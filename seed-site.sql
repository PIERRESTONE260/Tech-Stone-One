-- ============================================================
-- TS1 : contenu du site public et initialisation des données
-- Alignée sur le Dév, l'IoT, le Design et le Leadership
-- À exécuter UNE SEULE FOIS, après schema.sql
-- (Supabase > SQL Editor > New query > Run)
-- ============================================================

insert into public.news (title, description, image_url, source) values
('Succès FilmsAll', 'Déploiement sur Netlify OK[cite: 10].',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'TS NEWS'),
('FilmsAll v2 & IoT', 'Sécurité renforcée et intégration des modules embarqués[cite: 10].',
 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', 'TS NEWS');

insert into public.agenda_events (title, description, starts_on) values
('Réunion Stratégique TS1 & Leadership', 'Déploiement des terminaux NFC et ateliers de management d\'équipe[cite: 10].', '2026-04-18'),
('Audit de Sécurité & IoT', 'Revue des protocoles du manuel opérationnel et systèmes embarqués[cite: 10].', '2026-04-22'),
('Lancement Beta "FilmsAll"', 'Phase de test public de la plateforme[cite: 10].', '2026-04-30');