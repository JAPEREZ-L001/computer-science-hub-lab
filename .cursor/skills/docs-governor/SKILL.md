---
name: docs-governor
description: Gobierna la documentación de este repo. Úsala al ABRIR una sesión de trabajo (crear la carpeta fechada con el plan del sprint), al CERRARLA (promover lo que sobrevive a los canónicos y archivar), al AUDITAR el estado de docs/, o cada vez que haya que escribir/actualizar cualquier documentación. Dispara con: "abrir sesión", "cerrar sesión", "documentar esto", "dónde va este doc", "auditar docs", "ordenar la documentación", "sprint de hoy", "qué trabajamos hoy".
---

# Docs Governor

Regla única del repo: **lo vivo se mantiene, lo histórico se congela.**
Antes de escribir cualquier documentación, decidí en cuál de las dos cae.

## 0. Antes de escribir un solo archivo

Leé `docs/README.md`. Define las 4 zonas y cuál se actualiza. Si lo que vas a escribir no encaja
limpio en una zona, **preguntá al usuario** — no inventes una carpeta. Inventar carpetas es
exactamente lo que produjo el desorden que esta skill existe para prevenir.

---

## 1. Enrutado: dónde va cada cosa

Antes de crear un archivo, buscá en esta tabla. **El caso por defecto es actualizar un documento
que ya existe, no crear uno nuevo.**

| Lo que querés documentar | Va a | Acción |
|---|---|---|
| Patrón de código, estructura de carpetas, capa de auth | `docs/ARCHITECTURE.md` | actualizar |
| Tabla, RLS, función, migración | `docs/DATABASE.md` | actualizar |
| Ruta nueva o cambio de nivel de acceso | `docs/rutas-usuario.md` | actualizar |
| Variable de entorno, setup, entorno nuevo | `docs/ENVIRONMENTS.md` | actualizar |
| Decisión con trade-off ("elegimos X sobre Y porque…") | `docs/DECISIONS.md` | **agregar ADR nuevo** |
| Algo que se entregó / cambio notable | `docs/CHANGELOG.md` | agregar entrada |
| Algo que quedó sin hacer | `docs/BACKLOG.md` | agregar con archivo:línea de origen |
| Qué se está haciendo ahora mismo | `docs/STATUS.md` | **reemplazar**, no acumular |
| Cómo se hace un procedimiento | `docs/guides/` | actualizar el que aplique |
| Cómo trabaja el equipo (scrum, versionado, retros) | `docs/process/` | actualizar |
| Plan de la sesión, bitácora, análisis exploratorio, prompt, log | `docs/work/<sesión>/` | queda ahí, se archiva al cerrar |
| Cualquier cosa fechada y ya ejecutada | `docs/_archive/` | congelar, no editar |

**Crear un canónico nuevo en la raíz de `docs/` requiere justificación explícita al usuario.**
Doce canónicos alcanzan; el trece casi siempre es un capítulo de uno existente.

---

## 2. Abrir sesión

Cuando arranca un trabajo con alcance propio (feature, fix grande, auditoría, sprint):

```bash
date +"%Y-%m-%d-%H%M"     # obtené fecha y hora REALES, no las inventes
```

Creá `docs/work/<YYYY-MM-DD-HHMM>-<slug-corto>/sesion.md`:

```markdown
---
sesion: 2026-09-03-2245-recuperacion-password
abierta: 2026-09-03 22:45
estado: abierta
rama: fix/post-lanzamiento-auth
---

# Recuperación de contraseña

## Objetivo
Una sola frase. Si necesitás dos, son dos sesiones.

## Alcance
- [ ] Tarea concreta y verificable
- [ ] Tarea concreta y verificable

## Fuera de alcance
- Lo que explícitamente NO se toca en esta sesión

## Bitácora
<!-- se llena durante el trabajo: qué se hizo, qué se descubrió, qué se decidió -->

## Cierre
<!-- lo llena la operación de cierre -->
```

Reglas:
- El slug va en kebab-case, 2-4 palabras. Sin fechas dentro del slug (ya están en el prefijo).
- **Antes de crear la carpeta, mirá si `docs/work/` ya tiene una sesión abierta del mismo tema.**
  Si la hay, seguí en esa. Dos carpetas para el mismo trabajo es cómo empezó el desorden anterior.
- Si `docs/work/` tiene 3 o más carpetas, avisá al usuario: hay sesiones sin cerrar.

## 3. Cerrar sesión

Cerrar **no es** mover la carpeta. Es extraer lo que sobrevive y después mover.

1. **Releé `sesion.md`** y contrastá cada punto del alcance con lo que realmente pasó.
2. **Promové a los canónicos** usando la tabla de la sección 1. Cada hallazgo que sobreviva a la
   sesión tiene que quedar en un canónico — si no, se pierde.
3. **Completá `## Cierre`** en `sesion.md`: qué se hizo, qué se promovió y a dónde, qué quedó
   pendiente y en qué línea de `BACKLOG.md` quedó registrado.
4. **Marcá `estado: cerrada`** en el frontmatter.
5. **Archivá:** `git mv docs/work/<sesión>/ docs/_archive/<sesión>/`
6. **Actualizá `docs/STATUS.md`** — reemplazá el contenido, no acumules sprints viejos ahí.
7. **Agregá la fila** al índice de `docs/_archive/README.md`.

Una sesión sin promover a canónicos es una sesión no cerrada, aunque la carpeta esté movida.

## 4. Auditar

Cuando el usuario pida revisar el estado de la documentación:

```bash
# Sesiones sin cerrar
ls docs/work/

# Documentos vivos vs archivados
find docs -name '*.md' -not -path '*/_archive/*' | wc -l
find docs/_archive -name '*.md' | wc -l

# Referencias rotas a rutas que ya no existen
grep -rn "docs/work/[A-Z_]\|docs/tutorials/\|docs/handbook/\|docs/configuration/" \
  --include="*.md" README.md docs/*.md docs/guides docs/process

# Duplicados por contenido idéntico
find docs -name '*.md' -not -path '*/node_modules/*' -exec md5sum {} + | sort | uniq -d -w32

# Canónicos que no se tocan hace mucho
for f in docs/*.md; do printf "%-32s " "$f"; git log -1 --format=%as -- "$f"; done
```

Reportá: sesiones abiertas, referencias rotas, duplicados, canónicos desactualizados. **No arregles
nada sin confirmar** — salvo referencias rotas, que se arreglan siempre.

---

## 5. Prohibiciones

Estas son las que producen el desorden. Ninguna tiene excepción sin decisión explícita del usuario.

1. **No editar `docs/_archive/**` jamás.** Si un archivado contradice la realidad, el arreglo va en
   el canónico correspondiente. Corregir un log histórico es falsificarlo.
2. **No crear carpetas fuera de `docs/work/<fecha-hora-slug>/`.** Nada de `Sprints/`, `Issues/`,
   `Planificacion-X/`, `_sprints/`. Ese fue el patrón que generó 9 convenciones paralelas.
3. **No crear un documento nuevo cuando existe uno que cubre el tema.** Actualizá el que existe.
4. **No duplicar contenido entre documentos.** Enlazá al canónico en vez de copiar. Ya hubo un
   `encuesta-betatesters.md` idéntico byte por byte en dos rutas.
5. **No dejar sesiones abiertas.** Al terminar el trabajo, cerrá.
6. **No inventar fechas.** Sacalas de `date` o de `git log`.
7. **No marcar algo como pendiente sin verificarlo contra el código.** `BACKLOG.md` §0 existe porque
   la documentación afirmaba que el reset de contraseña estaba comentado cuando ya funcionaba.

## 6. Sincronía Claude Code / Cursor

La fuente única es `.claude/skills/docs-governor/SKILL.md`.
`.cursor/skills/docs-governor/SKILL.md` es una copia — si modificás una, copiá a la otra:

```bash
cp .claude/skills/docs-governor/SKILL.md .cursor/skills/docs-governor/SKILL.md
```

Las reglas de enrutado están además en `CLAUDE.md` (raíz), que se carga siempre. Si cambiás la
tabla de la sección 1, actualizá también la versión resumida de `CLAUDE.md`.
