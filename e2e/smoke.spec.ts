import { test, expect } from '@playwright/test'

// 3 smoke tests mínimos (BL-14): protegen los flujos más críticos de auth/registro.
// No usan una cuenta real de Supabase (no hay credenciales de test en .env.example);
// ver ejecucion-log.md para el pendiente de un test de login exitoso end-to-end.

test('redirige a /login al visitar /perfil sin sesión', async ({ page }) => {
  await page.goto('/perfil')
  await page.waitForURL(/\/login(\?.*)?$/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/perfil')
})

test('el formulario de registro valida los campos en el cliente antes de enviar', async ({ page }) => {
  await page.goto('/registro')

  await page.getByRole('button', { name: /crear mi cuenta de acceso/i }).click()

  await expect(page.getByText('Ingresa tu nombre completo')).toBeVisible()
  await expect(page.getByText('Ingresa un email válido')).toBeVisible()
  await expect(page.getByText('Debes aceptar los términos para continuar')).toBeVisible()

  // No debe haber navegado: la validación client-side bloqueó el submit.
  await expect(page).toHaveURL(/\/registro/)
})

test('el login muestra un error si las credenciales son inválidas', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Correo institucional', { exact: true }).fill('usuario-inexistente@example.com')
  await page.getByLabel('Contraseña', { exact: true }).fill('ContraseñaIncorrecta123')
  await page.getByRole('button', { name: /entrar a mi perfil/i }).click()

  await expect(
    page.getByText('No se pudo iniciar sesión', { exact: true }),
  ).toBeVisible({ timeout: 10_000 })
  await expect(page).toHaveURL(/\/login/)
})
