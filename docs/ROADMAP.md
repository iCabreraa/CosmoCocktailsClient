# Roadmap - CosmoCocktails (Ecommerce)

This document is the single source of truth for roadmap structure, order,
and tracking rules. All open issues must live in one roadmap milestone and
carry a Status label.

## Roadmap order (follow in this sequence)
1) 0 - Release Gate (Security & Data Integrity)
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/13
2) 1 - Core Commerce (Shop/PDP/Cart/Checkout)
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/14
3) 2 - Account & Orders
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/15
4) 3 - Content & Brand
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/12
5) 4 - SEO/UX/Performance
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/16
6) 5 - Research & Future
   https://github.com/iCabreraa/CosmoCocktailsClient/milestone/17

Project board (single view of all open issues):
https://github.com/users/iCabreraa/projects/2

## Scope per milestone
- 0 - Release Gate
  - Security, auth consistency, data integrity, payment safety, release blockers.
- 1 - Core Commerce
  - Shop, PDP, cart, checkout, payments, inventory baseline.
- 2 - Account & Orders
  - Account area, orders history, addresses, favorites, auth flows.
- 3 - Content & Brand
  - Home, events, about, contact, quiz, footer, visual direction.
- 4 - SEO/UX/Performance
  - SEO, accessibility, responsive, UX polish, performance.
- 5 - Research & Future
  - Competitive research, experiments, future backlog.

## Entry/exit criteria (lightweight)
- Entry (all milestones)
  - Issues have clear acceptance criteria and owner.
  - Dependencies listed and tracked.
- Exit (all milestones)
  - Issues closed, verified, and documented if behavior changed.

## Labels (rules)
- Roadmap: one of the six roadmap labels (required on all open issues).
- Status: Backlog / Ready / In Progress / Blocked / Done (required on all open issues).
- Area: Checkout / Tienda / Productos / Cuenta / Contenido / Eventos / etc.
- Type: bug / enhancement / Security / TechDebt (optional but recommended).

## Workflow
1) Create issue with Area + Roadmap + Status: Backlog.
2) Add acceptance criteria and scope boundaries.
3) Move to Status: Ready when the scope is clear.
4) Set Status: In Progress during implementation.
5) Close issue and set Status: Done after verification.

## Ordering convention
- Each issue is prefixed to enforce a strict sequence per milestone:
  `M{Milestone}.{NN} [Category] - Title`
- Example: `M1.03 [Checkout] - Fix payment intent validation`
- If a new issue needs to be inserted between existing items, use a dot suffix:
  `M{Milestone}.{NN}.{sub}` (example: `M2.00.1`)
- Issues also include a `### Roadmap` block with the order and dependency.
- GitHub issue numbers are immutable; ordering is done by title prefix and dependency.

## Reporting
- Use milestone progress as the primary roadmap signal.
- Use labels for slicing by area or type.

## Milestone 0 - Current order
Open issues (in strict sequence):
1) M0.00 [Roadmap] - Roadmap Index (#309)
2) M0.07.1 [Checkout] - Stripe (new account) test->live migration checklist (#321)
3) M0.08 [CSP] - Harden CSP and remove unsafe-inline (#307)
