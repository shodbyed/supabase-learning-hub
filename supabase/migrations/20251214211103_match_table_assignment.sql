-- Migration: Add table assignment functionality to matches
-- This adds a column for assigned table numbers and a function to automatically
-- assign tables based on venue availability and fill order.

-- ============================================================================
-- 1. Add assigned_table_number column to matches
-- ============================================================================

ALTER TABLE "public"."matches"
ADD COLUMN IF NOT EXISTS "assigned_table_number" integer;

COMMENT ON COLUMN "public"."matches"."assigned_table_number" IS 'The table number assigned for this match at the venue (scheduled or actual)';

-- ============================================================================
-- 2. Create function to assign tables for a specific week
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."assign_tables_for_week"(p_season_week_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_season_id uuid;
    v_league_id uuid;
    match_rec RECORD;
    venue_tables RECORD;
    v_table_number integer;
    v_venue_usage jsonb := '{}'::jsonb;  -- Track used table indices per venue
    v_leftover_matches uuid[] := '{}';   -- Matches that couldn't get a table at their venue
    v_all_available jsonb := '[]'::jsonb; -- All available tables across all venues
    v_leftover_match_id uuid;
    v_available_table RECORD;
BEGIN
    -- Get season_id and league_id from the week
    SELECT sw.season_id, s.league_id
    INTO v_season_id, v_league_id
    FROM season_weeks sw
    JOIN seasons s ON s.id = sw.season_id
    WHERE sw.id = p_season_week_id;

    IF v_season_id IS NULL THEN
        RAISE NOTICE 'Season week % not found', p_season_week_id;
        RETURN;
    END IF;

    RAISE NOTICE 'Assigning tables for week %, season %, league %',
        p_season_week_id, v_season_id, v_league_id;

    -- First pass: Clear existing assignments for unplayed matches in this week
    UPDATE matches
    SET
        assigned_table_number = NULL,
        actual_venue_id = NULL
    WHERE season_week_id = p_season_week_id
      AND status IN ('scheduled', 'in_progress');

    -- Build a lookup of available tables per venue
    -- The available_table_numbers array is already in fill order (set by the UI)
    -- Store as: { "venue_id": [table1, table2, ...], ... }
    FOR venue_tables IN
        SELECT
            lv.venue_id,
            lv.available_table_numbers
        FROM league_venues lv
        WHERE lv.league_id = v_league_id
          AND lv.available_table_numbers IS NOT NULL
          AND array_length(lv.available_table_numbers, 1) > 0
    LOOP
        -- Initialize usage counter for this venue
        v_venue_usage := v_venue_usage || jsonb_build_object(venue_tables.venue_id::text, 0);

        -- Add all tables from this venue to the global available list (for overflow)
        FOR i IN 1..array_length(venue_tables.available_table_numbers, 1) LOOP
            v_all_available := v_all_available || jsonb_build_array(
                jsonb_build_object(
                    'venue_id', venue_tables.venue_id,
                    'table_number', venue_tables.available_table_numbers[i],
                    'priority', i
                )
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Venue usage initialized: %', v_venue_usage;

    -- Second pass: Assign tables to matches in match_number order
    -- Only process matches that have a scheduled venue (home team has chosen their venue)
    FOR match_rec IN
        SELECT m.id, m.scheduled_venue_id, m.match_number
        FROM matches m
        WHERE m.season_week_id = p_season_week_id
          AND m.status IN ('scheduled', 'in_progress')
          AND m.home_team_id IS NOT NULL  -- Skip BYE matches
          AND m.away_team_id IS NOT NULL
          AND m.scheduled_venue_id IS NOT NULL  -- Skip matches where home team hasn't set venue
        ORDER BY m.match_number
    LOOP
        v_table_number := NULL;

        -- Get the current usage index for this venue
        DECLARE
            v_current_index integer;
            v_venue_tables integer[];
        BEGIN
            v_current_index := COALESCE((v_venue_usage->>match_rec.scheduled_venue_id::text)::integer, 0);

            -- Get the table array for this venue
            SELECT available_table_numbers INTO v_venue_tables
            FROM league_venues
            WHERE venue_id = match_rec.scheduled_venue_id
              AND league_id = v_league_id;

            -- Check if there's an available table at this venue
            IF v_venue_tables IS NOT NULL AND v_current_index < array_length(v_venue_tables, 1) THEN
                -- Assign the next table (arrays are 1-indexed in PostgreSQL)
                v_table_number := v_venue_tables[v_current_index + 1];

                -- Update the usage counter
                v_venue_usage := v_venue_usage ||
                    jsonb_build_object(match_rec.scheduled_venue_id::text, v_current_index + 1);

                -- Update the match with the assigned table
                UPDATE matches
                SET assigned_table_number = v_table_number
                WHERE id = match_rec.id;

                RAISE NOTICE 'Match % assigned table % at scheduled venue %',
                    match_rec.match_number, v_table_number, match_rec.scheduled_venue_id;
            ELSE
                -- No table available at scheduled venue, add to leftovers
                v_leftover_matches := array_append(v_leftover_matches, match_rec.id);
                RAISE NOTICE 'Match % (venue %) added to leftovers - no tables available',
                    match_rec.match_number, match_rec.scheduled_venue_id;
            END IF;
        END;
    END LOOP;

    -- Third pass: Assign leftover matches to any available table
    IF array_length(v_leftover_matches, 1) > 0 THEN
        RAISE NOTICE 'Processing % leftover matches', array_length(v_leftover_matches, 1);

        FOREACH v_leftover_match_id IN ARRAY v_leftover_matches
        LOOP
            -- Find the first venue that still has availability
            FOR venue_tables IN
                SELECT
                    lv.venue_id,
                    lv.available_table_numbers
                FROM league_venues lv
                WHERE lv.league_id = v_league_id
                  AND lv.available_table_numbers IS NOT NULL
                  AND array_length(lv.available_table_numbers, 1) > 0
            LOOP
                DECLARE
                    v_current_index integer;
                BEGIN
                    v_current_index := COALESCE((v_venue_usage->>venue_tables.venue_id::text)::integer, 0);

                    IF v_current_index < array_length(venue_tables.available_table_numbers, 1) THEN
                        -- Found an available table
                        v_table_number := venue_tables.available_table_numbers[v_current_index + 1];

                        -- Update usage
                        v_venue_usage := v_venue_usage ||
                            jsonb_build_object(venue_tables.venue_id::text, v_current_index + 1);

                        -- Update match with actual_venue_id (different from scheduled)
                        UPDATE matches
                        SET
                            assigned_table_number = v_table_number,
                            actual_venue_id = venue_tables.venue_id
                        WHERE id = v_leftover_match_id;

                        RAISE NOTICE 'Leftover match % assigned table % at alternate venue %',
                            v_leftover_match_id, v_table_number, venue_tables.venue_id;

                        EXIT; -- Move to next leftover match
                    END IF;
                END;
            END LOOP;
        END LOOP;
    END IF;

    RAISE NOTICE 'Table assignment complete for week %', p_season_week_id;
END;
$$;

ALTER FUNCTION "public"."assign_tables_for_week"(uuid) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."assign_tables_for_week"(uuid) IS
'Assigns table numbers to all unplayed matches in a week based on venue availability and fill order.
Matches are processed in match_number order. If a venue runs out of tables, overflow matches are
assigned to any available table at another venue (actual_venue_id is set).';

-- Grant permissions
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_week"(uuid) TO "anon";
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_week"(uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_week"(uuid) TO "service_role";

-- ============================================================================
-- 3. Create function to assign tables for an entire season
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."assign_tables_for_season"(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    week_rec RECORD;
    v_week_count integer := 0;
BEGIN
    RAISE NOTICE 'Assigning tables for all weeks in season %', p_season_id;

    -- Process each week in the season
    FOR week_rec IN
        SELECT id
        FROM season_weeks
        WHERE season_id = p_season_id
        ORDER BY scheduled_date
    LOOP
        PERFORM assign_tables_for_week(week_rec.id);
        v_week_count := v_week_count + 1;
    END LOOP;

    RAISE NOTICE 'Table assignment complete for % weeks in season %', v_week_count, p_season_id;
END;
$$;

ALTER FUNCTION "public"."assign_tables_for_season"(uuid) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."assign_tables_for_season"(uuid) IS
'Assigns table numbers for all weeks in a season. Call this when a schedule is accepted/generated.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_season"(uuid) TO "anon";
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_season"(uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."assign_tables_for_season"(uuid) TO "service_role";

-- ============================================================================
-- 5. Update the venue change trigger to also reassign tables
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."update_match_venues_on_team_venue_change"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
    match_count INTEGER;
    week_id uuid;
    affected_weeks uuid[];
BEGIN
    -- Only proceed if home_venue_id actually changed
    IF OLD.home_venue_id IS DISTINCT FROM NEW.home_venue_id THEN
        RAISE NOTICE 'Trigger fired! Team ID: %, Old Venue: %, New Venue: %',
            NEW.id, OLD.home_venue_id, NEW.home_venue_id;

        -- Collect all affected weeks before updating
        SELECT array_agg(DISTINCT season_week_id) INTO affected_weeks
        FROM matches
        WHERE home_team_id = NEW.id
          AND status IN ('scheduled', 'in_progress');

        -- Update all matches where this team is the home team
        UPDATE matches
        SET
            scheduled_venue_id = NEW.home_venue_id,
            updated_at = NOW()
        WHERE home_team_id = NEW.id
          AND status IN ('scheduled', 'in_progress');

        GET DIAGNOSTICS match_count = ROW_COUNT;

        RAISE NOTICE 'Updated % matches for team % with new venue %',
            match_count, NEW.id, NEW.home_venue_id;

        -- Reassign tables for all affected weeks
        IF affected_weeks IS NOT NULL THEN
            FOREACH week_id IN ARRAY affected_weeks
            LOOP
                RAISE NOTICE 'Reassigning tables for week %', week_id;
                PERFORM assign_tables_for_week(week_id);
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE 'Trigger fired but venue unchanged for team %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 6. Create index for efficient table queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_matches_assigned_table"
ON "public"."matches" ("scheduled_venue_id", "season_week_id", "assigned_table_number");
