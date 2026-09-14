# Decisiones Arquitectonicas (ADR)

Registro de decisiones tecnicas importantes tomadas en el proyecto.
Formato: contexto → opciones consideradas → decision → consecuencias.

---

## ADR-001 — Resend sobre SMTP directo
**Fecha:** Marzo 2026 | **Estado:** Activo

**Contexto:** Se necesitaba enviar emails transaccionales (inscripciones, feedback) de forma confiable con un dominio propio.

**Opciones consideradas:**
- SMTP directo con Gmail/Outlook
- Nodemailer + SMTP personalizado
- Resend (API)

**Decision:** Usar Resend con dominio `send.cshdevs.org`.

**Razones:**
- API sencilla sin manejo de conexiones SMTP
- Dominio propio verificado mejora deliverability vs Gmail
- SDK oficial para Node/Next.js
- Free tier suficiente para el volumen actual

**Consecuencias:** El `RESEND_API_KEY` se guarda en Supabase Vault y en Vercel env vars.

---

## ADR-002 — Server Actions sobre API Routes
**Fecha:** Marzo 2026 | **Estado:** Activo

**Contexto:** Las mutaciones de datos (registrar en evento, guardar perfil, enviar feedback) necesitan una capa servidor.

**Opciones consideradas:**
- API Routes (`app/api/`)
- Server Actions con `'use server'`

**Decision:** Usar exclusivamente Server Actions en `app/actions/`.

**Razones:**
- Menos boilerplate (no hay fetch manual client → server)
- Type-safety end-to-end sin necesidad de definir request/response types
- Integra nativamente con React 19 (useFormState, revalidatePath)
- No expone endpoints publicos innecesarios

**Consecuencias:** Toda mutacion pasa por `app/actions/*.ts`. No hay `app/api/` para logica de negocio.

---

## ADR-003 — No mover `app/` ni `components/` dentro de `src/`
**Fecha:** Marzo 2026 | **Estado:** Activo

**Contexto:** La carpeta `src/` existe para tipado, utilidades y queries. Se evaluo mover todo ahi.

**Decision:** Mantener `app/` y `components/` en la raiz del proyecto.

**Razones:**
- La convencion actual funciona y el equipo la conoce
- Mover `app/` requeriria actualizar `tsconfig.json`, `components.json` y todos los imports
- Next.js soporta ambas estructuras — no hay beneficio tecnico que justifique la migracion
- El costo de refactoring supera el beneficio estetico

**Consecuencias:** `src/` contiene solo: `lib/` (supabase, resend, utils), `types/`, `data/` (mocks).

---

## ADR-004 — Supabase Auth sobre NextAuth
**Fecha:** Marzo 2026 | **Estado:** Activo

**Contexto:** Se necesitaba autenticacion con email/password y posible OAuth en el futuro.

**Decision:** Usar Supabase Auth con el paquete `@supabase/ssr`.

**Razones:**
- Base de datos y auth en el mismo proveedor (menos servicios externos)
- RLS (Row Level Security) integrado: las politicas de acceso se definen en Supabase
- `@supabase/ssr` maneja el refresco de sesion via cookies automaticamente
- El `updateSession()` en middleware mantiene el JWT activo sin config adicional

**Consecuencias:** El middleware debe correr en TODAS las rutas para refrescar el token (ver `middleware.ts`).

---

## ADR-005 — Dark mode forzado
**Fecha:** Marzo 2026 | **Estado:** Activo

**Contexto:** Se evaluo soporte para light/dark mode toggle.

**Decision:** Dark mode forzado en toda la app. No hay toggle de tema.

**Razones:**
- Identidad visual del CSH: estetica premium oscura con acentos cian
- Elimina la necesidad de mantener dos paletas de colores
- Simplifica el sistema de diseno

**Consecuencias:** El `ThemeProvider` de `next-themes` se configura con `forcedTheme="dark"`. No exponer controles de tema al usuario.

---

## Agregar nueva decision

Copia esta plantilla al final del archivo:

```markdown
## ADR-00X — [Titulo]
**Fecha:** [mes año] | **Estado:** Activo / Obsoleto / Reemplazado por ADR-00Y

**Contexto:** [Por que surgio esta decision]

**Opciones consideradas:**
- Opcion A
- Opcion B

**Decision:** [Que se decidio]

**Razones:**
- ...

**Consecuencias:** [Que implica esta decision a futuro]
```
