review established tables for reference

1. teams
2. team_players
3. season_weeks
4. matches

matches is basically the scheduled dates that these teams play and which team plays which on a specific date.

so a player on team A would go to his team viewer. that perhaps would have a link to upcoming matches. he clicks on the match he is going to be playing that night.

flow
page 1.

1. line up
   list of all players on the team with handicaps (h/c)
   3 dropdown to enter line up/ player order
   team handicap (3 players h/c added together plus team h/c which is derived from current standings which we wont have until we finish scoring)
   ready button to show the other team the lineup is complete
   page 2.
1. scoreboard.  
   score board should have a lot of information in a small area.
   team name - team h/c
   total h/c
   line up information players name - h/c -games won
   team games won/needed to win needed to tie.

1. score keeping.
   game 1. rack: <button>{playerName}<button> vs. break: <button>{opponentName}<button>
   the players will see a button group and know who racks and who breaks in that game
   play is double round robin
   team 1 player 1 = T1P1. B= Breaks team 1 is home
   order is B T1P1 vs T1P1, B T1P2 VS T2P2, B T1P3 VS T2P3
   T1P1 VS B T2P2, T1P2 VS B T2P3, T1P3 VS B T2P1,
   B T1P1 VS T2P3, B T1P2 VS T2P1, B T1P3 VS T2P2

   the order starts over with the opposite person breaking
   each player plays 2 games with each player on opposing team breaking once and racking once.
   18 total games played all games must be played in order for the night to be complete.

   once a game is played either team (or perhaps both teams) press the button of the winner to get a popup to verify this player was the winner

   'completed' game:
   <div>{playerName}<div><button>{edit/reverse/undo game}<button><div>{opponentName}<div> winner highlighted somehow with bg or badge etc

   games can be played out of order if necessary. completed games should go to the bottom of the "list"

   in sheets scoring they both have access to the sheet even after the match is completed. it has not happened in my small league but a player could go back later on and change scores unbeknownst to the opposing team.  
   here i would like some sort of confirmation/agreement. both teams agree games are scored correctly to "end" session. perhaps each game as well.
   team 1 presses player 1 as winner. opposing team gets a popup to confirm or presses player 1 as well to confirm. both must agree to edit/reverse/undo a game?

   once all 18 games are played either one of the teams "won" the match/night or it ended in a tie.

page 3 1. tie breaker
each team must enter their lineup. (order may change) 2. 3 games will be played
home team breaks in game 1 and 3 away teams breaks game 2
best 2 out of 3 breaks the tie and wins.
all 3 games need not be played if a team wins first 2 in a row game is decided
NOTE: winning team: players ALL get a winning game affecting their handicaps regardless if they won lost or did not play. losing team get NO game(win or loss) recorded
there will never be a time when all 3 players on a team will have a win as 2 in a row ends the match but 3 players will always get a recorded win vs tiebreaker to affect their handicap. (this rule is to further prevent sandbagging)

    example.
    T1P1 vs T2P1.  T1P1 wins
    T1P2 vs T2P2.  T2P2 wins
    T1P3 vs T2P3.  T2P3 wins
    team 2 wins the match.
    T2P1, T2P2 and T2P3 game won vs tiebreaker
    T1P1, T1P2 and T1P3 no game recorded

    @CLAUDE please go over this with the developer to be sure you understand how this works.

    # Handicap Scoring Rules — Lookup Table Specification

## Overview

League matches consist of **18 total games**.  
Each team has **3 players**, each with a handicap ranging from **+2 to −2**.  
The **team handicap total** is the sum of the three individual player handicaps.

The **handicap difference** between two teams is calculated as:
difference = teamA_handicap_total − teamB_handicap_total

## Handicap Difference Range

- Maximum team handicap total = +6
- Minimum team handicap total = −6
- Therefore, the **maximum difference** is **±12**

If the calculated difference exceeds this range, it is **capped**:

| Actual Difference | Capped Difference |
| ----------------- | ----------------- |
| ≥ +13             | +12               |
| ≤ −13             | −12               |

Example:
actualDiff = +14 → cappedDiff = +12
actualDiff = −13 → cappedDiff = −12

## Lookup Table Purpose

The lookup table determines how many wins a team needs to:

| Outcome  | Condition                                        |
| -------- | ------------------------------------------------ |
| **Win**  | Wins ≥ `games_to_win`                            |
| **Tie**  | Wins == `games_to_tie` (NULL = tie not possible) |
| **Lose** | Wins ≤ `games_to_lose`                           |

Each team uses the lookup based on **their own** perspective.  
Example:

- Team A diff = +6 → Team B diff = −6 (opposite sign)

## Database Strategy

A static table (`handicap_chart`) is stored in Supabase/PostgreSQL for quick lookup.

Schema:

| Column          | Type           | Notes                                           |
| --------------- | -------------- | ----------------------------------------------- |
| `hcp_diff`      | integer        | Primary key, range −12 to +12                   |
| `games_to_win`  | integer        | Required wins to secure a win                   |
| `games_to_tie`  | integer / NULL | Required wins to tie (NULL if tie not possible) |
| `games_to_lose` | integer        | Wins threshold for a loss                       |

Example SQL query:

```sql
SELECT games_to_win, games_to_tie, games_to_lose
FROM handicap_chart
WHERE hcp_diff = :cappedDiff;


```
