# System Patterns

## System Architecture

- Memory Bank consists of interconnected Markdown files:
  - `projectbrief.md` → Foundation document.
  - `productContext.md` → Project purpose and goals.
  - `activeContext.md` → Current focus and progress.
  - `systemPatterns.md` → Architecture and design patterns.
  - `techContext.md` → Technical setup and constraints.
  - `progress.md` → Status and known issues.
  - Supabase client is initialized in `supabaseClient.ts` using environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Key Technical Decisions

- Use Markdown for all Memory Bank files for simplicity and readability.
- Used Vite's `import.meta.env` to retrieve environment variables.
- Verified the Supabase connection with a test query in `App.tsx`.
- **Named Exports**: Prefer named exports (e.g., `export const Login`) over default exports for all components and utilities to improve consistency and clarity.

## Design Patterns in Use

- Hierarchical structure for file dependencies.
- Clear workflows for planning and execution.
- Centralized Supabase client initialization for reuse across the app.
- Environment variables stored in `.env` for security and flexibility.

## Component Relationships

- Files build upon each other to provide a complete project context.
- `supabaseClient.ts` is imported wherever Supabase functionality is needed.
- `App.tsx` serves as the entry point for testing the connection.
- `Login.tsx` handles user authentication by interacting with `supabaseClient.ts`.
- Future components (e.g., Login UI) will also import `supabaseClient.ts` to interact with Supabase for authentication and other features.
- React Router DOM is used to manage navigation and routing in the app.
- `NavBar` handles navigation links and is used in `App.tsx`.
- `NavRoutes` defines all application routes and is used in `App.tsx`.
- `Home` is the landing page and includes a link to the Login page.
- `About` is a static page added to the navigation.
- `Login` handles user authentication and integrates with Supabase's `signInWithPassword`.
- `UserContext` provides a centralized context for managing user authentication state.
- `UserProvider` wraps the app and manages the `UserContext` state, including `isLoggedIn` and `user`.
- `useUser` is a custom hook that allows components to access the `UserContext`.
- `LogoutButton` triggers the logout process and updates the `UserContext`.
- `UserProvider` manages the authentication state (`isLoggedIn` and `user`) and provides it to the app.
- `NewPlayerForm` provides comprehensive player registration with routing at `/new-player`.

## Emerging Patterns

- **Reusable Client**: The `supabaseClient.ts` file acts as a single source of truth for interacting with Supabase, ensuring consistency across the app.
- **Environment-Driven Configuration**: All sensitive configuration (e.g., API keys) is stored in `.env` and accessed via `import.meta.env`, making the app portable and secure.
- **Step-by-Step Development**: Each feature (e.g., authentication) is built incrementally, with clear testing and validation at each step.
- **Navigation Flow**: React Router DOM is used to define and protect routes, ensuring secure access to authenticated pages.
- **Modular Navigation**: Navigation is split into `NavBar` (links) and `NavRoutes` (routes) for better maintainability.
- **Declarative Routing**: React Router DOM is used to define routes declaratively.
- **Reusable Components**: Components like `NavBar` and `NavRoutes` are designed to be reusable and modular.
- **Modular CSS**: Navigation-specific styles are moved to `navigation.css` for better organization and maintainability.
- **Centralized Authentication State**: The `UserContext` and `UserProvider` manage the authentication state (`isLoggedIn` and `user`) and provide it to the app via React Context.
- **Custom Hooks for Context Access**: The `useUser` hook simplifies access to the `UserContext` and ensures proper usage by throwing an error if used outside of a `UserProvider`.
- **Separation of Concerns**: The `UserContext`, `UserProvider`, and `useUser` are split into separate files for better maintainability and compatibility with React Fast Refresh.
- **Authentication Flow**: The `Login` component and `LogoutButton` integrate with Supabase and the `UserContext` to manage authentication state.
- **Navigation**: React Router's `useNavigate` is used to programmatically navigate after login and logout.
- **Styling with Tailwind CSS v4**: Fully implemented utility-first styling ensuring consistent and responsive design system with @tailwindcss/vite integration.
- **Reusable Components with shadcn/ui**: Integrated accessible and reusable UI components including Button, Input, Label, and Card components.
- **Component Composition Pattern**: LoginCard wraps common card functionality while Login component focuses on authentication logic.
- **Variant-based Styling**: Using shadcn's variant system (e.g., `variant="secondary"` for buttons) for consistent component styling.
- **Schema Organization Pattern**: Validation schemas separated into dedicated `src/schemas/` directory for reusability and maintainability.
- **Type-Safe Form Validation**: Using Zod schemas with TypeScript type inference for form data validation and type safety.
- **Complex Form State Management**: useReducer pattern for handling multi-field forms with validation errors and field updates.
- **Real-time Input Formatting**: Custom formatters for phone numbers and text fields that transform data as users type.
- **Progressive Form Enhancement**: Forms handle validation, formatting, and submission with comprehensive error feedback.
