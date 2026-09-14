-- Limpieza de cuentas duplicadas creadas durante pruebas de signup/recovery.
--
-- Contexto: al depurar el flujo de recuperacion de contrasena y el bug de
-- envio de confirmacion (dominio send.cshdevs.org sin verificar en Resend),
-- se detectaron cuentas duplicadas de los mismos usuarios (typos de correo,
-- reintentos de registro) y dos cuentas de prueba sueltas. Confirmado por el
-- dueno del proyecto que hay que conservar solo:
--   - japerezw25@gmail.com   (Josue, cuenta principal)
--   - ezequielamaya129@gmail.com (Ezequiel, cuenta principal)
--   - cq250338@alumno.udb.edu.sv (Paola Carballo, cuenta real, no se toca)
--
-- Todas las FK hacia auth.users relevantes (profiles, event_registrations,
-- community_idea_votes) son ON DELETE CASCADE, y community_ideas.author_id /
-- events.created_by son ON DELETE SET NULL, asi que el borrado no deja
-- huerfanos ni requiere limpieza manual adicional. Se pierden intencionalmente
-- los votos de idea asociados a las cuentas duplicadas de Ezequiel.

DELETE FROM auth.users WHERE id IN (
  'd1c624d5-4d83-49d1-877e-ce7649ee54a3', -- japereze25@gmail.com (typo de Josue)
  '755e1624-7b6a-409f-8519-de9e1511374f', -- edwalt.1980.sv@gmail.com (prueba de Josue)
  'f9e68607-299f-4531-8bd9-0fb5bd1d2881', -- japerezw25+test1@gmail.com (alias de prueba de hoy)
  'b72a635b-711c-490d-8d0b-ed5ae9a8a993', -- andersonamaya129@gmail.com (prueba de Ezequiel)
  '739dc07c-1902-4d26-ae5b-7d537e470e07', -- andersonezequielamayacanales@gamil.com (typo de Ezequiel)
  '56ebc6dc-95eb-4c63-ae57-a0b6fc261f67', -- vash74217@gmail.com (prueba de Ezequiel)
  '0ee56dad-bb9e-4efd-a090-bca5ea79f8aa', -- marionoubleau23@gmail.com
  '42f18ca8-55ad-4eef-af07-80a7163043bf'  -- pcarballo1806@gmail.com
);
