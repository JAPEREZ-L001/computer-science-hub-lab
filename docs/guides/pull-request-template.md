---
title: "Plantilla para Pull Request"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "docs/guides/ciclo-vida-desarrollo.md"
  - "docs/process/scrum.md"
  - "CHANGELOG.md"
baseline_commit: ""
created: "2026-03-15"
last_reviewed: "2026-03-15"
---

# Uso de esta plantilla

Al abrir un PR hacia `develop`, rellena las secciones siguientes. Puedes copiar el bloque "Contenido para el PR" en la descripción del PR. Si el repositorio usa `.github/pull_request_template.md`, este documento es la referencia para mantener esa plantilla alineada.

Ver [Ciclo de vida de desarrollo](ciclo-vida-desarrollo.md) para el flujo completo.

---

# Contenido para el PR

## Descripción

<!-- Qué hace este PR en una o dos frases. -->

## Issue

<!-- Enlace al issue en Linear. -->
- **Linear:** CSH-XX – [Título del issue](url-del-issue)

## Tipo de cambio

<!-- Marca lo que aplique. -->
- [ ] `feature` – Nueva funcionalidad
- [ ] `fix` – Corrección de bug
- [ ] `docs` – Solo documentación
- [ ] `refactor` – Refactor sin cambio de comportamiento

## Cómo probar

<!-- Pasos concretos para que quien revise pueda validar. -->
1. 
2. 
3. 

## Checklist

- [ ] Rama creada desde `develop` con formato `feature/csh-XX-descripcion`.
- [ ] Pruebas ejecutadas y documentadas.
- [ ] Validación documental en verde: `python .cursor/skills/docs-governor/scripts/check_doc_validation.py --root .`
- [ ] CHANGELOG.md actualizado.

## Notas opcionales

<!-- Dependencias, breaking changes, seguimiento futuro, etc. -->
