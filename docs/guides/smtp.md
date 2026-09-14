# ⚠️ CONFIGURACIÓN EXACTA DE SMTP EN SUPABASE

## 🔍 Problema Identificado

El error 500 persiste porque hay una diferencia sutil en cómo Supabase maneja las credenciales SMTP.

## ✅ CONFIGURACIÓN CORRECTA (copia exactamente)

Ve a: https://supabase.com/dashboard/project/lijihfnrcjuooaoftyel/settings/auth

### En la sección "SMTP Settings":

```
┌─────────────────────────────────────────────────┐
│ ✓ Enable Custom SMTP                           │
├─────────────────────────────────────────────────┤
│ Sender email:                                   │
│   noreply@cshdevs.org                           │
│   (O cualquier dirección @cshdevs.org)          │
├─────────────────────────────────────────────────┤
│ Sender name:                                    │
│   ComputerScienceHub                            │
├─────────────────────────────────────────────────┤
│ Host:                                           │
│   smtp.resend.com                               │
├─────────────────────────────────────────────────┤
│ Port number:                                    │
│   465                                           │
├─────────────────────────────────────────────────┤
│ Username:                                       │
│   resend                                        │
├─────────────────────────────────────────────────┤
│ Password:                                       │
│   re_xxxx (ver $env:RESEND_API_KEY)             │
└─────────────────────────────────────────────────┘
```

## 🚨 ERRORES COMUNES

### ❌ Error 1: Usar "api" en lugar de "resend"
```
Username: api          ← INCORRECTO
Username: resend       ← CORRECTO
```

### ❌ Error 2: Puerto 587 en lugar de 465
```
Port: 587              ← Puede causar problemas
Port: 465              ← RECOMENDADO para Resend
```

### ❌ Error 3: Email sender incorrecto
```
Sender email: noreply@cshdevs.org           ← NO funciona
Sender email: noreply@send.cshdevs.org      ← CORRECTO (subdominio)
```

## 📝 DESPUÉS DE GUARDAR

1. **Espera 1-2 minutos** para que Supabase aplique los cambios
2. **Limpia caché del navegador** (Ctrl + Shift + Delete)
3. **Intenta registrar un usuario nuevo**

## 🧪 PRUEBA DESDE DASHBOARD

Antes de probar desde tu app:

1. Ve a: https://supabase.com/dashboard/project/lijihfnrcjuooaoftyel/auth/users
2. Click en **"Invite user"**
3. Ingresa tu email: japerezw25@gmail.com
4. Si llega el email → SMTP funciona ✅
5. Si NO llega → Revisa logs en paso siguiente

## 🔍 REVISAR LOGS DE ERROR

Si sigue fallando:

1. Ve a: https://supabase.com/dashboard/project/lijihfnrcjuooaoftyel/logs/auth-logs
2. Busca entradas con:
   - `level: error`
   - `msg: "smtp"`
   - `msg: "email"`
3. Copia el mensaje de error exacto

## 🔧 ALTERNATIVA: Desactivar confirmación temporalmente

Si necesitas que la app funcione YA mientras resolvemos el SMTP:

1. Ve a Auth Settings
2. Busca **"Enable email confirmations"**
3. **DESACTÍVALO** (toggle OFF)
4. Save
5. Los usuarios podrán registrarse SIN confirmar email
6. Luego lo reactivas cuando SMTP funcione

## ⚡ SOLUCIÓN RÁPIDA SI NADA FUNCIONA

Hay un problema conocido donde Supabase no guarda correctamente la configuración SMTP desde el dashboard en algunos casos.

**Solución via Management API:**

1. Genera token: https://supabase.com/dashboard/account/tokens
2. Edita `setup-smtp.ps1` con tu token
3. Ejecuta: `.\setup-smtp.ps1`
4. Esto fuerza la configuración via API (más confiable)

## 📊 RESUMEN DE VERIFICACIÓN

Ejecuta cada comando y verifica:

```powershell
# 1. Verificar API key de Resend
$env:RESEND_API_KEY = "re_xxxx"  # pega tu key local, nunca la commitees
resend whoami
# Debe decir: "authenticated": true

# 2. Verificar dominio
resend domains list
# Debe mostrar status: "verified"

# 3. Verificar secret en Supabase
npx supabase secrets list
# Debe mostrar: RESEND_API_KEY con un digest

# 4. Probar envío directo
.\test-resend-email.ps1
# Debe llegar el email a tu bandeja
```

## 🎯 SIGUIENTE PASO

Si después de aplicar esta configuración EXACTA sigue fallando:

1. Toma screenshot de la configuración SMTP en Supabase
2. Copia el error EXACTO de los logs de Auth
3. Verifca si llegó el email de prueba de Resend

---

**Configuración verificada:**
- ✅ Dominio: cshdevs.org → verified
- ✅ API Key: `re_xxxx` (ver dashboard Resend) → valid
- ✅ Puerto 465 → accesible
- ⚠️ Configuración SMTP en Supabase → VERIFICAR

