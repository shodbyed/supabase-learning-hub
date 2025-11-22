# Handicap System

Hard-coded handicap charts for both 3v3 and 5v5 formats. No database queries needed.

## Files

- **`get3v3GamesNeeded.ts`** - Custom 5-man league handicap chart (25 rows, -12 to +12)
- **`get5v5GamesNeeded.ts`** - BCA 8-man league handicap chart (7 ranges, percentage-based)
- **`index.ts`** - Unified interface for both formats

## Usage

### Option 1: Unified Interface (Recommended)

```typescript
import { getGamesNeeded, getGamesNeededForBothTeams } from '@/utils/handicap';

// Single team lookup
const thresholds = getGamesNeeded(5, '5_man'); // 3v3
console.log(thresholds.games_to_win); // 12

const thresholds = getGamesNeeded(16, '8_man'); // 5v5
console.log(thresholds.games_to_win); // 14

// Both teams at once
const { homeThresholds, awayThresholds } = getGamesNeededForBothTeams(
  8,  // home handicap
  5,  // away handicap
  '5_man'
);
console.log(`Home needs ${homeThresholds.games_to_win} wins`);
console.log(`Away needs ${awayThresholds.games_to_win} wins`);
```

### Option 2: Format-Specific Functions

```typescript
import { get3v3GamesNeeded, get5v5GamesNeeded } from '@/utils/handicap';

// 3v3 only
const thresholds = get3v3GamesNeeded(5);

// 5v5 only
const thresholds = get5v5GamesNeeded(16);
```

### Option 3: Legacy API (Backward Compatibility)

```typescript
import { getHandicapThresholds3v3, getHandicapThresholds } from '@/api/queries/handicaps';

// Old way (still works)
const thresholds = getHandicapThresholds3v3(5);

// New way (supports both formats)
const thresholds = getHandicapThresholds(5, '5_man');
const thresholds = getHandicapThresholds(16, '8_man');
```

## Return Type

```typescript
interface HandicapThresholds {
  games_to_win: number;      // Minimum games needed to win
  games_to_tie: number | null; // Games needed to tie (null for 5v5)
  games_to_lose: number;     // Maximum games to still lose
}
```

## 3v3 vs 5v5 Differences

| Feature | 3v3 (5_man) | 5v5 (8_man) |
|---------|-------------|-------------|
| **Total Games** | 18 | 25 |
| **Handicap Range** | -12 to +12 (integer) | 0-500 (percentage) |
| **Ties Possible?** | Yes (even handicaps) | No (odd game count) |
| **Chart Rows** | 25 exact values | 7 ranges |
| **Source** | Custom 5-Man System | BCA Standard |

## Benefits of Hard-Coded Charts

- ⚡ **Faster** - No database queries
- 🧪 **Testable** - Pure functions, no mocking
- 📦 **Simpler** - One less database table
- 🔒 **Version controlled** - Changes tracked in git
- 🚀 **Portable** - Works anywhere (mobile app, tests, etc.)
