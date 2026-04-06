# ASADETE — CLAUDE.md

## Token Efficient Rules
1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.

---

## App
PWA mobile-first para liquidar gastos de asado. Flujo: crear evento → compartir link → participantes cargan gastos → liquidar (minimiza transferencias) → confirmar pagos → cerrar.

## Stack
- **Frontend:** React 19 + Vite v8 + TypeScript + Tailwind CSS v3 → Vercel (auto-deploy on push to main)
- **Backend:** Express v5 + Prisma v5 + TypeScript → Render (`srv-d73ogqi4d50c73bqdrs0`)
- **DB:** PostgreSQL en Supabase (`nmjwoketxjdsbyndqcdl`, us-west-2)
- **Repo:** github.com/ventuwav/asadete

## Rutas
```
/                       → CreateEvent
/e/:shareToken/join     → JoinEvent
/e/:shareToken          → Dashboard
/e/:shareToken/share    → ShareEvent
```

## API endpoints (backend puerto 3000)
```
POST /api/events                                    → crear evento
POST /api/events/:token/join                        → unirse / editar participante
GET  /api/events/:token                             → estado completo
PUT  /api/events/:token/participants/:id            → admin edita participante
POST /api/events/:token/settle                      → liquidar
POST /api/events/:token/revert                      → revertir liquidación
POST /api/debts/:id/pay                             → marcar pagado
POST /api/debts/:id/confirm                         → confirmar pago
POST /api/items/:id/toggle                          → toggle consumidor M2M
GET  /api/admin/stats (x-admin-key header)          → KPIs dashboard
```

## Modelos Prisma (schema.prisma)
```
Event        id, name, budget, status(open|settled|closed), share_token, admin_token, created_at
Participant  id, event_id, name, alias, participant_token, is_creator, created_at
Expense      id, participant_id, event_id, total_amount, created_at
ExpenseItem  id, expense_id, name, amount — M2M con Participant (consumers)
Debt         id, event_id, from/to_participant_id, amount, status(pending|paid|confirmed)
```

## Auth (sin login)
- `participant_token` → `localStorage['asadete_<shareToken>']`
- `admin_token` → `localStorage['admin_token_<shareToken>']` — solo el creador
- `is_creator: true` si primer participante o presenta admin_token correcto

## Liquidación
Greedy: balance = pagado − consumido_por_ítem. Deudores (neg) vs acreedores (pos), match por mayor monto. Redondear a 2 decimales.

## Design System — "Editorial Organic Brutalism"
**Colores** (tailwind.config.js):
`surface #faf7f4` · `surfaceDark #3D3D3D` · `primary #cc5b0a` · `primaryLight #fae8dc` · `primaryBright #FF8C5A` · `onSurface #1e1a16` · `onSurfaceVariant #7a706b` · `outlineVariant #d9d0c8` · `successBg #96f39e`

**Gradiente CTA:** `bg-cta-gradient` = `linear-gradient(to bottom, #9E4216, #FF8C5A)` — solo en botones CTA, nunca en fondos.

**Radios:** `rounded-hero 3rem` · `rounded-section 1.5rem` · `rounded-card 1.25rem` · `rounded-inner 1rem`

**Sombras:** `shadow-cta` · `shadow-card` · `shadow-modal`

**Tipografía:** `font-heading` = TeX Gyre Adventor (self-hosted `/public/fonts/`) · `font-body` = Inter

**Isologo:** siempre `asaDeTe` — D y T en `text-primary` (fondo claro) o `text-primaryBright` (fondo oscuro). Nunca todo mayúsculas.

## Reglas de UI
- Nunca `#000000` → usar `onSurface`
- `Grill` icon: siempre `fill="currentColor"`
- Feedback: `toast.success/error()` de react-hot-toast, nunca `alert()`
- Destructivas: siempre modal de confirmación
- Mobile-first: `<PageLayout>` + `max-w-md mx-auto` + `<BottomNav>`
- Touch targets: mínimo 44×44px
- Botones icon-only: `aria-label` obligatorio
- Dark screens: gradiente `from-[#4a4a4a] to-surfaceDark`
- Modals/sheets: `rounded-t-hero`

## Componentes clave
```
AppHeader        variant="large"|"compact"
Button           variant="cta"|"secondary"|"outline"|"ghost"|"danger"
Card             variant="default"|"surface"|"muted"|"dark"
PageLayout       pb dinámico con safe-area-inset
BottomNav        44px touch targets, aria-labels
```

## Env vars
```
backend/.env:  DATABASE_URL (pgbouncer:6543?pgbouncer=true) · DIRECT_URL (port 5432) · GROQ_API_KEY · ADMIN_API_KEY
frontend:      VITE_API_URL=https://asadete-backend.onrender.com
```
⚠️ Usar DIRECT_URL solo para `prisma migrate`. Nunca commitear backend/.env.

## Deploy
- Frontend: `git push origin main` → Vercel auto-deploya
- Backend: push → trigger manual en Render (`srv-d73ogqi4d50c73bqdrs0`)
- Render API key + service IDs: `~/.claude/render_credentials.env`
- Prisma migrate prod: `npx prisma migrate deploy` desde `backend/`

## Dev
```bash
backend/  → npm run dev   (puerto 3000)
frontend/ → npm run dev   (puerto 5173)
```
