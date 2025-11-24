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

---

*Last Updated: 2025-11-24*
