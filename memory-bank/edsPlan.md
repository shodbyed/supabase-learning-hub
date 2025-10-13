=============FINISH LEAGUE WIZARDS===============

1. Team builder
2. Scheduler
3. Wizard dashboard

-- FINISH TEAM BUILDER WIZARD

    ======left off.  fixing the error handling in the add new team modal.   moving the error near the create team button to be more visible.

    8. optimize
    make sure components follow
    Kiss
    Dry
    small single responsibility
    reusable
    easily testable

-- Add the scheduler
description: the schedule will contain the match ups between the teams for each week of the season. this will not only need to be displayed but used by the website create scoring mechanisms users to document their games/matches. each week teams will play

    actual 4 team schedule
    export const fourTeamSchedule = [

{ week: 1, matches: [[1, 2], [3, 4]] },
{ week: 2, matches: [[3, 1], [4, 2]] },
{ week: 3, matches: [[2, 3], [1, 4]] },
{ week: 4, matches: [[3, 4], [2, 1]] },
{ week: 5, matches: [[4, 2], [1, 3]] },
{ week: 6, matches: [[1, 4], [3, 2]] },
{ week: 7, matches: [[2, 1], [4, 3]] },
{ week: 8, matches: [[1, 3], [2, 4]] },
{ week: 9, matches: [[3, 2], [4, 1]] },
{ week: 10, matches: [[4, 3], [1, 2]] },
{ week: 11, matches: [[2, 4], [3, 1]] },
{ week: 12, matches: [[4, 1], [2, 3]] },
];
week 1 would be team 1 vs team 2 and team 3 vs team 4 etc.  
first number is home team 2nd number is away. (week 13 would start over at week 1) 1. schedulers
decide shape for schedulers to be stored in
decide if (blank) schedulers should be stored in the code or in the database
i have schedulers that will accommodate between 4 and 48 teams. 2. convert schedulers from PDF to correct code shape 3. bye team
if {# of teams} is odd add a bye team to allow for seamless scheduling 4. randomize order
assign them numbers 1 to {# of teams} randomly to teams 5. scheduler
figure out an appropriate way to merge the scheduler with the teams and weeks.

    6. display schedule
        (this should be a reusable component as it will be used several places in the website)
        find an appropriate way to display the schedule for the league that is adaptive and intuitive
        we will need several "views" of the schedule depending on user needs

        single line per date (bare bones)
        {date} 1 vs 2, 3 vs 4
        {date} 3 vs 1, 4 vs 2  etc with team list
        Team 1 {Team name}
        Team 2 {Team name}

        expanded (more explanatory)
        {date}
        Mav's (home) vs Bucks @ {venue}
        Sun's (home) vs Tigers @ {venue}
        {date}
        Sun's (home) vs Mav's @ {venue} ... etc

        team view
        schedule for Mav's
        {date} Bucks @ {venue} (home)
        {date} Suns @ {venue} (away)

    7. connect to database
        write sql to create tables needed
        write teams, and schedule too database

    8. optimize
        make sure components follow
        Kiss
        Dry
        small single responsibility
        reusable
        easily testable

-- future shit 6. consistent modal
use the same modal as in other places in the code some have blacked out the background outside of the modal. i think some others you could see behind it.

5. fix login/register password attribute issue in the console
   Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) <input type=​"password" data-slot=​"input" class=​"file:​text-foreground placeholder:​text-muted-foreground selection:​bg-primary selection:​text-primary-foreground dark:​bg-input/​30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow]​ outline-none file:​inline-flex file:​h-7 file:​border-0 file:​bg-transparent file:​text-sm file:​font-medium disabled:​pointer-events-none disabled:​cursor-not-allowed disabled:​opacity-50 md:​text-sm focus-visible:​border-ring focus-visible:​ring-ring/​50 focus-visible:​ring-[3px]​ aria-invalid:​ring-destructive/​20 dark:​aria-invalid:​ring-destructive/​40 aria-invalid:​border-destructive pr-10" id=​"password" placeholder=​"Enter your password" required value>​

6. check about email verification requirement

Medium Priority
Component Extractions - TeamCard, TeamRosterList, VenueListItem, ConfirmDialog (200+ lines saved, massive reusability gains)
Separate Create/Update Logic - Better testability
