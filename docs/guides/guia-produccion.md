# Guía Rápida: Configurar Resend en Producción

## ✅ ACTUALIZACIÓN: Dominio Personalizado Configurado

Tu aplicación ahora usa el dominio: **https://cshdevs.org**

---

## ⚡ Pasos Completados

### ✅ Configuración del Código
- [x] Variables de entorno actualizadas
- [x] Mensajes de confirmación mejorados
- [x] SMTP configurado en `config.toml`
- [x] Dominio actualizado a `cshdevs.org`
- [x] Confirmación de email reactivada (`enable_confirmations = true`)
- [x] Configuración aplicada a Supabase remoto con `supabase config push` (22/03/2026)

### 🔄 Pasos Restantes en Vercel/Supabase (15-20 minutos)

### 1️⃣ Agregar Dominio en Vercel (5 min)

**Paso 1: Agregar el dominio**
1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto: **computersciencehub-web**
3. **Settings** → **Domains**
4. Agregar: `cshdevs.org`

**Paso 2: Configurar DNS en Cloudflare**
1. Ir a: https://dash.cloudflare.com
2. Seleccionar dominio: **cshdevs.org**
3. **DNS** → **Records** → **Add record**
4. Agregar registro A:
   ```
   Type: A
   Name: @
   IPv4: 76.76.21.21
   Proxy: Activado (🟠)
   ```

**Paso 3: Esperar verificación (2-5 min)**

---

### 2️⃣ Configurar Variables en Vercel (5 min)

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto: **computersciencehub-web**
3. **Settings** → **Environment Variables**
4. Agregar/actualizar estas dos variables:

```
NEXT_PUBLIC_SITE_URL = https://cshdevs.org
RESEND_API_KEY = re_xxxx  # copiar valor real desde el dashboard de Resend, nunca commitear
```

5. Aplicar a: **Production**, **Preview**, y **Development**
6. Guardar

---

### 3️⃣ Configurar SMTP en Supabase (5 min)

1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: **ComputerScienceHub-Web**
3. **Authentication** → **SMTP Settings**
4. Activar: **Enable Custom SMTP**
5. Llenar el formulario:

```
Sender email: noreply@send.cshdevs.org
Sender name: ComputerScienceHub
Host: smtp.resend.com
Port: 465
Username: resend
Password: re_xxxx  # mismo valor que RESEND_API_KEY, ver dashboard de Resend
```

6. **Save** / **Guardar**

**Paso 2: Actualizar Site URL**
1. En el mismo dashboard de Supabase
2. **Authentication** → **URL Configuration**
3. Actualizar:
   ```
   Site URL: https://cshdevs.org
   ```
4. Agregar redirect URLs:
   ```
   https://cshdevs.org/auth/callback
   ```
5. **Save**

---

### 4️⃣ Redesplegar la Aplicación (2 min)

**Opción A: Desde Vercel Dashboard**
1. Deployments → Últimas tres puntitos → **Redeploy**

**Opción B: Git Push**
```bash
git add .
git commit -m "Configurar Resend SMTP en producción"
git push
```

**Opción C: CLI de Vercel**
```bash
vercel --prod
```

---

### 5️⃣ Probar el Flujo (5 min)

1. Ir a: **https://cshdevs.org/registro**
2. Registrarte con un email real
3. Verificar que llegue el email desde **noreply@send.cshdevs.org**
4. Hacer clic en el enlace de confirmación (debe apuntar a `cshdevs.org`)
5. Iniciar sesión en **https://cshdevs.org/login**

---

## 📚 Documentación Adicional

- **Configuración completa de SMTP:** [`docs/configuracion-resend-smtp.md`](./configuracion-resend-smtp.md)
- **Cambios en el backend:** [`docs/cambios-backend-resend.md`](./cambios-backend-resend.md)
- **Configurar dominio en Vercel:** [`docs/configurar-dominio-vercel.md`](./configurar-dominio-vercel.md)

---

## ✅ Verificación Final

- [ ] Dominio `cshdevs.org` agregado en Vercel
- [ ] Registros DNS configurados en Cloudflare
- [ ] Dominio verificado en Vercel (✅ verde)
- [ ] SSL activo en `cshdevs.org`
- [ ] Variables configuradas en Vercel
- [ ] SMTP configurado en Supabase
- [ ] Site URL actualizado en Supabase
- [ ] Aplicación redesplegada
- [ ] Email de confirmación recibido desde `noreply@send.cshdevs.org`
- [ ] Enlaces en email apuntan a `cshdevs.org`
- [ ] Confirmación exitosa
- [ ] Login funciona en `https://cshdevs.org/login`

---

## 🚨 Si algo falla

### Email no llega:
1. Revisar carpeta de spam
2. Verificar configuración SMTP en Supabase
3. Ver logs en Resend: https://resend.com/emails

### Error al confirmar email:
1. Verificar que `NEXT_PUBLIC_SITE_URL` esté configurada
2. Redesplegar después de agregar variables
3. Limpiar caché del navegador

### Ayuda adicional:
- Ver documentación completa: `docs/cambios-backend-resend.md`
- Ver configuración Resend: `docs/configuracion-resend-smtp.md`

---

**Tiempo estimado total:** 15-20 minutos  
**Última actualización:** 22 de marzo de 2026
