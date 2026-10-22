-- Reseñas de las clases (estrellas y comentario).
-- Cualquiera con el enlace tuprofeporelmundo.com/opinar puede enviar una, pero entra como pendiente.
-- Solo se ven en la web las que Dana aprueba. El correo nunca se publica.
--
-- Se ejecuta una sola vez en Supabase → SQL Editor.
-- Para aprobar: Supabase → Table Editor → resenas → marcar la casilla «aprobada» y guardar.
-- Para retirar una ya publicada: desmarcar «aprobada» (o borrar la fila si la persona lo pide).

create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  creada timestamptz not null default now(),
  estrellas smallint not null check (estrellas between 1 and 5),
  comentario text not null check (char_length(comentario) between 10 and 1000),
  nombre text not null check (char_length(nombre) between 2 and 60),
  pais text check (char_length(pais) <= 60),
  clase text not null check (clase in ('espanol', 'apoyo')),
  nivel text check (char_length(nivel) <= 40),
  email text not null check (char_length(email) between 5 and 200 and email like '%_@_%'),
  idioma text check (idioma in ('es', 'en', 'fr')),
  aprobada boolean not null default false
);

alter table public.resenas enable row level security;

-- La web solo puede escribir estas columnas (no puede marcar «aprobada») y solo puede leer las públicas (nunca el correo).
revoke all on public.resenas from anon, authenticated;
grant insert (estrellas, comentario, nombre, pais, clase, nivel, email, idioma) on public.resenas to anon, authenticated;
grant select (id, creada, estrellas, comentario, nombre, pais, clase, nivel) on public.resenas to anon, authenticated;

drop policy if exists "cualquiera envia una resena pendiente" on public.resenas;
create policy "cualquiera envia una resena pendiente" on public.resenas
  for insert to anon, authenticated with check (aprobada = false);

drop policy if exists "se ven las resenas aprobadas" on public.resenas;
create policy "se ven las resenas aprobadas" on public.resenas
  for select to anon, authenticated using (aprobada = true);

-- Reseñas pendientes, las más nuevas primero (para revisarlas desde el SQL Editor):
-- select creada, estrellas, nombre, clase, email, comentario from public.resenas where not aprobada order by creada desc;
