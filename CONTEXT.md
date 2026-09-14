# ðŸ§  CONTEXT.md â€” Computer Science Hub (CSH) Web

> **Para la IA:** Lee este archivo completo antes de empezar cualquier tarea.
> TambiÃ©n lee `docs/work/STATUS.md` para saber en quÃ© punto estÃ¡ el sprint activo.

---

## Â¿QuÃ© es este proyecto?

**Computer Science Hub (CSH)** es la plataforma web oficial de una comunidad de estudiantes de Ciencias de la ComputaciÃ³n de la Universidad Don Bosco (Antiguo CuscatlÃ¡n, El Salvador). Permite a miembros registrados acceder a eventos, noticias, recursos, un directorio de miembros, oportunidades laborales, ideas comunitarias, mentorÃ­a y tutorÃ­as.

**URL de producciÃ³n:** `https://cshdevs.org`
**Repositorio:** `JAPEREZ-L001/Computer-Science-Hub-Web`

---

## Stack Completo

| Capa | TecnologÃ­a |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19 + TypeScript 5.7 |
| Estilos | Tailwind CSS 4 + PostCSS |
| Componentes | Radix UI primitives + shadcn/ui pattern |
| Formularios | React Hook Form + Zod |
| Iconos | Lucide React |
| Tema | Next Themes (dark mode forzado) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS + Vault) |
| Email | Resend (`noreply@send.cshdevs.org`) |
| Despliegue | Vercel |
| Analytics | @vercel/analytics |

---

## Estructura de Carpetas

```
/
â”œâ”€â”€ app/                    # Rutas Next.js (App Router)
â”‚   â”œâ”€â”€ actions/            # Server Actions (mutaciones del servidor)
â”‚   â”œâ”€â”€ admin/              # Panel admin (protegido)
â”‚   â”œâ”€â”€ auth/               # Callbacks de autenticaciÃ³n
â”‚   â”œâ”€â”€ comunidad/          # /comunidad â€” ideas, mentors, docs, podcast
â”‚   â”œâ”€â”€ eventos/            # /eventos
â”‚   â”œâ”€â”€ miembros/           # /miembros â€” directorio
â”‚   â”œâ”€â”€ noticias/           # /noticias
â”‚   â”œâ”€â”€ oportunidades/      # /oportunidades
â”‚   â”œâ”€â”€ perfil/             # /perfil â€” pÃ¡gina del usuario
â”‚   â”œâ”€â”€ recursos/           # /recursos
â”‚   â”œâ”€â”€ onboarding/         # /onboarding â€” flujo de bienvenida
â”‚   â””â”€â”€ ...otras rutas legales/info
â”œâ”€â”€ components/             # Componentes React
â”‚   â”œâ”€â”€ ui/                 # Primitivos atÃ³micos (shadcn)
â”‚   â”œâ”€â”€ admin/              # Componentes del panel admin
â”‚   â”œâ”€â”€ comunidad/          # Componentes de /comunidad
â”‚   â””â”€â”€ *.tsx               # Componentes de secciÃ³n (Header, Hero, etc.)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ supabase/       # Clientes y queries de Supabase
â”‚   â”‚   â”œâ”€â”€ resend.ts       # Servicio de email transaccional
â”‚   â”‚   â”œâ”€â”€ avatarGenerator.ts
â”‚   â”‚   â”œâ”€â”€ slugify.ts
â”‚   â”‚   â””â”€â”€ site-url.ts
â”‚   â”œâ”€â”€ types/index.ts      # Interfaces TypeScript globales
â”‚   â””â”€â”€ data/               # Mocks de datos (para pruebas)
â”œâ”€â”€ lib/utils.ts            # Helper `cn()` de shadcn
â”œâ”€â”€ hooks/                  # Custom React hooks
â”œâ”€â”€ middleware.ts            # Supabase session refresh (todas las rutas)
â”œâ”€â”€ docs/                   # DocumentaciÃ³n del proyecto
â””â”€â”€ scripts/                # Scripts de utilidad (.ps1)
```

---

## Base de Datos â€” Supabase (tablas principales)

| Tabla | DescripciÃ³n |
|---|---|
| `profiles` | Perfil del usuario autenticado (Ã¡rea, carrera, ciclo, estado) |
| `events` | Eventos del hub (workshops, charlas, hackathonsâ€¦) |
| `event_registrations` | Inscripciones de usuarios a eventos |
| `news` | Noticias/anuncios publicados |
| `resources` | Recursos acadÃ©micos (links, docs, herramientas) |
| `opportunities` | Oportunidades laborales o acadÃ©micas |
| `sponsors` | Patrocinadores (tier: principal/colaborador/aliado) |
| `community_ideas` | Ideas propuestas por la comunidad (votables) |
| `community_idea_votes` | Votos de ideas (user_id + idea_id) |
| `hub_documents` | Documentos oficiales del hub |
| `podcast_episodes` | Episodios del podcast |
| `research_publications` | Publicaciones de investigaciÃ³n |
| `community_leaderboard` | Ranking de miembros por puntos |
| `tutoring_requests` | Solicitudes de tutorÃ­a |
| `mentor_matching_profiles` | Perfiles de mentores/mentees |

**Clientes Supabase:**
- `src/lib/supabase/client.ts` â€” cliente browser (componentes client)
- `src/lib/supabase/server.ts` â€” cliente servidor (Server Components / Actions)

---

## Server Actions (`app/actions/`)

| Archivo | Acciones |
|---|---|
| `profile.ts` | Actualizar perfil, API keys |
| `onboarding.ts` | Completar onboarding |
| `interests.ts` | Guardar intereses del usuario |
| `events.ts` | Crear/eliminar eventos (admin) |
| `event-registration.ts` | Inscribirse/desinscribirse a eventos |
| `feedback.ts` | Enviar feedback (dispara email via Resend) |
| `betatester-survey.ts` | Guardar respuestas de encuesta beta |

---

## AutenticaciÃ³n

- **Proveedor:** Supabase Auth (email + password)
- **Middleware:** `middleware.ts` llama `updateSession()` en cada request para refrescar el token JWT
- **Rutas protegidas:** manejadas con verificaciÃ³n de sesiÃ³n en Server Components
- **Flujo post-login:** `/onboarding` si `onboarding_completed = false`, sino a `/perfil`

---

## Email â€” Resend

- **Dominio remitente:** `send.cshdevs.org` (verificado en Resend)
- **From address:** `noreply@send.cshdevs.org`
- **Admin email:** `admin@cshdevs.org`
- **Triggers actuales:** nueva inscripciÃ³n a evento, nuevo feedback

---

## Convenciones del CÃ³digo

- **Imports:** usar siempre el alias `@/` (mapea a la raÃ­z del proyecto)
- **Ejemplo:** `import { createClient } from '@/src/lib/supabase/server'`
- **Tipos globales:** definidos en `src/types/index.ts`, importar desde ahÃ­
- **Queries:** toda consulta a Supabase va en `src/lib/supabase/queries.ts` o `community-queries.ts`
- **Mutaciones:** van exclusivamente en `app/actions/*.ts` (Server Actions con `'use server'`)
- **Componentes de pÃ¡gina:** usan `async/await` directamente (RSC)
- **Componentes interactivos:** tienen `'use client'` arriba

---

## Decisiones Tomadas (No revertir)

| DecisiÃ³n | RazÃ³n |
|---|---|
| No mover `app/` ni `components/` a `src/` | La estructura actual funciona con Next.js y el equipo la conoce |
| Dark mode forzado en toda la app | Identidad visual del hub |
| `src/lib/supabase/` separado del resto de `lib/` | SeparaciÃ³n de concerns: todo Supabase estÃ¡ aislado |
| Usar Resend y no SMTP directo | Deliverability y simplicidad de API |
| `app/actions/` para todas las mutaciones | PatrÃ³n Server Actions, no API routes |

---

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

*Ãšltima actualizaciÃ³n: 2026-03-26 | Sprint 3 en progreso*
*Para el estado actual del sprint â†’ ver `docs/work/STATUS.md`*

