# 🌐 ENVIRONMENTS.md — Entornos de Desarrollo

> **Para la IA:** Este archivo describe cómo configurar y sincronizar los entornos del proyecto.
> Última actualización: 2026-09-04
>
> El equipo usa GitHub Flow simplificado (ver `docs/WORKFLOW.md`): **`main` es la única rama larga**,
> protegida, con merge solo vía PR. No existe una rama `develop` en el workflow actual — la fila
> "Staging" de abajo describe un entorno **aspiracional**, sin fecha ni rama asignada todavía.

---

## Entornos del Proyecto

| Entorno | URL | Proyecto Supabase | Rama |
|---|---|---|---|
| **Local** | `http://localhost:3000` | Supabase local (CLI) | Cualquier rama `feature/*`, `hotfix/*` o `chore/*` |
| **Staging** | *(no configurado)* | *(no configurado)* | Sin definir — ver nota arriba |
| **Producción** | `https://cshdevs.org` | Proyecto Supabase actual | `main` |

---

## 🔧 Setup Local

### Prerrequisitos

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `npm install -g supabase`
- Docker Desktop (requerido para Supabase local)

### Configurar variables de entorno

```bash
# Copiar el example a .env local
cp .env.example .env
```

Editar `.env` con las credenciales del proyecto Supabase de desarrollo:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key local de supabase start>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<alternativa legacy, solo si no hay publishable key>
RESEND_API_KEY=<tu API key de Resend>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> No hay `SUPABASE_SERVICE_ROLE_KEY` en ningún entorno: la app entera (incluido el panel admin)
> opera con la clave publishable/anon + RLS vía `is_admin()`, nunca con service_role. Ver
> "Modelo de autorización" en `docs/DATABASE.md`.

### Iniciar Supabase local

```bash
# Iniciar la instancia local de Supabase
supabase start

# Output esperado:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL: http://127.0.0.1:54323
# Publishable key: sb_publishable_...
# (el output también muestra un service role key -- no se usa en esta app, ignorarlo)
```

> **Windows:** si `supabase start` falla con `Ports are not available` / `bind: An attempt was made
> to access a socket in a way forbidden by its access permissions` en los puertos 54321-54329,
> revisá `netsh interface ipv4 show excludedportrange protocol=tcp` — Hyper-V puede reservar
> dinámicamente rangos que choquen con los puertos de Supabase. Soluciones: `net stop winnat && net
> start winnat` (como administrador) o cambiar los puertos en `supabase/config.toml` a un rango
> fuera de lo reservado.

### Aplicar migraciones

```bash
# Aplicar todas las migraciones al entorno local
supabase db reset

# O aplicar migraciones pendientes sin resetear
supabase db push --local
```

### Iniciar el dev server

```bash
npm run dev
```

---

## 🧪 Entorno Staging (futuro)

> Pendiente de configurar. Se requiere crear un segundo proyecto en Supabase.

### Pasos para configurar staging

1. Crear proyecto nuevo en [supabase.com](https://supabase.com) → "CSH Staging"
2. Agregar las variables de entorno de staging en Vercel (environment: Preview)
3. Ejecutar migraciones: `supabase db push --project-ref <ref-staging>`
4. Configurar Vercel para deploy automático de PRs al entorno staging

---

## 🔴 Producción

> **⚠️ Máxima precaución.** Los cambios en producción afectan a usuarios reales.

### Variables de entorno en Vercel (Production)

Configuradas en el panel de Vercel → Settings → Environment Variables:

| Variable | Entorno |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production |
| `RESEND_API_KEY` | Production (secret) |
| `NEXT_PUBLIC_SITE_URL` | Production → `https://cshdevs.org` |
| `SITE_DISABLED` | Production → `true` apaga el sitio al público (ver abajo) |
| `SITE_BYPASS_TOKEN` | Production (secret) → acceso anticipado mientras está apagado |

> No hay `SUPABASE_SERVICE_ROLE_KEY` configurada ni necesaria — ver nota en la sección de setup local.

### 🚦 Apagar y encender el sitio al público

El sitio tiene un interruptor por variable de entorno. No requiere tocar código ni
revertir commits: se cambia la variable en Vercel y se redespliega.

**Para apagarlo:**

1. Vercel → Settings → Environment Variables → `SITE_DISABLED` = `true` (Production).
2. Deployments → el último → **Redeploy**. Las variables de entorno solo se
   aplican en un despliegue nuevo; cambiarlas no afecta al que ya está corriendo.

Con el sitio apagado, **toda** ruta —incluidas `/admin`, `/perfil` y `/login`—
responde la página de mantenimiento con **HTTP 503** y cabecera `Retry-After`.
El 503 es deliberado: le dice a los buscadores que el cierre es temporal, para
que no desindexen el sitio mientras dura.

**Para volver a encenderlo:** poner `SITE_DISABLED` en `false` (o borrar la
variable) y redesplegar. No hay ningún otro paso.

**Acceso anticipado.** Para entrar mientras está apagado, configurar
`SITE_BYPASS_TOKEN` con un valor secreto (`openssl rand -hex 32`) y visitar:

```
https://cshdevs.org/?acceso=<TOKEN>
```

Eso deja una cookie `httpOnly` válida por 7 días y limpia el token de la URL para
que no quede en el historial ni se filtre por el header `Referer`. Si
`SITE_BYPASS_TOKEN` está vacío, el apagón no tiene puerta trasera.

> El interruptor corre en el middleware **antes** que la sesión de Supabase, así
> que el apagón funciona incluso si las variables de Supabase están mal
> configuradas. Lógica en `src/lib/site-gate.ts`, tests en `src/lib/site-gate.test.ts`.

### Aplicar migraciones a producción

```bash
# Conectar al proyecto de producción
supabase link --project-ref <ref-produccion>

# Verificar migraciones pendientes
supabase db diff --use-migra

# Aplicar
supabase db push
```

> **Siempre hacer backup antes de aplicar migraciones en producción.**

### Bootstrap del primer admin

`supabase/migrations/20260301101000_csh_s2_28_bootstrap_admin.sql` promueve a admin al primer usuario, pero es
**manual y de un solo uso** — no es un mecanismo repetible:

1. El usuario que va a ser admin **debe registrarse primero** en la app (necesita existir en
   `profiles` antes de correr la migración).
2. Editar el archivo de la migración y reemplazar `'TU_EMAIL_AQUI@example.com'` por el email real
   del futuro admin.
3. Aplicar la migración (`supabase db push`, o incluirla en el flujo normal de migraciones).
4. Es idempotente respecto a *no hacer nada dos veces*: si ya existe algún admin, no actúa. Pero
   una vez aplicada contra un proyecto Supabase, Supabase la marca como ejecutada — **no se puede
   simplemente editar el email y re-correr la misma migración** para bootstrapear a otra persona.

**Para promover admins adicionales después del bootstrap inicial**, no se necesita una migración
nueva: cualquier admin existente puede cambiar el `role` de otro perfil desde
`/admin/miembros` (usa `updateMemberProfile` en `app/admin/actions/members.ts`, que además protege
contra quitar el rol al último admin restante).

---

## 📋 Workflow de Migraciones

> **Convención unificada (BL-03 resuelto — 2026-09-02):** las 26 migraciones de
> `supabase/migrations/` usan un solo formato `YYYYMMDDHHMMSS_descripcion.sql`, y el orden
> lexicográfico **sí** coincide con el orden real de dependencias.
>
> Los 15 archivos que antes se llamaban `csh_s2_NN_*` se renombraron a
> `2026030110NN00_csh_s2_NN_*` (se conservó el nombre viejo como sufijo para no perder
> trazabilidad con los docs). Quedan después del base schema (`20260301090000`) y antes de las
> migraciones de marzo, que es su orden real: `is_admin()` se define en
> `20260301100000_csh_s2_19_rls.sql`, antes de los `20260322*` que la usan, y
> `public.community_ideas` se crea en `20260301100600_csh_s2_24_community.sql` antes del
> `ALTER TABLE` de `20260322161000_expansion_fase2.sql`.
>
> Antes del rename esos 15 archivos **ni siquiera los reconocía el CLI** (no matcheaban
> `<dígitos>_nombre.sql`): por eso nunca aparecieron en `supabase migration list` y se habían
> aplicado a mano contra producción. Verificado con `supabase db reset` local — las 26 corren en
> orden y reconstruyen el schema completo.
>
> **Pendiente:** el historial del proyecto remoto todavía no refleja los nombres nuevos. Ver
> `docs/_archive/2026-09-02-asec-eventos/informe-correcciones-eventos.md` §7 para la secuencia de `migration repair`.
>
> **Para una migración nueva:** usá timestamp real `YYYYMMDDHHMMSS_descripcion.sql` y validala
> con `supabase db reset` en local antes de aplicarla en producción.

```
1. Crear archivo SQL en supabase/migrations/ con timestamp real:
   YYYYMMDDHHMMSS_descripcion.sql

2. Probar localmente:
   supabase db reset        ← reset completo
   supabase db push --local ← solo pendientes

3. Hacer commit con el archivo de migración incluido

4. Al mergear a main:
   supabase db push         ← aplica a producción
```

---

## 🛠️ Comandos Útiles

```bash
# Ver estado de migraciones
supabase migration list

# Generar migración nueva desde diff
supabase db diff -f nombre_migracion

# Acceder a Supabase Studio local
open http://127.0.0.1:54323

# Ver logs del servidor local
supabase logs

# Detener Supabase local
supabase stop
```

---

*Para contexto técnico completo → `CONTEXT.md`*  
*Para workflow del equipo → `docs/WORKFLOW.md`*
