// Cada pestaña (inglés, francés, apoyo escolar, profesores) tiene su propio título,
// descripción y tarjeta para redes, para que Google y WhatsApp/Instagram no
// enseñen siempre los de la portada. Si algo falla, se sirve la web tal cual.
const P = {
  "/ingles": { u: "/ingles/", t: "Clases de inglés online con profesor nativo de Chicago · Tu profe por el mundo", d: "Prepara tu examen de inglés (A1-C1) o mejora tu nivel y conversa con Chris, profesor nativo de Chicago. Clases online a tu medida." },
  "/frances": { u: "/frances/", t: "Clases de francés online con profesor nativo · Tu profe por el mundo", d: "Prepara el DELF/DALF o mejora tu nivel de francés y conversa con un profesor nativo. Preinscripción abierta." },
  "/apoyo-escolar": { u: "/apoyo-escolar/", t: "Apoyo escolar online de primaria y ESO · Tu profe por el mundo", d: "Apoyo escolar online para primaria y ESO con plan a partir del curso y el material de tu hijo o hija. Estudia y practica gratis." },
  "/profesores": { u: "/profesores/", t: "Nuestros profesores · Tu profe por el mundo", d: "Conoce a Dana (español y apoyo escolar), Chris (inglés nativo, de Chicago) y a nuestro futuro profesor nativo de francés." },
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const attr = (html, re, val) => html.replace(re, (m, a, b) => a + val + b);

export default async (req, context) => {
  const m = P[new URL(req.url).pathname.replace(/\/+$/, "")];
  if (!m) return context.next();
  try {
    const res = await context.rewrite("/index.html");
    if (!res.ok) return res;
    let html = await res.text();
    const full = "https://tuprofeporelmundo.com" + m.u;
    html = html.replace(/<title>[^<]*<\/title>/, () => "<title>" + esc(m.t) + "</title>");
    html = attr(html, /(<meta name="description" content=")[^"]*(")/, esc(m.d));
    html = attr(html, /(<link rel="canonical" href=")[^"]*(")/, full);
    html = attr(html, /(<meta property="og:title" content=")[^"]*(")/, esc(m.t));
    html = attr(html, /(<meta property="og:description" content=")[^"]*(")/, esc(m.d));
    html = attr(html, /(<meta property="og:url" content=")[^"]*(")/, full);
    const h = new Headers(res.headers);
    h.delete("content-length");
    return new Response(html, { status: 200, headers: h });
  } catch (e) {
    return context.next();
  }
};

export const config = {
  path: ["/ingles", "/ingles/", "/frances", "/frances/", "/apoyo-escolar", "/apoyo-escolar/", "/profesores", "/profesores/"],
};
