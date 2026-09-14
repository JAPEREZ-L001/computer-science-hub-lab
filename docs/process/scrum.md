---
title: "Scrum y Linear"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "docs/process/*.md"
baseline_commit: "f239578"
created: "2026-03-14T23:00:00Z"
last_reviewed: "2026-03-14T23:00:00Z"
---

# Scrum y uso de Linear

Este proyecto replica el modelo de **Haiku** (Linear): **Projects** = sprints/iniciativas, **Milestones** = sub-iteraciones (semanas o fases), e **issues** con una plantilla estándar. Los planes de alto nivel viven en [docs/Planes](../../Planes); los ítems ejecutables se gestionan en Linear.

## Configuración inicial en Linear

1. **Crear un team** para Computer Science Hub Web en la interfaz de Linear (Settings → Teams → New team). Asignar una **key** corta, por ejemplo **CSH**, para que los issues tengan identificadores `CSH-1`, `CSH-2`, etc. (La creación de teams no está disponible vía MCP; debe hacerse en la app o web de Linear.)

2. **Crear el primer Project (sprint)** desde Linear o con el MCP `save_project`:
   - **name:** p. ej. "Sprint 1: Estructura y documentación"
   - **setTeams** o **addTeams:** nombre o ID del team CSH
   - **startDate** / **targetDate:** fechas del sprint (ISO)
   - **description:** Objetivo y tareas en Markdown

3. **Crear Milestones** del proyecto con el MCP `save_milestone`:
   - **project:** nombre o ID del proyecto
   - **name:** p. ej. "Semana 1: Setup y docs", "Semana 2: …"

## Convención de issues

Cada issue en Linear debe seguir esta estructura (igual que en Haiku):

- **Título:** Descriptivo; se puede usar prefijo de área: `FE:`, `BE:`, `DOC:`, `OPS:`, `QA:`, etc.

- **Descripción (Markdown):**
  ```markdown
  ## Objetivo
  (Qué se quiere lograr.)

  ## Criterios de aceptación
  - [ ] Criterio 1
  - [ ] Criterio 2

  ## Deliverables
  (Opcional: lista de entregables concretos.)
  ```

- **Labels:** Usar etiquetas coherentes (Frontend, Backend, Docs, CI/CD, etc.).

- **Priority:** 0 = None, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low.

- **Estado:** Backlog → Todo → In Progress → Done.

- **Asignación:** Asignar responsable cuando corresponda.

## Convención de ramas Git

Para issues del team CSH (identificador `CSH-XX`):

- **Patrón:** `feature/csh-XX-slug-del-titulo`
- **Ejemplo:** Para el issue CSH-3 "DOC: Guía de contribución" → `feature/csh-3-doc-guia-de-contribucion`

Las ramas se integran en `develop`; los releases se preparan en `main` según [versioning](versioning.md).

## Uso del MCP Linear

Con el MCP `plugin-linear-linear` (Cursor) se puede:

- **list_teams** — Ver teams del workspace (para obtener nombre/ID del team CSH).
- **list_projects** — Listar proyectos (sprints).
- **list_milestones** — Listar milestones de un proyecto (parámetro `project`).
- **list_issues** — Filtrar por `team`, `project`, `state`, `label`, `assignee`, etc.
- **get_issue** — Ver descripción completa de un issue por ID (p. ej. `CSH-5`).
- **save_issue** — Crear o actualizar un issue (`title`, `team`, `description`, `project`, `milestone`, `state`, `labels`, `priority`, `assignee`).
- **save_project** — Crear o actualizar un proyecto (sprint).
- **save_milestone** — Crear o actualizar un milestone dentro de un proyecto.

Así se replica el mismo flujo que en Haiku: Projects = sprints, Milestones = sub-iteraciones, e issues con Objetivo, Criterios de aceptación y Deliverables.

## Definición de “done”

Un ítem se considera hecho cuando:

- El código está en la rama `develop` y ha pasado revisión.
- Los criterios de aceptación del issue están cumplidos.
- La documentación relevante está actualizada (handbook o work) si aplica.
- Si afecta a usuarios o releases, el [CHANGELOG](../../../CHANGELOG.md) está actualizado.

## Relación con docs/Planes

- **Planes de trabajo y prototipos** → [docs/Planes](../../Planes) (archivos `.plan.md`).
- **Tareas ejecutables, bugs y mejoras** → Linear (issues del team CSH).

Los planes pueden referenciar issues de Linear por identificador (p. ej. `CSH-12`) para trazar qué implementación cubre cada parte del plan.
