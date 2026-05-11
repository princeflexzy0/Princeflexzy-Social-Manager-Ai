-- 1. USERS TABLE
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  referrer text,
  created_at timestamp with time zone default now(),
  notified boolean default false,
  reminders_sent int default 0,
  active boolean default false
);

-- 2. POST QUEUE TABLE
create table if not exists post_queue (
  id uuid primary key default gen_random_uuid(),
  platform text,
  media_url text,
  caption text,
  priority int default 0,
  scheduled_at timestamp with time zone,
  status text default 'pending' check (status in ('pending', 'posted', 'failed')),
  retries int default 0,
  last_attempt_at timestamp with time zone
);

-- 3. ENGAGEMENTS TABLE
create table if not exists engagements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references post_queue(id) on delete cascade,
  platform text,
  likes int default 0,
  shares int default 0,
  comments int default 0,
  views int default 0,
  user_id uuid references users(id) on delete set null,
  reward_triggered boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. BLOGS TABLE
create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  image_urls text[],
  tags text[],
  created_at timestamp with time zone default now(),
  published boolean default false
);

-- 5. LOGGING TABLE (OPTIONAL)
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  level text,
  message text,
  meta jsonb,
  created_at timestamp with time zone default now()
);

-- 1. Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('reward', 'engagement', 'system', 'custom')) not null,
  title text not null,
  message text not null,
  data jsonb,
  read boolean default false,
  delivered boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Rewards Table
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  post_id uuid references post_queue(id) on delete cascade,
  reward_type text check (reward_type in ('silver', 'gold', 'viral')),
  amount numeric default 0,
  issued_at timestamp with time zone default now(),
  metadata jsonb,
  notified boolean default false
);

-- 3. Trigger Function
create or replace function handle_engagement_insert()
returns trigger as $$
declare
  total_engagements int;
begin
  total_engagements := new.likes + new.shares + new.comments + new.views;

  if total_engagements >= 100 and new.reward_triggered = false then

    update engagements
    set reward_triggered = true
    where id = new.id;

    insert into rewards (user_id, post_id, reward_type, amount)
    values (new.user_id, new.post_id, 'silver', 10);

  end if;

  return new;
end;
$$ language plpgsql;


-- ROLES AND PERMISSIONS
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- seed base roles/permissions (idempotent)
insert into roles (id, name, description)
select gen_random_uuid(), r.name, r.description
from (values
  ('admin','Full administrative access'),
  ('partner','Limited access to own data'),
  ('visitor','Captured user, minimal access')
) as r(name, description)
where not exists (select 1 from roles where name = r.name);

insert into permissions (id, code, description)
select gen_random_uuid(), p.code, p.description
from (values
  ('dashboard.view','View dashboard'),
  ('users.manage','Manage users'),
  ('bots.manage','Run and manage bots'),
  ('rewards.manage','Manage rewards'),
  ('posts.write','Create and schedule posts'),
  ('posts.read','Read posts queue'),
  ('settings.manage','Change system settings'),
  ('logs.read','Read system logs')
) as p(code, description)
where not exists (select 1 from permissions where code = p.code);

-- map admin to all permissions
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'admin'
and not exists (
  select 1 from role_permissions rp where rp.role_id = r.id and rp.permission_id = p.id
);

-- map partner minimal permissions
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'partner' and p.code in ('dashboard.view','posts.write','posts.read','logs.read')
and not exists (
  select 1 from role_permissions rp where rp.role_id = r.id and rp.permission_id = p.id
);
-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries on user_id and position
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_position ON leaderboard(position);
-- 4. Attach Trigger
drop trigger if exists engagement_reward_trigger on engagements;

create trigger engagement_reward_trigger
  after insert or update on engagements
  for each row
  execute procedure handle_engagement_insert();

create or replace function award_tokens_if_needed(
  input_post_id uuid,
  input_user_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  existing_reward rewards%rowtype;
  new_reward_id uuid;
begin
  -- Check if already rewarded
  select * into existing_reward
  from rewards
  where post_id = input_post_id
    and user_id = input_user_id;

  if found then
    return jsonb_build_object(
      'status', 'already rewarded',
      'reward_id', existing_reward.id
    );
  end if;

  -- Insert reward
  insert into rewards (
    user_id,
    post_id,
    reward_type,
    amount,
    metadata
  )
  values (
    input_user_id,
    input_post_id,
    'silver',
    10,
    jsonb_build_object('source', 'rpc_engagement')
  )
  returning id into new_reward_id;

  -- Send notification
  insert into notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  values (
    input_user_id,
    'reward',
    '🎉 You earned a reward!',
    'You passed the engagement threshold and received a silver reward.',
    jsonb_build_object(
      'post_id', input_post_id,
      'reward_id', new_reward_id,
      'amount', 10,
      'tier', 'silver'
    )
  );

  return jsonb_build_object(
    'status', 'reward issued',
    'reward_id', new_reward_id,
    'tier', 'silver',
    'amount', 10
  );
end;
$$;


-- ✅ 7. RLS POLICIES
-- USERS
alter table users enable row level security;
create policy "Allow insert with service role" on users
  for insert with check (auth.uid() is null);

-- POST_QUEUE
alter table post_queue enable row level security;
create policy "Allow insert with service role" on post_queue
  for insert with check (auth.uid() is null);

-- ENGAGEMENTS
alter table engagements enable row level security;
create policy "Allow insert with service role" on engagements
  for insert with check (auth.uid() is null);

-- BLOGS
alter table blogs enable row level security;

-- Allow service role full access
create policy "Allow all for service role" on blogs
  for all using (auth.role() = 'service_role');

-- Allow authenticated users to read published blogs
create policy "Allow read published for authenticated" on blogs
  for select using (
    auth.role() = 'authenticated' 
    and published = true
  );

-- Allow partners to read and update their own blogs
create policy "Allow partners own blogs" on blogs
  for all using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where r.name = 'partner'
      and ur.user_id = auth.uid()
    )
  );

-- POSTS
alter table posts enable row level security;

-- Allow service role full access
create policy "Allow all for service role" on posts
  for all using (auth.role() = 'service_role');

-- Allow partners to read and update their own posts
create policy "Allow partners own posts" on posts
  for all using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where r.name = 'partner'
      and ur.user_id = auth.uid()
    )
  );

-- Allow authenticated users to read non-pending posts
create policy "Allow read posted for authenticated" on posts
  for select using (
    auth.role() = 'authenticated' 
    and status = 'posted'
  );

-- POST_QUEUE (update existing policies)
drop policy if exists "Allow insert with service role" on post_queue;
create policy "Allow all for service role" on post_queue
  for all using (auth.role() = 'service_role');

create policy "Allow partners own queue" on post_queue
  for all using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where r.name = 'partner'
      and ur.user_id = auth.uid()
    )
  );

-- LANGUAGE FALLBACK FUNCTION
create or replace function get_content_in_language(
  content jsonb,                    -- The JSONB content field (metadata or extras)
  preferred_languages text[],       -- Array of preferred languages in order
  content_field text default 'text' -- The field name within the content to retrieve
) returns text as $$
declare
  lang text;
  fallback_text text;
begin
  -- Try each preferred language in order
  foreach lang in array preferred_languages loop
    if content->>'default_language' = lang then
      -- If content is in preferred language, return main content
      return content->>content_field;
    elsif content->'translations' ? lang then
      -- If translation exists for preferred language, return it
      return content->'translations'->lang->>content_field;
    end if;
  end loop;

  -- If no preferred language matches, fall back to default language
  fallback_text := content->>content_field;
  
  -- If content field is empty in default language, try to get any translation
  if fallback_text is null then
    select value->content_field
    into fallback_text
    from jsonb_each(content->'translations')
    where value->content_field is not null
    limit 1;
  end if;

  return fallback_text;
end;
$$ language plpgsql stable;

-- Example usage:
-- select get_content_in_language(
--   '{"text": "Hello", "default_language": "en", "translations": {"es": {"text": "Hola"}, "hi": {"text": "नमस्ते"}}}'::jsonb,
--   array['hi', 'es', 'en'],
--   'text'
-- );

-- LOGS
alter table logs enable row level security;
create policy "Allow insert with service role" on logs
  for insert with check (auth.uid() is null);


-- 1. Add columns if not already present
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 2. Enable Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if needed
DROP POLICY IF EXISTS "Allow insert with service key" ON users;
DROP POLICY IF EXISTS "Allow select with service key" ON users;
DROP POLICY IF EXISTS "Allow update with service key" ON users;
DROP POLICY IF EXISTS "Allow delete with service key" ON users;

-- 4. Insert policy: Allow only when using the service role (no auth.uid())
CREATE POLICY "Allow insert with service key"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- 5. Select policy: Allow service role to read
CREATE POLICY "Allow select with service key"
  ON users
  FOR SELECT
  USING (auth.uid() IS NULL);

-- 6. Update policy: Allow service role to update any row
CREATE POLICY "Allow update with service key"
  ON users
  FOR UPDATE
  USING (auth.uid() IS NULL)
  WITH CHECK (auth.uid() IS NULL);

-- 7. Delete policy: Allow service role to delete
CREATE POLICY "Allow delete with service key"
  ON users
  FOR DELETE
  USING (auth.uid() IS NULL);

-- Enable Row Level Security if not already
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


-- Allow SELECTs for all authenticated users
CREATE POLICY "Read users"
ON users
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow UPDATE for service_role
CREATE POLICY "Update users"
ON users
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow DELETE for service_role
CREATE POLICY "Delete users"
ON users
FOR DELETE
USING (auth.role() = 'service_role');



create table if not exists bot_status (
  id uuid primary key default gen_random_uuid(),
  bot_name text not null,
  last_run timestamp,
  status text default 'idle',
  last_error text,
  updated_at timestamp default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamp default now()
);

ALTER TABLE users
ADD COLUMN magic_token TEXT,
ADD COLUMN magic_token_expires TIMESTAMP;

-- Add language and geo preferences
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS geo_region TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS language_preferences TEXT[] DEFAULT ARRAY['en'];

-- Validate language preference is supported
ALTER TABLE users 
ADD CONSTRAINT valid_preferred_language 
CHECK (preferred_language = ANY(ARRAY['en','es','hi']));

-- Validate geo region is a valid country code (simplified check)
ALTER TABLE users 
ADD CONSTRAINT valid_geo_region 
CHECK (char_length(geo_region) = 2);

ALTER TABLE users ADD COLUMN IF NOT EXISTS reminders_sent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE;


create table if not exists generated_posts (
  id uuid primary key default gen_random_uuid(),
  platform text,
  caption text,
  media_prompt text,
  generated_by text default 'gpt-4',
  queued boolean default false,
  created_at timestamp with time zone default now()
);
-- Cache table for AI outputs (optional)
create table if not exists ai_outputs (
  id uuid primary key default gen_random_uuid(),
  platform text,
  prompt text,
  output text,
  created_at timestamp default now()
);

alter table blogs
  add column slug text unique,
  add column content_markdown text,
  add column content_html text,
  add column image_prompts text[],
  add column published_at timestamp with time zone,
  add column medium_url text,
  add column substack_url text,
  add column reddit_url text,
  add column gmb_url text,
  add column syndication_status jsonb default '{}'::jsonb;
  

  -- Add metadata JSONB if not exists
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Optional: Set a default structure for new rows (run once)
UPDATE blogs SET metadata = '{}' WHERE metadata IS NULL;

-- Add extras JSONB if not exists
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}';

-- Optional: Set a default structure for new rows
UPDATE blogs SET extras = '{}' WHERE extras IS NULL;

ALTER TABLE ai_outputs 
ALTER COLUMN output TYPE JSONB USING output::JSONB;


-- =====================================================
-- Multi-Language & Geo-Aware Support for Blogs & Posts
-- =====================================================

-- Copilot: Generate idempotent SQL to add JSONB columns 'metadata' and 'extras' to Supabase 'blogs' table, default '{}'. Migrate legacy 'title' to metadata.title.en if exists.
ALTER TABLE blogs 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}';

-- Migrate legacy 'title' to metadata.title.en if not already migrated (run once)
UPDATE blogs SET metadata = jsonb_set(coalesce(metadata, '{}'), '{title,en}', to_jsonb(title)) WHERE title IS NOT NULL AND (metadata IS NULL OR NOT (metadata ? 'title'));

-- Copilot: Generate idempotent SQL to create 'posts' table in Supabase with UUID id, platform, media_prompt, scheduled_at, status default 'pending', metadata JSONB, extras JSONB. If exists, add metadata/extras JSONB.
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  media_prompt TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  metadata JSONB DEFAULT '{}',
  extras JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add metadata/extras JSONB columns to posts if not exists (for legacy tables)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}';

-- Migrate legacy 'caption' to metadata.caption.en if present (run once)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='caption') THEN
    UPDATE posts SET metadata = jsonb_set(coalesce(metadata, '{}'), '{caption,en}', to_jsonb(caption)) WHERE caption IS NOT NULL;
  END IF;
END $$;

-- Add metadata JSONB if not exists
ALTER TABLE post_queue
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add extras JSONB if not exists
ALTER TABLE post_queue
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}';

-- Optional: Migrate legacy caption to metadata if exists (run once if old data)
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS caption TEXT;  -- If legacy
UPDATE post_queue SET metadata = jsonb_set(metadata, '{caption, en}', to_jsonb(caption)) WHERE caption IS NOT NULL;
create or replace function get_platform_engagement_stats()
returns table (
  platform text,
  total_likes int,
  total_shares int,
  total_views int,
  total_comments int
) as $$
begin
  return query
  select
    e.platform::text,
    sum(e.likes)::int,
    sum(e.shares)::int,
    sum(e.views)::int,
    sum(e.comments)::int
  from engagements e
  group by e.platform;
end;
$$ language plpgsql;




create or replace function get_reward_stats_by_type()
returns table (
  reward_type text,
  total_rewards int,
  total_amount numeric
) as $$
begin
  return query
  select
    r.reward_type,
    count(*)::int as total_rewards,
    sum(r.amount)::numeric as total_amount
  from rewards r
  group by r.reward_type;
end;
$$ language plpgsql;


create or replace function top_engaged_users()
returns table (
  user_id uuid,
  total_likes int,
  total_shares int,
  total_comments int,
  total_views int,
  total_engagement int
) as $$
begin
  return query
  select
    e.user_id,
    sum(e.likes)::int,
    sum(e.shares)::int,
    sum(e.comments)::int,
    sum(e.views)::int,
    (sum(e.likes + e.shares + e.comments + e.views))::int as total_engagement
  from engagements e
  where e.user_id is not null
  group by e.user_id
  order by total_engagement desc
  limit 10;
end;
$$ language plpgsql;
