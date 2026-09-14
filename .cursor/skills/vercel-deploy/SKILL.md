---
name: vercel-deploy
description: Guía el despliegue en Vercel con CLI: comprobaciones previas (lint, build), deploy a producción o preview, y configuración de deploy automático tras cada push. Usar cuando el usuario pida desplegar en Vercel, configurar deploy on push, ejecutar vercel --prod, revisar despliegues, rollback, variables de entorno o logs de Vercel.
---

# Vercel Deploy

Guía para desplegar en Vercel desde CLI, con comprobaciones previas y opciones de deploy tras cada push.

## Cuándo usar esta skill

Aplicar cuando el usuario mencione: deploy en Vercel, deploy on push, vercel CLI, producción, preview, rollback, variables de entorno o logs de Vercel.

## Pre-requisitos

- **Proyecto linkeado:** `vercel link` (una vez desde la raíz del repo).
- **Login:** `vercel login` en local; en CI usar token en [Vercel Tokens](https://vercel.com/account/tokens) y `vercel --token <TOKEN>`.

Si el proyecto no está linkeado, recordar ejecutar `vercel link` y, si hace falta env de producción, `vercel pull --environment=production`.

## Deploy a producción

1. Estar en la rama que se quiere desplegar (para `main`: `git checkout main && git pull origin main`).
2. Ejecutar comprobaciones y deploy:
   - `npm run deploy:prod` (recomendado: ejecuta predeploy + vercel --prod), o
   - `npm run predeploy && vercel --prod`, o
   - `npm run lint && npm run build && vercel --prod`.

La URL de producción se imprime en stdout. Con `vercel --prod --logs` se ven también los logs del build.

## Comprobaciones antes de deploy

Siempre ejecutar lint y build antes de `vercel --prod` para no romper producción. Orden recomendado:

1. `npm run lint`
2. `npm run build`
3. (Opcional) `vercel build --prod` para replicar exactamente el build de Vercel en local (requiere `vercel link` y `vercel pull` previos).
4. `vercel --prod`

Si el proyecto tiene scripts `predeploy` y `deploy:prod`, usarlos (ya incluyen lint + build).

## Deploy después de cada push

**Opción A (recomendada):** Conectar el repositorio en Vercel (Dashboard del proyecto → Settings → Git). Configurar Production Branch = `main`. Vercel desplegará automáticamente en cada push a `main` y creará previews por PR. No requiere código en el repo.

**Opción B (CLI / CI):** Si el usuario quiere control explícito o gates adicionales:
- **Manual:** Tras cada push a `main`, ejecutar `npm run deploy:prod` desde local.
- **GitHub Actions:** Añadir un workflow que en `push` a `main` ejecute lint, build y `vercel --prod --token ${{ secrets.VERCEL_TOKEN }}`. Documentar la creación del token en Vercel y el secret `VERCEL_TOKEN` en el repo.

## Preview deployments

- **CLI:** `vercel` (sin `--prod`) despliega a preview y devuelve una URL de preview.
- **Git:** Si el repo está conectado en Vercel, cada PR obtiene una URL de preview automática.

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Listar despliegues | `vercel list` |
| Logs de un deployment | `vercel logs <deployment-url>` |
| Inspeccionar deployment | `vercel inspect <deployment-url>` |
| Rollback a anterior | `vercel rollback` (o promover desde el dashboard) |
| Descargar env de producción | `vercel pull --environment=production` |
| Añadir variable de entorno | `vercel env add <name> <environment>` |

Para más detalle de opciones y ejemplos, ver [reference.md](reference.md).

## Referencia del proyecto

- Plan de feature y flujo: [docs/work/14-03-26FeatureDeployBeforeSprint1/plan-deploy.md](../../docs/work/14-03-26FeatureDeployBeforeSprint1/plan-deploy.md).
- Scripts del repo: `predeploy` (lint + build), `deploy:prod` (predeploy + vercel --prod). Rama de producción acordada: `main`.
