-- Cierra el material del aula: solo lo abren los alumnos a los que Dana da acceso.
-- Pegar entero en Supabase → SQL Editor → New query → Run. Se puede ejecutar más de una vez.
create table if not exists public.acceso_material (
  email text primary key,
  anadido timestamptz not null default now()
);
alter table public.acceso_material enable row level security;

drop policy if exists "cada alumno ve su acceso" on public.acceso_material;
create policy "cada alumno ve su acceso" on public.acceso_material
  for select to authenticated using (lower(email) = lower((select auth.jwt() ->> 'email')));

drop policy if exists "alumnos leen el material" on storage.objects;
create policy "alumnos leen el material" on storage.objects
  for select to authenticated using (
    bucket_id = 'material'
    and exists (select 1 from public.acceso_material a where lower(a.email) = lower((select auth.jwt() ->> 'email')))
  );

-- Después, da acceso a cada alumno con clases (cambia el usuario):
-- insert into public.acceso_material (email) values ('jose.maria@tuprofeporelmundo.com');
