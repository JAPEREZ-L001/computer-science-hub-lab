# Arquitectura — Computer Science Hub (CSH) Web

> Última actualización: 2026-09-01 — ver `docs/DATABASE.md` para el schema completo de Supabase y
> `docs/rutas-usuario.md` para el mapa de rutas. Este documento cubre patrones y estructura de código.
> Para el contexto completo de IA → ver `CONTEXT.md` en la raíz del repo.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19 + TypeScript 5.7 |
| Estilos | Tailwind CSS 4 + PostCSS |
| Componentes | Radix UI primitives + shadcn/ui |
| Formularios | React Hook Form + Zod |
| Iconos | Lucide React |
| Tema | Dark mode fijo vía CSS/className — sin `next-themes` (se removió en la limpieza de FASE 2, no había control de tema expuesto al usuario) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) — sin `service_role`, ver `docs/DATABASE.md` |
| Email | Resend (dominio: `send.cshdevs.org`) |
| Testing | Vitest (unit) + Playwright (E2E smoke) |
| Despliegue | Vercel |
| CI | GitHub Actions — lint, typecheck, build, tests unitarios, smoke E2E (`.github/workflows/ci.yml`) |
| Analytics | @vercel/analytics |

---

## 📁 Estructura del Proyecto

```
/
├── app/                    # Rutas Next.js (App Router)
│   ├── actions/            # Server Actions ('use server')
│   ├── admin/              # Panel administrativo
│   ├── auth/               # Callback de autenticación Supabase
│   ├── comunidad/          # Comunidad: ideas, mentors, documentos, podcast
│   ├── eventos/            # Listado y detalle de eventos
│   ├── feedback/           # Formulario de feedback
│   ├── login/ + registro/  # Autenticación
│   ├── miembros/           # Directorio de miembros
│   ├── noticias/           # Blog de noticias
│   ├── onboarding/         # Flujo de bienvenida (nuevo usuario)
│   ├── oportunidades/      # Oportunidades laborales/académicas
│   ├── perfil/             # Perfil del usuario autenticado
│   ├── recursos/           # Recursos académicos
│   └── layout.tsx / globals.css
├── components/
│   ├── ui/                 # Primitivos atómicos (shadcn/Radix)
│   ├── admin/              # Componentes del panel admin
│   ├── comunidad/          # Componentes de la sección comunidad
│   └── *.tsx               # Componentes de sección (Header, Hero, Footer…)
├── src/
│   ├── lib/
│   │   ├── supabase/       # Clientes y queries
│   │   │   ├── client.ts         # Cliente browser
│   │   │   ├── server.ts         # Cliente servidor
│   │   │   ├── middleware.ts     # updateSession para JWT
│   │   │   ├── queries.ts        # Queries principales
│   │   │   ├── community-queries.ts  # Queries de comunidad
│   │   │   ├── admin-queries.ts  # Queries del panel admin
│   │   │   └── admin-auth.ts     # Verificación de rol admin
│   │   ├── resend.ts       # Email transaccional
│   │   ├── avatar-generator.ts
│   │   ├── slugify.ts
│   │   └── site-url.ts
│   ├── types/index.ts      # Interfaces TypeScript globales
│   └── schemas/            # Schemas zod compartidos (ej. encuesta betatester)
├── lib/utils.ts            # Helper cn() de shadcn
├── hooks/                  # Custom hooks de React (use-toast, use-in-view)
├── middleware.ts            # Refresh de sesión Supabase + verificación de rol admin (todas las rutas)
├── e2e/                    # Smoke tests de Playwright
├── docs/                   # Documentación del proyecto
├── scripts/                # Scripts de utilidad (.ps1, gitignored — no versionados)
├── resources/              # Assets y referencias externas
└── public/                 # Assets estáticos
```

> Los mocks de datos que vivían en `src/data/` se eliminaron (FASE 1, quick win) — la migración a
> datos reales de Supabase ya estaba completa en toda la app y no tenían consumidores.

---

## 🗄️ Base de Datos — Supabase

Schema completo (22 tablas, funciones, RLS, convención de migraciones) documentado en
**[`docs/DATABASE.md`](./DATABASE.md)** — no se duplica aquí para evitar que ambos documentos se
desincronicen otra vez (pasó con la versión anterior de este archivo, que omitía 8+ tablas).

Resumen de dominios: núcleo (`profiles`, `universities`), contenido público (`news`, `events` +
`event_registrations`, `opportunities`, `resources`, `sponsors`), comunidad (`hub_documents`,
`podcast_episodes`, `research_publications`, `community_leaderboard`, `community_ideas` +
`community_idea_votes`, `tutoring_requests`, `mentor_matching_profiles`), feedback/encuestas
(`feedback`, `betatester_survey_new_users`, `betatester_survey_returning_users`,
`member_interests`).

### Tipos principales (`src/types/index.ts`)

- `MemberArea`: `frontend | backend | diseño | devops | ia | seguridad | general`
- `MemberStatus`: `activo | inactivo`
- `HubEventType`: `workshop | charla | hackathon | copa | networking | otro`
- `NewsCategory`: `anuncio | logro | evento | update`
- `SponsorTier`: `principal | colaborador | aliado`
- `UserBadge` (`CoreBadge | CommunityBadge`): sistema de bandas visual — `ceo_founder`,
  `primary_agent`, `primary_fellow`, `agent` (núcleo/staff) y `member`, `fellow`, `catedratico`,
  `estudiante` (comunidad). Distinto de `profiles.role` (`member | admin`, usado por `is_admin()`).
- `UniversityCode`: `UDB | UCA | UES | UFG | UEES | ESEN` — sistema multi-universidad

---

## 🔐 Autenticación

```
Browser → middleware.ts → updateSession() → Supabase JWT refresh
                 ↓
        Si ruta /admin/* y usuario autenticado: verifica profiles.role = 'admin'
                 ↓
        Server Component verifica sesión (capa adicional)
                 ↓
        Si no autenticado: redirect /login
        Si onboarding_completed = false: redirect /onboarding
```

- Supabase Auth (email + password)
- Middleware aplica a todas las rutas excepto assets estáticos; para `/admin/*` verifica sesión
  **y** rol (defense-in-depth añadida en FASE 0, antes solo verificaba sesión)
- El cliente browser (`client.ts`) se usa en componentes `'use client'`
- El cliente servidor (`server.ts`) se usa en RSC y Server Actions
- Autorización de admin en 3 capas: middleware → `requireAdmin()`/`assertAdminAction()` (layout y
  Server Actions) → RLS (`is_admin()`) — cualquiera de las tres bloquea por sí sola

---

## ✉️ Email — Resend

- **From:** `noreply@send.cshdevs.org`
- **Admin:** `admin@cshdevs.org`
- **Triggers:** inscripción a evento, envío de feedback
- **Variable:** `RESEND_API_KEY` (Vercel env; no hay Supabase Vault en uso)
- Todo valor de origen usuario (nombre, mensaje, etc.) se escapa con `escapeHtml()` antes de
  interpolarse en el HTML del email — XSS confirmado y corregido en FASE 0 (`src/lib/resend.ts`)

---

## 🏗️ Patrones de Arquitectura

### 1. Server Actions para mutaciones
Toda mutación va en `app/actions/*.ts` con `'use server'`. No se usan API Routes para lógica de negocio.

### 2. RSC para fetch de datos
Los Server Components fetchean datos directamente con `await` usando las funciones de `src/lib/supabase/queries.ts`.

### 3. Separación cliente/servidor
`src/lib/supabase/client.ts` → solo en `'use client'`  
`src/lib/supabase/server.ts` → solo en Server Components y Actions

### 4. Alias `@/`
Todo import usa `@/` que mapea a la raíz del proyecto (configurado en `tsconfig.json`).

---

## ☁️ Infraestructura

- **Hosting:** Vercel (Edge + Image Optimization)
- **DB + Auth:** Supabase
- **Email:** Resend (dominio verificado `send.cshdevs.org`)
- **Dominio:** `cshdevs.org` (configurado en Vercel)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) en cada push/PR a `main` — lint, typecheck,
  build, tests unitarios (Vitest) y smoke E2E (Playwright). `npm run predeploy` (lint + build)
  sigue disponible para verificación manual antes de un deploy directo.
