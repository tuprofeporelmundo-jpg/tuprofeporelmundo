// Cada pestaña (inglés, francés, apoyo escolar, profesores, opiniones) tiene su propio título,
// descripción y tarjeta para redes, para que Google y WhatsApp/Instagram no
// enseñen siempre los de la portada. Si algo falla, se sirve la web tal cual.
const P = {
  "/ingles": { u: "/ingles/", v: "en", t: "Clases de inglés online con profesor nativo de Chicago · Tu profe por el mundo", d: "Prepara tu examen de inglés (A1-C1) o mejora tu nivel y conversa con Chris, profesor nativo de Chicago. Clases online a tu medida." },
  "/frances": { u: "/frances/", v: "fr", t: "Clases de francés online con profesor nativo · Tu profe por el mundo", d: "Prepara el DELF/DALF o mejora tu nivel de francés y conversa con un profesor nativo. Preinscripción abierta." },
  "/apoyo-escolar": { u: "/apoyo-escolar/", v: "ap", t: "Apoyo escolar online de primaria y ESO · Tu profe por el mundo", d: "Apoyo escolar online para primaria y ESO con plan a partir del curso y el material de tu hijo o hija. Estudia y practica gratis." },
  "/profesores": { u: "/profesores/", v: "prof", t: "Nuestros profesores · Tu profe por el mundo", d: "Conoce a Dana (español y apoyo escolar), Chris (inglés nativo, de Chicago) y a nuestro futuro profesor nativo de francés." },
  "/opiniones": { u: "/opiniones/", v: "op", t: "Opiniones de mis alumnos · Tu profe por el mundo", d: "Lee lo que opinan los alumnos y las familias de las clases online de español y de apoyo escolar con Dana. Opiniones reales, buenas y malas." },
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const attr = (html, re, val) => html.replace(re, (m, a, b) => a + val + b);


// Además: la vista correcta ya viene marcada en <body> y cada página lleva sus datos estructurados
// (curso o servicio, profesores, tarifas y preguntas frecuentes), leídos del propio HTML para que nunca se desincronicen.
const ORIGIN = "https://tuprofeporelmundo.com";
const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
const ORG = { "@id": ORIGIN + "/#org" };
const DANA = { "@type": "Person", "@id": ORIGIN + "/#dana", name: "Dana Salgado" };
const CHRIS = { "@type": "Person", "@id": ORIGIN + "/#chris", name: "Christopher Graham", jobTitle: "Profesor nativo de inglés", description: "Profesor nativo de inglés, de Chicago, en Tu profe por el mundo.", worksFor: ORG, url: ORIGIN + "/profesores/" };

function enrich(html, m) {
  html = html.replace(/<script type="application\/ld\+json" id="ld-home">[\s\S]*?<\/script>\n?/, "");
  if (m.v === "fr") return html.replace("<body>", () => '<body data-view="fr">');
  const offers = [...html.matchAll(/<div class="pcard[^"]*">[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3><span class="big">([\s\S]*?)<\/span>/g)]
    .map((x) => ({ name: strip(x[1]), price: parseFloat(strip(x[2]).replace(/[^\d,]/g, "").replace(",", ".")) }))
    .filter((o) => o.name && o.price > 0)
    .map((o) => ({ "@type": "Offer", name: o.name, price: o.price.toFixed(2), priceCurrency: "EUR", availability: "https://schema.org/InStock" }));
  const faqHtml = (html.match(/<section id="faq"[\s\S]*?<\/section>/) || [""])[0];
  const faq = [...faqHtml.matchAll(/<details([^>]*)><summary[^>]*>([\s\S]*?)<\/summary><p[^>]*>([\s\S]*?)<\/p><\/details>/g)]
    .filter((x) => ((x[1].match(/data-views="([^"]*)"/) || [, "es en fr ap"])[1]).split(" ").includes(m.v))
    .map((x) => ({ "@type": "Question", name: strip(x[2]), acceptedAnswer: { "@type": "Answer", text: strip(x[3]) } }));
  const graph = [];
  if (m.v === "en") {
    graph.push({ "@type": "Course", "@id": ORIGIN + "/ingles/#curso", name: "Clases de inglés online (A1–C1)", description: "Clases individuales online de inglés con un profesor nativo de Chicago: preparación de examen o mejora del nivel y conversación.", inLanguage: "es", provider: ORG, educationalLevel: "A1–C1", courseMode: "online", offers, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", instructor: CHRIS } }, CHRIS);
  } else if (m.v === "ap") {
    graph.push({ "@type": "Service", "@id": ORIGIN + "/apoyo-escolar/#servicio", name: "Apoyo escolar online de primaria y ESO", serviceType: "Apoyo escolar", description: "Clases individuales online de apoyo escolar para primaria y ESO, con plan a partir del curso y el material del alumno.", provider: ORG, areaServed: "Online", offers }, DANA);
  } else if (m.v === "prof") {
    graph.push(DANA, CHRIS);
  }
  if (faq.length && m.v !== "prof") graph.push({ "@type": "FAQPage", "@id": ORIGIN + m.u + "#faq", mainEntity: faq });
  graph.push({ "@type": "WebPage", "@id": ORIGIN + m.u, url: ORIGIN + m.u, name: m.t, description: m.d, inLanguage: "es", isPartOf: ORG });
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return html.replace("<body>", () => '<body data-view="' + m.v + '">').replace("<style>", () => '<script type="application/ld+json">' + ld + "</script>\n<style>");
}

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
    html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, "");
    html = enrich(html, m);
    const h = new Headers(res.headers);
    h.delete("content-length");
    return new Response(html, { status: 200, headers: h });
  } catch (e) {
    return context.next();
  }
};

export const config = {
  path: ["/ingles", "/ingles/", "/frances", "/frances/", "/apoyo-escolar", "/apoyo-escolar/", "/profesores", "/profesores/", "/opiniones", "/opiniones/"],
};
