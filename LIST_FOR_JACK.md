# Task List for Jack

## 1. Revamp Navigation Bar
- Review and update the navigation bar design and functionality
- Ensure consistent styling and user experience

## 2. Fix App.tsx Navigation
- Remove or properly implement the commented-out `NavigationWrapper` component in `src/App.tsx`
- Clean up unused imports: `useLocation`, `NavBar`, `OperatorNavBar`
- This is causing TypeScript errors for unused declarations

## 3. Home Page - Mobile First Design
- Review and update the home page for mobile-first responsive design
- Ensure all sections look great on mobile devices first
- Test on various screen sizes (mobile, tablet, desktop)
- Optimize images and layout for mobile performance

## 4. Login Pages - Mobile First Design
- Review and update all login/auth pages for mobile-first design:
  - Login page (`/login`)
  - Register page (`/register`)
  - Forgot Password page (`/forgot-password`)
  - Reset Password page (`/reset-password`)
  - Email Confirmation page (`/confirm`)
- Ensure forms are easy to use on mobile devices
- Test form inputs, buttons, and validation messages on small screens
- Optimize layout and spacing for mobile

## 5. Organization Settings Page Styling
- Review and improve styling for `/operator/organization-settings` page
- The layout and visual design needs refinement for better UX
- Current sections include:
  - Organization Information card (with individual editable sections)
  - League Rules card
  - Venue Management card
  - Content Moderation (Profanity Filter) card
  - Blackout Dates (BCA/APA Championship) card
- Consider improving:
  - Card layouts and spacing
  - Edit mode transitions
  - Form styling consistency
  - Mobile responsiveness
  - Visual hierarchy

## 6. Type System Architecture Review
- **Issue**: Over-abstraction with Pick<> types for single-record fetches
- **Context**: Using `Pick<Member, 'id' | 'name' | ...>` for individual member queries adds maintenance overhead without performance benefit
- **Question**: Should we grab full records (`select *`) for single-entity fetches and only use selective fetching for list queries where it matters?
- **Trade-off**: Simplicity vs explicit dependencies. At current scale, simplicity likely wins.
- **Files affected**: Message components (MemberForMessaging), various single-entity hooks
- **Decision needed**: Establish pattern for when to use selective vs full fetching

## 7. InfoButton Responsive Positioning
- **Issue**: InfoButton popups get cut off on small screens
- **Context**: The popup positioning logic in `/src/components/InfoButton.tsx` needs improvement for mobile
- **Problem**: On narrow screens, the popup can extend beyond viewport edges, causing horizontal scrolling or cut-off content
- **Solution needed**:
  - Make popups stay fully within viewport at all screen widths
  - At small widths, consider full-width or anchored-to-edge positioning
  - At larger widths, keep centered positioning
  - Prevent any content cutoff regardless of screen size
- **File**: `/src/components/InfoButton.tsx`

---

*Last Updated: 2025-11-25*
