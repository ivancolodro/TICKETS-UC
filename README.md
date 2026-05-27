# Tickets UC

Formulario web para registrar tickets de soporte. Base de datos en **Supabase** (PostgreSQL) y hosting en **Vercel**.

## Desarrollo local

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia las variables de conexión:

```bash
cp .env.example .env
```

3. En Supabase → **Project Settings** → **Database** → **Connection string**:
   - **DATABASE_URL**: URI en modo **Transaction** (puerto `6543`). Añade `?pgbouncer=true` al final si no viene.
   - **DIRECT_URL**: URI en modo **Session** (puerto `5432`).

4. Instala y aplica migraciones:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Desplegar en Supabase + Vercel

### 1. Supabase

1. [supabase.com](https://supabase.com) → **New project**.
2. Guarda la contraseña de la base de datos.
3. **Project Settings** → **Database** → **Connection string** → **URI**:
   - Copia la URI **Transaction pooler** → será `DATABASE_URL` (debe incluir `?pgbouncer=true`).
   - Copia la URI **Session pooler** → será `DIRECT_URL`.
4. (Opcional) **SQL Editor** → pega y ejecuta `supabase/schema.sql` si no usarás migraciones de Prisma.

### 2. Subir código a GitHub

```bash
git init
git add .
git commit -m "Tickets UC con Supabase y Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tickets-uc.git
git push -u origin main
```

No subas `.env` (ya está en `.gitignore`).

### 3. Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importa el repo de GitHub.
2. **Environment Variables** (Production, Preview y Development):

| Variable       | Valor                                      |
|----------------|--------------------------------------------|
| `DATABASE_URL` | URI Transaction pooler + `?pgbouncer=true` |
| `DIRECT_URL`   | URI Session pooler (puerto 5432)           |

3. **Deploy**. El build ejecuta `prisma migrate deploy` y crea la tabla `Ticket`.

### 4. Comprobar

- Abre la URL de Vercel (ej. `https://tickets-uc.vercel.app`).
- Registra un ticket y revisa en Supabase → **Table Editor** → `Ticket`.

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run db:migrate` | Aplicar migraciones a Supabase |
| `npm run db:studio` | Explorar datos con Prisma Studio |

## Estructura

- `src/components/TicketForm.tsx` — formulario
- `src/app/api/tickets/route.ts` — API REST
- `prisma/schema.prisma` — modelo y PostgreSQL
- `prisma/migrations/` — migraciones para producción
