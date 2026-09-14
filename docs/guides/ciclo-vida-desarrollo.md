---
title: "Ciclo de vida de desarrollo"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "README.md"
  - "docs/process/*.md"
  - "CHANGELOG.md"
baseline_commit: ""
created: "2026-03-15"
last_reviewed: "2026-03-15"
---

# Objetivo

Este documento define el flujo de trabajo por tarea, desde la asignación en Linear hasta el PR a `develop`.

# Alcance

- Aplica a todo desarrollo durante el sprint.
- Aplica a tareas e issues gestionadas en Linear (team CSH).
- Los planes de alto nivel viven en [docs/Planes](../Planes); los ítems ejecutables en Linear.

# Contexto operativo

- Cada desarrollador trabaja sobre tareas asignadas.
- Cada tarea usa una rama dedicada.
- Todo cambio se integra vía PR hacia `develop`; no se hacen commits directos en `main` ni `develop`.

# Modelo de ramas

- Rama base: `develop`.
- Formato de rama: `feature/csh-XX-descripcion` (XX = número de issue en Linear, p. ej. CSH-3). Ver [Scrum y Linear](../handbook/process/scrum.md).
- Tipos permitidos: `feature`, `fix`, `docs`, `refactor`.
- No commits directos en `main` o `develop`.

Comandos sugeridos:

```bash
git checkout develop
git pull
git checkout -b feature/csh-XX-descripcion-corta
```

# Flujo del ciclo de vida

## 0) Inicio de tarea

- Revisar en Linear: alcance, criterios de aceptación y descripción del issue.
- Confirmar restricciones técnicas antes de codificar.

Salida esperada: alcance claro y accionable.

## 1) Planificación / análisis / diseño

- Usar `docs/work/<rama>/` para plan, diseño o notas de implementación (soporte durante la tarea).
- La documentación estable va a `docs/handbook` y `docs/tutorials` siguiendo el flujo del skill docs-governor.

Salida esperada: borradores listos para implementar.

## 2) Implementación

- Implementar solo dentro del alcance de la tarea.
- Hacer commits incrementales según [commit.md](commit.md).
- Evitar cambios fuera del dominio asignado.

Salida esperada: implementación completa en la rama de trabajo.

## 3) Testing

- Ejecutar las pruebas que apliquen (manual, E2E, etc.) y validar el comportamiento.
- Documentar pasos de prueba y resultado para el PR.

## 4) Cierre documental post-implementación

- Actualizar documentación afectada (`handbook`, `tutorials`, README si aplica).
- Ejecutar validación documental:

```bash
python .cursor/skills/docs-governor/scripts/check_doc_validation.py --root .
```

- Actualizar [CHANGELOG.md](../../CHANGELOG.md) con los cambios de la rama.

Salida esperada: documentación alineada, validación en verde y changelog actualizado.

## 5) Pull Request a develop

- Abrir PR con base `develop`.
- Incluir descripción clara, enlace al issue (CSH-XX) y sección "Cómo probar" con pasos de validación.
- Usar la plantilla de PR en [pull-request-template.md](pull-request-template.md). Si el repo usa `.github/pull_request_template.md`, mantenerla alineada con esa referencia.
- Asignar revisor según criterio del equipo.

Salida esperada: PR listo para revisión.

# Reglas de desarrollo

- No modificar esquemas, contratos o estilos base salvo que la tarea lo pida explícitamente.
- No commitear secretos ni contenido de `.env.local`.
- Seguir la convención de commits y ramas descrita en este documento y en [Scrum y Linear](../handbook/process/scrum.md).

# Definition of Done

- [ ] Rama creada desde `develop` con formato `feature/csh-XX-descripcion`.
- [ ] Implementación completada según alcance del issue en Linear.
- [ ] Pruebas ejecutadas y documentadas para el PR.
- [ ] `python .cursor/skills/docs-governor/scripts/check_doc_validation.py --root .` en verde (sin errores de frontmatter/estructura).
- [ ] CHANGELOG.md actualizado.
- [ ] PR abierto hacia `develop` con descripción y pasos para probar.
