# DATABASE.md — Schema de Supabase

> Última actualización: 2026-09-01 (reescrito desde las 23 migraciones reales en
> `supabase/migrations/` + uso real en el código — ver `docs/_archive/2026-09-01-auditoria-integral/`)
> Para el contexto completo → `CONTEXT.md`

---

## Modelo de autorización (corrige versión anterior)

**El panel admin NO usa `SUPABASE_SERVICE_ROLE_KEY`.** No existe ninguna referencia a esa
variable en `src/` ni `app/` — solo aparecía mencionada en docs desactualizados. El modelo real:

- Todas las queries (públicas y admin) usan la misma clave `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  (o `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback legacy — ver `src/lib/supabase/env.ts`).
- La autorización de admin corre **enteramente sobre RLS**: cada policy de escritura en tablas de
  contenido usa `public.is_admin()`, una función `SECURITY DEFINER` que verifica
  `profiles.role = 'admin'` sin recursión.
- La capa de aplicación (`assertAdminAction()`, `requireAdmin()` en `src/lib/supabase/admin-auth.ts`,
  y el middleware — ver BL-15) es defensa adicional, no la única barrera: si esas capas fallaran,
  RLS sigue bloqueando escrituras de no-admins.

---

## Funciones y triggers

| Función | Tipo | Uso |
|---|---|---|
| `public.is_admin()` | `SECURITY DEFINER`, sin args | `SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'`. Usada en casi todas las RLS policies de escritura. |
| `public.handle_new_user()` | Trigger `AFTER INSERT ON auth.users` | Crea la fila en `profiles` automáticamente al registrarse, leyendo `raw_user_meta_data` (full_name, career, cycle, area) y marcando `status = 'inactivo'` si el usuario es anónimo. |
| `public.cast_idea_vote(p_idea_id uuid)` | `SECURITY DEFINER`, RPC | Vota una idea de forma atómica: INSERT en `community_idea_votes` + UPDATE `vote_count` en una sola transacción implícita. Reemplaza el flujo anterior (INSERT + RPC separada) que tenía un bug de RLS silencioso — ver commit `d24b9df`. |
| `public.increment_idea_vote_count(idea_id uuid)` | `SECURITY INVOKER`, RPC | **Legacy, ya no se usa desde el código** (se mantiene por compatibilidad histórica). No la llames desde código nuevo: al ser `SECURITY INVOKER`, la RLS de `community_ideas` bloquea el UPDATE cuando el votante no es el autor ni admin. |

---

## Núcleo

### `profiles`
Perfil de cada usuario autenticado. Se crea automáticamente vía `handle_new_user()` al registrarse.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK, FK → `auth.users`) | `ON DELETE CASCADE` |
| `full_name` | text | |
| `email` | text | |
| `career` | text | Carrera universitaria |
| `cycle` | int | Ciclo académico actual |
| `area` | text | `frontend \| backend \| diseño \| devops \| ia \| seguridad \| general` (default `general`) |
| `status` | text | `activo \| inactivo` (default `activo`; `inactivo` para sesiones anónimas) |
| `role` | text | `member \| admin` (default `member`) — usado por `is_admin()` |
| `badge` | text | `ceo_founder \| primary_agent \| primary_fellow \| agent \| member \| fellow \| catedratico \| estudiante` (default `member`) — badge visual, **distinto** de `role` |
| `university_role` | text | `estudiante \| catedratico` (default `estudiante`) |
| `university` | text (FK → `universities.code`) | default `UDB`, `ON UPDATE CASCADE` |
| `bio` | text | |
| `github_url` | text | |
| `linkedin_url` | text | |
| `onboarding_completed` | bool | default `false`; +5 reputación al completarse |
| `reputation_score` | int | default `0` |
| `avatar_palette_index` | smallint | índice 0-9 de paleta generativa |
| `banner_palette_index` | smallint | |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()` (sin trigger de auto-actualización) |

RLS: SELECT si `status='activo' OR auth.uid()=id OR is_admin()`. INSERT/UPDATE solo propio o admin.
DELETE solo admin.

### `universities`
Catálogo de universidades para el sistema multi-universidad (CSH-S0-007).

| Campo | Tipo |
|---|---|
| `code` | text (PK) — `UDB \| UCA \| UES \| UFG \| UEES \| ESEN` |
| `name`, `short_name` | text |
| `country` | text (default `El Salvador`) |
| `active` | bool |
| `sort_order` | int |
| `created_at` | timestamptz |

RLS: SELECT público si `active`, escritura solo admin.

---

## Contenido público

Todas comparten el mismo patrón RLS: SELECT si `published = true OR is_admin()` (o `active` en
`sponsors`), INSERT/UPDATE/DELETE solo admin.

### `news`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `slug` | text **UNIQUE** |
| `title`, `excerpt`, `content` | text |
| `category` | text — `anuncio \| logro \| evento \| update` (default `anuncio`) |
| `published` | bool (default `false`) |
| `published_at` | timestamptz |
| `created_at` | timestamptz |

### `events`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title`, `description` | text |
| `event_date` | date |
| `event_time` | **text** (no `time` — se guarda como string `"17:00"`, no como tipo `time` de Postgres) |
| `speaker`, `location`, `registration_url` | text |
| `type` | text — `workshop \| charla \| hackathon \| copa \| networking \| otro` (default `workshop`) |
| `published` | bool (default `false`) |
| `created_by` | uuid (FK → `auth.users`, `ON DELETE SET NULL`) — permite borrar el evento a su creador además de admin |
| `created_at` | timestamptz |

### `event_registrations`
| Campo | Tipo |
|---|---|
| `event_id` | uuid (FK → `events`, CASCADE) |
| `user_id` | uuid (FK → `auth.users`, CASCADE) |
| `registered_at` | timestamptz |

PK compuesta `(event_id, user_id)`. RLS: usuario ve/inserta/borra las propias; admin ve todas.

### `opportunities`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title`, `organization`, `description`, `url` | text |
| `type` | text (default `Pasantía / Primer empleo`) |
| `published` | bool |
| `created_at` | timestamptz |

### `resources`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title`, `description`, `url` | text |
| `category` | text (default `computacion`) |
| `tags` | text[] (default `{}`) |
| `published` | bool |
| `created_at` | timestamptz |

### `sponsors`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `name` | text **UNIQUE** |
| `logo_url`, `website_url` | text |
| `tier` | text — `principal \| colaborador \| aliado` (default `colaborador`) |
| `active` | bool (default `true`) |
| `created_at` | timestamptz |

---

## Comunidad

### `hub_documents`, `podcast_episodes`, `research_publications`, `community_leaderboard`
Contenido curado, mismo patrón RLS que "Contenido público" (`published`/admin).

| Tabla | Campos propios |
|---|---|
| `hub_documents` | `title`, `description`, `url`, `category` (default `general`), `sort_order` |
| `podcast_episodes` | `title`, `summary`, `episode_url`, `platform` (default `web`), `published_at`, `sort_order` |
| `research_publications` | `title`, `authors`, `venue`, `year`, `url`, `sort_order` |
| `community_leaderboard` | `display_name`, `points` (default `0`), `badge`, `area`, `sort_order` — datos demo, sin vínculo a eventos reales todavía (ver BL futuro) |

### `community_ideas`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title`, `description` | text |
| `author_id` | uuid (FK → `auth.users`, `SET NULL`) |
| `vote_count` | int (default `0`, `CHECK >= 0`) |
| `status` | text — `open \| closed \| archived` (default `open`) |
| `created_at` | timestamptz |

RLS: SELECT si `status='open' OR is_admin()`. INSERT autenticado no-anónimo. UPDATE propio o admin.
**DELETE: propio autor o admin** (BL-04 — antes solo admin, pese a que `deleteOwnIdea` en
`app/comunidad/actions.ts` ya intentaba borrar como autor).

### `community_idea_votes`
| Campo | Tipo |
|---|---|
| `idea_id` | uuid (FK → `community_ideas`, CASCADE) |
| `user_id` | uuid (FK → `auth.users`, CASCADE) |
| `created_at` | timestamptz |

PK compuesta `(idea_id, user_id)` — previene doble voto a nivel de constraint. Votar pasa por la
RPC `cast_idea_vote()`, no por INSERT directo (ver arriba).

### `tutoring_requests`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `user_id` | uuid (FK → `auth.users`, CASCADE) |
| `topic`, `details`, `preferred_schedule` | text |
| `status` | text — `pending \| matched \| closed` (default `pending`) |
| `created_at` | timestamptz |

RLS: usuario ve/inserta las propias (no-anónimo); admin ve todas y actualiza status (sin workflow
de matching automatizado todavía — ver P07/BL futuro).

### `mentor_matching_profiles`
| Campo | Tipo |
|---|---|
| `user_id` | uuid (PK, FK → `auth.users`, CASCADE) |
| `role` | text — `mentor \| student \| both` |
| `topics`, `availability`, `bio_short` | text |
| `active` | bool (default `true`) |
| `updated_at` | timestamptz |

RLS: SELECT propio, o si `active AND role IN ('mentor','both')` para cualquier autenticado
(directorio de mentores); UPDATE/DELETE propio o admin.

### `idea_comments`, `member_projects` — ⚠️ sin consumidor en el código

Ambas tablas se crearon en `20260322161000_expansion_fase2.sql` con RLS completo (CRUD del propio
autor + lectura pública) pero **0 referencias en `app/` ni `components/`** — ninguna UI las lee ni
las escribe. Decisión (FASE 2, BL-24): no implementar UI ni hacer `DROP TABLE` en esta sesión —
implementar UI es trabajo de feature nuevo (fuera de alcance de limpieza), y dropear tablas sin
confirmar que están vacías en producción es un riesgo de datos no verificable sin acceso directo a
la BD remota. Pendiente de decisión de producto.

| Tabla | Campos |
|---|---|
| `idea_comments` | `id`, `idea_id` (FK → `community_ideas`), `author_id` (FK → `profiles`), `content`, `created_at`, `updated_at` |
| `member_projects` | `id`, `profile_id` (FK → `profiles`), `title`, `description`, `url`, `github_url`, `image_url`, `created_at`, `updated_at` |

---

## Feedback y encuestas

### `feedback`
| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `name`, `email`, `message` | text |
| `is_anonymous` | bool (default `false`) |
| `read` | bool (default `false`) |
| `created_at` | timestamptz |

RLS: INSERT abierto a cualquiera (incluido `anon`, protegido por rate limiting en el Server Action,
no en RLS). SELECT solo admin.

### `betatester_survey_new_users`, `betatester_survey_returning_users`
Encuestas de beta cerrada — columnas explícitas por pregunta (ver
`src/lib/schemas/betatester-survey.ts` para el schema zod completo compartido con la validación).
Comparten: `id`, `user_id` (nullable, FK → `auth.users`), `created_at`, `cohort_tag` (default
`beta-cerrada`), más un bloque "common_*" idéntico en ambas tablas para comparabilidad entre
cohortes.

RLS: INSERT abierto (`anon` + `authenticated`, protegido por rate limiting a nivel de Server
Action — ver `checkRateLimit` en `app/actions/betatester-survey.ts`). SELECT solo admin.

### `member_interests`
Capturado por `MicroIntakeForm` (micro-intake de interés, `/nosotros`).

| Campo | Tipo |
|---|---|
| `id` | uuid (PK) |
| `user_id` | uuid (nullable, FK → `auth.users`, `SET NULL`) — permite envíos sin sesión |
| `name`, `email`, `detail` | text |
| `goals` | text[] (default `{}`) |
| `created_at` | timestamptz |

RLS: INSERT si `user_id IS NULL OR user_id = auth.uid()`. SELECT solo admin.

---

## Clientes Supabase

```typescript
// Solo en 'use client' (browser):
import { createClient } from '@/src/lib/supabase/client'

// En Server Components y Server Actions:
import { createClient } from '@/src/lib/supabase/server'

// En middleware:
import { updateSession } from '@/src/lib/supabase/middleware'
```

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=                    # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=        # Clave publishable moderna (recomendada)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=             # Alternativa legacy — fallback si no hay publishable key
NEXT_PUBLIC_SITE_URL=                        # Para emails de confirmación / callbacks OAuth
RESEND_API_KEY=                              # Notificaciones por email (opcional en dev)
```

No hay `SUPABASE_SERVICE_ROLE_KEY` en uso — ver "Modelo de autorización" arriba.

---

## Migraciones — estado y orden

23 migraciones en `supabase/migrations/`. El orden **lexicográfico no coincide con el orden real
de dependencias** (bug B08 del reporte de auditoría): archivos con timestamp `2026MMDD...` y
archivos `csh_s2_NN_...` están intercalados de forma que rompe `supabase db reset` desde cero.
`20260301090000_base_schema_public_tables.sql` (BL-02, esta sesión) restaura las 6 tablas núcleo
que nunca tuvieron `CREATE TABLE` versionado. El renombrado completo del resto (BL-03) está
**escalado, no ejecutado** — ver `docs/_archive/2026-09-01-auditoria-integral/ejecucion-log.md` sección
"BL-03" para las opciones A/B y el riesgo de romper la reconciliación con el Supabase de
producción si esas migraciones ya están aplicadas ahí.
