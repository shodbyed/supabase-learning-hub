==== Message System ======

## Design Decisions Made (2025-01-16)

### UI Approach: Full Page (not modal)
- Messaging deserves dedicated space for readability
- Less confusing for tech-averse users
- Better mobile experience for future app
- Route: `/messages`

### Layout: Simplified Slack Style
```
Two-column layout:
- Left: Conversation list with search
- Right: Selected conversation messages + input box
```
No channels, @mentions, or reactions initially - keep it simple

### New Message Flow
- [+ New] button opens modal
- Search bar + filter tabs: All | My Leagues | My Teams
- Click user → creates/opens conversation
- Familiar pattern (like phone texting)

### Navigation
- Envelope icon in navbar with unread badge
- Optional: Dashboard card showing recent messages

### Message Types
1. **Group Chats**: Back-and-forth conversations (everyone can reply)
2. **Announcements**: No-reply messages (from operators/captains only)

## Original Requirements

The message system should be global meaning any user should be able to message any other user. searching for those users may be difficult so we should have ways to limit who they have to scroll thru. maybe filters like global(all) my organization (they may be a part of more than one). my league (again maybe more than one) my teams.

1. first we want to get a simple message system ui in place.
   this should be similar to all the other ones out there lets not reinvent the wheel
2. it will need to be able to handle group chats and announcement type messages(no reply from devs, operators and maybe captains)

future features
one button groups like a captains chat(operator included?) for a specific season. a team chat. season active players things like this

    notifications to phone(maybe just for the phone app i don't know if a website can send notifications to a phone without some doing)

    features: real time notifications, message history threads and reply (don't think we need read receipts yet perhaps a future feature)


    8. optimize
        make sure components follow
        Kiss
        Dry
        small single responsibility
        reusable
        easily testable

=============COMPLETED: CAPTAINS MANAGE TEAM FLOW===============

1. ✅ players league and team pages
2. ✅ have a special button for captains to be able to manage their team/teams
3. ✅ they will need to be able to:
   change team name
   add/remove players
   change/select home venue
4. ✅ make sure changes update every where they need to. ie change of venue will change the schedule as that shows where matches are played.

ux. most members/users are players in a pool league. from the dashboard they will want to be able to get to all of the pages they might need for a league. first should be a list of the leagues they are playing in. the teams they are on. the schedule for those leagues, and the score keeping page for when they are actually playing their matches (an early version of the schedule page exists already but not the rest). in order for us to get to the captains being able to manage their team we need to build the league list (to choose which league they want to work with) and then the team page. captains will just have an visible edit button for the team, regular players will not. the flow for the edit team should already exist with the team wizard so we should be able to bite from that. there is at least some data in the database already for everything we will need for our purposes. most of the functions for the db should also be here some where. hopefully in a designated place

-- future shit 6. consistent modal
use the same modal as in other places in the code some have blacked out the background outside of the modal. i think some others you could see behind it.

5. fix login/register password attribute issue in the console
   Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) <input type=​"password" data-slot=​"input" class=​"file:​text-foreground placeholder:​text-muted-foreground selection:​bg-primary selection:​text-primary-foreground dark:​bg-input/​30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow]​ outline-none file:​inline-flex file:​h-7 file:​border-0 file:​bg-transparent file:​text-sm file:​font-medium disabled:​pointer-events-none disabled:​cursor-not-allowed disabled:​opacity-50 md:​text-sm focus-visible:​border-ring focus-visible:​ring-ring/​50 focus-visible:​ring-[3px]​ aria-invalid:​ring-destructive/​20 dark:​aria-invalid:​ring-destructive/​40 aria-invalid:​border-destructive pr-10" id=​"password" placeholder=​"Enter your password" required value>​

6. check about email verification requirement

Medium Priority
Component Extractions - TeamCard, TeamRosterList, VenueListItem, ConfirmDialog (200+ lines saved, massive reusability gains)
Separate Create/Update Logic - Better testability
