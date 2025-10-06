# Active Context

## Current Work Focus

### **Just Completed: Dashboard & Organization Settings Refinements** 🎉
**Implementation Date**: 2025-01-05
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Dashboard layout improvements with perfect grid alignment
- DashboardCard component updated with icon/title on same line (more compact)
- Organization Settings restructured to card-based overview
- League Rules page created with BCA rules links and house rules preview
- Removed League Rules from dashboard (now inside Organization Settings)
- Dashboard now has 3 quick action cards + Organization Settings + Quick Stats in perfect grid

**Dashboard Architecture**:
- **Row 1**: 3 cards (Messaging, Manage Players, Venue Partners) in grid
- **Row 2**: Active Leagues (2/3 width) + Sidebar (1/3 width)
- **Sidebar Contains**: Organization Settings card + Quick Stats
- **Grid Layout**: Using CSS Grid (`lg:grid-cols-3`) for perfect alignment
- **Compact Cards**: Icon and title on same line, reducing card height

**Organization Settings Redesign**:
- **Overview Page**: Card-based layout similar to dashboard style
- **Organization Info Card**: Displays org name, address, email, phone with "Edit Info" button
- **League Rules Card**: Links to `/league-rules` page for BCA rules and house rules
- **Future Ready**: "Edit Info" button ready for detailed edit page implementation

**League Rules Page**:
- **Official BCA Rules**: Links to 8-Ball, 9-Ball, and 10-Ball rules
- **TODO**: Current links go to bca-pool.com/page/rules which requires another click + PDF download
- **Future**: Need direct PDF links or consider hosting rules in-app
- **House Rules Section**: Preview of coming feature with examples (call pocket, coaching, time limits, etc.)
- **Navigation**: Back button to Organization Settings

**Files Created/Modified**:
- `/src/components/operator/DashboardCard.tsx` - Icon/title on same line
- `/src/operator/OperatorDashboard.tsx` - Grid layout with 3 + 2 structure
- `/src/operator/OrganizationSettings.tsx` - Complete restructure to card overview
- `/src/operator/LeagueRules.tsx` - NEW FILE - BCA rules and house rules page
- `/src/navigation/NavRoutes.tsx` - Added `/league-rules` route

### **Previously Completed: League Creation Database Integration** 🎉
**Implementation Date**: 2025-01-05
**Status**: ✅ **WORKING IN LOCAL DATABASE**

**What Was Built**:
- Complete `leagues` database table with proper schema
- Full league creation wizard integration with database
- Actual league records created in Supabase
- Row Level Security (RLS) policies properly configured
- Changed "qualifier" to "division" for better clarity
- Loading states and error handling during creation

**League Database Design**:
- **Leagues Table**: Container for ongoing league concept (game type, day, division, format)
- **Simple Schema**: Stores components, derives display names on-the-fly
- **Best Practices**: Lowercase database values (`eight_ball`, `monday`), formatted for display
- **Division Field**: Renamed from "qualifier" - more intuitive for operators
- **Historical Tracking**: `league_start_date` and `created_at` for league history

**RLS Policy Fix**:
- **Initial Issue**: Policies failed because they didn't join through `members` table
- **Auth Chain**: `auth.uid()` → `members.user_id` → `league_operators.member_id` → `leagues.operator_id`
- **Solution**: All RLS policies now JOIN through members table to verify ownership
- **Policies**: SELECT, INSERT, UPDATE, DELETE all check operator ownership
- **Public Access**: Active leagues visible to all (for player discovery)

**Database Operations**:
- Wizard fetches operator_id on mount
- Converts UI data to database format (`8-Ball` → `eight_ball`)
- INSERT league record with all required fields
- Clears localStorage after successful creation
- Navigates to operator dashboard

**UI Improvements**:
- Button shows "Creating League..." during submission
- All buttons disabled while submitting
- Proper error handling with console logging
- Success console logs show formatted league names

**Files Created/Modified**:
- `/database/leagues.sql` - Complete schema with fixed RLS policies
- `/src/types/league.ts` - League, LeagueInsertData types, formatter functions
- `/src/operator/LeagueCreationWizard.tsx` - Database integration, loading states
- `/src/components/forms/WizardStepRenderer.tsx` - Added isSubmitting prop
- `/src/components/forms/RadioChoiceStep.tsx` - Loading state support
- `/src/components/forms/QuestionStep.tsx` - Loading state support
- `/src/data/leagueWizardSteps.simple.tsx` - Changed to "division identifier"
- `/src/constants/infoContent/leagueWizardInfoContent.tsx` - Updated division info

### **Previously Completed: Organization Settings & NavRoutes Refactoring**
**Implementation Date**: 2025-01-05 (earlier in session)
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Organization Settings page with per-card editing
- NavRoutes refactored to array-based architecture
- Dramatically reduced code repetition

### **Previously Completed: League Operators Database & Application Submission**
**Implementation Date**: 2025-01-04
**Status**: ✅ **WORKING IN LOCAL DATABASE**

**What Was Built**:
- Complete `league_operators` database table with all fields
- Automatic database insertion on operator application submission
- Member role upgrade from 'player' to 'league_operator'
- Mock payment data generator for testing
- Full TypeScript type definitions for operator data

**Database Schema**:
- Created `/database/league_operators.sql` (ready for production)
- Table with 20+ columns including organization, contact, payment info
- Row Level Security (RLS) policies for data protection
- Triggers for auto-updating timestamps
- Indexes for performance on key lookups
- Foreign key to members table with CASCADE delete

**Application Flow**:
1. User fills out 6-step operator application form
2. Data collected with localStorage persistence
3. On submit: generates mock payment data (Stripe IDs)
4. INSERT into `league_operators` table
5. UPDATE `members.role` to 'league_operator'
6. Navigate to operator welcome page
7. User can now create leagues!

**Key Design Decisions**:
- **Address**: Copied from member profile at creation (admin-only, not shown to players)
- **Email/Phone**: Separate from member profile with visibility controls
- **Payment**: Mock data for testing (`cus_mock_...`, `pm_mock_...`)
- **Visibility Levels**: `in_app_only` (default), `my_teams`, `anyone`, etc.
- **In-app messaging required** for 'in_app_only' visibility to work

**Files Created/Modified**:
- `/database/league_operators.sql` - Database schema
- `/src/types/operator.ts` - TypeScript types + mock payment generator
- `/memory-bank/databaseSchema.md` - Complete database design documentation
- `/memory-bank/futureFeatures.md` - In-app messaging requirements documented
- `LeagueOperatorApplication.tsx` - Actual database insertion implemented

### **Previously Completed: Navigation & Link Improvements**
**Implementation Date**: Previous session
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Fixed sticky back button positioning and styling on all format detail pages
- Removed `target="_blank"` from info content links to enable proper back navigation
- Updated all navigation buttons to use consistent blue styling (variant="default")
- Verified public access security for all format detail pages

### **Previously Completed: 5-Man Format Detail Pages & Info System**
**Implementation Date**: Previous session
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Complete 5-Man Format Details page with comprehensive handicap system explanation
- Separate 8-Man Format Details page for traditional BCA format
- Format Comparison page for side-by-side analysis
- Enhanced info button system with links to detail pages
- All pages publicly accessible for operators to review

**Technical Implementation**:
- Three new public route pages: `/5-man-format-details`, `/8-man-format-details`, `/format-comparison`
- Removed comparison table from 5-man details, replaced with navigation buttons
- Updated info content centralization with `teamFormatComparisonInfo` export
- Cross-navigation between all three pages with browser history back support
- Rich content in info buttons with clickable links to detail pages

## Recent Changes

### **5-Man Format Details Page Enhancements**
**Sections Completed**:
1. **Overview** - Key benefits with experience-based credibility statement (15 years operator experience)
2. **How It Works** - Team structure, match format, example match night with break/rack rotation
3. **Handicap System Explained** - Complete system documentation:
   - Individual skill levels (+2 to -2 scale)
   - Skill calculation formula with rounding examples
   - 250-game rolling window for stability vs responsiveness
   - Team handicap calculation with modifier system
   - Games needed chart (H/C +12 to -12) in 2/3 + 1/3 column layout
   - Detailed example calculations with explicit player breakdowns
4. **Tie-Breaker Playoff** - Best 2-of-3 rules, winning team all get +1, losing team no change
5. **Standings and Ranking** - Three-tier system (match wins → team points → total games won)
6. **Why This Reduces Handicap Complaints** - 5 key reasons including handicap responsiveness
7. **Why Players Prefer This Format** - Less crowding (6-10 people vs 10-16 people)
8. **Benefits for League Operators** - Including "Eliminates Bias" benefit

### **Info Content Centralization Updates**
**Changes Made**:
- Renamed `teamFormatInfo` to `teamFormatComparisonInfo` for clarity
- Enhanced 8-man format info with structured "How It Works" section
- Added crowding numbers to comparison (6-10 people vs 10-16 people)
- All three info contents now have clickable links to detail pages
- Consistent formatting across all format info

### **Navigation Architecture**
**Implementation**:
- Three separate pages for focused content presentation
- Cross-navigation buttons between all pages
- Public routes (no authentication required)
- "Back" button uses `navigate(-1)` for flexible return
- Info buttons in wizard link to appropriate detail pages

## Next Steps

### **🎯 Immediate: Season Creation & Management**
**Current Status**: Leagues are created and displayed on dashboard with orange "Setup Needed" status
**Next Actions**:
- Design and create `seasons` database table
- Build season creation wizard (creates first season for a league)
- Link "Create Season" button from league cards to season wizard
- Update league progress indicators based on season status
- Team registration and management (after season exists)

### **Future Format Documentation Enhancements**
- Add video demonstrations of match flow
- Create printable quick reference cards for operators
- Develop operator training materials
- Build player onboarding guides explaining the system

## Active Decisions and Considerations

### **Educational Content Strategy**
**Decision**: Provide exhaustive detail upfront with credibility statement
**Rationale**: Operators need complete understanding before committing; 15 years experience provides authority
**Implementation**: Comprehensive detail pages with acknowledgment that it's "a lot to read"

### **Format Comparison Approach**
**Decision**: Separate comparison page rather than inline
**Rationale**: Allows focused comparison without cluttering individual format pages
**Implementation**: Dedicated comparison page with quick summary cards for each format

### **Public Access Philosophy**
**Decision**: Make all format detail pages public (no login required)
**Rationale**: Operators should be able to review system before committing to registration
**Implementation**: Public routes in NavRoutes.tsx

### **Handicap System Transparency**
**Decision**: Explain every detail of handicap calculation with concrete examples
**Rationale**: Transparency reduces complaints and builds operator confidence
**Implementation**: Step-by-step examples, charts, real-world scenarios, rounding demonstrations

### **Team Modifier Complexity**
**Decision**: Show 4 different standing scenarios to explain modifier calculation
**Rationale**: Complex concept needs multiple examples to be understood
**Implementation**: Example standings table with 4 matchup calculations + "additional teams below" indicator

## Current Status Summary

✅ **5-Man Format Details**: Complete comprehensive guide with all systems explained
✅ **8-Man Format Details**: Traditional format overview complete
✅ **Format Comparison**: Side-by-side analysis with quick summaries
✅ **Navigation System**: Cross-page navigation with back button support
✅ **Info Button Integration**: All wizard info buttons link to detail pages
✅ **League Operator System**: Complete database integration and profile management
✅ **Organization Settings**: Full CRUD operations for operator profile
✅ **NavRoutes Architecture**: Array-based routing with minimal repetition
🔄 **League Creation**: Wizard UI complete, ready for database implementation
🔄 **League Management**: Dashboard ready, needs active league tracking