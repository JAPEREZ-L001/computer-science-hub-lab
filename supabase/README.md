# Supabase — Computer Science Hub

Migraciones SQL versionadas en `migrations/`. Proyecto remoto: **Computer-Science-Hub** (`lijihfnrcjuooaoftyel`).

## Orden aplicado (Sprint 2)

1. `csh_s2_18_base_schema_public_tables` — tablas `profiles`, `news`, `events`, `opportunities`, `resources`, `sponsors` (no altera `respuestas_betatesters`).
2. `csh_s2_19_rls_policies` — RLS + función `public.is_admin()`.
3. **CSH-20 seed** — el script `20260301100100_csh_s2_20_seed.sql` está en el repo; en el proyecto remoto los `INSERT` se ejecutaron vía MCP (`execute_sql`) por tamaño. Re-ejecutar el archivo es idempotente (`ON CONFLICT` / `WHERE NOT EXISTS`).
4. `csh_s2_21_handle_new_user` — trigger `on_auth_user_created` en `auth.users` → inserta fila en `public.profiles` (metadata `full_name`, `career`, `cycle`, `area` desde `signUp`).

## Seed

- **Incluye:** noticias (mock), eventos (mock), oportunidades (página `/oportunidades`), recursos (página `/recursos`), sponsors (mock).
- **Profiles:** se crean al registrarse vía Auth + trigger `handle_new_user` (migración `20260301100200_csh_s2_21_handle_new_user.sql`).

## Auth: Site URL y redirect URLs (hosted)

La configuración de Auth del proyecto remoto vive en `config.toml` (sección `[auth]`). Tras `supabase link`, actualizar ahí `site_url` y `additional_redirect_urls` y aplicar con:

```bash
npx supabase config push --yes
```

**Importante:** `config push` compara **toda** la sección `[auth]` con el remoto (email, MFA, sign-in anónimo, etc.). No uses un `config.toml` “de plantilla” sin alinearlo con lo que ya tienes en el dashboard, o podrías sobrescribir ajustes sin querer.

Producción actual: `site_url` = `https://computersciencehub-web.vercel.app`; redirects permitidos incluyen `http://localhost:3000/auth/callback` y `https://computersciencehub-web.vercel.app/auth/callback`.

### Pendiente: recuperación de contraseña en el proyecto remoto

El flujo de `/recuperar` (BL-20) manda a `/auth/callback?next=/auth/update-password`, y la política
de contraseña se endureció a 8 caracteres con mayúscula, minúscula y dígito. Ambas cosas ya están
en `config.toml`, pero **eso solo gobierna el stack local**: hasta que no se corra
`config push`, el proyecto remoto sigue con la lista de redirects vieja y
`minimum_password_length = 6`.

Con la lista vieja, el enlace del correo no matchea ningún patrón permitido, así que Supabase
ignora el `redirectTo` y cae al `site_url`: el usuario aterriza en la home **con sesión y sin
forma de cambiar la contraseña**, que es justo el bug que el flujo nuevo evita.

```bash
npx supabase config push --yes
```

Releé la advertencia de arriba antes de correrlo: compara toda la sección `[auth]`. Alternativa
manual equivalente, en el dashboard → Authentication → URL Configuration, agregando los patrones
`.../auth/callback?**` y `.../auth/update-password` para los tres orígenes.

En Vercel, define también `NEXT_PUBLIC_SITE_URL` con la misma URL de producción (CLI: `vercel env add NEXT_PUBLIC_SITE_URL production`).

## Variables locales

Copiar `.env.example` → `.env.local` y pegar la clave publicable del dashboard de Supabase.
