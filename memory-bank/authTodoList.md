# Authentication & Role Management Todo List

Personal tracking for authentication system implementation and league operator onboarding.

## ✅ Completed Core Authentication & Member Management

- **Setup & Infrastructure**: Supabase client, environment variables, React Router, shadcn/Tailwind
- **Login System**: Full login/logout flow with Supabase authentication
- **Registration System**: User signup with email confirmation and auto-login
- **Password Reset**: Complete forgot/reset password flow with enhanced UX
- **Member Profile System**: Complete member application, profile management, and editing
- **Role-Based Access**: Protected routes with member role checking
- **Database Integration Ready**: All CRUD operations prepared with console logging
- **Testing**: All authentication and member flows tested and working

## 🎯 Next Major Phase - League Operator Onboarding System

### Phase 1: League Operator Detection & Invitation

- [ ] **Dashboard Enhancement**: Add "Become a League Operator" button/link for regular members
- [ ] **Role Detection Logic**: Check if user.role !== 'league_operator' to show invitation
- [ ] **League Operator Landing Page**: Create informational page explaining league operator benefits/requirements
- [ ] **Upgrade Path UI**: Design clear call-to-action flow from member to league operator

### Phase 2: League Operator Application Form

- [ ] **League Operator Application Form**: Create comprehensive application form component
- [ ] **Business Information Collection**:
  - [ ] Bar/Pool Hall name and details
  - [ ] Business address (separate from personal address)
  - [ ] Business contact information
  - [ ] Operating hours and schedule
  - [ ] League capacity and table information
- [ ] **Personal Business Details**:
  - [ ] Years of experience running leagues
  - [ ] Previous league operator experience
  - [ ] References or credentials
- [ ] **Agreement & Terms**:
  - [ ] League operator agreement and terms of service
  - [ ] Commission structure acknowledgment
  - [ ] Responsibilities and obligations

### Phase 3: Payment & Billing Setup

- [ ] **Credit Card Information Form**:
  - [ ] Payment method collection (prepare UI for Stripe integration)
  - [ ] Billing address collection
  - [ ] Payment method validation (UI only for now)
- [ ] **Season-Based Billing System**:
  - [ ] Calculate season costs: $1 per team per week
  - [ ] Season billing calculator (teams × weeks × $1)
  - [ ] Payment schedule configuration (due by week 3-4 of season)
  - [ ] Season cost preview and confirmation
- [ ] **Payment Management**:
  - [ ] Season payment due date tracking
  - [ ] Payment reminder system design
  - [ ] Invoice generation for season billing
  - [ ] Payment history per season

### Phase 4: Database Schema & Role Management

- [ ] **Database Schema Updates**:
  - [ ] League operator profile table design
  - [ ] Business information schema
  - [ ] Season billing tracking tables (seasons, teams, payments)
  - [ ] Role transition tracking
- [ ] **Role Upgrade Process**:
  - [ ] Member to league operator role transition logic
  - [ ] Application status tracking (pending, approved, rejected)
  - [ ] Admin approval workflow (if required)

### Phase 5: League Operator Dashboard & Features

- [ ] **League Operator Dashboard**: Separate dashboard with operator-specific features
- [ ] **Pool Hall Management**: Interface to manage their pool hall details
- [ ] **League Creation Tools**: Tools to create and manage leagues (set teams, weeks, dates)
- [ ] **Season Management**: Configure season length, team count, and calculate billing
- [ ] **Player Management**: View and manage players in their leagues
- [ ] **Season Billing Dashboard**: View season costs, payment status, and invoices

### Phase 6: Integration & Testing

- [ ] **Payment Processing Integration**: Integrate with payment processor (Stripe, etc.)
- [ ] **Database Operations**: Implement actual database operations for all league operator functions
- [ ] **Role-Based Security**: Enhanced protected routes for league operator features
- [ ] **Testing**: Comprehensive testing of entire league operator onboarding flow
- [ ] **Admin Tools**: Backend tools for managing league operator applications

---

## Technical Considerations

### Data Flow
1. Regular member sees "Become League Operator" invitation
2. User completes league operator application form
3. Payment information collected (UI prepared for future integration)
4. Application submitted for processing
5. Role upgraded to 'league_operator' upon approval
6. Access to league operator dashboard and features

### Database Tables Needed
- `league_operator_profiles` (business details, pool hall info)
- `league_operator_applications` (application status tracking)
- `pool_halls` (venue information and details)
- `leagues` (league management by operators)
- `seasons` (season details: teams, weeks, start/end dates)
- `season_payments` (billing tracking: amount due, payment status, due dates)
- `teams` (team information within leagues)

### UI/UX Patterns
- Follow existing profile edit patterns for form validation
- Maintain consistent design with member profile system
- Use console.log approach for database operations initially
- Progressive disclosure for complex onboarding flow

## Notes

- **Current Status**: Core member management complete, ready for league operator phase
- **Focus**: Transform regular members into league operators with business capabilities
- **Database Strategy**: Continue console.log approach for partner integration
- **Payment Strategy**: Season-based billing ($1/team/week), due by week 3-4 of season
- **Billing Model**: 10 teams × 12 weeks = $120 per season, payable early in season
- **Validation**: Use established Zod validation patterns from profile system
