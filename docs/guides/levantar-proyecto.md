---
title: "Levantar el proyecto en local"
status: "active"
owner: "@csh"
authors:
  - "@csh"
tracking:
  - "README.md"
  - "package.json"
  - "app/"
  - "next.config.mjs"
baseline_commit: ""
created: "2026-03-15"
last_reviewed: "2026-03-15"
---

# Objetivo

Levantar la aplicación Computer Science Hub Web en entorno local para desarrollo y validación básica (servidor de desarrollo, build y vista previa de producción).

# Alcance

- Sistema operativo: Windows, macOS y Linux.
- Runtime: Node.js 18+ (recomendado 20+).
- Gestor de paquetes: npm o pnpm.

# Prerrequisitos

1. Tener instalado Node.js 18 o superior (recomendado 20+).
2. Tener npm (o pnpm) disponible en terminal.
3. Tener Git instalado.

# Pasos para levantar en local

## 1) Clonar y entrar al repo

```bash
git clone https://github.com/JAPEREZ-L001/Computer-Science-Hub-Web.git
cd Computer-Science-Hub-Web
```

Resultado esperado:
- El directorio contiene `package.json`, `app/`, `components/`, `docs/` y `next.config.mjs`.

## 2) Instalar dependencias

```bash
npm install
```

O con pnpm:

```bash
pnpm install
```

Resultado esperado:
- Se crea `node_modules/`.
- No hay errores bloqueantes de instalación.

## 3) Variables de entorno (opcional)

La app puede iniciar sin `.env.local` para el flujo base. Si el proyecto requiere variables de entorno (p. ej. analytics o APIs), crea `.env.local` en la raíz y añade las claves necesarias. No versionar `.env.local` (está en `.gitignore`).

## 4) Levantar servidor de desarrollo

```bash
npm run dev
```

Resultado esperado:
- Next.js (Turbopack) inicia sin errores.
- URL local: `http://localhost:3000`.

## 5) Verificar navegación base

Validar manualmente:
- La página principal carga.
- La navegación y secciones (hero, CTA, etc.) se muestran correctamente.

Indicador de éxito:
- No hay pantalla en blanco ni error fatal al cargar.

## 6) Verificar build local

```bash
npm run build
```

Resultado esperado:
- Build completado y carpeta `.next/` generada.

## 7) (Opcional) Servir build de producción en local

```bash
npm run start
```

Resultado esperado:
- App servida desde el build de producción para verificación rápida (sigue en `http://localhost:3000` por defecto).

# Comandos útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Servir build de producción
npm run start

# Lint
npm run lint
```

# Solución de problemas

## Puerto 3000 ocupado
- Síntoma: Next.js no puede usar el puerto 3000.
- Solución: cerrar el proceso que usa el puerto o arrancar en otro: `npm run dev -- -p 3001`.

## Error al instalar dependencias
- Síntoma: fallo en `npm install`.
- Solución: eliminar `node_modules` y `package-lock.json` (o `pnpm-lock.yaml`), luego reinstalar.

## Errores de TypeScript o build
- Síntoma: errores durante `npm run build`.
- Solución: revisar `tsconfig.json` y dependencias; ejecutar `npm run lint` para detectar problemas.

# Verificación final

- [ ] `npm install` (o `pnpm install`) ejecuta sin bloqueos.
- [ ] `npm run dev` levanta la app en http://localhost:3000.
- [ ] La página principal carga correctamente.
- [ ] `npm run build` completa y genera `.next/`.
- [ ] (Opcional) `npm run start` sirve el build en local.
