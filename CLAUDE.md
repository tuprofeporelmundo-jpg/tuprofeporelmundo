# Tu profe por el mundo · Traspaso del proyecto a Claude Code

> **Cómo empezar (para Dana):** descomprime `tu-profe-por-el-mundo-proyecto.zip`, abre Claude Code dentro de esa carpeta y pega esto:
>
> *"Lee CLAUDE.md entero y continúa el proyecto desde la Fase 1. Háblame en español, paso a paso y sin tecnicismos. Pregúntame antes de crear cuentas, pagar algo o publicar."*

---

## 0. Estado actual (actualizar en cada sesión)

- **Repositorio GitHub público** `tuprofeporelmundo-jpg/tuprofeporelmundo`. La web nueva está en la rama `claude/new-session-irdk25` (en `main` sigue la web antigua; Dana aún no ha autorizado pasarla a `main`). `materiales-venta/` está en `.gitignore`: los PDF de pago no se suben nunca.
- **Netlify:** cuenta creada por Dana (equipo "tuprofeporelmundo"). Proyecto `tuprofeporelmundo` → **tuprofeporelmundo.netlify.app**, conectado a GitHub y publicando desde la rama `claude/new-session-irdk25`. Form detection activado; formularios `reserva` y `newsletter` detectados. Pendiente: confirmar que pulsó "Make public" y activar avisos por correo de los formularios.
- **Dominio:** `tuprofeporelmundo.com` (Porkbun). Pendiente: añadirlo en Netlify (www como principal) y cambiar el DNS en Porkbun.
- **Acceso automático (opción B elegida por Dana):** Claude lo hará por API con las variables de entorno `NETLIFY_AUTH_TOKEN`, `PORKBUN_API_KEY` y `PORKBUN_SECRET_API_KEY`, con `api.netlify.com` y `api.porkbun.com` permitidos en la red del entorno. Antes de cambiar DNS: listar los registros, enseñárselos a Dana y **no tocar MX ni TXT (SPF)**. Después de terminar, recordarle que borre o caduque las claves.

- **Auditoría (2 oct 2026):** informe completo en la carpeta del proyecto (`auditoria/`). Hecho: texto en español escrito en el HTML (el JS solo traduce), `og.png` 1200×630, `robots.txt`, `sitemap.xml`, cabeceras de seguridad con CSP en `netlify.toml` (si se añade un servicio externo, hay que permitirlo ahí), correo visible `contacto@tuprofeporelmundo.com` (reenvía al Gmail), asistente protegido por origen y límite de uso. El material del aula queda solo para alumnos de `public.acceso_material` (`supabase/cerrar-material.sql`, lo ejecuta Dana). Datos legales de Dana rellenados el 2 oct 2026.

## 1. Quién es la clienta y cómo trabajar con ella

- **Dana Salgado**, profesora online de **español para extranjeros (A1–C1)** y de **apoyo escolar (primaria y ESO)**. Es de Galdakao (Bizkaia). Ha dado clase en Asturias, Granada, Bilbao y alrededores, y tres años en colegios españoles de Tánger y Rabat. Lleva más de 10 años con clases particulares y ha preparado pruebas de español de distintos niveles.
- Marca: **Tu profe por el mundo** · Instagram **@daanaa.salgado** · hashtag **#tuprofeporelmundo** · correo actual **tuprofeporelmundo@gmail.com**.
- Su método es el argumento central: **no usa un método cerrado**, analiza las necesidades y objetivos de cada alumno y diseña el sistema que mejor le encaja.
- **No es técnica.** Explícale todo en español, con pasos cortos y concretos. Antes de cualquier acción con coste, cuentas externas, pagos o publicación, **pide su confirmación**.
- No inventes datos sobre ella (testimonios, titulaciones, número de alumnos). Si falta algo, pregúntaselo.

## 2. Estructura de la carpeta

```
tu-profe-por-el-mundo/
├── CLAUDE.md                  ← este documento
├── netlify.toml               ← configuración de Netlify (publica /site, funciones en /netlify/functions)
├── site/                      ← LO ÚNICO QUE SE PUBLICA
│   ├── index.html             ← toda la web (HTML + CSS + JS en un único archivo)
│   └── regalo/50-expresiones-tu-profe-por-el-mundo.pdf   ← regalo gratuito (público)
├── netlify/functions/chat.mjs ← asistente con IA (Anthropic API); desactivado hasta tener clave
└── materiales-venta/          ← 7 PDF de pago (sesión + solucionario). ¡NUNCA dentro de /site!
```

> ⚠️ Los PDF de `materiales-venta/` se venden a 3 €. Si se copian a `/site` quedarían descargables gratis. Se suben solo a la plataforma de pago.

## 3. Estado actual de la web (`site/index.html`)

Web de una sola página, **trilingüe (ES/EN/FR)**, con selector de idioma, modo oscuro y diseño adaptado al móvil. Es una versión de vista previa publicada en Claude; **todavía no está en el dominio de Dana**.

**Secciones, en orden:** portada con ficha de profesora · Clases (español y apoyo) · Sobre mí · Mi método (4 pasos) · Instagram con postal "frase del día" · **Reto del día** (ahorcado) · **Regalo** (PDF + newsletter) · **Tienda** (7 PDF a 3 €) · **Tarifas** y condiciones · **Horarios** (calendario por zona horaria y petición especial) · Preguntas frecuentes · **Reserva** (formulario) · pie con textos legales · botón flotante del **asistente**.

**Estilo (decidido por Dana, mantener):** tonos marrones y nude, verdes de selva y flores (frangipani de Ko Tao, hojas tropicales). Títulos con serifa del sistema. Variables CSS en `:root`: `--jungle` (#6B4433, color principal), `--flower` (#D98C7E), `--leaf` (#5E7A55), `--ochre` (#C4936B), etc. Las flores y hojas son símbolos SVG (`#fl`, `#fl2`, `#lf`, `#lf2`) reutilizados con `<use>`.

**Cómo está organizado el JS (todo dentro de `index.html`):**
- `T` = textos en `es`, `en`, `fr`. Los elementos usan `data-i18n="clave"` (y `data-i18n-ph` en los placeholders). **Toda clave nueva debe existir en los tres idiomas.**
- `PRODUCTS` = tienda (cada producto tiene un campo `url:""` para su enlace de pago; si está vacío, el botón abre un correo de pedido).
- `SCHEDULE` = horario (hora de España, `Europe/Madrid`): martes a jueves de 15:00 a 00:00; `busy` = clases fijas; `extra` = reservas puntuales `'AAAA-MM-DD HH'`.
- `WORDS` = 61 palabras del reto diario (el reto nº 1 es el 1 de octubre de 2026).
- `KB` = respuestas fijas del asistente; `CHAT_ENDPOINT=''` → con IA, poner `'/.netlify/functions/chat'`.
- Formularios Netlify: `reserva` (con subida de archivos) y `newsletter`. Si el envío falla, se abre el correo del visitante con los datos ya escritos.
- Almacenamiento local (exento de consentimiento, ya declarado en la política de cookies): `tppm-lang`, `tppm-tz`, `tppm-reto`.
- Plantillas legales `<template id="lg-aviso|lg-privacidad|lg-cookies|lg-condiciones|lg-desistimiento">` que se abren en un `<dialog>`. Los datos que faltan están marcados con `<span class="todo">`.

## 4. Datos del negocio (fuente de verdad)

**Tarifas** (iguales para español y apoyo escolar, sesiones de 1 h; precios finales):
- **Primera clase de 30 min: 15 €.** Si compra un bono en los 30 días siguientes, se descuentan. ❌ **Dana no quiere ninguna clase gratuita.**
- Clase suelta: 30 € · Bono de 5 clases: 125 € (válido 3 meses) · Bono de 10 clases: 220 € (válido 6 meses).
- Grupos: pareja 20 €/persona/h · grupo de 3-4 personas 17 €/persona/h · grupo con mensualidad 15 €/persona/h. Mínimo 3 alumnos: si un grupo baja a 2, se aplica la tarifa de pareja.
- Por cada alumno de grupo, Dana paga **5 € a su compañera** (dato interno, no se publica).

**Condiciones:** pago siempre por adelantado (mensualidades de grupo en la primera semana del mes); transferencia, Bizum o tarjeta. Cambios o cancelaciones con **24 h** de antelación; si el alumno avisa más tarde o **no se conecta en 10 minutos**, la clase cuenta. Si cancela Dana, se recupera la clase o se devuelve el importe. En los grupos, quien falta recibe el material. Se mantiene el derecho de desistimiento de 14 días.

**Horario y clases fijas (hora de España):** martes y jueves 17-18 (español B1) · martes y jueves 18-19 (apoyo de inglés) · jueves 19-21 (grupo de español A2) · martes y jueves 20-21 (apoyo de matemáticas, 2º ESO) · martes 23-00 (apoyo de lengua). Las dos últimas **no están en su Google Calendar**: confirmar con ella si se añaden.

## 5. Reglas que no se pueden romper

1. **Legal (España/UE):** RGPD, LOPDGDD, LSSI-CE y TRLGDCU. No añadir analítica, píxeles, vídeos incrustados ni fuentes de terceros sin un **banner de consentimiento previo** y sin actualizar la política de cookies. Todo formulario nuevo necesita información básica de protección de datos y casilla de consentimiento si procede. La web trata **datos de menores** (apoyo escolar): minimizar datos y exigir que reserve un adulto o su representante legal.
2. **Tres idiomas siempre sincronizados.**
3. **Accesibilidad y móvil:** contraste correcto, `aria-label` en los botones con icono y prueba a 390 px de ancho.
4. **Probar antes de dar algo por hecho:** abrir la web con Playwright (o similar) en ES/EN/FR, en modo claro y oscuro y en móvil, y revisar la consola sin errores.
5. No inventar testimonios, cifras ni titulaciones.

## 6. Plan de trabajo

### Fase 1 · Publicar en su dominio (prioridad)
1. Pregunta a Dana **el nombre exacto de su dominio** (registrado en **Porkbun**).
2. `git init` y primer commit.
3. Netlify: `npx netlify-cli login` (lo autoriza ella en el navegador) → `npx netlify-cli init` o `deploy --prod`. Comprueba que se publican `site/` y la función, y activa **Form detection** en el panel de Netlify (Forms).
4. Dominio: en Netlify, añade `www.SU-DOMINIO` como principal. En Porkbun (lo hace ella, o tú con la API de Porkbun si te da las claves): borra el ALIAS de aparcamiento a `pixie.porkbun.com` y el CNAME `*`; crea un **ALIAS** en el dominio sin www hacia `apex-loadbalancer.netlify.com` y un **CNAME** `www` hacia `SITIO.netlify.app`. **No tocar los registros MX ni el TXT del SPF.** Activa el HTTPS.
5. Verifica: reserva de prueba con archivo, alta en la newsletter y descarga del regalo.

### Fase 2 · Correo oficial
1. Propuestas que gustaron: `postal@`, `hola@`, `profe@`, `dana@`. Que elija una.
2. En Porkbun → Email Forwarding: reenviar a `tuprofeporelmundo@gmail.com`. En Gmail → "Enviar como" con SMTP `smtp.gmail.com:587` TLS y contraseña de aplicación (requiere verificación en dos pasos).
3. DNS: añade `include:_spf.google.com` al SPF existente (sin crear un segundo SPF) y un TXT `_dmarc` con `v=DMARC1; p=none`.
4. Sustituye `tuprofeporelmundo@gmail.com` en toda la web (constante `EMAIL`, textos, plantillas legales, JSON-LD, `KB`) por la dirección nueva, salvo donde convenga mantener el Gmail.

### Fase 3 · Lo que tiene que aportar Dana (pídeselo)
- **Foto** → sustituye la "D" de `.avatar` (portada) y de `.photo` (Sobre mí). Optimízala (WebP de unos 800 px), con `alt` descriptivo.
- **3-4 testimonios reales** (nombre, país, nivel y frase, con permiso) → nueva sección después de "Mi método".
- **Nombre completo, NIF y dirección** → rellenar los `<span class="todo">` de las plantillas legales.
- **Experiencia con el DELE o el CCSE / titulaciones** → si la tiene, crear una sección de especialidad (por ejemplo, "DELE A2 + CCSE para la nacionalidad").
- **Vídeo de presentación** (60-90 s) → alojarlo en el propio dominio, no incrustarlo de YouTube (cookies).
- Decidir: la frase "Respondo en menos de 24 horas", la garantía de satisfacción y la **tarifa del apoyo escolar** (el mercado para ESO online va de 12 a 22 €/h; Dana cobra 30 €).

### Fase 4 · Automatizar reservas, cobros y ventas
- **Cal.com** (recomendado) conectado a su Google Calendar y a Stripe, con tipos de cita: primera clase (30 min, 15 €), clase suelta (30 €), pareja y grupo. Sustituye o complementa la sección Horarios con su enlace o su widget (actualizando cookies y privacidad si el widget carga recursos de terceros) y mantén la petición especial.
- **Tienda:** sube los PDF de `materiales-venta/` a **Payhip, Gumroad o Lemon Squeezy**. Pon cada enlace en `PRODUCTS[i].url` y activa en la plataforma la casilla de renuncia al desistimiento para contenido digital (art. 103.m TRLGDCU). Añade la plataforma como encargada en la política de privacidad.

### Fase 5 · Asistente con IA
- Dana crea una clave en console.anthropic.com (tiene coste por uso, bajo). Guárdala en Netlify como `ANTHROPIC_API_KEY`. Pon `CHAT_ENDPOINT='/.netlify/functions/chat'`. La función usa el modelo `claude-haiku-4-5-20251001`; revisa su texto `INFO` para que coincida con las tarifas actuales. Añade un límite de uso básico.

### Fase 6 · Atraer clientes (SEO y captación)
- Fuentes propias: descarga Bricolage Grotesque y Caveat (woff2, licencia OFL) en `site/fonts/` y decláralas con `@font-face`. Nunca desde Google Fonts.
- Páginas por idioma y nicho (`/en/`, `/fr/`, "clases de español para francófonos", "DELE A2 + CCSE"…) con `hreflang`, `sitemap.xml`, `robots.txt`, `og:image` (crear una imagen de 1200×630 con la marca) y URL canónica.
- Newsletter: elegir proveedor (por ejemplo, Brevo o MailerLite, con servidores en la UE), migrar las altas recibidas en Netlify Forms, enviar con doble confirmación y actualizar la privacidad.
- Perfiles en Superprof y Classgap que enlacen a la web.
- Mantener el reto: cuando se acaben las palabras (a finales de noviembre de 2026), ampliar `WORDS` (las palabras se repiten en bucle).

## 7. Antes de cerrar cada tarea
- [ ] Consola sin errores, en ES/EN/FR, en modo claro y oscuro y en móvil.
- [ ] Textos nuevos en los tres idiomas.
- [ ] Política de privacidad y de cookies actualizadas si cambia algún tratamiento o servicio.
- [ ] Commit con un mensaje claro y `deploy --prod`.
- [ ] Resumen para Dana, en español sencillo, de lo hecho y de lo que necesita hacer ella.
