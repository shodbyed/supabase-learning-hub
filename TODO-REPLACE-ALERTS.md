# TODO: Replace Window Alerts with Custom Dialogs

> **Created**: 2025-11-04
> **Priority**: Medium
> **Status**: Not Started

---

## 📋 Task Overview

Replace all instances of `window.alert()`, `window.confirm()`, and `alert()` / `confirm()` with our custom shadcn dialog components for better UX and consistency.

## ✅ Completed Replacements

### SeasonSchedulePage.tsx
- ✅ Replaced `window.confirm()` for accepting schedule → `ConfirmDialog` with `confirmVariant="default"`

### ReportsManagement.tsx
- ✅ Replaced `alert('Please provide detailed notes...')` → `AlertDialog` (warning)
- ✅ Replaced `alert('Action recorded successfully')` → `AlertDialog` (success)
- ✅ Replaced `alert('Report escalated...')` → `AlertDialog` (success)
- ✅ Replaced `alert('Report marked as resolved')` → `AlertDialog` (success)
- ✅ Replaced `alert('Report dismissed')` → `AlertDialog` (success)
- ✅ Replaced `confirm('Escalate this report...')` → `ConfirmDialog`
- ✅ Replaced `confirm('Mark this report as resolved?')` → `ConfirmDialog`
- ✅ Replaced `confirm('Dismiss this report?')` → `ConfirmDialog`

---

## 📝 Pending Files to Update

Run these searches to find remaining instances:

```bash
# Find all alert() calls
grep -r "alert\(" src/ --include="*.tsx" --include="*.ts" -n

# Find all window.alert calls
grep -r "window\.alert" src/ --include="*.tsx" --include="*.ts" -n

# Find all confirm() calls
grep -r "confirm\(" src/ --include="*.tsx" --include="*.ts" -n

# Find all window.confirm calls
grep -r "window\.confirm" src/ --include="*.tsx" --include="*.ts" -n
```

### Files to Check (based on initial scan):

Will need to scan the entire codebase systematically to find all instances.

---

## 🛠️ Available Dialog Components

### 1. AlertDialog (OK button only)
**Use for**: Info messages, success confirmations, warnings, errors

```tsx
import { AlertDialog } from '@/components/AlertDialog';

const [alertDialog, setAlertDialog] = useState<{
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info'
} | null>(null);

// Show alert
setAlertDialog({
  show: true,
  title: 'Success',
  message: 'Action completed successfully',
  type: 'success'
});

// Render
{alertDialog?.show && (
  <AlertDialog
    title={alertDialog.title}
    message={alertDialog.message}
    type={alertDialog.type}
    onOk={() => setAlertDialog(null)}
  />
)}
```

**Types**:
- `success` - Green styling for successful actions
- `error` - Red styling for errors
- `warning` - Yellow styling for warnings
- `info` - Blue styling for informational messages

### 2. ConfirmDialog (Cancel + Confirm buttons)
**Use for**: Actions requiring user confirmation (delete, save, etc.)

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog';

const [confirmDialog, setConfirmDialog] = useState<{
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void
} | null>(null);

// Show confirmation
setConfirmDialog({
  show: true,
  title: 'Delete Item?',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  onConfirm: async () => {
    // Perform action
    await deleteItem();
    setConfirmDialog(null);
  }
});

// Render
{confirmDialog?.show && (
  <ConfirmDialog
    title={confirmDialog.title}
    message={confirmDialog.message}
    confirmText="Delete"
    cancelText="Cancel"
    confirmVariant="destructive" // or "default"
    onConfirm={confirmDialog.onConfirm}
    onCancel={() => setConfirmDialog(null)}
  />
)}
```

**Variants**:
- `destructive` (red) - For delete/destructive actions
- `default` (blue) - For non-destructive confirmations

---

## 📐 Implementation Pattern

For each file with alerts/confirms:

1. Import the dialog components
2. Add state for dialog(s)
3. Replace `alert()` with `setAlertDialog()`
4. Replace `confirm()` with `setConfirmDialog()`
5. Add dialog components to JSX (before closing div)
6. Test all dialogs work correctly

---

## 🎯 Benefits

- **Better UX**: Modal dialogs with proper styling and animations
- **Consistency**: All dialogs look and behave the same
- **Accessibility**: Better keyboard navigation and screen reader support
- **Customization**: Can add more features (icons, different buttons, etc.)
- **Mobile-friendly**: Better responsive design than native alerts

---

## 📊 Progress Tracking

- [ ] Run grep searches to find all instances
- [ ] Create comprehensive list of files
- [ ] Prioritize critical user-facing pages
- [ ] Update files systematically
- [ ] Test each replacement
- [ ] Update this document as progress is made
