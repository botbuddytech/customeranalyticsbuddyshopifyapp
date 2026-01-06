# Usage Tracking Table Schema Proposal

## Table 1: `UsageTracking`

This table will track total usage for each shop (no daily tracking).

### Proposed Columns:

1. **id** (String, UUID, Primary Key)
   - Unique identifier for each record

2. **shop** (String, Unique, Indexed)
   - Shopify shop identifier (e.g., "store-name.myshopify.com")
   - Used to identify which shop the usage belongs to

3. **totalChatsCreated** (Int, Default: 0)
   - Total number of chats created overall (cumulative)
   - Never resets

4. **totalListsGenerated** (Int, Default: 0)
   - Total number of lists generated overall (from AI Search Analyzer queries)
   - Never resets

5. **totalListsSaved** (Int, Default: 0)
   - Total number of lists saved overall (from both AI Search Analyzer and Filter Audience)
   - Never resets

6. **totalExports** (Int, Default: 0)
   - Total number of exports performed overall (PDF, CSV, Excel from both sources)
   - Never resets

7. **isBlocked** (Boolean, Default: false)
   - Flag to block user when limits are exceeded
   - Set to true when any limit is exceeded

8. **createdAt** (DateTime, Default: now())
   - When the record was created

9. **updatedAt** (DateTime, Auto-updated)
   - When the record was last updated

---

## Table 2: `UsageLimits`

This table will store global limits that apply to ALL users (not shop-specific).

### Proposed Columns:

1. **id** (String, UUID, Primary Key)
   - Unique identifier for each record

2. **maxChats** (Int, Default: 10)
   - Maximum allowed chats per shop (global limit for all shops)

3. **maxListsGenerated** (Int, Default: 20)
   - Maximum allowed lists generated per shop (global limit for all shops)

4. **maxListsSaved** (Int, Default: 15)
   - Maximum allowed lists saved per shop (global limit for all shops)

5. **maxExports** (Int, Default: 10)
   - Maximum allowed exports per shop (global limit for all shops)

6. **isActive** (Boolean, Default: true)
   - Flag to enable/disable limits globally

7. **createdAt** (DateTime, Default: now())
   - When the record was created

8. **updatedAt** (DateTime, Auto-updated)
   - When the record was last updated

### Notes:

- This table should have only ONE record (the global limits)
- All shops will use the same limits from this table
- Limits can be updated by admin to change for all users at once

---

### Additional Considerations:

- **Export Source Tracking**: We can add a separate table or JSON field to track export sources (ai-search-analyzer vs filter-audience) if needed
- **List Generation Tracking**: We'll track when a GraphQL query is executed and results are displayed (not just when saved)
- **Limit Checking**: Before allowing an action, check if the shop's total usage exceeds the global limits from `UsageLimits` table

### Questions for Confirmation:

1. Should we track export sources separately (ai-search-analyzer vs filter-audience)?
2. What should be the default limits for each metric? (Currently: 10 chats, 20 lists generated, 15 lists saved, 10 exports)
3. Do we need to track "lists generated" separately from "lists saved"?
   - Generated = Query executed and results shown
   - Saved = User explicitly saves the list
4. Should we add a separate table for detailed export history, or is the count sufficient?
