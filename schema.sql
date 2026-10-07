-- ============================================================
-- TS1 : schéma de base de données (Supabase / PostgreSQL)
-- Mis à jour pour intégrer : Dév, Design, IoT, Formation & Leadership
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- PROFILS (un profil par compte de connexion) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text check (full_name is null or char_length(full_name) <= 100),
  title text check (title is null or char_length(title) <= 100),
  role text not null default 'membre' check (role in ('direction','membre')),
  pole text check (pole in ('web','design','elec','market','iot','academy')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_direction() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'direction' and active
  );
$$;

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('direction','membre') and active
  );
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ACADEMY (Formations & Leadership) ----------
create table if not exists public.academy_live (
  id int primary key default 1 check (id = 1),
  active boolean not null default false,
  title text check (title is null or char_length(title) <= 150),
  description text check (description is null or char_length(description) <= 500),
  url text check (url is null or url ~* '^https://'),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  tag text check (tag is null or char_length(tag) <= 50), -- ex: 'Programmation', 'IoT', 'Leadership'
  recorded_on date,
  duration text check (duration is null or char_length(duration) <= 30),
  thumb_url text,
  video_url text check (video_url is null or video_url ~* '^https://'),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  value text not null check (char_length(value) between 1 and 30),
  position int not null default 0
);

-- ---------- SITE PUBLIC ----------
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  description text check (description is null or char_length(description) <= 500),
  starts_on date not null,
  public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  description text check (description is null or char_length(description) <= 500),
  image_url text,
  source text default 'TS NEWS' check (source is null or char_length(source) <= 50),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  description text check (description is null or char_length(description) <= 500),
  image_url text,
  live_url text check (live_url is null or live_url ~* '^https://'),
  source_url text check (source_url is null or source_url ~* '^https://'),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- DEMANDES ET CANDIDATURES (insertion publique) ----------
create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  service text not null check (service in ('web','design','repair','iot','academy')),
  contact text check (contact is null or char_length(contact) <= 150),
  message text not null check (char_length(message) between 1 and 1500),
  status text not null default 'nouveau' check (status in ('nouveau','en_cours','traite','archive')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 100),
  email text check (email is null or char_length(email) <= 150),
  phone text check (phone is null or char_length(phone) <= 40),
  pole text check (pole in ('web','design','elec','market','iot','academy')),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'nouveau' check (status in ('nouveau','entretien','accepte','refuse')),
  created_at timestamptz not null default now()
);

-- ---------- INTERNE (réservé aux membres connectés) ----------
create table if not exists public.manual_sections (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  title text not null check (char_length(title) between 1 and 150),
  body text not null check (char_length(body) between 1 and 5000),
  published boolean not null default true
);

create table if not exists public.internal_links (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  label text not null check (char_length(label) between 1 and 100),
  url text not null check (url ~* '^https://')
);

-- ---------- JOURNAL D'ACTIVITÉ ----------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid,
  user_email text,
  table_name text,
  action text,
  row_id text
);

create or replace function public.log_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare rid text;
begin
  if tg_op = 'DELETE' then rid := to_jsonb(old)->>'id'; else rid := to_jsonb(new)->>'id'; end if;
  insert into public.audit_log (user_id, user_email, table_name, action, row_id)
  values (auth.uid(), (select email from public.profiles where id = auth.uid()), tg_table_name, tg_op, rid);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','academy_live','academy_videos','academy_stats',
                           'agenda_events','news','projects','manual_sections','internal_links'] loop
    execute format('drop trigger if exists audit_%1$s on public.%1$I', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I for each row execute function public.log_change()', t);
  end loop;
end $$;

drop trigger if exists audit_client_requests on public.client_requests;
create trigger audit_client_requests after update or delete on public.client_requests
  for each row execute function public.log_change();
drop trigger if exists audit_applications on public.applications;
create trigger audit_applications after update or delete on public.applications
  for each row execute function public.log_change();

-- ---------- DROITS D'ACCÈS (RLS) ----------
alter table public.profiles         enable row level security;
alter table public.academy_live     enable row level security;
alter table public.academy_videos   enable row level security;
alter table public.academy_stats    enable row level security;
alter table public.agenda_events    enable row level security;
alter table public.news             enable row level security;
alter table public.projects         enable row level security;
alter table public.client_requests  enable row level security;
alter table public.applications     enable row level security;
alter table public.manual_sections  enable row level security;
alter table public.internal_links   enable row level security;
alter table public.audit_log        enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.agenda_events, public.news, public.projects to anon;
grant insert on public.client_requests, public.applications to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_direction());
create policy profiles_update on public.profiles for update to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy live_read on public.academy_live for select to authenticated using (public.is_member());
create policy live_admin on public.academy_live for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy videos_read on public.academy_videos for select to authenticated
  using (public.is_member() and published);
create policy videos_admin on public.academy_videos for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy stats_read on public.academy_stats for select to authenticated using (public.is_member());
create policy stats_admin on public.academy_stats for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy manual_read on public.manual_sections for select to authenticated
  using (public.is_member() and published);
create policy manual_admin on public.manual_sections for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy links_read on public.internal_links for select to authenticated using (public.is_member());
create policy links_admin on public.internal_links for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy agenda_read on public.agenda_events for select to anon, authenticated using (public);
create policy agenda_admin on public.agenda_events for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy news_read on public.news for select to anon, authenticated using (published);
create policy news_admin on public.news for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy projects_read on public.projects for select to anon, authenticated using (published);
create policy projects_admin on public.projects for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy requests_insert on public.client_requests for insert to anon, authenticated
  with check (status = 'nouveau');
create policy requests_admin on public.client_requests for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy applications_insert on public.applications for insert to anon, authenticated
  with check (status = 'nouveau');
create policy applications_admin on public.applications for all to authenticated
  using (public.is_direction()) with check (public.is_direction());

create policy audit_read on public.audit_log for select to authenticated using (public.is_direction());

-- ---------- DONNÉES DE DÉPART (Manuel enrichi avec le Leadership & Formation) ----------
insert into public.academy_live (id) values (1) on conflict (id) do nothing;

insert into public.manual_sections (position, title, body) values
(1, 'I. Validation ''Stone-Prime''',
 'Tout déploiement de code en production, mise en ligne d''application ou modification majeure d''infrastructure requiert l''aval technique du pôle directionnel (Validation Stone-Prime). Aucun commit direct sur la branche principale sans revue préalable.'),
(2, 'II. Standards de Développement PWA & IoT',
 'Les applications et systèmes embarqués développés sous la bannière TS1 doivent impérativement respecter les standards de haute performance, de sécurité matérielle/logicielle et d''ergonomie mobile-first.'),
(3, 'III. Culture du Leadership et Management d''Équipe',
 'Chez Tech-Stone One, chaque membre est encouragé à développer son leadership. Que l''on pilote une petite équipe agile ou une grande structure, les maîtres-mots sont la responsabilité, l''écoute active, la transparence et l''accompagnement des talents pour grandir ensemble.'),
(4, 'IV. Sécurité des Données & Confidentialité',
 'L''utilisation de bases de données sécurisées est primordiale. Les clés d''API, identifiants et accès aux infrastructures ne doivent jamais être partagés sur des canaux non sécurisés.');

insert into public.internal_links (position, label, url) values
(1, 'Réunion d''équipe & Stratégie (Google Meet)', 'https://meet.google.com/hyj-bmzk-gzh'),
(2, 'Session TS1 Academy — Code & Leadership (Google Meet)', 'https://meet.google.com/amy-zcqj-ren');

insert into public.projects (title, description, image_url, live_url, source_url) values
('FilmsAll', 'Streaming pour le cinéma africain.', 'projets/filmsall.png',
 'https://filmsall.netlify.app', 'https://github.com/PIERRESTONE260/filmsall.git');