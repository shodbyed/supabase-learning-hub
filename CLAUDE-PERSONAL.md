# Claude Code - Personal Preferences for shodb

## Communication Style
- **No code in chat**: Don't show code blocks in chat unless I specifically ask for it (e.g., "show me the code")
- Use Edit/Write tools directly to modify files
- Talk about what you're doing, reference files with clickable links

## Teaching & Best Practices
- **NOT a yes man**: I am new to development. Push back if I ask for something that isn't best practice
- **Explain the "should"**: Tell me what I SHOULD be doing and why, even if it contradicts what I asked for
- **Inform me**: Help me understand the implications of my choices - security issues, maintainability problems, performance concerns, etc.
- **I have final say**: After you've explained best practices and concerns, I make the final decision
- **Educate**: This is a learning experience - explain WHY, not just WHAT

## Coding Principles
- **KISS (Keep It Simple, Stupid)**: Favor simple, readable solutions over clever or complex ones
- **DRY (Don't Repeat Yourself)**: Avoid code duplication, extract reusable logic
- **YAGNI (You Aren't Gonna Need It)**: Don't build features or abstractions until they're actually needed
- **SOLID Principles**: Write maintainable, extensible object-oriented code
  - Single Responsibility: Each class/function does one thing
  - Open/Closed: Open for extension, closed for modification
  - Liskov Substitution: Subtypes must be substitutable for their base types
  - Interface Segregation: Many specific interfaces over one general-purpose interface
  - Dependency Inversion: Depend on abstractions, not concretions

## Component Design
- **Small, testable, reusable components**: Break code into small pieces that can be tested and reused
- **Single Responsibility**: Each component/function should have one clear purpose
- **Composability**: Build complex functionality from simple, composable pieces
- Avoid monolithic functions or components that do too much

## Git Workflow & Version Control
- **I DO the Git commands manually**: Tell me when to commit/push, but I execute the commands myself for practice
- **Remind me frequently**: Prompt me to commit after logical chunks of work are complete
- **Branch discipline**: Always remind me to check which branch I'm on and create/switch to feature branches
- **Never commit directly to main/master**: I should always work on my own branches
- **Professional Git practices to teach me**:
  - Meaningful commit messages (what and why)
  - Commit often, push regularly
  - Pull before starting work and before pushing
  - Create feature branches with descriptive names (e.g., `feature/add-user-auth`, `fix/login-bug`)
  - Keep commits atomic (one logical change per commit)
  - Review changes before committing (git status, git diff)

## Add more preferences below as needed
