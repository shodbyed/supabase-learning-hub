# Technical Context

## Technologies Used

- Markdown for documentation.
- Git for version control.
- **React**: For building the user interface with hooks and context patterns.
- **TypeScript**: For type safety and enhanced development experience.
- **Supabase**: For authentication, database management, and real-time features.
- **React Router**: For navigation, routing, and protected route management.
- **Tailwind CSS v4**: For utility-first styling and responsive design.
- **shadcn/ui**: For reusable and accessible UI components.
- **Zod**: For schema validation and type safety.

## Development Setup

- Files stored in the `memory-bank` folder and updated regularly based on project progress.
- **Package Manager**: This project uses **pnpm** (not npm) for all package management operations.
- To add **shadcn** components, use the following command:
  ```bash
  pnpm dlx shadcn@latest add <component-name>
  ```
- **Dev Server**: Use `pnpm run dev` to start the development server.

## Technical Constraints

- **Package Manager Consistency**: Always use pnpm for installations and dependency management.
- **Component Standards**: Start with bare bones shadcn components before adding custom styling.
- **Type Safety**: Maintain strict TypeScript integration across all components and utilities.
- **Responsive Design**: Ensure all components work across mobile and desktop breakpoints.
- **Business Logic Separation**: Keep calculations and utilities in separate files for testability.

## Dependencies

### **Core Infrastructure**
- **Supabase**: Authentication, session management, and database operations. Integrates with `UserContext` for real-time auth state management.
- **React Router DOM**: Navigation with protected routes and programmatic navigation.
- **TypeScript**: Type safety for all components, hooks, and utilities.

### **UI & Styling**
- **Tailwind CSS v4**: Utility-first styling with @tailwindcss/vite integration for responsive design.
- **shadcn/ui**: Accessible React components (Button, Input, Label, Card, Select components currently in use).
- **Radix UI**: Underlying primitive components used by shadcn/ui for accessibility compliance.
- **class-variance-authority & clsx**: Conditional CSS class management and component variants.
- **lucide-react**: Icon library for consistent iconography throughout the application.

### **Data Management & Validation**
- **Zod**: TypeScript-first schema validation for forms and data structures. Comprehensive schemas for profile editing (personalInfoSchema, contactInfoSchema, addressSchema).
- **Custom Hooks**: useUserProfile for member data management with role checking and permission utilities.
- **Utility Functions**: membershipUtils.ts for business logic calculations and UI styling determination.
- **Form Validation**: Advanced Zod error handling with real-time validation feedback and form save blocking.
- **Data Formatting**: Integration with existing formatting utilities (capitalizeWords) for consistent data presentation.

### **Development Patterns**
- **Context Pattern**: Centralized user authentication state with UserContext and UserProvider.
- **Custom Hooks**: Reusable logic for user profile management, form handling, and data fetching.
- **Utility-First Architecture**: Business logic separated into pure functions for reusability and testing.
- **Component Composition**: LoginCard for consistent authentication UI wrapper across auth flows.

### **Future Integration Ready**
- **BCA API Integration**: Structure prepared for official BCA member number verification.
- **League/Tournament Features**: Dashboard architecture ready for feature expansion.
- **Database Integration**: Console.log operations provide exact SQL queries and parameters for partner integration.
- **Profile Edit System**: Complete edit functionality implemented with validation, error handling, and success feedback.
