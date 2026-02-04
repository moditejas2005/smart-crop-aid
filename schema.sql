-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  phone text,
  role text check (role in ('farmer', 'admin')) default 'farmer',
  location text,
  farm_size numeric,
  farm_location jsonb,
  profile_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  last_active timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Crops Table
create table if not exists public.crops (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  crop_name text not null,
  variety text,
  planting_date date,
  expected_harvest_date date,
  actual_harvest_date date,
  status text check (status in ('recommended', 'planted', 'growing', 'harvested', 'failed')) default 'planted',
  area numeric,
  location jsonb,
  soil_type text,
  irrigation_type text,
  notes text,
  yield_amount numeric,
  yield_unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Pest Reports Table (Linked to Images)
create table if not exists public.pest_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  crop_id uuid references public.crops(id) on delete set null,
  image_url text not null,
  pest_name text,
  confidence numeric,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  description text,
  ai_analysis text, -- JSON string
  treatment_recommended text,
  treatment_applied text,
  treatment_status text check (treatment_status in ('pending', 'in_progress', 'completed')) default 'pending',
  location jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Chat Messages Table
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  message text not null,
  is_user boolean default true,
  ai_model text,
  feedback text check (feedback in ('helpful', 'not_helpful')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Market Prices (Optional/Shared)
create table if not exists public.market_prices (
  id uuid default uuid_generate_v4() primary key,
  crop_name text not null,
  variety text,
  price numeric not null,
  unit text not null,
  market_name text,
  location text,
  region text,
  date date default now(),
  trend text check (trend in ('up', 'down', 'stable')),
  change_percentage numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Notifications
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('weather', 'pest', 'price', 'crop', 'system')),
  read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Storage Buckets Setup (You must create 'pest-images' in dashboard, but policies can be added here)
insert into storage.buckets (id, name, public) values ('pest-images', 'pest-images', true)
on conflict do nothing;

-- RLS Policies (Safe Re-run)
alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

alter table public.pest_reports enable row level security;

drop policy if exists "Users can view own reports" on public.pest_reports;
create policy "Users can view own reports" on public.pest_reports for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own reports" on public.pest_reports;
create policy "Users can insert own reports" on public.pest_reports for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own reports" on public.pest_reports;
create policy "Users can update own reports" on public.pest_reports for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own reports" on public.pest_reports;
create policy "Users can delete own reports" on public.pest_reports for delete using (auth.uid() = user_id);

alter table public.chat_messages enable row level security;

drop policy if exists "Users can view own chats" on public.chat_messages;
create policy "Users can view own chats" on public.chat_messages for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own chats" on public.chat_messages;
create policy "Users can insert own chats" on public.chat_messages for insert with check (auth.uid() = user_id);

-- New Policies for Crops
alter table public.crops enable row level security;

drop policy if exists "Users can view own crops" on public.crops;
create policy "Users can view own crops" on public.crops for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own crops" on public.crops;
create policy "Users can insert own crops" on public.crops for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own crops" on public.crops;
create policy "Users can update own crops" on public.crops for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own crops" on public.crops;
create policy "Users can delete own crops" on public.crops for delete using (auth.uid() = user_id);

-- New Policies for Notifications
alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- New Policies for Market Prices
alter table public.market_prices enable row level security;

-- Everyone can view market prices
drop policy if exists "Market prices are viewable by everyone" on public.market_prices;
create policy "Market prices are viewable by everyone" on public.market_prices for select using (true);

-- Only admins can insert/update (Assuming admin role logic or restricted via app logic, but for now blocking direct inserts from normal users)
-- Note: 'admin' check relies on custom claim or separate table lookup which might be complex here. 
-- For simplicity, we disable insert/update foranon/authenticated users via API unless they have specific logic, 
-- or we can trust the 'role' column in users table using a wrapper function, but that is heavy.
-- Best practice: Disable insert/update for now, only allow via service role (backend scripts).

-- Verify
select 'Tables created successfully' as status;
