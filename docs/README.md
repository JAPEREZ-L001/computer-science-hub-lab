# Documentación — Computer Science Hub Web

> **Reorganizado:** 2026-09-03. Antes había 80 documentos repartidos en 9 convenciones de carpeta
> distintas, con históricos y documentos vivos mezclados. Ahora hay **una sola regla**:
> lo que está vivo se mantiene; lo que es histórico se congela en `_archive/`.

## La regla

| Zona | Qué es | ¿Se actualiza? |
|---|---|---|
| **Raíz de `docs/`** | Documentos canónicos. Describen el estado **actual** del sistema. | Sí — en cada sesión que cambie lo que describen |
| **`guides/`**, **`process/`** | Cómo se hacen las cosas. | Sí — cuando cambia el procedimiento |
| **`work/`** | Sesiones de trabajo **en curso**. Una carpeta por sesión. | Es efímero — se cierra y se archiva |
| **`_archive/`** | Histórico **congelado**. Logs, prompts, planes ya ejecutados, auditorías fechadas. | **No. Nunca.** |

La regla que evita el desorden: **un documento histórico no se corrige, se archiva.** Un log de
ejecución del 17 de marzo no debe "estar al día" — es un registro de lo que pasó ese día. Corregirlo
sería falsificarlo.

---

> **En `computer-science-hub-lab` (repo público de testing)** faltan a propósito `BACKLOG.md`, `STATUS.md` y
> `CHANGELOG.md`, y las zonas `work/` y `_archive/`: describen estado interno, hallazgos de
> auditoría abiertos y bitácoras de sesión. Viven solo en `Computer-Science-Hub-Web` (privado).

## Documentos canónicos (fuente de verdad)

| Documento | Cubre |
|---|---|
| [`../README.md`](../README.md) | Setup, stack, scripts |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Patrones de código, estructura de carpetas, capas de autorización |
| [`DATABASE.md`](DATABASE.md) | Schema de Supabase, RLS, funciones, convención de migraciones |
| [`rutas-usuario.md`](rutas-usuario.md) | Mapa de rutas de la app con nivel de acceso |
| [`ENVIRONMENTS.md`](ENVIRONMENTS.md) | Setup local, variables de entorno, entornos |
| [`WORKFLOW.md`](WORKFLOW.md) | Convenciones de git y flujo del equipo (GitHub Flow) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir al repo |
| [`DECISIONS.md`](DECISIONS.md) | ADRs — decisiones de arquitectura y su porqué |
| [`REPO-TREE.md`](REPO-TREE.md) | Árbol del repositorio |

## Guías y proceso

| Carpeta | Contenido |
|---|---|
| [`guides/`](guides/) | `levantar-proyecto.md`, `commit.md`, `ciclo-vida-desarrollo.md`, `ejemplo-flujo-trabajo.md`, `pull-request-template.md`, `guia-produccion.md`, `smtp.md` |
| [`process/`](process/) | `scrum.md`, `versioning.md`, `RETROSPECTIVES.md` |

## Trabajo en curso

[`work/`](work/) — una carpeta por sesión, con formato `YYYY-MM-DD-HHMM-<slug>/`.
Las crea y las cierra la skill **docs-governor** (`.claude/skills/docs-governor/`).
Al cerrar una sesión, lo que sobrevive se promueve a los canónicos y la carpeta se mueve a `_archive/`.

Si `work/` tiene más de 2 o 3 carpetas, hay sesiones sin cerrar. Eso es la señal temprana del desorden.

## Histórico

[`_archive/`](_archive/) — 56 documentos congelados, organizados por fecha. Ver
[`_archive/README.md`](_archive/README.md) para el índice.

---

## Pendiente de decisión

`docs/research/cuestionario-betatesters/` es una mini-app Next.js independiente (con su propio
deploy en Vercel) que **duplica funcionalmente** la ruta `/encuesta-betatester` de la app principal.
No se archivó porque la decisión de archivar o consolidar es del equipo, no técnica.
Registrada en [`BACKLOG.md`](BACKLOG.md) §6.
