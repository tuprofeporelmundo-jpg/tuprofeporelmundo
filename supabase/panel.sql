-- Panel de la profesora (tuprofeporelmundo.com/aula/panel/)
-- Deja que las cuentas de la tabla «profes» vean el progreso de todos los alumnos. Nadie más puede.
-- Se ejecuta una sola vez en Supabase → SQL Editor. Antes de pulsar Run, cambia el usuario de la última línea
-- por el tuyo del aula (el que usas para entrar en Mi aula).

create table if not exists public.profes (
  email text primary key
);
alter table public.profes enable row level security;
revoke all on public.profes from anon, authenticated;

create or replace function public.panel_alumnos()
returns table (email text, nombre text, actualizado timestamptz, datos jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profes p where lower(p.email) = lower(auth.jwt() ->> 'email')) then
    raise exception 'sin permiso';
  end if;
  return query
    select u.email::text, (u.raw_user_meta_data ->> 'nombre')::text, p.actualizado, p.datos
    from auth.users u
    left join public.progreso p on p.user_id = u.id
    where lower(u.email) not in (select lower(x.email) from public.profes x)
    order by p.actualizado desc nulls last;
end;
$$;

revoke all on function public.panel_alumnos() from public, anon;
grant execute on function public.panel_alumnos() to authenticated;

-- Tu usuario del aula (cámbialo si no es este):
insert into public.profes (email) values ('dana@tuprofeporelmundo.com') on conflict do nothing;
