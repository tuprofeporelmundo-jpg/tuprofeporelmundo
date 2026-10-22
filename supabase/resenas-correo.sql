-- Aviso por correo de cada reseña nueva, con enlace para publicarla o descartarla.
-- Se ejecuta una sola vez en Supabase → SQL Editor, DESPUÉS de resenas.sql y de que la web con la
-- función «resena-nueva» esté publicada.
--
-- Cómo funciona:
--  1. Cada reseña lleva un «token» secreto que la web no puede leer.
--  2. Al llegar una reseña nueva, la base de datos avisa a la web (función resena-nueva), que te manda el correo.
--  3. El correo lleva un enlace a tuprofeporelmundo.com/aprobar con el id y el token de esa reseña.
--     Solo quien tiene ese enlace puede publicarla o descartarla. Esa página pide confirmar con un botón.

alter table public.resenas add column if not exists token uuid not null default gen_random_uuid();
-- No se concede ningún permiso sobre «token» a la web: ni leerlo ni escribirlo.

-- Devuelve una reseña solo si el token coincide (para el correo y para la página de aprobar).
create or replace function public.resena_para_correo(p_id uuid, p_token uuid)
returns table (id uuid, creada timestamptz, estrellas smallint, comentario text, nombre text, pais text,
               clase text, nivel text, email text, idioma text, aprobada boolean)
language sql security definer set search_path = public as $$
  select r.id, r.creada, r.estrellas, r.comentario, r.nombre, r.pais, r.clase, r.nivel, r.email, r.idioma, r.aprobada
  from public.resenas r where r.id = p_id and r.token = p_token;
$$;

-- Publica o descarta una reseña, solo con el token correcto.
create or replace function public.moderar_resena(p_id uuid, p_token uuid, p_accion text)
returns text
language plpgsql security definer set search_path = public as $$
begin
  if p_accion = 'aprobar' then
    update public.resenas set aprobada = true where id = p_id and token = p_token;
    return case when found then 'aprobada' else 'no_encontrada' end;
  elsif p_accion = 'descartar' then
    delete from public.resenas where id = p_id and token = p_token;
    return case when found then 'descartada' else 'no_encontrada' end;
  end if;
  return 'accion_invalida';
end;
$$;

revoke all on function public.resena_para_correo(uuid, uuid) from public;
revoke all on function public.moderar_resena(uuid, uuid, text) from public;
grant execute on function public.resena_para_correo(uuid, uuid) to anon, authenticated;
grant execute on function public.moderar_resena(uuid, uuid, text) to anon, authenticated;

-- Aviso a la web cada vez que entra una reseña. Si el aviso fallara, la reseña se guarda igualmente.
create extension if not exists pg_net with schema extensions;

create or replace function public.avisar_resena_nueva()
returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  begin
    perform net.http_post(
      url := 'https://tuprofeporelmundo.com/.netlify/functions/resena-nueva',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('id', new.id, 'token', new.token)
    );
  exception when others then
    null;
  end;
  return new;
end;
$$;

drop trigger if exists resena_nueva_aviso on public.resenas;
create trigger resena_nueva_aviso after insert on public.resenas
  for each row execute function public.avisar_resena_nueva();
