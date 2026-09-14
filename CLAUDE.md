# Computer Science Hub Web

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind + Supabase, deploy en Vercel.
Scripts: `npm run dev` · `lint` · `test` (vitest) · `test:e2e` (playwright) · `deploy:prod`.

## Documentación — leé esto antes de escribir cualquier `.md`

La regla del repo: **lo vivo se mantiene, lo histórico se congela.** `docs/` tiene 4 zonas:

| Zona | Qué es | ¿Se edita? |
|---|---|---|
| `docs/*.md` | Canónicos: estado **actual** del sistema | Sí |
| `docs/guides/`, `docs/process/` | Cómo se hacen las cosas | Sí |
| `docs/work/<YYYY-MM-DD-HHMM-slug>/` | Sesión de trabajo en curso | Efímero |
| `docs/_archive/` | Histórico congelado | **Nunca** |

### Dónde va cada cosa

Arquitectura/patrones → `docs/ARCHITECTURE.md` · Schema/RLS/migraciones → `docs/DATABASE.md` ·
Rutas → `docs/rutas-usuario.md` · Env/setup → `docs/ENVIRONMENTS.md` ·
Decisión con trade-off → ADR nuevo en `docs/DECISIONS.md` · Entregado → `docs/CHANGELOG.md` ·
Pendiente → `docs/BACKLOG.md` (con archivo:línea de origen) · En progreso → `docs/STATUS.md` ·
Plan/bitácora/análisis de la sesión → `docs/work/<sesión>/`.

**El caso por defecto es actualizar un canónico existente, no crear un archivo nuevo.**

### Prohibiciones

1. **No editar `docs/_archive/**`.** Si un archivado contradice la realidad, el arreglo va en el
   canónico. Corregir un log histórico es falsificarlo.
2. **No crear carpetas fuera de `docs/work/<fecha-hora-slug>/`.** Nada de `Sprints/`, `Issues/`,
   `_sprints/`, `Planificacion-X/`. Ese patrón generó 9 convenciones paralelas y 80 archivos regados.
3. **No duplicar contenido entre documentos.** Enlazá al canónico.
4. **No inventar fechas.** Sacalas de `date` o `git log`.
5. **No marcar algo como pendiente sin verificarlo contra el código.**

Para abrir/cerrar/auditar sesiones de documentación usá la skill **`docs-governor`**
(`.claude/skills/docs-governor/SKILL.md`), que tiene el procedimiento completo.

## Convenciones de código

- Server Actions retornan `{ ok, message }`. Validación con zod.
- Migraciones en `supabase/migrations/` con timestamp `YYYYMMDDHHMMSS_descripcion.sql`.
- Ver `docs/ARCHITECTURE.md` para capas de autorización y `docs/WORKFLOW.md` para git.

## Git

- No hacer `commit` ni `push` salvo petición explícita del usuario.
- Conventional Commits en español. Ver `docs/guides/commit.md`.
