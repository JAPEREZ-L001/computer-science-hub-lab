-- CSH-20: Seed inicial desde mocks Sprint 1 (idempotente)
-- No inserta profiles: requieren filas en auth.users (CSH-21 + trigger)

-- ---------- news (mock-news.ts) ----------
INSERT INTO public.news (slug, title, excerpt, content, category, published, published_at)
VALUES
  (
    'hackathon-udb-2026',
    'Hackathon UDB 2026: equipos y preparación',
    'Ya están abiertas las inscripciones y compartimos tips para llegar listos.',
    $n1$## Hola, comunidad

Ya iniciamos la preparación del Hackathon UDB 2026.

### Qué traer
- Laptop y cargador
- Ideas o roadmap
- Disposición para aprender

Nos vemos en la sesión de arranque.$n1$,
    'evento',
    true,
    '2026-03-18T00:00:00Z'::timestamptz
  ),
  (
    'logro-ml-modelo-ligero',
    'Logro: modelo ligero para clasificación de textos',
    'Nuestro equipo IA entrenó un modelo compacto para despliegue rápido.',
    $n2$## Resumen del logro

El equipo de IA logró entrenar un modelo compacto para clasificación de textos, optimizado para tiempos de respuesta bajos.

Gracias a todos los miembros por su apoyo en revisión y pruebas.$n2$,
    'logro',
    true,
    '2026-03-12T00:00:00Z'::timestamptz
  ),
  (
    'anuncio-nuevos-mentores',
    'Anuncio: nuevos mentores del Hub',
    'Damos la bienvenida a mentores que acompañarán rutas de aprendizaje por área.',
    $n3$### ¿Qué cambia?

A partir de esta semana, el Hub tendrá mentores por área para guiar prácticas, revisar portafolios y apoyar proyectos.

Si te interesa participar, revisa la sección de Eventos.$n3$,
    'anuncio',
    true,
    '2026-03-08T00:00:00Z'::timestamptz
  ),
  (
    'update-mejoras-ux-login',
    'Update: mejoras de UX en pantallas de autenticación',
    'Ajustamos validaciones, estados de error y accesibilidad en el flujo de login.',
    $n4$## Cambios principales

- Mejoramos mensajes de validación
- Añadimos soporte de teclado
- Ajustamos el layout para responsive

Este update es parte del Sprint 1 (UI).$n4$,
    'update',
    true,
    '2026-03-05T00:00:00Z'::timestamptz
  ),
  (
    'evento-networking-ia',
    'Evento: networking para proyectos de IA',
    'Espacio para compartir aprendizajes, demos y próximos retos.',
    $n5$### Agenda

1. Presentaciones cortas
2. Demo de proyectos
3. Q&A y networking

Trae tu idea, incluso si está en borrador.$n5$,
    'evento',
    true,
    '2026-03-02T00:00:00Z'::timestamptz
  )
ON CONFLICT (slug) DO NOTHING;

-- ---------- events (mock-events.ts) ----------
INSERT INTO public.events (
  title, description, event_date, event_time, speaker, type, location, registration_url, published
)
SELECT * FROM (VALUES
  (
    'Workshop: Construye tu primer UI accesible',
    'Práctica guiada para construir componentes accesibles usando React + buenas prácticas de UX.'::text,
    '2026-03-25'::date,
    '17:30'::text,
    'Ana María López'::text,
    'workshop'::text,
    'Auditorio Don Bosco, UDB'::text,
    'https://example.com/inscripcion-workshop-ui'::text,
    true
  ),
  (
    'Charla: Arquitectura limpia en APIs',
    'Cómo separar responsabilidades, modelar recursos y mantener consistencia en servicios backend.'::text,
    '2026-03-29'::date,
    '18:00'::text,
    'Carlos Ernesto Rivera'::text,
    'charla'::text,
    'Salón de conferencias - Campus Antiguo Cuscatlán'::text,
    NULL::text,
    true
  ),
  (
    'Hackathon: Build in 48 — Comunidad',
    'Ideación y construcción enfocada: equipos, retos técnicos y demo final con evaluación comunitaria.',
    '2026-04-05'::date,
    '09:00'::text,
    'Equipo ComputerSciencieHub'::text,
    'hackathon'::text,
    'Plaza de eventos, UDB'::text,
    'https://example.com/inscripcion-hackathon'::text,
    true
  ),
  (
    'Copa: Semifinal de retos de seguridad',
    'Ronda de challenges de seguridad práctica con writeups al finalizar cada módulo.',
    '2026-04-10'::date,
    '16:00'::text,
    'Gustavo René Hernández'::text,
    'copa'::text,
    'Laboratorio de Computación'::text,
    NULL::text,
    true
  ),
  (
    'Networking: proyectos de IA y demos rápidas',
    'Espacio para compartir avances, demos de modelos y aprendizajes del camino (incluso si estás empezando).'::text,
    '2026-04-15'::date,
    '18:30'::text,
    'Comunidad IA'::text,
    'networking'::text,
    'Cafetería del Campus - UDB'::text,
    NULL::text,
    true
  )
) AS v(title, description, event_date, event_time, speaker, type, location, registration_url, published)
WHERE NOT EXISTS (SELECT 1 FROM public.events LIMIT 1);

-- ---------- opportunities (app/oportunidades/page.tsx) ----------
INSERT INTO public.opportunities (
  title, organization, description, url, type, published
)
SELECT * FROM (VALUES
  (
    'Pasantía / Primer empleo — Desarrollo de software'::text,
    'Applaudo Studios'::text,
    'Empresa líder de nearshore en latam que busca talento joven para programas de entrenamiento con salida laboral en desarrollo web y móvil.'::text,
    'https://applaudostudios.com'::text,
    'Pasantía / Primer empleo'::text,
    true
  ),
  (
    'Programa trainee — Infraestructura y redes'::text,
    'Grupo Cassa'::text,
    'Programa de formación técnica en infraestructura TI para estudiantes de los últimos ciclos de carreras de computación e ingeniería.'::text,
    'https://www.grupocassa.com'::text,
    'Programa trainee'::text,
    true
  ),
  (
    'Becas de aprendizaje'::text,
    'Platzi'::text,
    'Acceso a becas de aprendizaje en desarrollo, ciencia de datos, inteligencia artificial y habilidades blandas para la industria.'::text,
    'https://platzi.com'::text,
    'Becas'::text,
    true
  ),
  (
    'Programa de liderazgo — Campus Expert'::text,
    'GitHub'::text,
    'Formación en liderazgo comunitario, organización de eventos tech y contribución a proyectos open source a nivel universitario.'::text,
    'https://education.github.com/experts'::text,
    'Programa de liderazgo'::text,
    true
  ),
  (
    'Convocatoria emprendimiento tech'::text,
    'CONAMYPE'::text,
    'Programas de apoyo para emprendedores en tecnología: mentoría, financiamiento inicial y acceso a redes empresariales.'::text,
    'https://www.conamype.gob.sv'::text,
    'Convocatoria'::text,
    true
  )
) AS v(title, organization, description, url, type, published)
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities LIMIT 1);

-- ---------- resources (app/recursos/page.tsx) ----------
INSERT INTO public.resources (
  title, description, url, category, tags, published
)
SELECT * FROM (VALUES
  (
    'CS50 — Harvard'::text,
    'El curso introductorio de ciencias de la computación más popular del mundo. Cubre desde pensamiento computacional hasta desarrollo web.'::text,
    'https://cs50.harvard.edu/'::text,
    'computacion'::text,
    ARRAY['basico']::text[],
    true
  ),
  (
    'freeCodeCamp'::text,
    'Plataforma gratuita con certificaciones en desarrollo web, APIs, visualización de datos, machine learning y más.'::text,
    'https://www.freecodecamp.org/'::text,
    'computacion'::text,
    ARRAY['basico']::text[],
    true
  ),
  (
    'The Odin Project'::text,
    'Ruta de aprendizaje completa de full-stack: HTML, CSS, JavaScript, Node.js y Ruby on Rails con proyectos reales.'::text,
    'https://www.theodinproject.com/'::text,
    'computacion'::text,
    ARRAY['intermedio']::text[],
    true
  ),
  (
    'MIT OpenCourseWare — Algorithms'::text,
    'Curso completo de algoritmos y estructuras de datos del MIT, con grabaciones de clases, notas y problem sets.'::text,
    'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'::text,
    'computacion'::text,
    ARRAY['avanzado']::text[],
    true
  ),
  (
    'Figma para principiantes'::text,
    'Curso oficial de Figma que cubre los fundamentos de diseño de interfaces: componentes, auto-layout, prototipos y variables.'::text,
    'https://www.youtube.com/@Figma'::text,
    'diseño'::text,
    ARRAY['basico']::text[],
    true
  ),
  (
    'Refactoring UI'::text,
    'Guía de diseño práctica para desarrolladores: tipografía, color, espaciado y jerarquía visual sin necesidad de ser diseñador.'::text,
    'https://www.refactoringui.com/'::text,
    'diseño'::text,
    ARRAY['intermedio']::text[],
    true
  ),
  (
    'Interviewing.io — Mock Interviews'::text,
    'Práctica de entrevistas técnicas con ingenieros de empresas top. Feedback real y anónimo para mejorar tu performance.'::text,
    'https://interviewing.io/'::text,
    'profesional'::text,
    ARRAY['avanzado']::text[],
    true
  ),
  (
    'Tech Interview Handbook'::text,
    'Guía completa y gratuita para prepararse para entrevistas técnicas: algoritmos, system design, behavioral y negociación.'::text,
    'https://www.techinterviewhandbook.org/'::text,
    'profesional'::text,
    ARRAY['intermedio']::text[],
    true
  ),
  (
    'Roadmap.sh'::text,
    'Rutas de aprendizaje visuales para frontend, backend, DevOps, AI/ML y más. Comunidad activa con guías y checklists.'::text,
    'https://roadmap.sh/'::text,
    'computacion'::text,
    ARRAY['intermedio']::text[],
    true
  )
) AS v(title, description, url, category, tags, published)
WHERE NOT EXISTS (SELECT 1 FROM public.resources LIMIT 1);

-- ---------- sponsors (mock-sponsors.ts) ----------
INSERT INTO public.sponsors (name, logo_url, website_url, tier, active)
VALUES
  ('Cursor', NULL, 'https://cursor.com', 'principal', true),
  ('Supabase', NULL, 'https://supabase.com', 'principal', true),
  ('Obelysk', NULL, 'https://obelysk.com', 'colaborador', true),
  ('UDB', NULL, 'https://www.udb.edu.sv', 'aliado', true)
ON CONFLICT (name) DO NOTHING;
