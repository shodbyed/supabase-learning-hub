# Reusable Components Library

This document catalogs all reusable components in the application for easy discovery and reuse.

## 📋 Form Components (`/src/components/forms/`)

### `QuestionStep.tsx`
**Purpose**: Single question with text input, validation, and navigation
**Use Cases**: Any step-by-step form with text input
**Key Features**:
- Text input with real-time formatting
- Built-in validation with error display
- Navigation buttons (Back/Next/Continue)
- Optional info popup
- Keyboard navigation support
- Auto-formatting on input

**Props**: `title`, `subtitle`, `placeholder`, `value`, `onChange`, `validator`, `formatter`, etc.

### `ChoiceStep.tsx`
**Purpose**: Question with button choices instead of text input
**Use Cases**: Yes/No questions, multiple choice, selection screens
**Key Features**:
- Multiple choice buttons with variants
- Custom content area for additional info
- Navigation buttons
- Optional info popup
- Selection state management

**Props**: `title`, `choices[]`, `selectedValue`, `onSelect`, `content`, etc.

## 🔒 Privacy Components (`/src/components/privacy/`)

### `ContactInfoExposure.tsx`
**Purpose**: Complete contact visibility control system
**Use Cases**: Any contact information with privacy settings
**Key Features**:
- Role-based visibility options (league_operator, member, captain)
- 5 visibility levels (in-app only → anyone)
- Color-coded privacy feedback
- Helper functions for labels/descriptions
- Reusable across contact types

**Props**: `contactType`, `userRole`, `selectedLevel`, `onLevelChange`, `title`, etc.

### `VisibilityChoiceCard.tsx`
**Purpose**: Individual choice card with explanation (used by ContactInfoExposure)
**Use Cases**: Part of privacy selection system
**Key Features**:
- Radio button with icon and label
- Color-coded explanation card on selection
- Keyboard accessible
- Animation support

**Props**: `option`, `isSelected`, `colors`, `onSelect`, `showExplanation`

## 💳 Payment Components (`/src/components/`)

### `PaymentCardForm.tsx`
**Purpose**: Complete credit card form with secure tokenization
**Use Cases**: Any payment collection, card verification
**Key Features**:
- Real-time card formatting
- Card brand detection
- Secure tokenization flow
- $0.00 authorization verification
- Success/error states
- Security messaging

**Props**: `onVerificationSuccess`, `onVerificationError`, `verifyButtonText`, etc.

## 📊 Preview Components (`/src/components/previews/`)

### `ApplicationPreview.tsx`
**Purpose**: Live preview of application data being filled out
**Use Cases**: Multi-step forms that need live preview
**Key Features**:
- Real-time data display
- Organized sections
- Completion status
- Save/exit functionality

**Props**: `applicationData`, `isComplete`

## 🎯 UI Components (`/src/components/ui/`)
*Note: shadcn/ui components - see shadcn documentation*

## 📱 Modal Components (`/src/components/modals/`)

### `SecurityDisclaimerModal.tsx`
**Purpose**: Security warnings and disclaimers
**Use Cases**: Important security/privacy notices

### `SetupGuideModal.tsx`
**Purpose**: Setup guidance and tips
**Use Cases**: Help content, professional recommendations

## 🔧 Utility Components

### `InfoButton.tsx` (`/src/components/`)
**Purpose**: Information popup trigger button
**Use Cases**: Contextual help throughout forms

## 🎨 Component Patterns

### **Multi-Step Forms**
- Use `QuestionStep` for text inputs
- Use `ChoiceStep` for selections
- Combine with progress indicators
- Include preview panels where helpful

### **Privacy Controls**
- Use `ContactInfoExposure` for any contact info
- Customize with `userRole` and `contactType`
- Consistent color-coding across app

### **Payment Collection**
- Use `PaymentCardForm` for all card collection
- Customize button text and callbacks
- Consistent security messaging

## 📝 Usage Guidelines

1. **Always check this index first** before creating new components
2. **Prefer composition** - combine existing components rather than create new ones
3. **Extend existing components** - add props/features to existing components when possible
4. **Update this index** when creating new reusable components
5. **Test component isolation** - ensure components work independently

## 🔄 Migration Status

- ✅ `QuestionStep` - Moved to `/src/components/forms/`
- ✅ `ChoiceStep` - Moved to `/src/components/forms/`
- ✅ `VisibilityChoiceCard` - Moved to `/src/components/privacy/`
- ✅ `ContactInfoExposure` - Moved to `/src/components/privacy/`
- ✅ `PaymentCardForm` - Already in `/src/components/`
- ✅ `ApplicationPreview` - Moved to `/src/components/previews/`
- ✅ Modal components - Moved to `/src/components/modals/`

---
*Last Updated: Current Date*
*Total Reusable Components: 6+*