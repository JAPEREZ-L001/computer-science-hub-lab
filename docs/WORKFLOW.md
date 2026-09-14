# 🔧 WORKFLOW.md — Flujo de Trabajo del Equipo CSH

> **Para la IA:** Lee este archivo antes de hacer commits, PRs o cambios de rama.  
> Última actualización: 2026-04-13

---

## 🌿 Git Branching Strategy — GitHub Flow (simplificado)

```
main ─────────────────────────────────────────────────── producción
  │
  ├── feature/CSH-S0-001-feedback-anonimo     ← features / fixes
  ├── hotfix/CSH-S0-001-feedback-anonimo      ← hotfixes urgentes
  └── docs/update-context                     ← solo docs
```

### Ramas

| Rama | Protección | Uso |
|---|---|---|
| `main` | ✅ Protegida | Producción — solo merge via PR aprobado |
| `feature/CSH-XXX-descripcion` | — | Nuevas funcionalidades |
| `hotfix/CSH-XXX-descripcion` | — | Fixes urgentes en producción |
| `docs/descripcion` | — | Solo cambios de documentación |
| `chore/descripcion` | — | Mantenimiento, deps, config |

### Reglas de merge

- **Feature → main:** Squash and merge (historial limpio)
- **Hotfix → main:** Merge commit (preservar contexto de urgencia)
- **Docs → main:** Squash and merge
- Las PRs requieren al menos **1 review** antes de mergear a main
- La rama `main` no acepta push directo

### Nombrado de ramas

```
<tipo>/<codigo-ticket>-<descripcion-corta>

Ejemplos:
  feature/CSH-S0-005-foro-realtime
  hotfix/CSH-S0-001-feedback-anonimo
  chore/actualizar-dependencias
  docs/workflow-profesional
```

---

## 📝 Conventional Commits

Todo commit debe seguir este formato:

```
<tipo>(<scope>): <descripción en imperativo, máx 72 chars>

[cuerpo opcional — explicar el QUÉ y el POR QUÉ]

[referencias opcionales]
Refs: CSH-S0-001
```

### Tipos válidos

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `chore` | Mantenimiento, actualización de deps |
| `docs` | Solo documentación |
| `refactor` | Refactorización sin cambio de comportamiento |
| `style` | Cambios de formato, espacios (sin lógica) |
| `test` | Agregar o corregir tests |
| `ci` | Cambios en CI/CD pipelines |
| `db` | Migraciones de base de datos |
| `perf` | Mejoras de rendimiento |

### Scopes válidos

`auth` · `forum` · `feedback` · `survey` · `profile` · `events` · `admin` · `ui` · `db` · `ci` · `docs` · `realtime` · `messages` · `posts` · `badges` · `universities`

### Ejemplos válidos

```bash
feat(feedback): habilitar envío anónimo con rate limiting
fix(survey): corregir guard que bloqueaba nuevos usuarios anónimos
db(badges): migración para campos badge y university_role en profiles
chore(deps): actualizar @supabase/ssr a v0.10
docs(workflow): agregar branching strategy y convención de commits
```

### ❌ Commits inválidos

```bash
# Demasiado vago
fix: arreglar error

# Sin scope
feat: agregar foro

# En pasado (usar imperativo)
fixed: feedback bug

# Mezcla varios cambios
feat(forum,messages,profile): agregar muchas cosas
```

---

## 🔄 Proceso de Pull Request

### Antes de abrir una PR

1. `npm run lint` — sin errores
2. `npm run build` — sin errores de TypeScript
3. Commits siguen Conventional Commits
4. El código sigue los patrones del `CONTEXT.md`

### Checklist del reviewer

- [ ] ¿El código sigue las convenciones del repo?
- [ ] ¿Las queries van en `src/lib/supabase/queries.ts`?
- [ ] ¿Las mutaciones van en `app/actions/*.ts`?
- [ ] ¿Los tipos están actualizados en `src/types/index.ts`?
- [ ] ¿Las migraciones tienen nombre descriptivo?
- [ ] ¿Hay algún `console.log` de debug que deba eliminarse?
- [ ] ¿Las rutas protegidas verifican autenticación?
- [ ] ¿No hay secrets hardcodeados?

---

## 🚀 Deploy a Producción

```bash
# Solo desde main, después de un merge aprobado
npm run predeploy  # lint + build
npm run deploy:prod  # vercel --prod
```

> **No hacer push directo a main ni deploy sin pasar el predeploy.**

---

*Para contexto técnico completo → `CONTEXT.md`*  
*Para entornos de desarrollo → `docs/ENVIRONMENTS.md`*
