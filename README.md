> ### 🧪 Este es el repositorio de **testing** del Computer Science Hub
>
> Acá se trabaja libremente: se rompe, se prueba y se itera. El código que llega a
> producción vive en un repositorio **privado** aparte, y se promueve desde acá a mano.
>
> | | Repo | Despliegue |
> |---|---|---|
> | **Testing** (este) | `computer-science-hub-lab` — público | `computer-science-hub-lab.vercel.app` — apagado al público, se entra con token |
> | **Producción** | `Computer-Science-Hub-Web` — privado | `cshdevs.org` |
>
> **Dos reglas que no se rompen:**
>
> 1. **Los dos ambientes comparten la misma base de datos de Supabase.** Nunca corras
>    `supabase db push` ni `supabase db reset` contra el proyecto remoto desde acá: los
>    cambios de esquema se prueban contra Supabase local (`supabase start`) y los aplica a
>    remoto solo el dueño del repo privado. Probá con la cuenta de test, no con cuentas reales.
> 2. **Nada de secretos en el repo.** Es público. Las credenciales van en variables de
>    entorno de Vercel y en tu `.env` local, que está en `.gitignore`.
>
> El backlog, los issues y la documentación de estado interno (`BACKLOG.md`, `STATUS.md`,
> `CHANGELOG.md`, bitácoras de sesión) viven en el repo privado.

# Computer Science Hub – Web

Sitio web del **Computer Science Hub (CSH)**: plataforma de referencia para ciencias de la computación y espacio digital donde la comunidad estudiantil organiza su aprendizaje, su vida comunitaria y su proyección profesional.

## Sobre Computer Science Hub

El **Computer Science Hub (CSH)** es una iniciativa estudiantil autónoma de la carrera de Ingeniería en Ciencias de la Computación de la Universidad Don Bosco (Campus Antiguo Cuscatlán). Nace como un proyecto creado por y para estudiantes, con la meta de convertirse en un ecosistema evolutivo donde la comunidad fortalece su formación académica, su organización colectiva y su proyección profesional.

Este repositorio implementa la plataforma web que materializa esa misión: un sitio construido con stack moderno que sirve como punto de encuentro para el acompañamiento académico entre pares, la organización estudiantil y la conexión con el mundo profesional. Bajo la convicción de que **la disrupción provoca innovación**, el proyecto combina buenas prácticas de ingeniería de software con la construcción de una comunidad de ingeniería que impulsa futuro.

## Stack

- **Next.js** 16 (App Router, Turbopack)
- **React** 19
- **TypeScript** 5.7
- **Tailwind CSS** 4
- **Supabase** (Auth + Postgres + RLS)
- **Radix UI** (componentes accesibles) + shadcn/ui
- **React Hook Form** + **Zod**
- **Lucide React**, **date-fns**, **Resend** (email transaccional)
- **Vitest** (unit) + **Playwright** (E2E)

## Requisitos

- **Node.js** ≥ 20.9 (ver `engines` en `package.json`)

## Instalación

```bash
npm install
```

## Scripts

| Comando            | Descripción                          |
|--------------------|---------------------------------------|
| `npm run dev`      | Servidor de desarrollo (Turbopack)    |
| `npm run build`    | Build de producción                   |
| `npm run start`    | Servidor de producción                |
| `npm run lint`     | ESLint                                |
| `npm run test`     | Tests unitarios (Vitest)              |
| `npm run test:e2e` | Smoke tests E2E (Playwright)          |
| `npm run predeploy`| lint + build                          |

## Estructura principal

- `app/` – Rutas y páginas (App Router), incluyendo `app/actions/` (Server Actions) y `app/admin/` (panel admin)
- `components/` – Componentes reutilizables (incl. UI con Radix)
- `src/lib/supabase/` – Clientes Supabase (browser/server/middleware) y queries
- `supabase/migrations/` – Schema y RLS de la base de datos
- `e2e/` – Smoke tests de Playwright
- `docs/` – Documentación y referencias (ver `docs/README.md` para el índice)
- `public/` – Assets estáticos

## Documentación

- Arquitectura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Schema de base de datos: [`docs/DATABASE.md`](docs/DATABASE.md)
- Mapa de rutas de usuario: [`docs/rutas-usuario.md`](docs/rutas-usuario.md)
- Entornos y setup local: [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md)
- Workflow de git del equipo: [`docs/WORKFLOW.md`](docs/WORKFLOW.md)
- Proceso de trabajo (Scrum, versionado): [`docs/process`](docs/process)

La identidad institucional orientada a la versión web se documenta en:

- `docs/_archive/2026-03-15-marketing-pre-sprint1/16-03-26SprintPlanning/contenido/Identidad-Institucional-CSH-Web.md`

En la aplicación, esta identidad se proyecta en:

- Página principal (`/`) con secciones de héroe, filosofía, evolución del ecosistema, valores y llamado a la acción.
- Página [`/nosotros`](./app/nosotros/page.tsx) — quiénes somos, cómo trabajamos y hacia dónde vamos (consolida lo que antes eran `/sobre`, `/valores` y `/programas`; esas rutas siguen existiendo solo como redirects permanentes hacia `/nosotros`, ver `next.config.mjs`).

## Repositorio

[https://github.com/JAPEREZ-L001/Computer-Science-Hub-Web](https://github.com/JAPEREZ-L001/Computer-Science-Hub-Web)
