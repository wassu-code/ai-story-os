create extension if not exists pgcrypto;
create table if not exists projects (id uuid primary key default gen_random_uuid(), title text not null, genre text not null, status text not null default 'active', created_at timestamptz not null default now());
create table if not exists characters (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, name text not null, age int, appearance jsonb default '{}'::jsonb, personality jsonb default '{}'::jsonb, speech_style text, fixed_prompt text, negative_prompt text, created_at timestamptz not null default now());
create table if not exists world_states (id uuid primary key default gen_random_uuid(), project_id uuid unique references projects(id) on delete cascade, location text, current_time text, character_state jsonb default '{}'::jsonb, current_goal text, current_problem text, known_facts jsonb default '[]'::jsonb, unresolved_threads jsonb default '[]'::jsonb, updated_at timestamptz not null default now());
create table if not exists episodes (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, episode_number int not null, previous_episode_id uuid references episodes(id), summary text, selected_branch text, status text not null default 'DRAFT', created_at timestamptz not null default now(), published_at timestamptz, unique(project_id,episode_number));
create table if not exists branches (id uuid primary key default gen_random_uuid(), episode_id uuid references episodes(id) on delete cascade, branch_code text not null check(branch_code in ('A','B','C')), title text not null, description text, tension_score int, continuity_score int, performance_score int, ai_score int, selected boolean not null default false, unique(episode_id,branch_code));
create table if not exists contents (id uuid primary key default gen_random_uuid(), episode_id uuid unique references episodes(id) on delete cascade, hook text, script text, choice_a text, choice_b text, caption text, image_prompt text, video_prompt text, image_url text, video_url text, generation_version int not null default 1, status text not null default 'draft');
create table if not exists posts (id uuid primary key default gen_random_uuid(), content_id uuid references contents(id) on delete cascade, platform text not null check(platform in ('instagram','tiktok')), platform_post_id text, published_at timestamptz, status text not null default 'pending');
create table if not exists metrics (id uuid primary key default gen_random_uuid(), post_id uuid references posts(id) on delete cascade, views int default 0, likes int default 0, comments int default 0, shares int default 0, saves int default 0, votes_a int default 0, votes_b int default 0, participation_rate numeric(7,3), share_rate numeric(7,3), collected_at timestamptz not null default now());
create index if not exists idx_episode_status on episodes(status);
create index if not exists idx_metrics_post on metrics(post_id,collected_at desc);

-- v0.2 bootstrap seed (run once after schema creation)
insert into projects (title, genre)
select 'AI STORY Demo', 'mystery'
where not exists (select 1 from projects where title = 'AI STORY Demo');

-- Security note: v0.2 performs privileged mutations only from server routes using
-- SUPABASE_SERVICE_ROLE_KEY. Do not expose that key to client-side code.

-- v0.3 integrity guards
alter table episodes drop constraint if exists episodes_status_check;
alter table episodes add constraint episodes_status_check check (status in ('DRAFT','WAITING_DECISION','SELECTED','GENERATING','READY','APPROVED','PUBLISHED','COLLECTING','ANALYZED','COMPLETED'));
alter table branches drop constraint if exists branches_tension_score_check;
alter table branches add constraint branches_tension_score_check check (tension_score is null or tension_score between 1 and 5);
alter table branches drop constraint if exists branches_ai_score_check;
alter table branches add constraint branches_ai_score_check check (ai_score is null or ai_score between 0 and 100);
