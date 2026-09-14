-- Repara el linkedin_url de Josue, que quedo en null por el bug de
-- sanitizeOptionalUrl (rechazaba URLs sin protocolo explicito). El bug ya se
-- corrigio en src/lib/url-validation.ts; esto solo repara el dato existente.

UPDATE public.profiles
SET linkedin_url = 'https://www.linkedin.com/in/josué-adonaí-pérez-lópez-6666193a8'
WHERE id = '81d7b60e-e6bc-4449-8ed6-59f2ce9b6af2';
