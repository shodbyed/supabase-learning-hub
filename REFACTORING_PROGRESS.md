# MatchLineup.tsx Refactoring Progress

## Goal
Break down 979-line MatchLineup.tsx into smaller, reusable, testable components following SOLID principles

## Completed (Session 1)

### ✅ Phase 1: Utilities Created
1. **`/src/utils/lineup/substituteHelpers.ts`**
   - SUB_HOME_ID and SUB_AWAY_ID constants
   - isSubstitute(), getSubstituteId(), lineupHasSubstitute() helpers

2. **`/src/utils/lineup/handicapFormatters.ts`**
   - formatHandicap() - display formatting
   - roundHandicap() - rounding to 1 decimal

3. **`/src/utils/lineup/lineupValidation.ts`**
   - isLineupComplete() - check all players selected
   - hasDuplicateNicknames() - check for duplicates
   - canLockLineup() - combined validation

4. **`/src/utils/lineup/index.ts`** - Central exports

### ✅ Phase 2: Hooks Created
1. **`/src/hooks/lineup/useLineupState.ts`**
   - Manages all lineup selection state
   - player1Id, player2Id, player3Id
   - lineupLocked, lineupId
   - subHandicap
   - testMode, testHandicaps
   - Convenience methods: lockLineup(), unlockLineup(), resetTestMode()

2. **`/src/hooks/lineup/useHandicapCalculations.ts`**
   - Calculates individual player handicaps
   - Handles substitute handicap logic
   - Calculates player total (sum of 3)
   - Calculates team total (players + team bonus)
   - getPlayerHandicap() helper function
   - Uses useMemo for performance

3. **`/src/hooks/lineup/useLineupValidation.ts`**
   - isComplete, hasDuplicates, hasSub, canLock flags
   - Error messages: completenessError, duplicatesError
   - Uses useMemo for performance

4. **`/src/hooks/lineup/index.ts`** - Central exports

## Remaining Work

### 🔄 Phase 3: More Hooks (TODO)
1. **`useLineupPersistence.ts`** - Save/lock/unlock operations
   - handleLockLineup()
   - handleUnlockLineup()
   - Uses TanStack mutations

2. **`useMatchPreparation.ts`** - Extract the massive useEffect (lines 137-271)
   - Handles auto-navigation when both lineups locked
   - Calculates handicap thresholds
   - Creates match games
   - Navigates to scoring page

### 🔄 Phase 4: UI Components (TODO)
1. **`HandicapSummary.tsx`** - The handicap display card
   - Player handicaps total
   - Team modifier (if home team)
   - Team total handicap
   - InfoButton for explanations

2. **`SubstituteHandicapInput.tsx`** - Reusable sub handicap selector
   - Currently duplicated 3 times (lines 716-737, 777-798, 838-859)
   - Should be a single component

3. **`LineupValidationErrors.tsx`** - Error message displays
   - Duplicate nickname warning
   - Other validation errors

### 🔄 Phase 5: Refactor Main Component (TODO)
1. Update `MatchLineup.tsx` to use new hooks
2. Replace inline JSX with new components
3. Remove all extracted helper functions
4. Simplify to: queries → hooks → render

### 🔄 Phase 6: Cleanup (TODO)
1. Replace direct DB calls with TanStack mutations
   - Line 432-437: Team membership check
   - Line 469-485: Lineup insert
   - Line 234-246: Game creation

2. Refactor existing `LineupSelector.tsx` to use our hooks

3. Run build and verify no errors

4. Update TABLE_OF_CONTENTS.md

## File Structure (After Completion)

```
src/
├── hooks/
│   └── lineup/
│       ├── index.ts
│       ├── useLineupState.ts ✅
│       ├── useHandicapCalculations.ts ✅
│       ├── useLineupValidation.ts ✅
│       ├── useLineupPersistence.ts (TODO)
│       └── useMatchPreparation.ts (TODO)
├── utils/
│   └── lineup/
│       ├── index.ts ✅
│       ├── substituteHelpers.ts ✅
│       ├── handicapFormatters.ts ✅
│       └── lineupValidation.ts ✅
├── components/
│   └── lineup/
│       ├── LineupSelector.tsx (existing - refactor)
│       ├── LineupActions.tsx (existing)
│       ├── MatchInfoCard.tsx (existing)
│       ├── PlayerRoster.tsx (existing)
│       ├── TestModeToggle.tsx (existing)
│       ├── HandicapSummary.tsx (TODO)
│       ├── SubstituteHandicapInput.tsx (TODO)
│       └── LineupValidationErrors.tsx (TODO)
└── player/
    └── MatchLineup.tsx (refactor with hooks)
```

## Benefits Achieved So Far
- ✅ Extracted 300+ lines of logic into reusable hooks
- ✅ Created pure, testable utility functions
- ✅ Followed single responsibility principle
- ✅ Used useMemo for performance optimization
- ✅ Comprehensive JSDoc documentation

## Next Steps
1. Continue with `useLineupPersistence` hook
2. Extract `useMatchPreparation` hook
3. Create UI components
4. Refactor MatchLineup.tsx
5. Test and verify

## Notes
- All hooks use TypeScript for type safety
- All utilities are pure functions (no side effects)
- Comprehensive documentation for future developers
- Follows project patterns (TanStack Query, custom hooks, etc.)
