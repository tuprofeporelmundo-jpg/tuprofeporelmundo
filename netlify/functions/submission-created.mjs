// Correo automático de confirmación al alumno cuando envía una reserva.
// Netlify llama a esta función sola cada vez que llega un envío de formulario.
// Está DESACTIVADA hasta que existan estas variables en Netlify
// (Site configuration > Environment variables):
//   RESEND_API_KEY  = clave de API de tu cuenta de Resend (resend.com)
//   CONFIRM_FROM    = por ejemplo: Tu profe por el mundo <contacto@tuprofeporelmundo.com>
//                     (el dominio debe estar verificado en Resend)
// Sin ellas, no hace nada y la reserva sigue llegando igual por Netlify Forms.

const TXT = {
  ES: {
    subject: "Hemos recibido tu preinscripción · Tu profe por el mundo",
    body: (n) => `Hola ${n},\n\nHemos recibido tu preinscripción. En cuanto la revisemos te escribiremos a este correo para confirmar el día y la hora de tu clase.\n\nSi tienes cualquier duda, responde a este mensaje.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
  EN: {
    subject: "We have received your pre-registration · Tu profe por el mundo",
    body: (n) => `Hi ${n},\n\nWe have received your pre-registration. Once we have reviewed it, we will write to you at this address to confirm the day and time of your class.\n\nIf you have any questions, just reply to this message.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
  FR: {
    subject: "Nous avons bien reçu ta préinscription · Tu profe por el mundo",
    body: (n) => `Bonjour ${n},\n\nNous avons bien reçu ta préinscription. Dès que nous l'aurons examinée, nous t'écrirons à cette adresse pour confirmer le jour et l'heure de ton cours.\n\nSi tu as une question, réponds simplement à ce message.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
};

export default async (req) => {
  const key = process.env.RESEND_API_KEY;
  const rawFrom = String(process.env.CONFIRM_FROM || "").replace(/^[\s"']+|[\s"']+$/g, "");
  const okFrom = /^[^<>]+<[^\s<>@]+@[^\s<>@]+>$/.test(rawFrom) || /^[^\s<>@]+@[^\s<>@]+$/.test(rawFrom);
  const from = okFrom ? rawFrom : "Tu profe por el mundo <contacto@tuprofeporelmundo.com>";
  if (!okFrom) console.log("confirmacion: CONFIRM_FROM no valido, se usa el remitente por defecto");
  console.log("confirmacion: RESEND_API_KEY", key ? "ok" : "FALTA", "CONFIRM_FROM", from ? "ok" : "FALTA");
  if (!key || !from) return new Response("disabled", { status: 200 });
  try {
    const { payload } = await req.json();
    if (!payload || payload.form_name !== "reserva") return new Response("skip", { status: 200 });
    const d = payload.data || {};
    // Aviso a Dana por correo (Netlify cobra por sus avisos de formulario; este va por Resend).
    try {
      const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const v = (k) => { const x = d[k]; return typeof x === "string" ? x.trim() : ""; };
      const cap = (x) => x.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      const nombre = cap(v("nombre")).slice(0, 80) || "Sin nombre";
      const SECCIONES = [
        ["Lo que quiere", [["Tipo de clase", "tipo"], ["Tarifa", "tarifa"], ["Cómo reservar", "modo-reserva"], ["Franja elegida", "franja"], ["Disponibilidad", "disponibilidad"], ["Petición especial", "peticion-especial"], ["Profesor elegido", "profesor"], ["Aviso", "aviso"]]],
        ["Alumno", [["Nombre", "nombre"], ["Email", "email"], ["WhatsApp", "whatsapp"], ["País / zona horaria", "pais-zona-horaria"], ["Idioma de la web", "idioma-web"]]],
        ["Español", [["Nivel", "nivel-espanol"], ["Modalidad", "modalidad"], ["Objetivo", "objetivo"]]],
        ["Apoyo escolar", [["Etapa", "etapa"], ["Curso", "curso"], ["Asignatura", "asignatura"], ["Otra asignatura", "asignatura-otra"], ["Tema", "tema"]]],
        ["Inglés", [["Nivel", "nivel-ingles"], ["Modalidad", "modalidad-ingles"], ["Objetivo", "objetivo-ingles"], ["Examen", "examen-ingles"], ["Detalle", "detalle-ingles"]]],
        ["Francés", [["Nivel", "nivel-frances"], ["Modalidad", "modalidad-frances"], ["Objetivo", "objetivo-frances"], ["Examen", "examen-frances"], ["Detalle", "detalle-frances"]]],
        ["Test de nivel", [["Resultado", "resultado-test"]]],
        ["Mensaje", [["Mensaje", "mensaje"]]],
        ["Consentimientos", [["Mayor de edad o representante legal", "mayor-o-representante-legal"], ["Política de privacidad leída", "informacion-privacidad-leida"]]],
      ];
      let html = "", txt = "";
      for (const [titulo, campos] of SECCIONES) {
        const filas = campos.map(([l, k]) => [l, v(k)]).filter(([, x]) => x);
        if (!filas.length) continue;
        html += `<tr><td style="padding:18px 0 6px;font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b4532a;border-bottom:2px solid #f0e3d6">${esc(titulo)}</td></tr>`;
        txt += `\n${titulo.toUpperCase()}\n`;
        for (const [l, x] of filas) {
          html += `<tr><td style="padding:8px 0;border-bottom:1px solid #f3ece4;font:14px/1.5 Arial,sans-serif;color:#2b2b2b"><span style="display:block;font-size:12px;color:#8a7f75">${esc(l)}</span>${esc(x).replace(/\n/g, "<br>")}</td></tr>`;
          txt += `${l}: ${x}\n`;
        }
      }
      const adj = v("archivos");
      if (adj) { html += `<tr><td style="padding:12px 0;font:14px Arial,sans-serif;color:#2b2b2b">Archivos adjuntos: ${esc(adj)}</td></tr>`; txt += `\nArchivos: ${adj}\n`; }
      const tipo = v("tipo");
      const mail = v("email");
      const wa = v("whatsapp").replace(/[^\d]/g, "");
      const botones = (mail ? `<a href="mailto:${esc(mail)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;background:#b4532a;color:#fff;text-decoration:none;border-radius:8px;font:700 14px Arial,sans-serif">Responder por email</a>` : "") +
        (wa.length >= 7 ? `<a href="https://wa.me/${wa}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;background:#25a244;color:#fff;text-decoration:none;border-radius:8px;font:700 14px Arial,sans-serif">Abrir WhatsApp</a>` : "");
      const fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "long", timeStyle: "short" });
      const cuerpo = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#faf6f1"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;padding:28px 28px 20px">` +
        `<tr><td style="font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8a7f75">Nueva preinscripción</td></tr>` +
        `<tr><td style="padding:6px 0 4px;font:700 24px Arial,sans-serif;color:#2b2b2b">${esc(nombre)}</td></tr>` +
        `<tr><td style="padding:0 0 16px;font:15px Arial,sans-serif;color:#555">${esc(tipo || "Clase")} · ${esc(fecha)}</td></tr>` +
        `<tr><td style="padding:0 0 4px">${botones}</td></tr>` + html +
        `<tr><td style="padding:20px 0 0;font:12px Arial,sans-serif;color:#a0968c">Al pulsar Responder, tu respuesta va directa al alumno. Todos los envíos también quedan en Netlify Forms.</td></tr>` +
        `</table></td></tr></table></body></html>`;
      const rn = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: "Bearer " + key, "content-type": "application/json" },
        body: JSON.stringify({
          from,
          to: process.env.NOTIFY_TO || "contacto@tuprofeporelmundo.com",
          reply_to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? mail : undefined,
          subject: "Nueva preinscripción · " + (tipo ? tipo.slice(0, 60) + " · " : "") + nombre,
          html: cuerpo,
          text: `Nueva preinscripción: ${nombre}\n${fecha}\n` + txt,
        }),
      });
      console.log("aviso a Dana: Resend respondio", rn.status, (await rn.text()).slice(0, 200));
    } catch (e) {
      console.log("aviso a Dana: fallo", String((e && e.message) || e));
    }
    const to = String(d.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return new Response("no-email", { status: 200 });
    const lang = TXT[String(d["idioma-web"] || "ES").toUpperCase()] || TXT.ES;
    const name = (String(d.nombre || "").trim().split(/\s+/)[0] || "").slice(0, 40).replace(/^./, (c) => c.toUpperCase()).replace(/(?<=.)./g, (c) => c.toLowerCase());
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: "contacto@tuprofeporelmundo.com",
        subject: lang.subject,
        text: lang.body(name),
      }),
    });
    console.log("confirmacion: Resend respondio", r.status, (await r.text()).slice(0, 300));
    return new Response(r.ok ? "sent" : "error", { status: 200 });
  } catch (e) {
    console.log("confirmacion: fallo", String(e && e.message || e));
    return new Response("error", { status: 200 });
  }
};
