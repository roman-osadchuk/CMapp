### Decisions
- **TanStack Query**: Used this for all data fetching. Alternatives like manual `useEffect` or Redux were considered, but React Query is just way easier for handling loading states and caching.
- **Expo Router**: Chose this for navigation since it's the Expo standard now. File-based routing makes the project structure self-explanatory.
- **Client-side Logic**: Decided to calculate USD values and portfolio totals on the client in `amount-logic.ts`. It keeps the UI snappy and reduces unnecessary API calls.

### Working with AI
- **Refining Prompts**: (ai-logs.txt:12) Initially asked for the claim screen but the AI missed the fee and decimal validation logic. Had to refine the prompt to explicitly handle these based on the API response.
- **Risky Output**: (ai-logs.txt:45) The AI suggested using `.toFixed(2)` for crypto amounts. Caught this during testing—crypto needs much higher precision, so I switched to using the decimals provided by the balance object.
- **Disagreement**: (ai-logs.txt:78) AI wanted to pull in Redux for the global state. I rejected it as overkill and stuck with TanStack Query and a simple Context for auth.

### Not done / known issues
- **High-Precision Math**: Using `parseFloat` for calculations isn't perfect for crypto. Ideally, I'd use something like `decimal.js`.
- **Refresh Flow**: The auth context is a bit basic; it needs a proper token refresh mechanism for production.
- **Unit Tests**: Added Jest tests for `amount-logic` and `activity-logic` to ensure correct handling of edge cases and de-duplication during pagination.



