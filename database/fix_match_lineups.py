#!/usr/bin/env python3
"""
Fix match_lineups data from old schema to new schema.

Old: team_handicap
New: home_team_modifier (renamed)
New columns: player4_id, player4_handicap, player5_id, player5_handicap (optional, can be NULL)
"""

import re

with open('local-data-dump.sql', 'r') as f:
    content = f.read()

# Find match_lineups INSERT
match = re.search(
    r'INSERT INTO "public"\."match_lineups" \([^)]+\) VALUES\s*([\s\S]*?)(?=\n\n--|$)',
    content
)

if match:
    values_block = match.group(0)

    # Replace team_handicap with home_team_modifier in the column definition
    fixed_sql = values_block.replace('"team_handicap"', '"home_team_modifier"')

    with open('restore_match_lineups.sql', 'w') as f:
        f.write('-- Fixed match_lineups data\n')
        f.write('-- Renamed team_handicap to home_team_modifier\n\n')
        f.write(fixed_sql)
        f.write('\n')

    # Count rows
    row_count = len(re.findall(r"\t\('[a-f0-9-]+',", values_block))
    print(f"Created restore_match_lineups.sql with {row_count} rows")
else:
    print("Could not find match_lineups INSERT statement")
