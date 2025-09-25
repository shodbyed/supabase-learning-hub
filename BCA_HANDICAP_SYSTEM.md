# BCA Standard Handicap System Documentation

## 🏆 **System Overview**

The BCA Standard Handicap System is used for 8-man team leagues with single round robin format (5 players per team per night, 25 total games per match).

## 📊 **Core Concept**

**Handicap = Win Percentage**
- Simple calculation: Wins ÷ Total Games Played
- Example: 7 wins, 3 losses = 7÷10 = 70% handicap
- Rolling window: Only last 50 games count (keeps current skill level)

## 🎯 **Match Scoring System**

### **Team Setup**
- **Roster**: 8 players maximum per team
- **Active Players**: 5 players compete each match night
- **Match Format**: Single round robin (each player plays each opponent once)
- **Total Games**: 25 individual games per team match

### **Handicap Calculation Process**

1. **Calculate Team Handicap**
   - Add up all 5 active players' handicap percentages
   - Example: Team A = 276 total, Team B = 260 total

2. **Find Handicap Difference**
   - Higher handicap - Lower handicap = Difference
   - Example: 276 - 260 = 16 point difference

3. **Lookup Games Needed to Win**
   - Use CHARTS table (below) to determine win requirements

## 📋 **BCA CHARTS Lookup Table**

| Handicap Difference | Higher H/C Wins Needed | Lower H/C Wins Needed |
|---------------------|------------------------|----------------------|
| 0-14 points         | 13 games               | 13 games             |
| 15-40 points        | 14 games               | 12 games             |
| 41-66 points        | 15 games               | 11 games             |
| 67-92 points        | 16 games               | 10 games             |
| 93-118 points       | 17 games               | 9 games              |
| 119-144 points      | 18 games               | 8 games              |
| 145+ points         | 19 games               | 7 games              |

### **Lookup Formula**
```
=VLOOKUP(handicap_difference, CHARTS_TABLE, column_index, TRUE)
```

## 🎱 **Example Match Calculation**

**Teams:**
- Team A (Crystalized): 276 total handicap
- Team B (Familia): 260 total handicap

**Calculation:**
1. Handicap difference: 276 - 260 = 16 points
2. Lookup: 16 falls in 15-40 range
3. **Result**: Team A needs 14 wins, Team B needs 12 wins
4. **Match**: First team to reach their target wins

**BCA Point System:**
- **Win**: Full points = 1 point per game won
- **Close Loss (70%+ of target)**: Enhanced points = 1.5 points per game won
- **Bad Loss (below 70%)**: Regular points = 1 point per game won

**Examples:**
- **Team needs 12 wins:**
  - **Win with 14 games**: 14 points (1 × 14)
  - **Close loss with 8 games**: 12 points (1.5 × 8) - reached 70% threshold
  - **Bad loss with 5 games**: 5 points (1 × 5) - below 70% threshold

**70% Calculation:**
- Team needing 10 wins: 70% = 7+ games (need at least 7 for bonus)
- Team needing 12 wins: 70% = 8.4 = 8+ games (need at least 8 for bonus)
- Team needing 14 wins: 70% = 9.8 = 10+ games (need at least 10 for bonus)

**Purpose:** Rewards teams that "kept it close" even when losing

## ✅ **System Benefits**

### **Advantages:**
- **Simple**: Easy to understand percentage-based system
- **Fair**: Higher skilled players need more wins
- **Standard**: Universally used across BCA leagues
- **Proven**: Well-tested system with established rules
- **Scalable**: Works for any handicap difference

### **BCA Philosophy: "Less Handicapping"**
- **Design Intent**: Minimal handicap interference with natural skill differences
- **50-game window**: Creates more volatile, changeable handicaps
- **Talent disparity**: System allows skilled teams to dominate more easily
- **Competitive philosophy**: "May the best team win" with minimal balancing

### **Best Used For:**
- BCA-sanctioned tournaments and leagues
- Competitive leagues where skill differences should show
- Players who prefer established, familiar systems
- Leagues that want minimal handicap interference
- **Not ideal for**: Casual leagues with major skill gaps (stacked teams dominate)

## ⏰ **Venue & Time Considerations**

### **Match Duration**
- **25 individual games per match** = longer playing time
- **Requires extra tables**: 4+ teams often need to share additional tables to speed up play
- **Without extra tables**: Matches can run very long
- **Table management**: Complex scheduling needed for multiple simultaneous games

### **Venue Requirements**
- **Space needed**: 16 people (8 per team) around single table area
- **Can get crowded**: Especially in smaller venues
- **Pros for venue owners**: More people = more drinks/food sales
- **Cons for venues**: Space constraints, longer table occupation

### **Best Venue Types:**
- Larger pool halls with multiple tables
- Venues that benefit from longer customer stays
- Establishments with good food/beverage programs

## 🔧 **Implementation Requirements**

### **Data Tracking Needed:**
- Player win/loss records (last 50 games)
- Automatic handicap percentage calculation
- Team handicap totals for active players
- CHARTS lookup table for win requirements
- Match scoring with running totals

### **Calculation Logic:**
```javascript
// Pseudo-code for BCA system
function calculateBCAHandicap(wins, losses) {
  return (wins / (wins + losses)) * 100;
}

function getWinsNeeded(teamAHandicap, teamBHandicap) {
  const difference = Math.abs(teamAHandicap - teamBHandicap);

  if (difference <= 14) return [13, 13];
  if (difference <= 40) return [14, 12];
  if (difference <= 66) return [15, 11];
  if (difference <= 92) return [16, 10];
  if (difference <= 118) return [17, 9];
  if (difference <= 144) return [18, 8];
  return [19, 7];
}
```

## 📚 **Reference Materials**

- **Source**: PASCO BCA SCORING system
- **CHARTS Table**: Validated from actual league scoring sheet
- **Format**: 8-man teams, single round robin, 25 games per match
- **Rolling Window**: Last 50 games for handicap calculation

---

*This system is the foundation for all BCA-sanctioned league play and provides fair, competitive matches regardless of skill level differences.*