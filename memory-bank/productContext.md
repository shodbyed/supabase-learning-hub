# Product Context

## Purpose
BCA Member Management System - A comprehensive platform for billiard league members to manage their profiles, track membership dues, and access league/tournament features.

## Problems Solved
- **Member Information Management**: Centralized system for storing and accessing member profiles, contact information, and address details
- **Membership Dues Tracking**: Automated calculation and visual tracking of annual BCA dues with clear status indicators (paid/overdue/never paid)
- **User Experience Clarity**: Clear separation between user-editable information and system-controlled data
- **Navigation Structure**: Organized flow between dashboard (action center) and profile (information center)
- **Authentication Integration**: Seamless connection between Supabase auth and member records

## How It Should Work
- **Authentication Flow**: Users register/login through Supabase auth, then complete member application
- **Profile Management**: Members view comprehensive profile with organized sections for personal info, contact details, address, and account information
- **Dues Visualization**: Color-coded status system (green=current, red=overdue, yellow=never paid) with expiration tracking
- **Dashboard Experience**: Welcome page with quick actions and future navigation to leagues/tournaments
- **Data Organization**: Clear distinction between editable fields (personal info, contact, address) and system fields (role, member number, dues status)

## User Experience Goals
- **Intuitive Navigation**: Profile always accessible from nav bar, dashboard focuses on actions
- **Visual Clarity**: Edit icons only on user-editable sections, color-coded dues status for immediate recognition
- **Information Hierarchy**: Logical grouping of related information with clear visual separation
- **Future Readiness**: Dashboard structure prepared for league and tournament feature integration
- **Mobile Responsive**: Clean design that works across all device sizes
