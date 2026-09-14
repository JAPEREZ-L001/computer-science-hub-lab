---
title: "Commit de trabajo actual"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "README.md"
  - "CHANGELOG.md"
baseline_commit: ""
created: "2026-03-15"
last_reviewed: "2026-03-15"
---

# Objetivo

Definir cómo crear un commit limpio solo con el trabajo actual.

# Importante

- Usar el contexto de cambios actual para decidir qué incluir.
- Hacer commit solo cuando se indique explícitamente.
- No incluir en el mismo commit trabajo posterior salvo que se pida de nuevo.

# Formato del mensaje de commit

Estructura en inglés:

```text
type: Short title description (< 80 characters) include Issue code if fixing one

- 2~5 bullet points (< 80 characters) with quick description
Reason: quick explanation why this implementation was done.
```

Ejemplo:

```text
docs: Update local setup tutorial and metadata

- Rewrite tutorial with clear local setup steps
- Add troubleshooting and validation checklist
Reason: New contributors need a reliable onboarding flow.
```

# Procedimiento

1. Revisar los cambios actuales.
   - Ejecutar `git status`.
   - Ejecutar `git diff` (staged y unstaged).

2. Revisar cada archivo modificado.
   - Confirmar que cada archivo pertenece a la tarea completada.
   - Excluir cambios no relacionados, temporales o accidentales.

3. Añadir al staging solo los archivos relacionados.
   - Usar `git add <file>` por archivo cuando sea posible.

4. Escribir el mensaje de commit con la plantilla.
   - Título y bullets de menos de 80 caracteres.
   - Incluir código de issue en el título cuando aplique (p. ej. CSH-12).

5. Crear el commit y comprobar.
   - Primer `-m`: solo el título (type: Short description).
   - Segundo `-m`: bullets + reason (cuerpo multilínea).
   - Ejemplo:
     ```bash
     git commit -m "feat: Add hero section with CTA" -m "- Add HeroSection component
     - Wire up CTA to docs/Planes link
     Reason: Align home with design from docs/Referencias."
     ```
   - Ejecutar `git status` para confirmar que el staging quedó limpio.

6. (Opcional) Preguntar por push.
   - Si la rama actual no es `main`, preguntar: ¿Quieres que haga push de este commit?

# Tipos de commit

- `feat`: nueva funcionalidad o capacidad
- `fix`: corrección de bug
- `docs`: solo documentación
- `refactor`: reestructuración sin cambio de comportamiento
- `test`: pruebas añadidas o actualizadas
- `chore`: mantenimiento, herramientas o tareas de soporte

# Anti-patrones a evitar

- Títulos ambiguos como `fix`, `changes`, `update`.
- Mezclar archivos no relacionados en un solo commit.
- Hacer commit de archivos temporales, generados o secretos.
- Saltarse la revisión por archivo antes del staging.
