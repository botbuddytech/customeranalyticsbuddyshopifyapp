# Testing Instructions for Customer Analytics Buddy

## Quick Testing Steps

1. **Install & Onboard**
   - Install the app and complete the 4-step onboarding
   - In Step 3, click "Generate a list of all my customers" and verify AI response with customer list

2. **Dashboard**
   - View customer analytics cards (Total, New, Returning, Inactive Customers)
   - Click "View" on any card to see customer list modal
   - Test export (CSV, PDF, Excel) from the modal

3. **AI Search**
   - Navigate to "AI Search & Analyzer"
   - Enter query: "Show me customers who spent more than $100"
   - Verify results display and export works

4. **Filter Audience**
   - Navigate to "Filter Audience"
   - Apply filters (e.g., Country, Total Spent, Product purchases)
   - Click "Preview Segment" then "Save List"
   - Verify list appears in "My Saved Lists"

5. **My Saved Lists**
   - View saved segments
   - Test View, Export, and Delete actions
   - Verify AI-generated lists cannot be modified

6. **Settings**
   - Navigate to "Settings"
   - Test Mailchimp connection (popup OAuth flow)
   - Verify connection status updates

7. **Export Verification**
   - Test CSV, PDF, and Excel exports from:
     - Dashboard modals
     - Saved lists
     - AI Search results
