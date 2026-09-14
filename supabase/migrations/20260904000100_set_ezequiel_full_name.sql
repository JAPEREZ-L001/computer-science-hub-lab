-- La cuenta principal de Ezequiel (ezequielamaya129@gmail.com) quedo con
-- full_name vacio: se registro antes de que el formulario de registro pidiera
-- nombre completo. Sin nombre, la UI cae al literal "Miembro" (inscripciones,
-- ranking, autoria de ideas). Se completa a pedido del dueno del proyecto.

UPDATE public.profiles
SET full_name = 'Anderson Ezequiel Amaya Canales'
WHERE id = 'ddbcff0b-1f3a-4045-bc3b-4f458ae597c4';
