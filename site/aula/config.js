/* Configuración del aula.
   Mientras supabaseUrl esté vacío, el aula funciona SIN cuenta: el progreso se guarda solo en el navegador del alumno.
   Cuando exista el proyecto de Supabase, se rellenan estos dos datos (están en Supabase → Project Settings → API).
   La "anon key" es pública por diseño: la seguridad la ponen las reglas (RLS) de supabase/esquema.sql. */
window.AULA_CONFIG={
  supabaseUrl:'https://csnofemrppaqnnwirusx.supabase.co',
  supabaseKey:'sb_publishable_q1Sx5pe8Klw8T6UA11r5MA_d0oclgYt',
  email:'contacto@tuprofeporelmundo.com'
};
