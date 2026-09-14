-- CSH-31: Reemplaza noticias y eventos mock por contenido real del CSH
-- Basado en Ideas-CSH.md (2026-03-22)

-- ============================================================
-- NOTICIAS — eliminar las 5 genéricas e insertar 6 reales
-- ============================================================

DELETE FROM public.news
WHERE slug IN (
  'hackathon-udb-2026',
  'logro-ml-modelo-ligero',
  'anuncio-nuevos-mentores',
  'update-mejoras-ux-login',
  'evento-networking-ia'
);

INSERT INTO public.news (slug, title, excerpt, content, category, published, published_at)
VALUES
  (
    'lanzamiento-hub-antiguo-cuscatlan-2026',
    'Lanzamos el Computer Science Hub en Antiguo Cuscatlán',
    'El CSH abre sus puertas en el campus de Antiguo Cuscatlán. Conocé qué somos, qué hacemos y cómo unirte.',
    $n1$## El Hub ya está aquí

El Computer Science Hub llega al campus de Antiguo Cuscatlán de la Universidad Don Bosco con una misión clara: construir la comunidad técnica más sólida del campus.

### ¿Qué es el CSH?

El CSH es una comunidad estudiantil de Ciencias de la Computación que convierte el aula en un laboratorio vivo. Akademia, proyectos reales, mentorías entre pares y vínculo directo con la industria tecnológica.

### ¿Cómo participar?

- Completá tu perfil en nuestra plataforma
- Asistí a la sesión de bienvenida
- Conectate con otros miembros desde el Hub

Si estás en tu primer ciclo o llevas años en la carrera, hay espacio para vos.$n1$,
    'anuncio',
    true,
    '2026-03-01T09:00:00Z'::timestamptz
  ),
  (
    'cafe-udb-primer-networking',
    'Café UDB: nuestro primer evento de networking',
    'Realizamos el primer Café UDB, un espacio informal para conectar estudiantes, egresados y profesionales del sector tech.',
    $n2$## Resumen del Café UDB #01

El pasado viernes realizamos nuestro primer evento de networking dentro del campus. La propuesta fue simple: un espacio sin formalidades donde estudiantes pudieran conocer egresados y profesionales del ecosistema tecnológico salvadoreño.

### Lo que pasó

- Más de 30 asistentes entre estudiantes y egresados
- Tres conversaciones espontáneas sobre oportunidades laborales
- Demos rápidas de proyectos en desarrollo dentro del hub

### ¿Por qué lo hacemos?

Porque la carrera no se construye solo en el aula. Las conexiones que hacés hoy son parte del capital profesional de mañana.

El próximo Café UDB ya está en agenda. Seguí los canales del hub para no perderte la fecha.$n2$,
    'evento',
    true,
    '2026-03-08T09:00:00Z'::timestamptz
  ),
  (
    'sistema-nivelacion-en-marcha',
    'El Sistema de Nivelación del CSH ya está en marcha',
    'Los miembros veteranos del hub ahora acompañan activamente a los nuevos. Así funciona el modelo.',
    $n3$## Cómo funciona el Sistema de Nivelación

Una de las primeras iniciativas del CSH ya está activa: el Sistema de Nivelación. La idea es simple pero poderosa: los miembros con más experiencia guían a los nuevos, y a cambio mantienen activos sus beneficios dentro del hub.

### El modelo

1. Cada miembro nuevo es asignado a un grupo con miembros veteranos
2. Los veteranos comparten su roadmap, errores y recursos
3. Los nuevos aportan energía, ideas frescas y preguntas que desafían lo establecido

### Por qué importa

La pérdida de conocimiento entre generaciones es el mayor enemigo de cualquier comunidad técnica. Este sistema construye una cadena sostenible de aprendizaje.

Si querés ser mentor o encontrar uno, accedé a la sección de Tutorías en tu área de comunidad.$n3$,
    'anuncio',
    true,
    '2026-03-12T09:00:00Z'::timestamptz
  ),
  (
    'primer-comite-estudiantil-campus-ac',
    'CSH impulsa el primer Comité Estudiantil del campus',
    'El hub formaliza su primer comité: estudiantes avanzados con voz en decisiones académicas y contenidos.',
    $n4$## El primer Comité Estudiantil

El Computer Science Hub impulsa la formación del primer Comité Estudiantil del campus de Antiguo Cuscatlán. Este comité cambia la dinámica de quién tiene voz en lo académico.

### Qué hace el comité

- Estudiantes avanzados elaboran guías actualizadas por ciclo
- Revisan la pertinencia de contenidos de ciencias básicas
- Proponen mejoras a los guiones de clases desactualizados
- Aplican mecanismos como la segunda vuelta cuando el rendimiento colectivo lo justifica

### Por qué es un logro

Nunca antes el campus de Antiguo Cuscatlán tuvo una instancia formal de representación estudiantil con incidencia real en lo académico. Este comité es el primero.

Si sos estudiante de ciclos avanzados y querés participar, escribinos directamente.$n4$,
    'logro',
    true,
    '2026-03-15T09:00:00Z'::timestamptz
  ),
  (
    'workshop-marca-personal-resultados',
    'Workshop de Marca Personal: construí tu identidad profesional',
    'Cerramos el primer workshop de marca personal con más de 25 asistentes. Repaso de lo que aprendimos.',
    $n5$## Workshop de Marca Personal — Resumen

El viernes pasado llevamos a cabo el primer Workshop de Marca Personal del CSH, orientado a que los miembros aprendan a construir y comunicar su identidad profesional en el mundo tech.

### Lo que trabajamos

- Cómo construir un perfil de LinkedIn que realmente destaque
- La diferencia entre un CV genérico y un portfolio con historia
- Cómo hablar de tus proyectos aunque sean pequeños

### Conclusión clave

Tu marca personal no es lo que decís que sos. Es lo que la industria ve cuando buscas tu nombre. Empezar temprano marca la diferencia.

El material y los recursos del workshop están disponibles en el Repositorio del Hub.$n5$,
    'evento',
    true,
    '2026-03-18T09:00:00Z'::timestamptz
  ),
  (
    'alianza-direccion-innovacion-udb',
    'Alianza oficial con la Dirección de Innovación UDB',
    'El CSH firma acuerdo con la DiInn de la UDB para acceso a charlas, horas sociales y recursos de innovación.',
    $n6$## Nueva alianza estratégica

El Computer Science Hub formalizó su alianza con la Dirección de Innovación de la Universidad Don Bosco. Esta alianza abre canales directos para los miembros del hub.

### Qué significa para vos como miembro

- Acceso prioritario a charlas y capacitaciones organizadas por la DiInn
- Oportunidades de horas sociales vinculadas a proyectos de innovación
- Convocatorias anticipadas a eventos y programas de la dirección
- Canal directo para proponer proyectos estudiantiles con respaldo institucional

### Próximos pasos

En las siguientes semanas se publicará el calendario de actividades conjuntas. Revisá la sección de Eventos para estar al tanto.

Esta alianza es parte del esfuerzo del CSH por construir puentes reales entre la comunidad estudiantil y los recursos institucionales de la UDB.$n6$,
    'anuncio',
    true,
    '2026-03-22T09:00:00Z'::timestamptz
  )
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- EVENTOS — eliminar los 5 genéricos e insertar 6 reales
-- ============================================================

-- Eliminar solo si la tabla solo tiene las filas del seed original
-- (borra todos los eventos y re-inserta los reales)
DELETE FROM public.events
WHERE title IN (
  'Workshop: Construye tu primer UI accesible',
  'Charla: Arquitectura limpia en APIs',
  'Hackathon: Build in 48 — Comunidad',
  'Copa: Semifinal de retos de seguridad',
  'Networking: proyectos de IA y demos rápidas'
);

INSERT INTO public.events (
  title, description, event_date, event_time, speaker, type, location, registration_url, published
)
VALUES
  (
    'Workshop: Ciberseguridad para la vida universitaria',
    'Introducción práctica a los conceptos de ciberseguridad que todo estudiante de computación debería conocer: contraseñas seguras, phishing, redes Wi-Fi y protección de cuentas. Impartido por miembros del CSH con experiencia en seguridad informática.',
    '2026-04-05'::date,
    '17:00',
    'Jacob & Josué',
    'workshop',
    'Salón de conferencias — Campus Antiguo Cuscatlán, UDB',
    NULL,
    true
  ),
  (
    'Workshop: Inteligencia Artificial para estudiantes',
    'Panorama práctico de la IA aplicada a la vida universitaria y al mercado laboral. Cubriremos conceptos base, herramientas actuales y cómo aprovechar modelos de lenguaje de forma crítica y productiva sin perder autonomía intelectual.',
    '2026-04-12'::date,
    '17:00',
    'Rodrigo',
    'workshop',
    'Salón de conferencias — Campus Antiguo Cuscatlán, UDB',
    NULL,
    true
  ),
  (
    'Workshop: Control de versiones con Git y GitHub',
    'Taller práctico de Git y GitHub desde cero: repositorios, commits, ramas, pull requests y trabajo colaborativo. Ideal para quienes nunca han usado control de versiones o quieren solidificar sus fundamentos.',
    '2026-04-19'::date,
    '16:00',
    'Équipo CSH',
    'workshop',
    'Laboratorio de Computación — Campus Antiguo Cuscatlán, UDB',
    NULL,
    true
  ),
  (
    'Workshop: Diseño UX/UI — Introducción práctica',
    'Fundamentos de diseño de interfaces centradas en el usuario. Aprenderemos a crear wireframes, prototipos y sistemas de diseño en Figma. El taller está orientado a desarrolladores que quieren elevar la calidad visual de sus proyectos.',
    '2026-04-26'::date,
    '17:30',
    'Katherine & Rodrigo',
    'workshop',
    'Auditorio Don Bosco — Campus Antiguo Cuscatlán, UDB',
    NULL,
    true
  ),
  (
    'Café UDB #02 — Evento de Networking',
    'Segunda edición del Café UDB: el espacio informal del CSH para conectar estudiantes, egresados y profesionales del sector tecnológico. Trae tus proyectos, ideas y ganas de conocer gente que trabaja en tech en El Salvador.',
    '2026-05-03'::date,
    '17:00',
    'Comunidad CSH',
    'networking',
    'Cafetería del Campus — Antiguo Cuscatlán, UDB',
    NULL,
    true
  ),
  (
    'Programación Extrema — Hackathon Interno 12h',
    'Primera edición del hackathon interno del CSH: 12 horas continuas de desarrollo intensivo. Equipos de 2 a 4 personas, un reto técnico en común y una demo al final. Inspirado en la dinámica de hackathons reales de la industria. Habrá premios simbólicos y reconocimiento dentro de la comunidad.',
    '2026-05-17'::date,
    '08:00',
    'Équipo CSH',
    'hackathon',
    'Coworking CSH — Campus Antiguo Cuscatlán, UDB',
    NULL,
    true
  )
ON CONFLICT DO NOTHING;
