# Technical Context

## Technologies Used

- Markdown for documentation.
- Git for version control.
- **React**: For building the user interface.
- **Supabase**: For authentication and database management.
- **React Router**: For navigation and routing.
- **Tailwind CSS**: For utility-first styling.
- **shadcn**: For reusable and accessible UI components.

## Development Setup

- Files stored in the `memory-bank` folder.
- Updated regularly based on project progress.
- To add **shadcn** components, use the following command:
  ```bash
  pnpm dlx shadcn@latest add <component-name>

  ```

## Technical Constraints

- Maintaining consistency across component styling and patterns.
- Ensuring proper TypeScript integration with all dependencies.

## Dependencies

- Accurate and up-to-date Memory Bank files.
- **Supabase**: Used for authentication and session management. The `UserContext` integrates with `supabase.auth.getSession` and `supabase.auth.onAuthStateChange` to manage user authentication state in real-time.
- **Tailwind CSS v4**: Fully integrated for utility-first styling with @tailwindcss/vite plugin.
- **shadcn/ui**: Component library providing accessible React components (Button, Input, Label, Card components currently in use).
- **Radix UI**: Underlying primitive components used by shadcn/ui for accessibility.
- **class-variance-authority & clsx**: For conditional CSS class management.
- **lucide-react**: Icon library used by shadcn components.
