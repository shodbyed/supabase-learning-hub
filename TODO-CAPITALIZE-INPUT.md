# TODO: Migrate Inputs to CapitalizeInput Component

## Overview
Replace all text inputs that would benefit from auto-capitalization with the new `CapitalizeInput` component.

## Component Location
`src/components/ui/capitalize-input.tsx`

## Features
- Auto-capitalize toggle (can be hidden with `hideCheckbox` prop)
- Press Enter to preview capitalization
- Click Next/Submit to apply capitalization
- Default: checkbox shown, auto-capitalize enabled
- When `hideCheckbox={true}`: always capitalizes, no checkbox visible

## Candidates for Migration

### High Priority (User-Facing Text Inputs)

#### League/Team Management
- [ ] **Team Name inputs** - When creating/editing teams
  - Location: Team creation/edit forms
  - Use: `hideCheckbox={false}` (let users choose)

- [ ] **Division/Qualifier inputs** - League creation/edit
  - Location: Already done in `LeagueCreationWizard` ✅
  - Status: COMPLETE

- [ ] **Player Name inputs** - When adding players
  - Location: Player registration/add forms
  - Use: `hideCheckbox={false}` (names should be capitalized but give option)

- [ ] **League Name custom inputs** - If any exist
  - Location: Search for league name text inputs
  - Use: `hideCheckbox={false}`

#### Forms/Wizards
- [ ] **League Operator Application** - Company/Business name fields
  - Location: `src/leagueOperator/LeagueOperatorApplication.tsx`
  - Check: All text inputs in the application wizard
  - Use: `hideCheckbox={false}` for flexibility

- [ ] **Any custom "reason" or "notes" fields** that need capitalization
  - Location: Search for "reason", "notes", "description" inputs
  - Use: `hideCheckbox={false}` to give users control

### Medium Priority (Admin/Config Inputs)

- [ ] **Venue/Location names** - If these exist
  - Location: TBD
  - Use: `hideCheckbox={false}`

- [ ] **Custom blackout reason** - In schedule management
  - Location: Schedule/blackout management
  - Use: `hideCheckbox={false}`

### Search Strategy

```bash
# Find all Input components
grep -r "import.*Input.*from.*ui/input" src/

# Find all <input type="text"> elements
grep -r '<input.*type="text"' src/

# Find all Input usage
grep -r '<Input' src/
```

### Files to Check

Based on initial search, check these files:
1. `src/components/forms/QuestionStep.tsx` - ✅ DONE
2. `src/leagueOperator/LeagueOperatorApplication.tsx` - Check wizard steps
3. `src/leagueOperator/QuestionStep.tsx` - May need update
4. Team creation/edit forms (find these files)
5. Player registration forms (find these files)
6. Any other forms with text inputs

## Migration Pattern

### Before (plain Input):
```tsx
<Input
  value={value}
  onChange={setValue}
  placeholder="Enter name"
/>
```

### After (with CapitalizeInput):
```tsx
<CapitalizeInput
  value={value}
  onChange={setValue}
  placeholder="Enter name"
  hideCheckbox={false}  // Show checkbox - let user choose
  // OR
  hideCheckbox={true}   // Always capitalize - no checkbox
/>
```

### With ref (for forms that need formatted value on submit):
```tsx
const inputRef = useRef<{ getFormattedValue: () => string }>(null);

<CapitalizeInput
  ref={inputRef}
  value={value}
  onChange={setValue}
  placeholder="Enter name"
/>

// On submit:
const finalValue = inputRef.current?.getFormattedValue() || value;
```

## Notes
- Don't migrate inputs for emails, URLs, codes, or technical fields
- Don't migrate password inputs
- Don't migrate number inputs
- Focus on user-visible text like names, divisions, descriptions
- Consider UX: show checkbox for most cases, hide only when capitalization is always desired

## Completion Criteria
- [ ] All user-facing text inputs reviewed
- [ ] Team/player name inputs migrated
- [ ] League operator application reviewed
- [ ] Any custom text fields migrated
- [ ] Documentation updated if needed
- [ ] Manual testing of migrated inputs completed
