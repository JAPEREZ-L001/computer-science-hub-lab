import { z } from 'zod'

/**
 * Política de contraseña del Hub, para cuando el usuario **define** una nueva
 * (registro o recuperación).
 *
 * Debe mantenerse en sincronía con `minimum_password_length` y
 * `password_requirements` en `supabase/config.toml`: si el cliente es más
 * estricto que el backend, la validación es cosmética y se puede saltar
 * llamando a la API directo.
 */
export const newPasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')

/**
 * Contraseña al **iniciar sesión**: solo se exige que no esté vacía.
 *
 * A propósito no aplica `newPasswordSchema`: hay cuentas creadas cuando el
 * mínimo era 6 caracteres, y validar la política nueva en el login les
 * impediría entrar con una contraseña que sigue siendo válida.
 */
export const loginPasswordSchema = z.string().min(1, 'Ingresa tu contraseña')
