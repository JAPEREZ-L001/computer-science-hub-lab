---
title: "Versionado"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "package.json"
  - "CHANGELOG.md"
baseline_commit: "f239578"
created: "2026-03-14T23:00:00Z"
last_reviewed: "2026-03-14T23:00:00Z"
---

# Versionado

El proyecto sigue [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH). La versión actual está en `package.json`; el historial legible en [CHANGELOG.md](../../../CHANGELOG.md) (formato [Keep a Changelog](https://keepachangelog.com/)).

## Cuándo subir versión

- **PATCH:** Correcciones y cambios menores sin impacto en API o comportamiento visible.
- **MINOR:** Nueva funcionalidad compatible con versiones anteriores.
- **MAJOR:** Cambios incompatibles (API, comportamiento relevante).

## Flujo

1. En `develop`: al cerrar un release, incrementar la versión en `package.json` y mover las entradas de `[Unreleased]` en CHANGELOG a una nueva sección `[X.Y.Z] - YYYY-MM-DD`.
2. Crear tag Git desde `main` tras merge desde `develop` (p. ej. `v0.1.0`, `v0.2.0`).
3. En GitHub: crear un Release desde el tag y pegar la sección correspondiente del CHANGELOG como notas.

## Rama develop y main

- **develop:** Integración continua; aquí se hace el trabajo diario y los merges de features.
- **main:** Rama estable; solo se actualiza al hacer release (merge desde develop y tag).
