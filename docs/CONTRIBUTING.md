# CONTRIBUTING.md — Guia para Colaboradores

Bienvenido al Computer Science Hub (CSH) Web. Esta guia te explica como configurar el entorno y colaborar en el proyecto.

---

## Requisitos previos

- Node.js >= 20
- npm >= 10
- Git
- Cuenta en Supabase (para obtener credenciales)
- Cuenta en Resend (para email, opcional en dev)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/JAPEREZ-L001/Computer-Science-Hub-Web.git
cd ComputerSciencieHub-Web
npm install
```

---

## 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Rellena las variables en `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=         # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Anon key
SUPABASE_SERVICE_ROLE_KEY=        # Service role key (solo local/servidor)
RESEND_API_KEY=                   # Opcional para desarrollo
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Pide las credenciales de Supabase al lider del proyecto.

---

## 3. Levantar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 4. Estructura de trabajo

Antes de codear, lee:
- `CONTEXT.md` — stack, convenciones y decisiones tecnicas
- `docs/STATUS.md` — estado actual del sprint
- `docs/ARCHITECTURE.md` — arquitectura detallada

---

## 5. Convenciones de codigo

### Imports
Usar siempre el alias `@/` (raiz del proyecto):
```typescript
// CORRECTO
import { createClient } from '@/src/lib/supabase/server'
import type { MemberProfile } from '@/src/types'

// MAL
import { createClient } from '../../src/lib/supabase/server'
```

### Componentes
- **Server Components (RSC):** fetchean datos con `await` directamente, sin `'use client'`
- **Client Components:** agregar `'use client'` al inicio, usar hooks de React
- **Mutaciones:** SIEMPRE via Server Actions en `app/actions/` con `'use server'`

### Tipos
Definir tipos globales en `src/types/index.ts`. Tipos especificos de una query pueden vivir en el mismo archivo de la query.

### Nombrado
- Archivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Variables de entorno: `SCREAMING_SNAKE_CASE`

---

## 6. Flujo de trabajo con Git

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-de-la-funcionalidad

# 2. Hacer commits atomicos y descriptivos
git add .
git commit -m "feat: agregar boton de eliminar idea propia"

# 3. Push y crear PR hacia develop
git push origin feature/nombre-de-la-funcionalidad
```

### Tipos de commit
| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Correccion de bug |
| `docs:` | Documentacion |
| `refactor:` | Refactoring sin cambio de comportamiento |
| `style:` | Cambios de UI/CSS sin logica |
| `chore:` | Tareas de mantenimiento (deps, config) |

---

## 7. Antes de hacer push

```bash
npm run lint    # Verifica errores de ESLint
npm run build   # Verifica que el build de produccion no falla
```

O en un solo comando:
```bash
npm run predeploy
```

---

## 8. Documentacion

Si agregas una funcionalidad significativa:
- Actualiza `docs/STATUS.md` (mueve la tarea a "Completado")
- Si tomas una decision arquitectonica importante → agrega un ADR en `docs/DECISIONS.md`
- Si cambias el schema de Supabase → actualiza `docs/DATABASE.md`

---

## Contacto

Lider del proyecto: **japerez** (GitHub: JAPEREZ-L001)
Comunidad: Computer Science Hub — Universidad Don Bosco, El Salvador
