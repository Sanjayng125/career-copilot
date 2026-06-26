-- Users table
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Resumes table
create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users on delete cascade,
  file_name text,
  file_path text,
  parsed_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Applications table
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users on delete cascade,
  source text check (source in ('search', 'manual')),
  job_title text,
  company text,
  location text,
  apply_url text,
  status text default 'saved' check (status in ('saved', 'applied', 'interview', 'offer', 'rejected')),
  fit_score int,
  matched_skills text[],
  missing_skills text[],
  ai_summary text,
  tailored_resume text,
  cover_letter text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Unique constraints
alter table resumes add constraint resumes_user_id_key unique (user_id);

-- RLS
alter table users enable row level security;
alter table resumes enable row level security;
alter table applications enable row level security;

-- Policies
create policy "Users can manage own data"
  on users for all
  using (auth.uid() = id);

create policy "Users can manage own resumes"
  on resumes for all
  using (auth.uid() = user_id);

create policy "Users can manage own applications"
  on applications for all
  using (auth.uid() = user_id);

-- Storage bucket policies
create policy "Users can upload their own resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own resume"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
  