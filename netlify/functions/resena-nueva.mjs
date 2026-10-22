// Aviso por correo cuando llega una reseña nueva.
// Supabase llama a esta función (trigger de la tabla resenas, ver supabase/resenas-correo.sql) con el id y el
// token de la reseña. La función comprueba con Supabase que ese par es real (así nadie puede inventar avisos)
// y te manda un correo con la reseña y dos enlaces: publicar o descartar.
// Usa las mismas variables de Netlify que la confirmación de reservas: RESEND_API_KEY, CONFIRM_FROM, NOTIFY_TO.

const SUPA = "https://csnofemrppaqnnwirusx.supabase.co";
const KEY = "sb_publishable_q1Sx5pe8Klw8T6UA11r5MA_d0oclgYt"; // clave pública, la misma que usa la web
const ORIGIN = "https://tuprofeporelmundo.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "metodo" }, 405);
  try {
    const key = process.env.RESEND_API_KEY;
    const fromEnv = process.env.CONFIRM_FROM || "";
    const rawFrom = fromEnv.replace(/^[\s"']+|[\s"']+$/g, "");
    const okFrom = /^[^<>]+<[^\s<>@]+@[^\s<>@]+>$/.test(rawFrom) || /^[^\s<>@]+@[^\s<>@]+$/.test(rawFrom);
    const from = okFrom ? rawFrom : "Tu profe por el mundo <contacto@tuprofeporelmundo.com>"; // mismo remitente por defecto que la confirmación de reservas
    if (!key || !from) return json({ ok: false, error: "sin_resend" });

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || ""), token = String(body.token || "");
    if (!UUID.test(id) || !UUID.test(token)) return json({ ok: false, error: "datos" }, 400);

    const r = await fetch(SUPA + "/rest/v1/rpc/resena_para_correo", {
      method: "POST",
      headers: { apikey: KEY, "content-type": "application/json" },
      body: JSON.stringify({ p_id: id, p_token: token }),
    });
    const rows = r.ok ? await r.json() : [];
    const x = rows[0];
    if (!x) return json({ ok: false, error: "no_existe" }, 404);
    if (x.aprobada) return json({ ok: true, skip: "ya_aprobada" });

    const base = ORIGIN + "/aprobar/?id=" + id + "&t=" + token;
    const estrellas = "★".repeat(x.estrellas) + "☆".repeat(5 - x.estrellas);
    const clase = x.clase === "apoyo" ? "Apoyo escolar" : "Español";
    const fecha = new Date(x.creada).toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "long", timeStyle: "short" });
    const detalles = [clase, x.nivel, x.pais].filter(Boolean).join(" · ");
    const btn = (href, txt, bg) => `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;background:${bg};color:#fff;text-decoration:none;border-radius:8px;font:700 14px Arial,sans-serif">${txt}</a>`;
    const html = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#faf6f1"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;padding:24px"><tr><td>` +
      `<div style="font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8a7f75">Nueva reseña pendiente</div>` +
      `<div style="padding:8px 0 2px;font:700 22px Arial,sans-serif;color:#2b2b2b">${esc(x.nombre)}</div>` +
      `<div style="padding:0 0 12px;font:14px Arial,sans-serif;color:#555">${esc(detalles)} · ${esc(fecha)}</div>` +
      `<div style="padding:0 0 12px;font:26px Arial,sans-serif;color:#c4936b;letter-spacing:2px">${estrellas}</div>` +
      `<div style="padding:14px 16px;background:#faf6f1;border-radius:8px;font:15px/1.55 Arial,sans-serif;color:#2b2b2b">${esc(x.comentario).replace(/\n/g, "<br>")}</div>` +
      `<div style="padding:18px 0 4px">${btn(base + "&a=aprobar", "Revisar y publicar", "#5e7a55")}${btn(base + "&a=descartar", "Descartar", "#8a7f75")}</div>` +
      `<div style="padding:10px 0 0;font:12px/1.5 Arial,sans-serif;color:#a0968c">Los enlaces abren una página que pide confirmar con un botón: no se publica nada solo por abrir el correo. Correo de quien opina (no se publica): ${esc(x.email)}</div>` +
      `</td></tr></table></td></tr></table></body></html>`;
    const text = `Nueva reseña pendiente (${x.estrellas}/5)\n${x.nombre} · ${detalles}\n\n${x.comentario}\n\nCorreo (no se publica): ${x.email}\n\nPublicar: ${base}&a=aprobar\nDescartar: ${base}&a=descartar\n`;

    const rn = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: process.env.NOTIFY_TO || "contacto@tuprofeporelmundo.com",
        reply_to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email) ? x.email : undefined,
        subject: `Reseña nueva · ${x.estrellas}★ · ${String(x.nombre).slice(0, 60)}`,
        html,
        text,
      }),
    });
    console.log("resena-nueva: Resend respondio", rn.status);
    return json({ ok: rn.ok, resend: rn.status });
  } catch (e) {
    console.log("resena-nueva: fallo", String((e && e.message) || e));
    return json({ ok: false, error: "fallo" }, 500);
  }
};
