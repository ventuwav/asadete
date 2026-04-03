# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 🥩 ASADETE — Contexto Completo del Proyecto

> Archivo de contexto para Claude Code. Contiene toda la información necesaria para continuar el desarrollo de Asadete sin perder contexto entre sesiones.

---

## 1. ¿Qué es Asadete?

Asadete es una **PWA mobile-first** para organizar y liquidar los gastos de un asado argentino entre amigos. El flujo principal es:

1. Alguien **crea el evento** (el asador / organizador).
2. Comparte un **link único** con los participantes.
3. Cada participante se **suma al evento** y carga lo que gastó (ítems + montos).
4. Al terminar, el asador **liquida** y el sistema calcula quién le debe cuánto a quién (minimizando transferencias).
5. Los participantes **marcan los pagos** como realizados; cuando todos confirman, el evento se cierra.

---

## 2. Stack Tecnológico

### Backend
- **Runtime:** Node.js + TypeScript (`tsx`)
- **Framework:** Express v5
- **ORM:** Prisma v5 (`@prisma/client`)
- **Base de datos:** PostgreSQL en **Supabase** (connection pooling via PgBouncer)
- **Dev server:** `nodemon`
- **Deployment:** Railway / servidor propio (puerto 3000)

### Frontend
- **Build tool:** Vite v8
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v3 (con tokens propios — ver sección 5)
- **Router:** React Router DOM v7
- **Iconos:** Lucide React
- **Fuentes:** Plus Jakarta Sans (headings), Inter (body) — via `@fontsource`
- **QR:** `qrcode.react`
- **Deployment:** Vercel

---

## 3. Estructura del Proyecto

```
/Users/gventu/Asadete/
├── CLAUDE.md            ← este archivo
├── gemini.md            ← constitución original del proyecto
├── .env                 ← (vacío, no push)
├── architecture/
│   ├── expense_sop.md
│   ├── app_sop.md
│   └── link_sop.md
├── backend/
│   ├── .env             ← DATABASE_URL + DIRECT_URL (Supabase)
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── index.ts     ← Todos los endpoints de la API REST
└── frontend/
    ├── vercel.json
    ├── tailwind.config.js
    └── src/
        ├── App.tsx       ← Routing + Toaster global (react-hot-toast)
        ├── pages/
        │   ├── OnboardingWizard.tsx  ← Wizard 4 slides (primer ingreso) + warm-up backend
        │   ├── CreateEvent.tsx
        │   ├── JoinEvent.tsx
        │   ├── Dashboard.tsx
        │   ├── OpenDashboard.tsx
        │   ├── SettledDashboard.tsx
        │   ├── ClosedDashboard.tsx
        │   ├── ShareEvent.tsx
        │   ├── HelpChat.tsx
        │   └── EditParticipantModal.tsx
        ├── components/
        │   ├── AppHeader.tsx     ← variant="large" | "compact"
        │   ├── BottomNav.tsx     ← button elements, aria-labels, 44px touch target
        │   ├── Card.tsx          ← variant="default"|"surface"|"muted"|"dark"
        │   ├── Input.tsx         ← variant="field"|"inner"
        │   ├── SectionLabel.tsx  ← variant="default"|"primary"
        │   ├── PageLayout.tsx    ← pb dinámico con safe-area-inset
        │   ├── Grill.tsx         ← ícono SVG custom
        │   └── ui/button.tsx     ← variant="cta"|"secondary"|"outline"|"ghost"|"danger"
        └── lib/
```

---

## 4. Variables de Entorno

### `backend/.env`
```ini
# Supabase PostgreSQL (connection pooling — PgBouncer)
DATABASE_URL="postgresql://postgres.nmjwoketxjdsbyndqcdl:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL (para migraciones Prisma)
DIRECT_URL="postgresql://postgres.nmjwoketxjdsbyndqcdl:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
```

### `frontend/.env` (o variables en Vercel)
```ini
VITE_API_URL=https://<tu-backend-url>
```
> En desarrollo local, `VITE_API_URL` vacío → el frontend usa `http://localhost:3000`.

---

## 5. Schemas de Base de Datos (Prisma)

```prisma
model Event {
  id           String        @id @default(uuid())
  name         String
  budget       Float         @default(0)
  status       String        @default("open")  // open | settled | closed
  share_token  String        @unique @default(uuid())
  admin_token  String?       @unique
  created_at   DateTime      @default(now())
  
  participants Participant[]
  expenses     Expense[]
  debts        Debt[]
}

model Participant {
  id                String   @id @default(uuid())
  event_id          String
  name              String
  alias             String?           // Alias de Mercado Pago / CBU (opcional)
  participant_token String   @unique @default(uuid())
  created_at        DateTime @default(now())
  is_creator        Boolean  @default(false)

  event            Event       @relation(fields: [event_id], references: [id], onDelete: Cascade)
  expenses         Expense[]
  debts_owed       Debt[]      @relation("Debtor")
  debts_to_receive Debt[]      @relation("Creditor")
  consumed_items   ExpenseItem[]
}

model Expense {
  id             String        @id @default(uuid())
  participant_id String
  event_id       String
  total_amount   Float
  created_at     DateTime      @default(now())

  participant Participant   @relation(fields: [participant_id], references: [id], onDelete: Cascade)
  event       Event         @relation(fields: [event_id], references: [id], onDelete: Cascade)
  items       ExpenseItem[]
}

model ExpenseItem {
  id         String @id @default(uuid())
  expense_id String
  name       String
  amount     Float

  expense   Expense       @relation(fields: [expense_id], references: [id], onDelete: Cascade)
  consumers Participant[]  // Relación M2M: quiénes consumieron este ítem
}

model Debt {
  id                  String @id @default(uuid())
  event_id            String
  from_participant_id String
  to_participant_id   String
  amount              Float
  status              String @default("pending") // pending | paid | confirmed

  event            Event       @relation(fields: [event_id], references: [id], onDelete: Cascade)
  from_participant Participant @relation("Debtor",   fields: [from_participant_id], references: [id], onDelete: Cascade)
  to_participant   Participant @relation("Creditor", fields: [to_participant_id],   references: [id], onDelete: Cascade)
}
```

---

## 6. API REST (backend/src/index.ts — Puerto 3000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/events` | Crear evento → devuelve `event_id`, `share_token`, `admin_token` |
| `POST` | `/api/events/:share_token/join` | Unirse al evento (crear o actualizar participante + cargar gastos) |
| `PUT`  | `/api/events/:share_token/participants/:participant_id` | Admin edita participante (requiere `admin_token` en body) |
| `GET`  | `/api/events/:share_token` | Obtener estado completo del evento (includes: participants, expenses, debts) |
| `GET`  | `/api/events/:share_token/admin-token` | Recuperar `admin_token` si sos el creador (requiere `x-participant-token` header) |
| `POST` | `/api/events/:share_token/settle` | Liquidar evento → calcula deudas, cambia status a `"settled"` |
| `POST` | `/api/events/:share_token/revert` | Revertir liquidación → borra deudas, vuelve a `"open"` |
| `POST` | `/api/debts/:id/pay` | Marcar deuda como `"paid"` |
| `POST` | `/api/debts/:id/confirm` | Confirmar pago → si todas las deudas confirmadas, cierra evento (`"closed"`) |
| `POST` | `/api/items/:id/toggle` | Toggle consumidor de un ítem (connect/disconnect en M2M) |

### Body de `/api/events` (POST)
```json
{ "name": "string", "budget": 0 }
```

### Body de `/api/events/:share_token/join` (POST)
```json
{
  "name": "string",
  "alias": "string (opcional)",
  "expenses": [
    {
      "total_amount": 1500,
      "items": [
        { "name": "Asado 3kg", "amount": 1200 },
        { "name": "Carbón", "amount": 300 }
      ]
    }
  ],
  "admin_token": "string (opcional — solo para reclamar is_creator)",
  "participant_token": "string (opcional — para editar en vez de crear)"
}
```

---

## 7. Algoritmo de Liquidación (Transferencias Mínimas)

```python
# Objetivo: minimizar la cantidad de transferencias
# (greedy matching entre deudores y acreedores)

balances = []
for p in participants:
    paid = sum(p.expenses.total_amount)
    consumed = sum(item.amount / len(item.consumers)
                   for item in all_items if p in item.consumers)
    net = round(paid - consumed, 2)
    balances.append({ "p_id": p.id, "net": net })

debtors   = sorted([b for b in balances if b.net < 0], key=lambda x: x.net)       # más negativo primero
creditors = sorted([b for b in balances if b.net > 0], key=lambda x: -x.net)      # más positivo primero

while debtors and creditors:
    d = debtors[0]
    c = creditors[0]
    amount = round(min(abs(d.net), c.net), 2)
    create_debt(from=d.p_id, to=c.p_id, amount=amount)
    d.net += amount
    c.net -= amount
    if d.net >= 0: debtors.pop(0)
    if c.net <= 0: creditors.pop(0)
```

> **Nota importante:** los balances se calculan por **ítem consumido** (M2M con `consumers`), NO dividiendo el total del evento por cabeza uniformemente.

---

## 8. Autenticación / Sesión (Sin login)

- **`participant_token`**: UUID generado en backend al unirse. Se guarda en `localStorage` con key `asadete_<shareToken>`. Identifica a un participante en futuras visitas.
- **`admin_token`**: UUID guardado en `localStorage` con key `admin_token_<shareToken>`. Solo lo tiene el creador del evento. Le permite editar cualquier participante.
- **`is_creator`**: Boolean en DB. Se asigna `true` si al hacer join se presenta el `admin_token` correcto, o si es el primer participante en unirse.

---

## 9. Routing del Frontend

```
/                          → CreateEvent (crear nuevo evento)
/e/:shareToken/share       → ShareEvent (QR + link para compartir)
/e/:shareToken/join        → JoinEvent (unirse al evento / editar cuenta)
/e/:shareToken             → Dashboard (vista principal del evento)
```

---

## 10. Design System — "La República Serena"

### Paleta de Colores
| Token | Valor | Uso |
|-------|-------|-----|
| `surface` | `#faf7f4` | Background principal |
| `surfaceLow` | `#f2ede8` | Cards ligeramente más oscuras |
| `surfaceHighest` | `#e6dfd7` | Inputs, separadores, fondo de nav |
| `primary` | `#cc5b0a` | Color principal (Amber cálido), botones CTA, logo |
| `primaryLight` | `#fae8dc` | Background suave de elementos primary |
| `primaryDim` | `#a3470a` | Hover state de primary |
| `secondary` | `#2e2825` | Textos importantes secundarios |
| `success` | `#1c7327` | Textos de confirmación |
| `successBg` | `#96f39e` | Fondo de badges de éxito |
| `onSurface` | `#1e1a16` | Texto principal (nunca `#000000` puro) |
| `onSurfaceVariant` | `#7a706b` | Texto secundario / subtítulos |
| `outlineVariant` | `#d9d0c8` | Borders muy sutiles |

### Tipografía
- **Headings + Logo:** `TeX Gyre Adventor` (font-heading) — self-hosted en `/public/fonts/`, usado para todos los títulos, números y el logo "asaDeTe"
- **Body:** `Inter` (font-body) — regular/medium para texto corrido y labels
- **Labels de sección:** `text-[10px] font-bold tracking-widest uppercase text-onSurfaceVariant`

### Border Radius (tokens nombrados en tailwind.config.js)
- `rounded-hero` (`2rem`) — Cards grandes, hero sections
- `rounded-section` (`1.5rem`) — Secciones / containers
- `rounded-card` (`1.25rem`) — Cards, botones, inputs estándar
- `rounded-inner` (`1rem`) — Inputs internos, elementos secundarios
- `rounded-full` — Avatares, badges, pills

### Sombras (tokens nombrados en tailwind.config.js)
- `shadow-cta` — Glow naranja para botones CTA primarios
- `shadow-card` — Elevación sutil para cards de contenido

### Reglas de Diseño
1. **Nunca usar `#000000` puro.** Usar `onSurface` (`#1e1a16`).
2. **Sin gradientes.** Todos los fondos son colores planos.
3. **Sin bordes agresivos.** Usar `border border-outlineVariant` (1px, sutil) o sin borde.
4. **Sombras suaves:** `shadow-sm`, `shadow-card`, `shadow-cta` para CTAs.
5. **Micro-animaciones:** `animate-in fade-in`, `slide-in-from-top-4`, `active:scale-[0.98]`.
6. **Botón CTA principal:** componente `<Button>` variant="cta" — nunca construirlo a mano.
7. **Grill icon:** siempre `fill="currentColor"` — nunca valores hex hardcodeados.
8. **Toasts:** usar `react-hot-toast` para feedback de acciones. Nunca `alert()`.
9. **Acciones destructivas:** siempre mostrar modal de confirmación antes de ejecutar.

### Ícono Custom (Grill SVG)
```tsx
const Grill = ({ size = 24, className = "", strokeWidth = 2, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 5v2" /><path d="M12 3v4" /><path d="M16 5v2" />
    <path d="M4 11h16a8 8 0 0 1-16 0Z" />
    <line x1="2" y1="11" x2="22" y2="11" />
    <line x1="7" y1="18.5" x2="5" y2="22" />
    <line x1="17" y1="18.5" x2="19" y2="22" />
  </svg>
);
```

---

## 11. Comandos de Desarrollo

```bash
# Backend (desde /Users/gventu/Asadete/backend)
npm run dev          # nodemon → tsx src/index.ts (puerto 3000)

# Frontend (desde /Users/gventu/Asadete/frontend)
npm run dev          # vite (puerto 5173)

# Migraciones Prisma
npx prisma migrate dev --name <nombre>
npx prisma generate
npx prisma studio    # GUI para explorar la DB
```

---

## 12. Estado Actual del Proyecto

### ✅ Implementado y funcionando
- Crear evento con nombre y presupuesto
- Compartir link y QR del evento
- Unirse al evento con nombre, alias y gastos (ítems detallados)
- Dashboard completo: resumen de gastos, participantes, deudas
- Liquidación con algoritmo de transferencias mínimas
- Revertir liquidación (con modal de confirmación)
- Marcar pagos como pagados / confirmados
- Cierre automático del evento cuando todas las deudas están confirmadas
- Edición de cuenta propia (participante puede editar sus datos y gastos)
- Admin puede editar cualquier participante (requiere `admin_token`)
- Recuperación de sesión via `localStorage` (`participant_token`)
- Toggle de consumidores por ítem (M2M)
- Stat cards en Dashboard (total evento, tu gasto, tu balance)
- Logo "asaDeTe" con font-brand (TeX Gyre Adventor) en todas las páginas
- Bottom navigation bar en todas las vistas (button elements, aria-labels, 44px touch)
- Onboarding wizard de 4 slides al primer ingreso (warm-up del backend incluido)
- Indicador "Iniciando servidor..." cuando el backend está durmiendo (Render)
- Toasts de éxito/error en todas las acciones (react-hot-toast)
- Empty state en Dashboard cuando no hay gastos cargados
- Modal de confirmación antes de Reversión y Archivar Asado

### 🔲 Pendiente / Ideas futuras
- Notificaciones push cuando alguien te paga
- Soporte para múltiples eventos del mismo usuario
- Exportar resumen como imagen para compartir en WhatsApp
- Dark mode
- Historial de eventos pasados

---

## 13. Deployment & Cloud Tools

### Arquitectura de Deploy

```
GitHub (ventuwav/asadete)
    ├── frontend/ → Vercel  (auto-deploy on push to main)
    └── backend/  → manual / Railway (si se agrega en el futuro)

Supabase → PostgreSQL (hosted, us-west-2)
```

---

### 🟢 Supabase (Base de Datos)

**Proyecto:** `nmjwoketxjdsbyndqcdl` (us-west-2)
**Dashboard:** https://supabase.com/dashboard/project/nmjwoketxjdsbyndqcdl

#### Variables de conexión (ya en `backend/.env` y configuradas en Render)
```ini
# Pooled (app runtime — usa PgBouncer puerto 6543)
DATABASE_URL=postgresql://postgres.nmjwoketxjdsbyndqcdl:bujsun-mansyx-Nygwa6@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct (migraciones Prisma — puerto 5432)
DIRECT_URL=postgresql://postgres.nmjwoketxjdsbyndqcdl:bujsun-mansyx-Nygwa6@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

#### Comandos Prisma contra Supabase
```bash
# Desde /Users/gventu/Asadete/backend/

# Aplicar migraciones en producción
npx prisma migrate deploy

# Crear nueva migración en desarrollo
npx prisma migrate dev --name <nombre_descriptivo>

# Regenerar Prisma Client después de cambiar schema
npx prisma generate

# Ver datos en el browser (GUI)
npx prisma studio

# Reset completo de la DB (⚠️ borra todos los datos)
npx prisma migrate reset
```

> **⚠️ IMPORTANTE:** Siempre usar `DATABASE_URL` con `?pgbouncer=true` para el runtime del servidor.
> Usar `DIRECT_URL` solo para `prisma migrate`. Si se usa el pooler para migraciones, Prisma lanza error.

---

### 🔺 Vercel (Frontend)

**Repo conectado:** `github.com/ventuwav/asadete` → directorio `frontend/`
**Dashboard:** https://vercel.com/dashboard

#### Deploy automático
Vercel está conectado al repo de GitHub. Cada `git push` a `main` dispara un deploy automático del frontend.

#### Deploy manual desde CLI
```bash
# Instalar CLI (si no está instalado)
npm i -g vercel

# Desde /Users/gventu/Asadete/frontend/
vercel          # deploy a preview
vercel --prod   # deploy a producción

# Ver logs del último deploy
vercel logs

# Ver variables de entorno en Vercel
vercel env ls
vercel env add VITE_API_URL    # agregar variable
vercel env pull .env.local     # bajar variables localmente
```

#### Variables de entorno en Vercel (configurar en Dashboard o CLI)
```
VITE_API_URL = https://<url-del-backend>
```

#### `frontend/vercel.json` (ya existe)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
> Este rewrite es crítico para que React Router funcione correctamente. Sin él, las rutas como `/e/:shareToken` dan 404 en Vercel.

---

### 🐙 GitHub (Repositorio)

**URL:** https://github.com/ventuwav/asadete
**Remote local:** `origin`

#### Comandos habituales
```bash
# Desde /Users/gventu/Asadete/

# Ver estado
git status
git log --oneline -10

# Push de cambios
git add -A
git commit -m "feat: descripción del cambio"
git push origin main

# Pull de cambios remotos
git pull origin main

# Ver remotes
git remote -v
```

#### `.gitignore` (raíz)
```
node_modules/
.env
*.db
.DS_Store
dist/
```

> **⚠️ NUNCA commitear `backend/.env`** — contiene las credenciales reales de Supabase.

---

### 🔄 Flujo Completo de Deploy

#### Cuando cambias el schema de Prisma:
```bash
# 1. Editar backend/prisma/schema.prisma
# 2. Crear y aplicar la migración
cd /Users/gventu/Asadete/backend
npx prisma migrate dev --name <nombre>   # desarrollo local (si tenés DB local)
# ó directamente en producción:
npx prisma migrate deploy                # aplica migraciones pendientes en Supabase
npx prisma generate                      # regenera el cliente

# 3. Reiniciar el backend
npm run dev
```

#### Cuando cambias código del frontend:
```bash
cd /Users/gventu/Asadete
git add -A
git commit -m "feat/fix: descripción"
git push origin main
# → Vercel detecta el push y hace deploy automático en ~1 minuto
```

#### Cuando cambias código del backend:
```bash
# El backend actualmente se corre localmente o en un servidor propio.
# Si se migra a Railway u otro PaaS, agregar los pasos aquí.
cd /Users/gventu/Asadete/backend
npm run dev   # desarrollo local (puerto 3000)
```

---

## 14. Reglas de Comportamiento para el AI

1. **Siempre respetar el Design System** descrito en la sección 10. No usar colores ad-hoc ni valores hex hardcodeados.
2. **No usar `#000000` nunca.** Usar `onSurface` (`#1e1a16`).
3. **Sin gradientes.** Todos los fondos son planos. No usar `bg-gradient-*`.
4. **Nombre de la app:** siempre `asaDeTe` — solo D y T en mayúscula. Nunca "Asadete".
5. **Logo:** usar componente `<AppHeader>` existente. La font `font-brand` (TeX Gyre Adventor) aplica sola.
6. **Grill icon:** siempre `fill="currentColor"`. Nunca `fill="#..."` hardcodeado.
7. **Feedback al usuario:** usar `toast.success()` / `toast.error()` de `react-hot-toast`. Nunca `alert()`.
8. **Acciones destructivas** (revertir, archivar, borrar): mostrar siempre modal de confirmación con descripción del impacto.
9. **Sesión lightweight** via `participant_token` en `localStorage`. No hay login real.
10. **El asador es la autoridad máxima.** El creador (`is_creator: true`) tiene poderes de admin.
11. **Balances calculados por ítem consumido**, no por división uniforme del total.
12. **Redondeo a 2 decimales** en todos los cálculos monetarios para evitar errores IEEE 754.
13. **Mobile-first:** todas las páginas usan `<PageLayout>` con `max-w-md mx-auto` y `<BottomNav>`.
14. **Touch targets:** mínimo 44×44px en todos los elementos interactivos. Usar `<Button>` o `min-w-[44px] min-h-[44px]`.
15. **Accesibilidad:** todos los botones icon-only deben tener `aria-label`.
16. **Deploy desde Claude Code:** Al terminar un cambio, hacer commit y push directamente. No pedirle al usuario que lo haga. Vercel (frontend) hace auto-deploy en cada push a `main`.
