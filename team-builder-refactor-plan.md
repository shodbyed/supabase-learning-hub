# Team Building Wizard Refactoring Plan

## Overview
This plan outlines the refactoring of the team building portion of the league operator wizard to match the patterns, best practices, and quality standards established in the recent season builder refactor.

## Reference Implementation: Season Builder Patterns

### Key Patterns Identified from Season Builder

1. **shadcn/ui Component Usage**
   - All UI elements use shadcn components (Button, Input, Label, Select, Card, etc.)
   - NO raw HTML elements (`<button>`, `<input>`, `<select>`, `<label>`)
   - Calendar component for all date inputs
   - CapitalizeInput component for auto-formatted text fields
   - Consistent styling through shadcn design system

2. **Reusable Components**
   - `MemberCombobox` - Searchable member selection with clear button
   - `VenueListItem` - Venue display with checkbox and limit button
   - `TeamCard` - Collapsible team display with roster
   - `SeasonStatusCard` - Summary card showing configured data
   - `InfoButton` - Reusable info tooltip component
   - `CapitalizeInput` - Auto-capitalize text input with user bypass option

3. **Custom Hooks for Logic Separation**
   - `useRosterEditor` - Manages roster state and validation logic
   - `useTeamManagement` - Handles all data fetching for team-related data
   - `useScheduleGeneration` - Handles schedule generation logic
   - `useChampionshipAutoFill` - Auto-populates championship steps
   - Single responsibility principle applied to each hook

4. **State Management**
   - `useReducer` for complex state (see `wizardReducer` in season builder)
   - Centralized state management with actions
   - LocalStorage integration for persistence
   - Clear state update patterns

5. **Code Organization Principles**
   - KISS (Keep It Simple, Stupid)
   - DRY (Don't Repeat Yourself)
   - Single Responsibility Principle
   - Component composition over monolithic components

6. **Documentation Standards**
   - JSDoc `@fileoverview` for every file
   - Function parameter documentation with `@param` and `@returns`
   - Inline comments explaining business logic
   - Usage examples in component documentation

7. **Icon Usage**
   - Consistent use of lucide-react icons
   - Icons match semantic meaning (ArrowLeft, Plus, Pencil, Trash2, etc.)

## Current State Analysis

### Files to Refactor

1. **Main Components**
   - `/src/operator/TeamManagement.tsx` - Main team management page
   - `/src/operator/TeamEditorModal.tsx` - Team creation/editing modal
   - `/src/operator/VenueLimitModal.tsx` - Venue limit editing modal

2. **Supporting Components**
   - `/src/components/TeamCard.tsx` - Already refactored ✓
   - `/src/components/VenueListItem.tsx` - Already refactored ✓
   - `/src/components/MemberCombobox.tsx` - Already refactored ✓
   - `/src/components/ui/capitalize-input.tsx` - Exists but uses raw checkbox (needs fix)
   - `/src/components/AllPlayersRosterCard.tsx` - Needs review
   - `/src/components/TeamRosterList.tsx` - Needs review
   - `/src/components/VenueCreationModal.tsx` - Needs review (if exists)

3. **Hooks**
   - `/src/hooks/useTeamManagement.ts` - Already refactored ✓
   - `/src/hooks/useRosterEditor.ts` - Already refactored ✓

### Issues to Address

Based on code review of TeamManagement.tsx and TeamEditorModal.tsx:

#### TeamEditorModal.tsx Issues
1. **Raw HTML Elements** (Lines 318-324)
   - Uses `<button>` instead of Button component for close button
   - Inconsistent with shadcn pattern

2. **Missing CapitalizeInput Usage** (Lines 348-360)
   - Team Name field uses plain Input component
   - Should use CapitalizeInput with optional bypass (`hideCheckbox={false}`)
   - User should be able to override if they want specific formatting

3. **Documentation**
   - Good JSDoc comments present ✓
   - Could improve inline documentation for complex logic

4. **Component Structure**
   - Well-organized with clear sections ✓
   - Uses MemberCombobox for member selection ✓
   - Uses shadcn Select for venue selection ✓

#### TeamManagement.tsx Issues
1. **Raw HTML Elements**
   - Uses `<input type="checkbox">` (lines 549-555, 556-559) instead of shadcn Checkbox
   - Should use shadcn Checkbox component

2. **Complex Component**
   - Large component (748 lines) - could benefit from extraction
   - Multiple responsibilities: venue assignment, team creation, data fetching
   - Good use of custom hooks though ✓

3. **Documentation**
   - Has good JSDoc file overview ✓
   - Function documentation could be more detailed

#### VenueCreationModal Issues (if exists)
1. **Missing CapitalizeInput Usage**
   - Venue name field should use CapitalizeInput with optional bypass (`hideCheckbox={false}`)
   - Address fields (street, city) should use CapitalizeInput with FORCED capitalization (`hideCheckbox={true}`)
   - State should NOT use CapitalizeInput (needs to be uppercase abbreviation)

#### CapitalizeInput Component Issues
1. **Raw HTML Elements** (Line 164-171)
   - Uses `<input type="checkbox">` for auto-capitalize toggle
   - Should use shadcn Checkbox component
   - Uses raw `<label>` instead of Label component

## Refactoring Plan

### Phase 1: Component Audit & Preparation
**Goal:** Identify all non-compliant patterns and prepare refactoring checklist

#### Tasks:
1. ✓ Audit TeamManagement.tsx for raw HTML elements
2. ✓ Audit TeamEditorModal.tsx for raw HTML elements
3. Review supporting components (AllPlayersRosterCard, TeamRosterList, VenueCreationModal)
4. Create detailed checklist of all violations
5. Verify all shadcn components are installed (especially Checkbox)

### Phase 2: Replace Raw HTML with shadcn Components
**Goal:** Ensure 100% shadcn component usage across all team building UI

#### Tasks:
1. **CapitalizeInput Component** (Fix this first - it's used everywhere)
   - Replace raw `<input type="checkbox">` with shadcn Checkbox (line 164)
   - Replace raw `<label>` with shadcn Label component (line 172)
   - Test thoroughly as this affects all forms using it

2. **TeamManagement.tsx**
   - Replace checkbox inputs with shadcn Checkbox component (lines 549-555, 556-559)
   - Verify all Button usage is shadcn Button ✓
   - Verify all Input usage is shadcn Input ✓
   - Verify all Label usage is shadcn Label ✓
   - Verify all Select usage is shadcn Select ✓

3. **TeamEditorModal.tsx**
   - Replace close button `<button>` with shadcn Button component (line 318)
   - Replace team name Input with CapitalizeInput component (line 350)
   - Add proper variant and size props for close button
   - Verify modal backdrop uses proper shadcn Dialog pattern (optional enhancement)

4. **VenueCreationModal** (if exists)
   - Replace venue name input with CapitalizeInput (`hideCheckbox={false}` - user can bypass)
   - Replace address field inputs with CapitalizeInput (`hideCheckbox={true}` - forced formatting):
     - Street address: forced capitalization
     - City: forced capitalization
   - Keep state field as regular Input (needs uppercase abbreviation format)

5. **Supporting Components**
   - Review AllPlayersRosterCard for HTML elements
   - Review TeamRosterList for HTML elements

### Phase 3: Extract Reusable Components
**Goal:** Break down large components into smaller, reusable pieces

#### Potential Extractions from TeamManagement.tsx:

1. **SetupSummaryCard** (lines 484-529)
   - Displays league type, venues, tables, max teams, teams created
   - Reusable for other management views
   ```tsx
   <SetupSummaryCard
     leagueVenues={leagueVenues}
     teamsCount={teams.length}
   />
   ```

2. **VenueAssignmentSection** (lines 532-591)
   - Handles venue assignment UI and logic
   - Could be extracted with callback props
   ```tsx
   <VenueAssignmentSection
     venues={venues}
     leagueVenues={leagueVenues}
     onToggleVenue={handleToggleVenue}
     onSelectAll={handleSelectAll}
     onLimitClick={handleOpenLimitModal}
     onCreateVenue={() => setShowVenueCreation(true)}
   />
   ```

3. **TeamsSection** (lines 599-665)
   - Team list display and management
   ```tsx
   <TeamsSection
     teams={teams}
     expandedTeams={expandedTeams}
     canAddTeams={leagueVenues.length > 0 && seasonId}
     onToggleExpand={toggleTeamExpansion}
     onAddTeam={() => setShowTeamEditor(true)}
     onEditTeam={(team) => { setEditingTeam(team); setShowTeamEditor(true); }}
     onDeleteTeam={(teamId) => { setDeletingTeamId(teamId); setShowDeleteConfirm(true); }}
     onImportTeams={handleImportTeams}
     previousSeasonId={previousSeasonId}
   />
   ```

4. **CompletionActions** (lines 669-685)
   - Save & Exit / Save & Continue buttons
   ```tsx
   <CompletionActions
     visible={teams.length > 0 && !!seasonId}
     leagueId={leagueId}
     seasonId={seasonId}
   />
   ```

### Phase 4: Enhance Documentation
**Goal:** Match documentation standards from season builder

#### Tasks:
1. **Add detailed JSDoc comments**
   - Document all helper functions with @param and @returns
   - Add usage examples for complex components
   - Explain business logic in inline comments

2. **Improve inline documentation**
   - Add step-by-step explanations for complex flows
   - Document data transformations
   - Explain validation logic

3. **Add file overview improvements**
   - Enhance existing @fileoverview descriptions
   - List component responsibilities clearly
   - Document data flow patterns

### Phase 5: Code Quality Improvements
**Goal:** Apply KISS, DRY, and Single Responsibility principles

#### Tasks:
1. **Extract validation logic**
   - Create validation utilities for team data
   - Centralize error message handling

2. **Improve state management**
   - Consider using reducer for TeamManagement if complexity grows
   - Ensure state updates are predictable

3. **Optimize re-renders**
   - Use useCallback for event handlers passed to children
   - Use useMemo for expensive computations

4. **Error handling**
   - Consistent error display patterns
   - User-friendly error messages
   - Proper error boundary usage

### Phase 6: Testing & Verification
**Goal:** Ensure refactored code works correctly

#### Tasks:
1. **Manual Testing**
   - Test all team creation flows
   - Test venue assignment flows
   - Test roster management
   - Test import from previous season
   - Test all validation scenarios

2. **Visual Testing**
   - Verify consistent styling across all components
   - Check responsive behavior
   - Test all interactive elements (buttons, inputs, etc.)

3. **Edge Cases**
   - Empty states (no venues, no teams, no members)
   - Maximum limits (48 teams, roster size)
   - Duplicate detection
   - Cross-team player validation

### Phase 7: Performance & Polish
**Goal:** Optimize and polish the final implementation

#### Tasks:
1. **Performance optimization**
   - Lazy load modals if needed
   - Optimize large team lists rendering
   - Minimize unnecessary re-renders

2. **Accessibility**
   - Ensure all interactive elements are keyboard accessible
   - Add proper ARIA labels
   - Test with screen readers

3. **UX improvements**
   - Loading states for all async operations
   - Success feedback for actions
   - Smooth transitions

## Implementation Checklist

### Must-Have Requirements
- [ ] All raw HTML elements replaced with shadcn components
- [ ] CapitalizeInput used for all text fields that need formatting:
  - [ ] Team names: optional bypass (`hideCheckbox={false}`)
  - [ ] Venue names: optional bypass (`hideCheckbox={false}`)
  - [ ] Address fields (street, city): forced capitalization (`hideCheckbox={true}`)
- [ ] CapitalizeInput component itself uses shadcn components (no raw checkbox/label)
- [ ] Consistent icon usage from lucide-react
- [ ] All components follow single responsibility principle
- [ ] Complete JSDoc documentation for all files
- [ ] Inline comments for business logic
- [ ] No code duplication (DRY principle)
- [ ] Proper error handling throughout

### Should-Have Requirements
- [ ] Extract reusable components from large files
- [ ] Optimize re-renders with useCallback/useMemo
- [ ] Comprehensive manual testing completed
- [ ] Accessibility improvements implemented

### Nice-to-Have Enhancements
- [ ] Automated tests for critical flows
- [ ] Performance optimization for large datasets
- [ ] Enhanced loading/success states
- [ ] Smooth animations and transitions

## Execution Strategy

### Approach
1. **Incremental refactoring** - Make changes in small, testable chunks
2. **Test after each phase** - Don't move to next phase until current phase works
3. **Commit frequently** - Commit after each successful component refactor
4. **Use feature flags** - If needed, use flags to toggle between old/new implementations

### Time Estimates
- Phase 1 (Audit): 30 minutes
- Phase 2 (shadcn Components): 1-2 hours
- Phase 3 (Extract Components): 2-3 hours
- Phase 4 (Documentation): 1-2 hours
- Phase 5 (Code Quality): 2-3 hours
- Phase 6 (Testing): 1-2 hours
- Phase 7 (Polish): 1-2 hours

**Total Estimated Time:** 8-15 hours

### Risk Mitigation
1. Create feature branch for refactoring work
2. Keep original code commented out during initial phases
3. Test thoroughly before removing old code
4. Have rollback plan ready

## Success Criteria
1. All team building UI uses shadcn components exclusively
2. Code follows same patterns as season builder
3. All components have complete documentation
4. No regression in functionality
5. Improved code maintainability and readability
6. Team building feels consistent with season building

## Notes
- Season builder is the reference implementation - follow its patterns exactly
- Focus on consistency over innovation
- Prioritize code clarity and maintainability
- Document all decisions and patterns for future reference

---

**Created:** 2025-10-24
**Last Updated:** 2025-10-24
**Status:** Ready for Implementation
