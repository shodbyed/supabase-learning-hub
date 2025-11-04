Phase 1: Foundation (Setup)
Install TanStack Query
Create /src/api structure
Set up QueryClient with sensible defaults
Create query key factory

Phase 2: Migration Strategy
Start with high-value targets (member data, auth)
Migrate query utilities (\*Queries.ts) to new API layer
Replace custom data-fetching hooks with TanStack Query hooks
Remove duplicate fetches

Phase 3: Enhanced Features
Add optimistic updates for mutations
Implement prefetching strategies
Add query devtools for development

Phase 4: Cleanup
Remove old patterns
Update TABLE_OF_CONTENTS.md
Document new patterns in memory-bank
🤔 Questions Before We Proceed
Do you want TanStack Query? (I highly recommend it - perfect for your use case)
Migration pace: All at once or incremental (I recommend incremental - start with auth/member data)
Should we keep /utils/\*Queries.ts or fully migrate to /api/queries/? (I recommend migrate)
Realtime integration: Keep current useRealtime hook or integrate with TanStack Query subscriptions?
