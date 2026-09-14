# Computer Science Hub — Laboratorio de testing

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind + Supabase, deploy en Vercel.
Scripts: `npm run dev` · `lint` · `test` (vitest) · `test:e2e` (playwright).

## Dónde estás parado

| | Repositorio | Visibilidad | Sitio |
|---|---|---|---|
| **Testing** ← *estás acá* | `computer-science-hub-lab` | **pública** | `computer-science-hub-lab.vercel.app` |
| **Producción** | `Computer-Science-Hub-Web` | privada | `cshdevs.org` |

Este es el repo donde el equipo trabaja libremente: se rompe, se prueba, se itera. El código de
producción vive en el repo privado y **no se toca desde acá**: lo promueve a mano JAPEREZ-L001,
copiando el árbol de las rutas de aplicación (las historias de git de los dos repos no están
relacionadas, así que no hay `merge` posible entre ellos).

**Por qué existe este repo:** Vercel Hobby deja en estado `BLOCKED` todo deploy cuyo autor de
commit no sea el dueño de la cuenta, cuando el repositorio es privado. Con el repo de producción
privado, solo una persona del equipo lograba desplegar. Acá, al ser público, los deploys de todos
salen. El razonamiento completo está en `docs/DECISIONS.md` (ADR-006) del repo privado.

---

## Las tres reglas duras

### 1. Este repo es público — nunca commitees un secreto

`.env` está en `.gitignore` y ahí se queda. Las credenciales viven en las variables de entorno de
Vercel, no en el repo.

Esto va más allá de las API keys: **no escribas acá documentación que describa secretos sin rotar,
hallazgos de seguridad abiertos, credenciales en texto plano o informes internos.** Por eso este
repo no tiene `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/CHANGELOG.md`, `docs/_archive/` ni
`security_audit_report.md` — están en el privado y ahí se quedan. Si lo que vas a escribir cae en
esa categoría, va al repo privado.

Antes de un commit que toque configuración o documentación:

```bash
git grep -n -E 're_[A-Za-z0-9_]{16,}|sbp_[A-Za-z0-9]{20,}|sb_secret_|eyJhbGciOi[A-Za-z0-9_-]{20,}'
```

### 2. La base de datos es la MISMA que la de producción

No hay Supabase de staging: los dos ambientes apuntan al mismo proyecto, con usuarios y datos
reales. Fue una decisión explícita del equipo, y obliga a lo siguiente.

**Nunca, desde este repo:**

- `supabase db push` ni `supabase db reset` apuntando al proyecto **remoto**
- `supabase link` contra el proyecto de producción
- `TRUNCATE`, `DROP`, `DELETE` masivos o cualquier escritura ancha vía MCP o SQL

**Sí:** los cambios de esquema se escriben como migración en `supabase/migrations/` con timestamp
`YYYYMMDDHHMMSS_descripcion.sql` y se prueban **contra Supabase local**:

```bash
supabase start           # instancia local en Docker
supabase db reset        # aplica todas las migraciones desde cero
```

Aplicar esa migración al proyecto remoto lo hace JAPEREZ-L001 desde el repo privado. Acá el trabajo
termina con el archivo `.sql` commiteado.

Para probar flujos de usuario, usá la cuenta de test — no cuentas reales de la comunidad.

### 3. `vercel --prod` desde acá despliega EL LAB, no `cshdevs.org`

El directorio está linkeado al proyecto `computer-science-hub-lab`. "Producción" en el contexto de
este repo significa la rama `main` **del lab**. No hay forma de desplegar `cshdevs.org` desde acá y
no deberías intentarlo. Si una skill o guía habla de "deploy a producción", se refiere al lab.

---

## Cómo levantar el proyecto

```bash
npm install
cp .env.example .env     # completar con las credenciales que te pase el equipo
npm run dev              # http://localhost:3000
```

Detalle de variables y setup de Supabase local: `docs/ENVIRONMENTS.md`.

## Cómo ver tus cambios desplegados

| Acción | Resultado |
|---|---|
| Push a una rama `feature/*` | Deploy de **preview** con URL propia |
| Merge a `main` | Deploy de la rama principal del lab |

**El sitio del lab responde HTTP 503 a todo el mundo.** Es deliberado: comparte base de datos con
producción, así que no puede quedar abierto. Para entrar:

```
https://computer-science-hub-lab.vercel.app/?acceso=<SITE_BYPASS_TOKEN>
```

Deja una cookie `httpOnly` de 7 días. **El token no está en el repo y no debe estar** — vive en las
variables de entorno del proyecto de Vercel. Pedíselo a JAPEREZ-L001. Los previews de PR están
gateados igual.

El interruptor es `src/lib/site-gate.ts` + `src/lib/site-mode.ts`, y corre en el middleware antes
que la sesión de Supabase.

## Convenciones de código

- Server Actions retornan `{ ok, message }`. Validación con zod.
- Queries en `src/lib/supabase/queries.ts`; mutaciones en `app/actions/*.ts`.
- Tipos compartidos en `src/types/index.ts`.
- Migraciones en `supabase/migrations/`, timestamp `YYYYMMDDHHMMSS_descripcion.sql`.
- Ver `docs/ARCHITECTURE.md` para las capas de autorización y `docs/DATABASE.md` para RLS.

## Documentación

`docs/` acá es una **copia de referencia**, no se mantiene. La documentación viva del proyecto está
en el repo privado y no se sincroniza entre los dos.

- **No uses la skill `docs-governor` en este repo.** Su procedimiento (abrir sesión en `docs/work/`,
  promover a `BACKLOG.md` / `STATUS.md` / `CHANGELOG.md`, archivar en `docs/_archive/`) asume
  documentos y zonas que acá no existen a propósito.
- Si un cambio de código necesita actualizar la documentación, decilo en el PR y que se haga en el
  repo privado al promover.

## Git

- No hacer `commit` ni `push` salvo petición explícita del usuario.
- Conventional Commits en español. Ver `docs/guides/commit.md`.
- Ramas: `feature/<descripcion>`, `fix/<descripcion>`, `chore/<descripcion>` → PR a `main`.
- **Los issues viven en el repo privado**; acá están desactivados. Referencialos por número.

## Checklist de lo que NO se hace desde este repo

- [ ] Commitear secretos, o documentación que describa secretos o vulnerabilidades abiertas
- [ ] `supabase db push` / `db reset` / `link` contra el proyecto remoto
- [ ] Escrituras masivas o destructivas sobre la base compartida
- [ ] Intentar desplegar `cshdevs.org`
- [ ] Abrir sesiones de `docs-governor` o editar los canónicos de documentación
- [ ] Quitar `SITE_DISABLED` de las variables de Vercel
