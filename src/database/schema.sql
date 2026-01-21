-- NIGEL MVP Schema
-- Note: Store all timestamps in UTC (TIMESTAMPTZ)

create extension if not exists vector;

-- Phoenix timezone helper
create or replace function phoenix_date(ts timestamptz default now())
returns date
language sql
stable
as $$
  select (ts at time zone 'America/Phoenix')::date;
$$;

create table if not exists users (
  id bigint generated always as identity primary key,
  discord_user_id bigint not null unique,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_stats (
  user_id bigint primary key references users(id) on delete cascade,
  points int not null default 0,
  experience int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id bigint generated always as identity primary key,
  name text not null,
  source text,
  doc_type text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chunks (
  id bigint generated always as identity primary key,
  document_id bigint not null references documents(id) on delete cascade,
  section text,
  content text not null,
  framework_tags text[] not null default '{}',
  token_count int,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id bigint generated always as identity primary key,
  question_text text not null,
  answer_text text,
  options jsonb,
  correct_option_index int,
  question_type text not null default 'drill',
  difficulty int,
  framework_tags text[] not null default '{}',
  source_document_id bigint references documents(id),
  is_active boolean not null default true,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  session_type text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists attempts (
  id bigint generated always as identity primary key,
  session_id bigint references sessions(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  question_id bigint not null references questions(id) on delete cascade,
  answer_text text,
  is_correct boolean not null default false,
  points_awarded int not null default 0,
  response_time_ms int,
  created_at timestamptz not null default now()
);

create table if not exists authority_entries (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  entry_date date not null,
  scores jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists authority_streaks (
  user_id bigint primary key references users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_entry_date date,
  updated_at timestamptz not null default now()
);

create table if not exists period_scores (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  period_type text not null,
  period_start date not null,
  period_end date not null,
  points int not null default 0,
  rank int,
  created_at timestamptz not null default now(),
  unique (user_id, period_type, period_start)
);

create table if not exists badges (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  description text,
  icon text,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_badges (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  badge_id bigint not null references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists events (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  status text not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists users_discord_user_id_idx on users (discord_user_id);

create index if not exists documents_name_idx on documents (name);
create index if not exists documents_created_at_idx on documents (created_at);

create index if not exists chunks_document_id_idx on chunks (document_id);
create index if not exists chunks_framework_tags_gin on chunks using gin (framework_tags);
create index if not exists chunks_embedding_ivfflat
  on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists questions_active_idx on questions (is_active);
create index if not exists questions_framework_tags_gin on questions using gin (framework_tags);
create index if not exists questions_difficulty_idx on questions (difficulty);

create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_started_at_idx on sessions (started_at);

create index if not exists attempts_user_id_idx on attempts (user_id);
create index if not exists attempts_question_id_idx on attempts (question_id);
create index if not exists attempts_session_id_idx on attempts (session_id);
create index if not exists attempts_created_at_idx on attempts (created_at);

create index if not exists authority_entries_user_id_idx on authority_entries (user_id);
create index if not exists authority_entries_entry_date_idx on authority_entries (entry_date);

create index if not exists period_scores_period_idx on period_scores (period_type, period_start);

create index if not exists user_badges_user_id_idx on user_badges (user_id);

create index if not exists events_status_idx on events (status);
create index if not exists events_starts_at_idx on events (starts_at);
