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
    subject: "Hemos recibido tu reserva · Tu profe por el mundo",
    body: (n) => `Hola ${n},\n\nHemos recibido tu reserva. En cuanto la revisemos te escribiremos a este correo para confirmar el día y la hora de tu clase.\n\nSi tienes cualquier duda, responde a este mensaje.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
  EN: {
    subject: "We have received your booking · Tu profe por el mundo",
    body: (n) => `Hi ${n},\n\nWe have received your booking. Once we have reviewed it, we will write to you at this address to confirm the day and time of your class.\n\nIf you have any questions, just reply to this message.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
  FR: {
    subject: "Nous avons bien reçu ta réservation · Tu profe por el mundo",
    body: (n) => `Bonjour ${n},\n\nNous avons bien reçu ta réservation. Dès que nous l'aurons examinée, nous t'écrirons à cette adresse pour confirmer le jour et l'heure de ton cours.\n\nSi tu as une question, réponds simplement à ce message.\n\nTu profe por el mundo\nhttps://tuprofeporelmundo.com`,
  },
};

export default async (req) => {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONFIRM_FROM;
  console.log("confirmacion: RESEND_API_KEY", key ? "ok" : "FALTA", "CONFIRM_FROM", from ? "ok" : "FALTA");
  if (!key || !from) return new Response("disabled", { status: 200 });
  try {
    const { payload } = await req.json();
    if (!payload || payload.form_name !== "reserva") return new Response("skip", { status: 200 });
    const d = payload.data || {};
    // Aviso a Dana por correo (Netlify cobra por sus avisos de formulario; este va por Resend).
    try {
      const lineas = Object.entries(d)
        .filter(([k, x]) => !["bot-field", "form-name", "archivos"].includes(k) && x && typeof x === "string")
        .map(([k, x]) => k + ": " + x);
      const mail = String(d.email || "").trim();
      const rn = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: "Bearer " + key, "content-type": "application/json" },
        body: JSON.stringify({
          from,
          to: process.env.NOTIFY_TO || "contacto@tuprofeporelmundo.com",
          reply_to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? mail : undefined,
          subject: "Nueva preinscripcion: " + String(d.nombre || "").slice(0, 60) + " (" + String(d.tipo || "") + ")",
          text: lineas.join("\n"),
        }),
      });
      console.log("aviso a Dana: Resend respondio", rn.status, (await rn.text()).slice(0, 200));
    } catch (e) {
      console.log("aviso a Dana: fallo", String((e && e.message) || e));
    }
    const to = String(d.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return new Response("no-email", { status: 200 });
    const lang = TXT[String(d["idioma-web"] || "ES").toUpperCase()] || TXT.ES;
    const name = String(d.nombre || "").split(/\s+/)[0].slice(0, 40) || "";
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
