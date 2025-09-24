# Architecture & Technical Context

## System Architecture

### Core Infrastructure
- **Memory Bank**: Interconnected Markdown files providing project context
- **Supabase**: Authentication, session management, and database operations
- **React Router**: Navigation with protected routes and programmatic routing
- **TypeScript**: Strict type safety across all components and utilities

### Component Architecture
- **UserContext & UserProvider**: Centralized authentication state management
- **useUserProfile**: Hook for member data management with role checking
- **Custom Hooks**: Reusable logic for form handling and data fetching
- **Component Composition**: LoginCard wrapper for consistent auth UI

## Key Technical Decisions

### **Package Management**
- **pnpm**: Exclusive package manager (not npm) for all operations
- **shadcn Integration**: `pnpm dlx shadcn@latest add <component-name>`
- **Dev Server**: `pnpm run dev` for development

### **Development Patterns**
- **Named Exports**: Preferred over default exports for consistency
- **Utility-First Architecture**: Business logic in pure functions for testing
- **Component Standards**: Start with bare shadcn components before custom styling
- **Database Simulation**: Console.log operations for partner integration

### **Validation & Data Management**
- **Zod Schemas**: TypeScript-first validation in src/schemas/ directory
- **Real-time Validation**: Form validation with error feedback and save blocking
- **Data Formatting**: Consistent formatting using utility functions (capitalizeWords)
- **Change Detection**: Only modified fields logged for efficient updates

## Design Patterns

### **Edit System Pattern**
Consistent UI flow across all editable components:
1. Edit icon indicates editable sections
2. Click reveals form fields with validation
3. Save/cancel buttons for user control
4. Real-time error feedback during editing
5. Success popup with before/after change details

### **Status System Pattern**
Color-coded visual indicators for business states:
- **Green**: Current/paid status
- **Red**: Overdue/problem status
- **Yellow**: Warning/never paid status
- Utility functions return CSS classes based on business logic

### **Database Integration Pattern**
- UI provides full functionality with user feedback
- Console.log shows exact SQL queries and parameters needed
- Partner team handles actual database operations
- Consistent error handling and success states

## Technologies Used

### **Frontend Stack**
- **React**: Component-based UI with hooks and context
- **TypeScript**: Type safety and enhanced development experience
- **Tailwind CSS v4**: Utility-first styling with @tailwindcss/vite integration
- **shadcn/ui**: Accessible components (Button, Input, Label, Card, Select)
- **Radix UI**: Underlying primitives for accessibility compliance
- **Lucide React**: Consistent iconography throughout application

### **Data & Validation**
- **Zod**: Schema validation with TypeScript integration
- **Custom Utilities**: membershipUtils.ts for business logic calculations
- **Form Management**: useReducer for complex form state
- **Real-time Formatting**: Phone numbers, text fields with live transformation

### **Infrastructure**
- **Supabase**: Authentication and database backend
- **React Router DOM**: Client-side routing with protection
- **Vite**: Build tool with environment variable support
- **class-variance-authority & clsx**: Conditional CSS class management

## Component Relationships

### **Authentication Flow**
```
UserProvider → UserContext → useUser hook → Components
Supabase ← → UserContext (session management)
Login/Register → UserContext (state updates)
Protected Routes → UserContext (access control)
```

### **Profile System Flow**
```
Profile Component → useUserProfile hook → Member data
Profile Sections → Edit Components → Validation Schemas
membershipUtils → Status calculations → UI styling
Edit Forms → Console.log → Database operation simulation
```

### **Navigation Architecture**
```
App.tsx → NavBar + NavRoutes
NavRoutes → Protected/Public route definitions
NavBar → Conditional links based on auth status
Dashboard ← → Profile (action vs information separation)
```

## Technical Constraints

### **Responsive Design**
- Mobile-first approach with grid layouts
- Breakpoint adaptation for all components
- Consistent spacing and typography scales

### **Type Safety**
- Strict TypeScript configuration
- Interface definitions for all data structures
- Type-safe form validation with Zod integration

### **Business Logic Separation**
- Pure utility functions for calculations
- Testable business logic in dedicated files
- Clear separation from UI components

### **Future Integration Ready**
- BCA API integration structure prepared
- League/tournament feature architecture planned
- Database schema evolution documented

## Development Setup

### **Environment Configuration**
- `.env` file with Supabase credentials
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Vite's `import.meta.env` for variable access

### **Code Organization**
- `src/components/` - React components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/schemas/` - Zod validation schemas
- `src/utils/` - Pure utility functions
- `memory-bank/` - Project documentation and patterns

### **Quality Assurance**
- TypeScript strict mode enabled
- Consistent error handling patterns
- Real-time validation feedback
- Comprehensive success state management