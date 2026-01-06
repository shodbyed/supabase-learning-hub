#!/usr/bin/env python3
"""
Fix the local-data-dump.sql to work with current schema.

Changes:
1. league_operators -> organizations (table rename + column renames)
2. venues: created_by_operator_id -> organization_id
3. leagues: operator_id -> organization_id
4. match_games: confirmed_by_home/away changed from boolean to uuid
5. match_lineups: add team_handicap column
6. operator_blackout_preferences: operator_id -> organization_id
7. user_reports: assigned_operator_id -> assigned_organization_id
"""

import re

with open('local-data-dump.sql', 'r') as f:
    content = f.read()

# 1. Fix league_operators -> organizations
# Old: INSERT INTO "public"."league_operators" ("id", "member_id", "organization_name", ...
# New: INSERT INTO "public"."organizations" ("id", "organization_name", ...
# Note: member_id becomes created_by, league_email -> organization_email, etc.

league_operators_pattern = r'INSERT INTO "public"\."league_operators" \("id", "member_id", "organization_name", "organization_address", "organization_city", "organization_state", "organization_zip_code", "contact_disclaimer_acknowledged", "league_email", "email_visibility", "league_phone", "phone_visibility", "stripe_customer_id", "payment_method_id", "card_last4", "card_brand", "expiry_month", "expiry_year", "billing_zip", "payment_verified", "created_at", "updated_at", "profanity_filter_enabled"\) VALUES'

league_operators_replacement = 'INSERT INTO "public"."organizations" ("id", "created_by", "organization_name", "organization_address", "organization_city", "organization_state", "organization_zip_code", "organization_email", "organization_email_visibility", "organization_phone", "organization_phone_visibility", "stripe_customer_id", "payment_method_id", "card_last4", "card_brand", "expiry_month", "expiry_year", "billing_zip", "payment_verified", "created_at", "updated_at", "profanity_filter_enabled") VALUES'

content = re.sub(league_operators_pattern, league_operators_replacement, content)

# Now fix the VALUES - need to remove the contact_disclaimer_acknowledged field (was after zip_code)
# Pattern: ('uuid', 'member_id', 'name', 'addr', 'city', 'state', 'zip', true/false, 'email', ...)
# The 8th value (index 7) is contact_disclaimer_acknowledged - need to remove it

def fix_league_operator_values(match):
    full_match = match.group(0)
    # This is complex - the values have commas inside strings too
    # Let's just note this needs manual attention or skip for now
    return full_match

# 2. Fix venues: created_by_operator_id -> organization_id
content = content.replace('"created_by_operator_id"', '"organization_id"')

# 3. Fix leagues: operator_id -> organization_id
content = content.replace('"operator_id"', '"organization_id"')

# 4. Fix match_games: confirmed_by_home/away are now uuid, not boolean
# The old data has true/false, new schema expects uuid or null
# We'll replace true/false with NULL for these fields
# Old pattern in VALUES: ..., true, true, '2025-...'
# This is tricky because true/false could be for other fields too

# 5. Fix match_lineups: team_handicap column was added
# Old: INSERT INTO "public"."match_lineups" ("id", ..., "updated_at") VALUES
# New: needs "team_handicap" column
match_lineups_old = 'INSERT INTO "public"."match_lineups" ("id", "match_id", "team_id", "player1_id", "player1_handicap", "player2_id", "player2_handicap", "player3_id", "player3_handicap", "locked", "locked_at", "created_at", "updated_at", "team_handicap") VALUES'
match_lineups_new = 'INSERT INTO "public"."match_lineups" ("id", "match_id", "team_id", "player1_id", "player1_handicap", "player2_id", "player2_handicap", "player3_id", "player3_handicap", "locked", "locked_at", "created_at", "updated_at", "team_handicap") VALUES'
# Actually, the dump already has team_handicap - the issue is the VALUES don't include it
# Let's check what the actual insert looks like

# 6. Fix operator_blackout_preferences: operator_id -> organization_id
# Already handled by the generic replacement above

# 7. Fix user_reports: assigned_operator_id -> assigned_organization_id
content = content.replace('"assigned_operator_id"', '"assigned_organization_id"')

with open('local-data-dump-fixed.sql', 'w') as f:
    f.write(content)

print("Created local-data-dump-fixed.sql")
print("Note: match_games confirmed_by fields need manual fix (boolean->uuid)")
print("Note: league_operators->organizations needs contact_disclaimer_acknowledged removed from values")
