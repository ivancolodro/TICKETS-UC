# UC CHRISTUS — Sistema de Tickets de Soporte

Plataforma multicanal de gestión de tickets (web, email, API) para UC CHRISTUS.

**Producción:** [https://tickets-uc.vercel.app](https://tickets-uc.vercel.app)  
**Repositorio:** [github.com/ivancolodro/TICKETS-UC](https://github.com/ivancolodro/TICKETS-UC)

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM |
| Auth | NextAuth.js (credenciales, Google OAuth, 2FA TOTP) |
| Email | Nodemailer + React Email |
| Cache | Upstash Redis |
| Colas | BullMQ |
| Storage | Local (dev) / S3-compatible (prod) |
| Deploy | Vercel |

## Estado del proyecto

| Módulo | Estado |
|--------|--------|
| Arquitectura base + Prisma | ✅ |
| **Tickets** (CRUD, portal, API, panel agente) | ✅ |
| **Usuarios y acceso** (auth, RBAC, admin) | ✅ |
| Formularios personalizados | 🔲 |
| Email / notificaciones | 🔲 |
| SLA (motor completo) | 🔲 |
| Automatización | 🔲 |
| Base de conocimiento | 🔲 |
| Reportes | 🔲 |
| Integraciones API (ApiKey) | 🔲 |

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (enlaces a portal y agente) |
| `/login` | Inicio de sesión (credenciales + 2FA + Google) |
| `/portal/new` | Formulario web — crear ticket sin cuenta |
| `/portal/tickets/[token]` | Seguimiento público por token |
| `/agent/tickets` | Lista y gestión de tickets |
| `/agent/tickets/new` | Creación manual por agente |
| `/agent/tickets/[id]` | Detalle, respuestas, notas, fusionar |
| `/admin/agents` | CRUD agentes |
| `/admin/departments` | CRUD departamentos |
| `/admin/teams` | CRUD equipos |
| `/admin/customers` | Clientes y historial |

## API relevante

| Endpoint | Uso |
|----------|-----|
| `POST /api/portal/tickets` | Canal portal cliente |
| `POST /api/v1/tickets` | Canal API REST |
| `GET/POST /api/tickets` | Panel agente (autenticado) |
| `GET /api/tickets/public/[token]` | Acceso sin login |
| `GET/POST /api/admin/agents` | Gestión de agentes |
| `GET/POST /api/admin/departments` | Departamentos |
| `GET/POST /api/admin/teams` | Equipos |
| `GET /api/admin/customers` | Clientes |
| `POST /api/auth/validate` | Validación login (2FA, bloqueo) |
| `POST /api/auth/2fa/setup` | Configurar 2FA |
| `GET /api/health` | Health check |

## Roles y permisos (RBAC)

| Permiso | Admin | Supervisor | Agente | Cliente | Solo lectura |
|---------|:-----:|:----------:|:------:|:-------:|:------------:|
| Ver todos los tickets | ✓ | ✓ depto | — | — | ✓ |
| Crear ticket | ✓ | ✓ | ✓ | ✓ | — |
| Asignar ticket | ✓ | ✓ | ✓ | — | — |
| Notas internas | ✓ | ✓ | ✓ | — | ✓ |
| Gestionar agentes | ✓ | ✓ depto | — | — | — |
| Ver reportes | ✓ | ✓ | — | — | ✓ |
| Config. sistema | ✓ | — | — | — | — |

Definición en `src/lib/rbac/permissions.ts`. Middleware en `src/middleware.ts`.

## Estructura del proyecto

```
TICKETS-UC/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (admin)/admin/       # Agentes, deptos, equipos, clientes
│   │   ├── (agent)/agent/       # Panel de tickets
│   │   ├── (auth)/login/
│   │   ├── (portal)/portal/
│   │   └── api/                 # REST + NextAuth
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── tickets/
│   │   └── admin/
│   ├── modules/
│   │   ├── tickets/             # Servicios, schemas, SLA utils
│   │   └── users/               # Agentes, auth, deptos, equipos
│   ├── lib/rbac/
│   ├── config/                  # auth, routes, app
│   └── middleware.ts
├── .env.example
└── vercel.json
```

## Inicio rápido (local)

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completar al menos:

- `DATABASE_URL` — Supabase Transaction pooler (puerto 6543) + `?pgbouncer=true`
- `DIRECT_URL` — Supabase Session pooler (puerto 5432)
- `NEXTAUTH_URL` — `http://localhost:3000`
- `NEXTAUTH_SECRET` — generar con `openssl rand -base64 32`

Opcional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIS_URL`, SMTP.

### 2. Instalar y base de datos

```bash
npm install
npx prisma db push          # o: npx prisma migrate deploy
npm run db:seed
```

### 3. Node.js 20 (requerido)

El proyecto necesita **Node ≥ 20** (Next.js 14 y AWS SDK). Si `npm run dev` falla con *Node.js 18.15* o `nvm: command not found`:

**Opción A — Homebrew (recomendado en Mac, sin nvm):**

```bash
brew install node@20
npm run dev
```

El script `scripts/dev.sh` usa automáticamente `/opt/homebrew/opt/node@20/bin` (o `/usr/local/opt/node@20` en Intel).

Para usar Node 20 en **todas** las terminales, añade a `~/.zshrc`:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

**Opción B — nvm** (si lo prefieres): instala [nvm](https://github.com/nvm-sh/nvm), luego `nvm install 20 && nvm use`.

### 4. Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Usuarios de prueba (seed)

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@ucchristus.cl` | `Admin123!` | ADMIN |
| `agente@ucchristus.cl` | `Admin123!` | AGENT |

## Despliegue (Vercel + Supabase)

1. Base de datos en [Supabase](https://supabase.com) con las dos URLs de conexión.
2. Push a GitHub → Vercel importa el repo y despliega en cada push a `main`.
3. En Vercel → **Environment Variables** (Production):

   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` — URL pública (ej. `https://tickets-uc.vercel.app`)

4. El build ejecuta `prisma generate && prisma migrate deploy && next build`.

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:seed` | Datos iniciales (admin, agente, deptos) |
| `npm run db:studio` | Explorar BD con Prisma Studio |
| `npm run queue:worker` | Worker BullMQ (requiere `REDIS_URL`) |

## Próximos pasos

- Adjuntos en tickets (upload S3/local)
- Configuración de sistema (`/admin/settings`) — política de contraseñas
- Módulo Email / notificaciones
- SLA y automatización
- Base de conocimiento y reportes

## Requisitos

- Node.js ≥ 20
- PostgreSQL 14+ (Supabase recomendado)
- Redis opcional (colas y cache)
