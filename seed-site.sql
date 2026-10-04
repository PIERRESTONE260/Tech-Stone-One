-- ============================================================
-- TS1 : contenu du site public repris de l'ancien index.html
-- À exécuter UNE SEULE FOIS, après schema.sql
-- (Supabase > SQL Editor > New query > Run)
-- Vous pourrez ensuite tout modifier depuis admin.html
-- ============================================================

insert into public.news (title, description, image_url, source) values
('Succès FilmsAll', 'Déploiement sur Netlify OK.',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'TS NEWS'),
('FilmsAll v2', 'Sécurité renforcée.',
 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', 'TS NEWS');

-- Dates d'avril 2026 : elles sont passées, mettez-les à jour dans Contrôle > Agenda
insert into public.agenda_events (title, description, starts_on) values
('Réunion Stratégique TS1', 'Déploiement des terminaux NFC.', '2026-04-18'),
('Audit de Sécurité', 'Revue des protocoles du manuel opérationnel.', '2026-04-22'),
('Lancement Beta "FilmsAll"', 'Phase de test public de la plateforme.', '2026-04-30');