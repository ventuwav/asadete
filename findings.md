# Findings & Constraints

## Discovery Input
1. **Product Pivot:** We are pivoting the codebase into a full standalone Web Application ("Splitwise but exclusively for Asados").
2. **Virality/Onboarding:** User creates an event, generates a Link/QR.
3. **Participant Flow:**
   - Scan QR / Click Link -> Join the Asado.
   - Enter Name.
   - Enter Items bought & Amount spent (*itemized input*).
   - Enter Alias/CBU if expecting to receive transfers.
4. **Settlement Engine:** The app runs an optimized debt-settlement algorithm to minimize total bank transfers between participants.
5. **Interactive Balances:** Users view who they owe / who owes them. They can mark "Paid", and receivers can "Confirm Receipt".
6. **Monetization/Endgame:** Success message upon settling all debts, followed by a tip/donation request for the platform.
   
## Constraints
* We must strictly follow **The Serene Republic** (Pampa Celeste) high-end editorial design system.
* Application state must support real-time or local persistence of these complex relationships.
