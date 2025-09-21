# Technical Context

## Technologies Used

- Markdown for documentation.
- Git for version control.

## Development Setup

- Files stored in the `memory-bank` folder.
- Updated regularly based on project progress.

## Technical Constraints

- Copilot's memory resets between sessions, requiring precise documentation.

## Dependencies

- Accurate and up-to-date Memory Bank files.
- **Supabase**: Used for authentication and session management. The `UserContext` integrates with `supabase.auth.getSession` and `supabase.auth.onAuthStateChange` to manage user authentication state in real-time.
