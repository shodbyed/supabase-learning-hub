#!/usr/bin/env python3
"""
Fix match_games data from old schema to new schema.

Old columns: id, match_id, game_number, home_player_id, away_player_id, winner_team_id,
             winner_player_id, home_action, away_action, break_and_run, golden_break,
             confirmed_by_home (boolean), confirmed_by_away (boolean), confirmed_at,
             is_tiebreaker, created_at, updated_at

New columns: id, match_id, game_number, home_player_id, away_player_id, winner_team_id,
             winner_player_id, home_action, away_action, break_and_run, golden_break,
             confirmed_at, is_tiebreaker, created_at, updated_at, game_type,
             confirmed_by_home (uuid), confirmed_by_away (uuid), vacate_requested_by,
             home_position, away_position

Changes:
- confirmed_by_home/away: boolean -> uuid (set to NULL if was true/false)
- game_type: new column (set to 'eight_ball' for all old data)
- vacate_requested_by, home_position, away_position: new columns (set to NULL)
"""

import re

with open('local-data-dump.sql', 'r') as f:
    content = f.read()

# Find match_games INSERT
match = re.search(
    r'INSERT INTO "public"\."match_games" \([^)]+\) VALUES\s*([\s\S]*?)(?=\n\n--|$)',
    content
)

if match:
    values_block = match.group(0)

    # Replace the column definition
    new_columns = '''INSERT INTO "public"."match_games" ("id", "match_id", "game_number", "home_player_id", "away_player_id", "winner_team_id", "winner_player_id", "home_action", "away_action", "break_and_run", "golden_break", "confirmed_at", "is_tiebreaker", "created_at", "updated_at", "game_type") VALUES'''

    # Get just the values part
    values_start = values_block.find('VALUES')
    values_part = values_block[values_start + 6:].strip()

    # For each row, we need to remove confirmed_by_home and confirmed_by_away (positions 11 and 12)
    # and add game_type at the end

    # Parse each row - they look like:
    # ('uuid', 'uuid', 2, 'uuid', 'uuid', 'uuid', 'uuid', 'breaks', 'racks', false, false, true, true, NULL, false, 'timestamp', 'timestamp'),

    rows = []
    # Split by row pattern
    row_pattern = re.compile(r"\t\('([^']+)', '([^']+)', (\d+), ([^,]+), ([^,]+), ([^,]+), ([^,]+), '([^']+)', '([^']+)', (false|true), (false|true), (true|false), (true|false), ([^,]+), (false|true), '([^']+)', '([^']+)'\)([,;])")

    for row_match in row_pattern.finditer(values_part):
        # Groups: id, match_id, game_number, home_player_id, away_player_id, winner_team_id,
        #         winner_player_id, home_action, away_action, break_and_run, golden_break,
        #         confirmed_by_home (skip), confirmed_by_away (skip), confirmed_at,
        #         is_tiebreaker, created_at, updated_at, terminator
        g = row_match.groups()
        # Build new row without confirmed_by_home (11) and confirmed_by_away (12)
        # Add game_type at end
        new_row = f"\t('{g[0]}', '{g[1]}', {g[2]}, {g[3]}, {g[4]}, {g[5]}, {g[6]}, '{g[7]}', '{g[8]}', {g[9]}, {g[10]}, {g[13]}, {g[14]}, '{g[15]}', '{g[16]}', 'eight_ball'){g[17]}"
        rows.append(new_row)

    if rows:
        fixed_sql = new_columns + '\n' + '\n'.join(rows)

        with open('restore_match_games.sql', 'w') as f:
            f.write('-- Fixed match_games data\n')
            f.write('-- Removed confirmed_by_home/away boolean columns, added game_type\n\n')
            f.write(fixed_sql)
            f.write('\n')

        print(f"Created restore_match_games.sql with {len(rows)} rows")
    else:
        print("No rows matched the pattern")
else:
    print("Could not find match_games INSERT statement")
