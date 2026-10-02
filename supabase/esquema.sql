-- Aula de Tu profe por el mundo · esquema de Supabase
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede ejecutar más de una vez sin romper nada.

-- 1. Progreso de cada alumno (un registro por alumno)
create table if not exists public.progreso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

alter table public.progreso enable row level security;

drop policy if exists "cada alumno ve su progreso" on public.progreso;
create policy "cada alumno ve su progreso" on public.progreso
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "cada alumno crea su progreso" on public.progreso;
create policy "cada alumno crea su progreso" on public.progreso
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "cada alumno actualiza su progreso" on public.progreso;
create policy "cada alumno actualiza su progreso" on public.progreso
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2. El alumno puede borrar su cuenta (y con ella su progreso) desde el aula
create or replace function public.borrar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;

-- 3. Material privado: solo lo abren alumnos con sesión iniciada
insert into storage.buckets (id, name, public)
values ('material', 'material', false)
on conflict (id) do nothing;

drop policy if exists "alumnos leen el material" on storage.objects;
create policy "alumnos leen el material" on storage.objects
  for select to authenticated using (bucket_id = 'material');

-- 4. Vista para Dana: alumnos, nivel y objetivo (se consulta desde el panel de Supabase, no desde la web)
create or replace view public.resumen_alumnos with (security_invoker = true) as
select
  u.email,
  u.raw_user_meta_data ->> 'nombre' as nombre,
  p.datos ->> 'goal' as objetivo,
  (array['A1','A2','B1','B2','C1','C2'])[(p.datos ->> 'target')::int + 1] as nivel_objetivo,
  case when (p.datos ->> 'level')::int < 0 then 'Inicio'
       else (array['A1','A2','B1','B2','C1','C2'])[(p.datos ->> 'level')::int + 1] end as nivel_actual,
  (p.datos ->> 'xp')::int as xp,
  p.actualizado as ultima_actividad
from auth.users u
left join public.progreso p on p.user_id = u.id;

revoke all on public.resumen_alumnos from anon, authenticated;

-- 5. Cambiar la contraseña de un alumno que la ha olvidado
--    (las direcciones usuario@tuprofeporelmundo.com sirven para entrar, no reciben correo).
--    Copia estas dos líneas en una consulta nueva, cambia el usuario y la contraseña, y pulsa Run:
-- update auth.users set encrypted_password = extensions.crypt('NuevaClave2026', extensions.gen_salt('bf'))
-- where email = 'jose.maria@tuprofeporelmundo.com';
