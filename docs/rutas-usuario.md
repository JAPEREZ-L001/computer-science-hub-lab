# Mapa de Rutas de Usuario — Computer Science Hub

> Última actualización: 2026-09-01 — fusiona `docs/rutas-usuario.md` (2026-03-20) con
> `docs/_archive/2026-03-23-mapeo-betatester-v1/mapeo-rutas-funcionalidades.md` (2026-03-23) y
> corrige contra el árbol real de `app/` (BL-12). Ese segundo archivo queda como referencia
> histórica; este documento es la fuente canónica.
> Basado en la estructura `app/` de Next.js App Router + `middleware.ts`

---

## Niveles de Acceso

| Nivel | Descripción |
|-------|-------------|
| 🌐 Público | Cualquier visitante, sin cuenta |
| 👤 Funcionalidad reducida | Visible para todos, acciones interactivas requieren cuenta real |
| 🔒 Requiere sesión | Solo usuarios autenticados con cuenta real |
| 🛡️ Solo admin | Requiere rol de administrador |

---

## Navegación del Header (`components/header.tsx`)

```
El Hub        → Conócenos (/nosotros) · Comunidad (/comunidad) · Directorio (/miembros)
Crecimiento   → Oportunidades (/oportunidades) · Recursos (/recursos)
Novedades     → Eventos (/eventos) · Noticias (/noticias)
[Sin sesión]  → Acceder (/login) · Postularse (/nosotros#join)
[Con sesión]  → Mi Perfil (/perfil) · Admin (/admin, solo admins) · Cerrar sesión
```

---

## Rutas Públicas — Sitio Principal

### `GET /` — Home
- **Acceso:** 🌐 Público
- **Secciones:** Hero, Filosofía, Ecosistema, Ruta del sitio, Prueba social, Sponsors, Crecimiento, Valores, CTA
- **Lleva hacia:** `/nosotros#join`, todas las rutas del Header/Footer

### `GET /nosotros` — Conócenos
- **Acceso:** 🌐 Público
- **Propósito:** Quiénes somos, filosofía, valores y micro-intake de interés (`id="join"`)
- **Redirects permanentes** (`next.config.mjs`): `/sobre`, `/valores`, `/programas` → `/nosotros`

### `GET /oportunidades` — Oportunidades
- **Acceso:** 🌐 Público — listado publicado, filtros por categoría

### `GET /recursos` — Recursos
- **Acceso:** 🌐 Público — listado publicado, filtros por categoría/nivel

### `GET /noticias` — Noticias
- **Acceso:** 🌐 Público — grid categorizado (`anuncio \| logro \| evento \| update`)
- **Lleva hacia:** `/noticias/[slug]`

### `GET /noticias/[slug]` — Artículo individual *(ruta dinámica)*
- **Acceso:** 🌐 Público — si el slug no existe, redirige a `/noticias`

### `GET /eventos` — Eventos
- **Acceso:** 👤 Funcionalidad reducida
- **Sin cuenta:** ve los eventos, no puede inscribirse
- **Con cuenta real:** inscripción vía `EventSubscribeButton`; puede borrar eventos propios (`created_by`) o cualquiera si es admin

### `GET /miembros` — Directorio de Miembros
- **Acceso:** 🌐 Público — filtros por área, búsqueda por nombre

### `GET /feedback` — Feedback
- **Acceso:** 🌐 Público (incluido `anon`) — formulario de opinión general, protegido por rate limiting a nivel de Server Action, no por auth

### `GET /encuesta-betatester` — Encuesta betatester
- **Acceso:** 🌐 Público (beta cerrada, sin requerir login) — dos variantes de encuesta (usuario nuevo / recurrente), rate limited por IP

### `GET /terminos`, `GET /privacidad` — Legales
- **Acceso:** 🌐 Público

---

## Rutas Públicas — Comunidad (`/comunidad/*`)

### `GET /comunidad` — Hub de la Comunidad
- **Acceso:** 🌐 Público
- **Contenido:** Tabs (Directorio, Mentores & Tutorías, Beneficios) + grid "Explorá el resto de la comunidad" (BL-22, ver abajo)
- **Lleva hacia:**

| Módulo | Ruta | Acceso |
|--------|------|--------|
| Directorio | `/miembros` | 🌐 |
| Tutorías entre pares | `/comunidad/tutorias` | 👤 |
| Matching de Mentores | `/comunidad/mentores` | 👤 |
| Beneficios | `/comunidad/beneficios` | 👤 |
| Ideas en Votación | `/comunidad/ideas` | 👤 |
| Documentación | `/comunidad/documentacion` | 🌐 |
| Podcast & Media | `/comunidad/podcast` | 🌐 |
| Investigación | `/comunidad/investigacion` | 🌐 |
| Competencias | `/comunidad/competencias` | 🌐 |

> Hasta BL-22 (2026-09-01), los últimos 5 módulos (ideas, documentación, podcast, investigación,
> competencias) estaban implementados y accesibles por URL directa pero sin ningún link visible
> desde el hub — quedaban huérfanos de navegación. Ahora están enlazados desde `/comunidad` vía
> `ComunidadModuleCard`.

### `GET /comunidad/tutorias` — Tutorías entre pares
- **Acceso:** 👤 — sin cuenta: botón → `/login?redirect=/comunidad/tutorias`; con cuenta: enviar solicitudes

### `GET /comunidad/mentores` — Mentores & Matching
- **Acceso:** 👤 — sin cuenta: botón de login; con cuenta: directorio + perfil de matching propio

### `GET /comunidad/ideas` — Ideas en Votación
- **Acceso:** 👤 — sin cuenta: solo ver ideas abiertas; con cuenta: proponer, votar (RPC atómica `cast_idea_vote`, ver BL-16) y borrar las propias

### `GET /comunidad/beneficios` — Beneficios
- **Acceso:** 👤 — sin cuenta: CTA a `/registro` / `/login`; con cuenta: lista completa de beneficios

### `GET /comunidad/documentacion`, `/comunidad/podcast`, `/comunidad/investigacion`, `/comunidad/competencias`
- **Acceso:** 🌐 Público — contenido curado desde Supabase (`hub_documents`, `podcast_episodes`, `research_publications`, `community_leaderboard`)

---

## Rutas de Autenticación

### `GET /login` — Iniciar Sesión
- **Acceso:** 🌐 Público (middleware redirige a `/` si ya hay sesión real)
- **Después del login:** redirige a `?redirect=` (por defecto `/`)

### `GET /registro` — Registrarse
- **Acceso:** 🌐 Público (middleware redirige a `/` si ya hay sesión real)
- **Password:** mínimo 8 caracteres, 1 mayúscula, 1 número (BL-06, corregido el placeholder que decía "mínimo 6")
- **Después del registro:** redirige a `?redirect=` (por defecto `/perfil`)

### `GET /auth/callback` — Handler OAuth / Magic Link *(route handler, no página)*
- **Parámetro:** `?next=/ruta` (por defecto `/`) — si falla, redirige a `/auth/auth-code-error`

### `GET /auth/auth-code-error` — Error de Autenticación
- **Acceso:** 🌐 Público

### `GET /onboarding` — Onboarding
- **Acceso:** 🔒 Requiere sesión — wizard obligatorio si `profiles.onboarding_completed = false`; el middleware y `/perfil` redirigen aquí hasta completarlo. +5 reputación al completar.

---

## Rutas Protegidas — Usuario Autenticado

### `GET /perfil` — Mi Perfil
- **Acceso:** 🔒 Requiere sesión real — protección doble: middleware + verificación server-side
- **Contenido:** datos personales, reputación (BL-21, ya no dice "Próximamente"), eventos inscritos, tutorías solicitadas, ideas propias, perfil de mentor
- **Funcionalidad:** modal `EditProfileDialog`

---

## Panel de Administración

> Todas las rutas `/admin/*` requieren rol admin. Protección en 3 capas: middleware (BL-15, verifica
> rol además de sesión) + `requireAdmin()` en el layout + RLS (`is_admin()`) en cada policy de escritura.

| Ruta | Propósito |
|------|-----------|
| `/admin` | Dashboard — contadores de Noticias, Eventos, Oportunidades, Recursos, Sponsors, Miembros |
| `/admin/noticias` | CRUD de noticias |
| `/admin/eventos` | CRUD de eventos |
| `/admin/oportunidades` | CRUD de oportunidades |
| `/admin/recursos` | CRUD de recursos |
| `/admin/sponsors` | CRUD de sponsors |
| `/admin/miembros` | Gestión de perfiles de miembros |

---

## Rutas técnicas / soporte

| Ruta | Tipo | Función |
|------|------|---------|
| `app/layout.tsx` | Layout raíz | Tipografía, sesión, `<Toaster />`, Vercel Analytics |
| `app/admin/layout.tsx` | Layout protegido | `requireAdmin()` + shell del panel |
| `app/not-found.tsx` | Fallback | 404 global |
| `app/auth/callback/route.ts` | Route handler | Único endpoint API dentro de `app/` (intercambio de código OAuth) |

---

## Integraciones externas

| Integración | Uso |
|---|---|
| Supabase Auth | Registro, login, sesiones, middleware, control de acceso |
| Supabase Database | Todo el contenido: perfiles, noticias, eventos, recursos, oportunidades, comunidad, feedback, encuestas |
| Resend | Notificaciones por email (inscripción a eventos, feedback) — ver `src/lib/resend.ts` |
| Vercel Analytics | Analítica desde el layout global |

---

## Flujos Clave por Tipo de Usuario

### Usuario nuevo (sin cuenta)
```
/ → /nosotros#join (formulario) → /registro → /onboarding → /perfil
/ → /login → /registro → /onboarding → /perfil
/comunidad/beneficios → /registro → /onboarding → /perfil
```

### Usuario que regresa (con cuenta)
```
/ → /login → [redirect destino o /]
/eventos → inscribirse → [requiere /login si no tiene sesión]
/comunidad/tutorias → solicitar tutoría
/comunidad/ideas → votar / proponer
/comunidad/mentores → directorio + matching
```

### Administrador
```
/login → /admin → /admin/[sección] → CRUD de contenido
```

---

## Resumen Rápido

| Tipo | Cantidad | Rutas |
|------|----------|-------|
| Públicas | 17 | `/`, `/nosotros` (+ redirects `/sobre`, `/valores`, `/programas`), `/oportunidades`, `/recursos`, `/noticias`, `/noticias/[slug]`, `/miembros`, `/feedback`, `/encuesta-betatester`, `/terminos`, `/privacidad`, `/comunidad`, `/comunidad/documentacion`, `/comunidad/podcast`, `/comunidad/investigacion`, `/comunidad/competencias`, `/auth/auth-code-error` |
| Func. reducida | 5 | `/eventos`, `/comunidad/ideas`, `/comunidad/tutorias`, `/comunidad/mentores`, `/comunidad/beneficios` |
| Requieren sesión | 2 | `/onboarding`, `/perfil` |
| Solo admin | 7 | `/admin`, `/admin/noticias`, `/admin/eventos`, `/admin/oportunidades`, `/admin/recursos`, `/admin/sponsors`, `/admin/miembros` |
| Utility | 1 | `/auth/callback` |
| **Total** | **32** | |
