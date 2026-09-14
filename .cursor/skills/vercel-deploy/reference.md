****# Vercel CLI — Referencia de comandos

Comandos y opciones útiles para despliegue, rollback, env y diagnóstico. Ejecutar desde la raíz del proyecto.

## Deploy

```bash
# Preview (no producción)
vercel

# Producción
vercel --prod

# Con logs del build
vercel --prod --logs

# Forzar nuevo deploy sin cache
vercel --prod --force

# Desplegar output ya construido (tras vercel build)
vercel deploy --prebuilt --prod
```

## Build local (réplica del build de Vercel)

```bash
vercel pull --environment=production   # descarga env y configuración
vercel build --prod                    # resultado en .vercel/output
```

## Listar e inspeccionar

```bash
vercel list                            # últimos despliegues del proyecto
vercel list <project-name>             # por nombre de proyecto
vercel inspect <deployment-url>        # detalles de un deployment
vercel inspect <url> --logs            # con logs
vercel inspect <url> --wait            # esperar a que termine
```

## Logs

```bash
vercel logs <deployment-url>           # logs de runtime
vercel logs <deployment-url> --follow   # stream en vivo
```

## Rollback

```bash
vercel rollback                        # rollback del proyecto actual
vercel rollback <deployment-url>       # rollback a un deployment concreto
vercel rollback status [project]       # estado del rollback
```

Promover un deployment anterior a producción sin nuevo build:

```bash
vercel promote <deployment-url>
vercel promote status [project]
```

## Variables de entorno

```bash
vercel env ls                          # listar variables
vercel env add <name> production       # añadir (interactivo)
vercel env pull [.env.local]           # descargar a archivo
vercel env rm <name> production        # eliminar
```

En CI, antes de `vercel build --prod`, usar `vercel pull --environment=production` para tener las mismas variables que en el dashboard.

## Proyecto y link

```bash
vercel link                            # linkear directorio actual al proyecto
vercel link --yes --project <name>     # linkear con nombre válido (minúsculas, sin '---'). Ej: computersciencehub-web
vercel link <path>                     # linkear otra ruta
vercel project ls                      # listar proyectos
vercel project inspect <name>          # detalles del proyecto
```

Si el nombre del directorio tiene mayúsculas (ej. `ComputerSciencieHub-Web`), Vercel rechazará el nombre. Usa `vercel link --yes --project computersciencehub-web` (o otro nombre en minúsculas).

## Autenticación

```bash
vercel login                           # login: abre URL en el navegador (OAuth). No usar email ni flags legacy.
vercel logout
vercel whoami                          # usuario actual
```

**Importante:** No uses `vercel login <email>`; el login por email está deshabilitado. Ejecuta solo `vercel login`, abre la URL que muestra la CLI en el navegador y elige "Continue with GitHub" (u otro método en la web).

En CI: crear token en https://vercel.com/account/tokens y pasar `vercel --token $VERCEL_TOKEN` en cada comando.

## Opciones globales útiles

- `--yes` / `-y`: No preguntar (usar valores por defecto).
- `--cwd <path>`: Directorio del proyecto.
- `--debug`: Logs de depuración.
- `--token <token>`: Token para CI.

Documentación oficial: https://vercel.com/docs/cli
