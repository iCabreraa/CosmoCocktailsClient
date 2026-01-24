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

## Milestone 0 - Completed
All issues are closed and verified.
https://github.com/iCabreraa/CosmoCocktailsClient/milestone/13

## Milestone 1 - Current order
Open issues (in strict sequence):
1) M1.00 [Roadmap] - Roadmap Index (#310)
2) M1.01 [Shop] - Incorporar buscador y filtros (#15)
3) M1.02 [Shop] - Implementar barra de búsqueda de productos (#40)
4) M1.03 [Shop] - Crear filtros por categoría y tipo de cóctel (#41)
5) M1.04 [Shop] - Añadir filtros por precio y rango de intensidad alcohólica (#42)
6) M1.05 [Shop] - Incorporar filtros de disponibilidad y novedades (#43)
7) M1.06 [Shop] - Implementar ordenación personalizada (#44)
8) M1.07 [Shop] - Diseñar una interfaz de filtros clara y responsiva (#45)
9) M1.08 [PDP] - Sustituir ilustraciones por fotografías reales y añadir galería de imágenes (#70)
10) M1.09 [PDP] - Implementar sistema de valoraciones y reseñas (#76)
11) M1.10 [PDP] - Roadmap guía de preparación y servicio del cocktail (PDP) (#268)
12) M1.11 [Checkout] - Delivery Form (#10)
13) M1.12 [Checkout] - Completar flujo de pago y formularios (#16)
14) M1.13 [Checkout] - Checkout: autocompletado y validación de direcciones (#222)
15) M1.14 [Checkout] - Payments/Stripe go-live & security checklist (#224)
16) M1.15 [Checkout] - Stripe: activar métodos de pago y verificación de dominio (#225)
17) M1.16 [Checkout] - Stripe: configurar webhooks y secretos en producción (#226)
18) M1.17 [Checkout] - Stripe: idempotencia y estados de pedido (#227)
19) M1.18 [Checkout] - Stripe: monitorización y alertas de pagos (#228)
20) M1.19 [Checkout] - Stripe: checklist de pruebas (3DS, fallos, métodos alternativos) (#229)
21) M1.20 [Checkout] - Stripe: políticas PCI y almacenamiento seguro (#230)
22) M1.21 [Checkout] - Checkout: autocompletar dirección NL por código postal y número (#232)
23) M1.22 [Checkout] - Epic: Seguimiento de pedidos para invitados (#234)
24) M1.23 [Checkout] - Portal público de seguimiento para invitados (UI + flujo) (#235)
25) M1.24 [Checkout] - Tracking seguro: token/identificador público + endpoint (#236)
26) M1.25 [Checkout] - Success page: botón copiar Order Ref + enlace de tracking (#237)
27) M1.26 [Checkout] - Email de confirmación: incluir enlace de tracking (#238)
28) M1.27 [Checkout] - Seguridad y anti-abuso en tracking público (#239)
29) M1.28 [Checkout] - Epic: Direcciones avanzadas y delivery instructions (#242)
30) M1.29 [Checkout] - Direcciones avanzadas: modelo de datos y almacenamiento (#243)
31) M1.30 [Checkout] - Direcciones avanzadas: reordenar formulario (#244)
32) M1.31 [Checkout] - Direcciones avanzadas: delivery instructions + resumen (#245)
33) M1.32 [Checkout] - Direcciones avanzadas: property type (House/Flat) (#246)
34) M1.33 [Checkout] - Direcciones avanzadas: validaciones y UX (#247)
35) M1.34 [Checkout] - Email de confirmación de pedido (plantilla y envío) (#250)
36) M1.35 [Checkout] - Priority: Reserva temporal de stock en checkout (#251)
37) M1.36 [Checkout] - Stripe: iDEAL duplica PaymentIntent en local (StrictMode) (#258)
38) M1.37 [Checkout] - Stripe: iDEAL pago ok pero pedido no se inserta (webhook) (#259)
39) M1.38 [Checkout] - Stripe: 500 en create-payment-intent por items inválidos (verificar fix) (#260)
