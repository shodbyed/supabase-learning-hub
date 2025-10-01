# Tournament Scheduling Pattern

## Overview

The Tournament Scheduling Pattern is a reusable architecture for handling tournament date conflicts in league scheduling. This pattern was first implemented for BCA tournaments and is designed to be easily extended to other tournament organizations (APA, VNEA, UPA, etc.).

## Core Features

### **Automatic Database Search**
- useEffect triggers search when tournament step is reached
- Searches for community-verified tournament dates
- Populates radio button choices dynamically
- No manual operator intervention required

### **Community-Verified Date System**
- Multiple operators can confirm tournament dates
- Vote counts indicate reliability of date information
- Most-voted dates appear first in radio button list
- Builds confidence through community consensus

### **Flexible Choice Architecture**
- **Found Dates**: Show database results with vote counts
- **Ignore Option**: Operator doesn't need to schedule around tournament
- **Custom Entry**: Operator has different/updated dates to use

### **Smart URL Integration**
- Clickable links to official tournament websites
- URLs adapt based on current date context
- BCA: Uses next year URL after March 15
- APA: Static URL structure
- Generic getChampionshipLink() function

## Implementation Example: BCA Tournament Step

```typescript
{
  id: 'bca_nationals_dates',
  title: 'BCA National Tournament Scheduling',
  subtitle: (
    <span>
      To avoid conflicts with major tournaments your players may want to attend, please select how to handle BCA Nationals dates.
      <br />
      Please verify championship dates at the{' '}
      <a
        href={fetchBCAChampionshipURL()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        BCA Website
      </a>
      .
    </span>
  ),
  type: 'choice',
  choices: [
    // Dynamic choices from database search
    ...foundTournamentDates.map(option => ({
      value: option.id,
      label: option.label,
      description: option.description
    })),
    // Always include ignore and custom options
    {
      value: 'ignore',
      label: 'Ignore BCA tournament scheduling',
      description: 'I don\'t expect enough of my league players to travel to this tournament so I have no need to schedule my league around it'
    },
    {
      value: 'custom',
      label: 'Enter my own tournament dates',
      description: 'I have different/updated BCA tournament dates to use for scheduling'
    }
  ],
  // ... rest of step configuration
}
```

## Database Search Implementation

```typescript
const searchBCANationalsInDatabase = () => {
  console.log('🔍 DATABASE OPERATION: Automatically searching for BCA Nationals dates');

  const currentYear = new Date().getFullYear();
  const searchQuery = {
    table: 'tournament_dates',
    where: {
      organization: 'BCA',
      tournament_type: 'nationals',
      year: currentYear
    },
    select: ['start_date', 'end_date', 'vote_count', 'last_confirmed'],
    orderBy: 'vote_count DESC'
  };

  // Mock database results with vote counts
  const foundOptions = [
    {
      id: 'found_dates_0',
      label: '2024-02-22 to 2024-02-26',
      description: '8 operators have confirmed these dates',
      startDate: '2024-02-22',
      endDate: '2024-02-26',
      voteCount: 8,
      lastConfirmed: '2024-01-15'
    }
    // ... more options
  ];

  setFoundTournamentDates(foundOptions);
};
```

## Automatic Trigger with useEffect

```typescript
useEffect(() => {
  const step = getCurrentStep();
  // Trigger search when user reaches BCA nationals step for the first time
  if (step.id === 'bca_nationals_dates' && foundTournamentDates.length === 0) {
    console.log('🎯 STEP TRIGGER: Reached BCA Nationals step - starting automatic database search');
    searchBCANationalsInDatabase();
  }
}, [currentStep]);
```

## Component Interface Updates

### **React Element Support**
All wizard components now support React elements in subtitle and content:

```typescript
interface RadioChoiceStepProps {
  title: string;
  subtitle?: string | React.ReactElement;  // NEW: Supports JSX
  // ... other props
}

interface QuestionStepProps {
  title: string;
  subtitle?: string | React.ReactElement;  // NEW: Supports JSX
  // ... other props
}

interface SimpleRadioChoiceProps {
  subtitle?: string | React.ReactElement;  // NEW: Supports JSX
  infoContent?: React.ReactNode;           // NEW: Supports JSX
  // ... other props
}
```

## Tournament URL Utilities

### **Dynamic URL Generation**
```typescript
// BCA: Date-aware URL generation
export const fetchBCAChampionshipURL = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  // After March 15, use next year's championship page
  const useNextYear = month > 2 || (month === 2 && day > 15);
  const championshipYear = useNextYear ? currentYear + 1 : currentYear;

  return `https://www.playcsipool.com/${championshipYear}-bcapl-world-championships.html`;
};

// APA: Static URL
export const fetchAPAChampionshipURL = (): string => {
  return 'https://poolplayers.com/world-pool-championships/';
};

// Generic function for any organization
export const getChampionshipLink = (organization: 'BCA' | 'APA'): string => {
  return organization === 'BCA' ? fetchBCAChampionshipURL() : fetchAPAChampionshipURL();
};
```

## Pattern Replication: APA Implementation

To implement APA tournament scheduling, follow this pattern:

### **1. Add APA Step Definition**
```typescript
{
  id: 'apa_nationals_dates',
  title: 'APA National Tournament Scheduling',
  subtitle: (
    <span>
      To avoid conflicts with major tournaments your players may want to attend, please select how to handle APA Nationals dates.
      <br />
      Please verify championship dates at the{' '}
      <a
        href={fetchAPAChampionshipURL()}  // Only change needed
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        APA Website  {/* Change from "BCA Website" */}
      </a>
      .
    </span>
  ),
  // ... rest identical to BCA implementation
}
```

### **2. Create APA Database Search Function**
```typescript
const searchAPANationalsInDatabase = () => {
  console.log('🔍 DATABASE OPERATION: Automatically searching for APA Nationals dates');

  const searchQuery = {
    table: 'tournament_dates',
    where: {
      organization: 'APA',  // Only change needed
      tournament_type: 'nationals',
      year: currentYear
    },
    // ... rest identical
  };

  // Same logic, different organization
};
```

### **3. Add APA useEffect Trigger**
```typescript
useEffect(() => {
  const step = getCurrentStep();
  if (step.id === 'apa_nationals_dates' && foundTournamentDates.length === 0) {
    console.log('🎯 STEP TRIGGER: Reached APA Nationals step - starting automatic database search');
    searchAPANationalsInDatabase();  // Call APA function
  }
}, [currentStep]);
```

## Generic Info Content

The tournament info button content is designed to work for both BCA and APA:

```typescript
infoTitle: 'Why Schedule Around Major Tournaments?',
infoContent: (
  <div className="space-y-4">
    <p><strong>Many players want to compete in BCA and APA Championships.</strong> These tournaments represent the highest level of pool competition.</p>

    <div>
      <p><strong>Scheduling during tournaments causes problems:</strong></p>
      <ul className="list-disc ml-4 mt-2">
        <li>Teams lose key players who travel to compete</li>
        <li>Unnecessary forfeits when rosters are short</li>
        <li>Complicated makeup matches later in the season</li>
      </ul>
    </div>

    <p><strong>If any of your players might attend these championships, schedule around them.</strong> This supports player growth and keeps your league running smoothly.</p>
  </div>
)
```

## Benefits of This Pattern

### **Developer Benefits**
- **Minimal Code Duplication**: 95% code reuse between organizations
- **Type Safety**: Full TypeScript support with interface definitions
- **Maintainable**: Changes to pattern logic apply to all tournament types
- **Testable**: Clear separation between UI and business logic

### **User Experience Benefits**
- **Consistent Interface**: Same interaction pattern across all tournaments
- **Community Trust**: Vote counts build confidence in date accuracy
- **Flexible Choices**: Accommodates all operator preferences
- **Professional Links**: Direct access to official tournament information

### **Business Benefits**
- **Data Quality**: Community verification improves tournament date accuracy
- **Operator Efficiency**: Automatic search eliminates manual date lookup
- **Conflict Prevention**: Proactive scheduling prevents tournament conflicts
- **Scalability**: Easy addition of new tournament organizations

## Future Extensions

### **Additional Tournament Organizations**
- VNEA (Valley National Eight-ball Association)
- UPA (United States Professional Poolplayers Association)
- Regional tournament circuits
- Local major tournaments

### **Enhanced Features**
- **Conflict Detection**: Check for date overlaps between different tournaments
- **Calendar Integration**: Export tournament dates to operator calendars
- **Notification System**: Alert operators when tournament dates change
- **Multi-Year Planning**: Support for planning multiple seasons ahead

## Implementation Checklist

For each new tournament organization:

- [ ] Add organization to database schema
- [ ] Create fetchXXXChampionshipURL() function
- [ ] Update getChampionshipLink() to support new organization
- [ ] Add database search function (searchXXXNationalsInDatabase)
- [ ] Create wizard step definition with proper subtitle JSX
- [ ] Add useEffect trigger for automatic search
- [ ] Update form data interface to include new tournament dates
- [ ] Test with mock database data
- [ ] Document organization-specific considerations

This pattern provides a robust, scalable foundation for tournament scheduling that can grow with the platform's needs while maintaining consistency and reliability.