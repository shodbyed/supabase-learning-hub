# Reference Code from Firebase Project

This folder contains code from the existing Firebase league management system for analysis and conversion to the new Supabase-based architecture.

## Folder Structure

```
reference-code/
├── src/                     # Main source code from Firebase project
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom hooks
│   └── services/           # Firebase services
├── firestore-rules/        # Firestore security rules
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## What to Include

**Essential files needed:**
- `src/` folder (all source code)
- `package.json` (to see dependencies)
- Firestore rules (if available)
- Any schema documentation

**Not needed:**
- `node_modules/`
- Build/dist folders
- Git history
- Environment files with secrets

## Analysis Goals

1. **Extract proven patterns** from Firebase implementation
2. **Identify reusable components** for league operator features
3. **Understand billing/payment logic** for season-based pricing
4. **Modernize architecture** for Supabase and current React patterns
5. **Improve upon existing designs** where possible

## Conversion Process

1. Analyze existing Firebase components
2. Identify Supabase equivalent patterns
3. Extract business logic from Firebase-specific code
4. Apply established validation and formatting patterns
5. Enhance UI/UX using current design system
6. Maintain console.log approach for database operations