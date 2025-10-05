# Active Context

## Current Work Focus

### **Just Completed: Organization Settings & NavRoutes Refactoring** 🎉
**Implementation Date**: 2025-01-05
**Status**: ✅ **PRODUCTION READY**

**What Was Built**:
- Complete Organization Settings page with independent edit sections
- Each card (name, address, email, phone) editable separately
- Improved UX with section-specific edit modes
- NavRoutes refactored to use arrays and map functions
- Dramatically reduced code repetition in routing

**Organization Settings Design**:
- **Separate Edit Sections**: Each card has its own Edit button
- **Independent State Management**: Only one section editable at a time
- **Section-Specific Updates**: Database updates only modified fields
- **Professional Layout**:
  - Organization Name card with historical name warning
  - Mailing Address card (for BCA materials)
  - League Contact Email card (how players contact you by email)
  - League Contact Phone card (how players contact you by phone)
  - Payment Information card (read-only)

**NavRoutes Refactoring**:
- **Array-Based Architecture**: Routes organized by protection level
  - `publicRoutes` - No authentication required
  - `authRoutes` - Require authentication only
  - `memberRoutes` - Require authentication + approved member application
  - `operatorRoutes` - Require league_operator role
- **Map Functions**: Each array mapped to generate routes
- **Cleaner Code**: Dramatically reduced repetition
- **Easier Maintenance**: Adding new routes is now trivial

**Files Modified**:
- `/src/operator/OrganizationSettings.tsx` - Complete rewrite with separate edit sections
- `/src/navigation/NavRoutes.tsx` - Refactored to array-based architecture
- `/src/operator/OperatorDashboard.tsx` - Added Organization Settings button

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

### **🎯 Immediate: Continue League Creation & Management**
**Current Status**: Operator infrastructure complete, ready for league database implementation
**Next Actions**:
- Design and create `leagues` database table
- Design and create `seasons` database table
- Implement actual league creation (write to database)
- Build league management page (view/edit active leagues)
- Create season scheduling and management tools

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