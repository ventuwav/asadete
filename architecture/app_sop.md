# Web App UI/UX Architecture SOP (Layer 1)

## Architecture Overview
The frontend will be a React Single-Page Application (SPA) structured around the Pampa Celeste (Asadete) Design System rules.

## Tech Stack
- **Build Tool:** Vite
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS (Strictly referencing `design-tokens.json` values)
- **State:** React Context for the AsadoEvent payload.

## Visual Implementation Constraints
- **Color Palette:** Must use the Fire Orange (`#a43700`) primary gradient and Warm Rustic (`#fcf9f8`) surface backgrounds.
- **No-Line Rule:** Borders are strictly forbidden. Use `bg-surface-container-highest` for depth.
- **Typography:** `Plus Jakarta Sans` for headers (Total Balances), `Inter` for participant names and list items.

## Modules (Phase 4 Pipeline)
1. **Dashboard Module:** Displays the total cost and the breakdown of who owes what (The Meat-O-Meter style).
2. **Input Module:** The "Rustic Field" input form for adding new expenses or querying NotebookLM to extract them automatically.
