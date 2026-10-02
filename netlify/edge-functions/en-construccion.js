// Web «en construcción»: los visitantes ven «Próximamente» y solo quien sabe la
// contraseña (Dana) ve la web completa. Para abrir la web a todo el mundo,
// basta con borrar este archivo.
//
// Entrar: /entrar · Salir: /salir
// La contraseña no está escrita aquí: solo una huella (PBKDF2 + SHA-256).

const SALT = "2b71c3aaf74ae22afd24cb7dfcfad4b9";
const ITER = 150000;
const HUELLA = "4efcad60dd2915e38d6c589427f62140c95002735b7f5002e7025cc3601f706a";
const COOKIE = "tppm_acceso";
const LIBRES = new Set(["/og.png", "/robots.txt", "/favicon.ico"]);

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (txt) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)));

async function llave(pw) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(SALT), iterations: ITER },
    base,
    256,
  );
  return hex(bits);
}

function leerCookie(req) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([a-f0-9]{64})"));
  return m ? m[1] : "";
}

const CSS = `:root{--bg:#FCF8F5;--card:#FFFFFF;--ink:#33251E;--muted:#6F6058;--line:#EADCD2;--jungle:#6B4433;--flower:#D98C7E;--leaf:#5E7A55;--petal:#FFF8F1;--petal-c:#F2C46D;--on:#FFFFFF;--danger:#A8321E}
@media (prefers-color-scheme:dark){:root{--bg:#1D1613;--card:#2B211C;--ink:#F4EAE3;--muted:#C2B2A7;--line:#3E3029;--jungle:#E3BCA6;--flower:#E89E90;--leaf:#93AE87;--petal:#F6E9DE;--on:#1D1613;--danger:#F0A08F}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%}
body{background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.6;display:grid;place-items:center;min-height:100vh;padding:24px 16px}
main{max-width:560px;width:100%;text-align:center;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:40px 24px;box-shadow:0 12px 28px -14px rgba(60,36,26,.25)}
h1{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;color:var(--jungle);font-size:clamp(1.9rem,6vw,2.6rem);line-height:1.15;margin:.4rem 0 .6rem}
.marca{font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:.8rem;color:var(--leaf)}
p{margin:.5rem 0;color:var(--muted)}.otros{font-size:.92rem}
a{color:var(--jungle);font-weight:700}
svg.flores{width:190px;height:86px}
form{display:grid;gap:12px;margin-top:18px}
input{font:inherit;padding:.8rem 1rem;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
button{font:inherit;font-weight:700;padding:.85rem 1.4rem;border-radius:10px;border:0;background:var(--jungle);color:var(--on);cursor:pointer}
:focus-visible{outline:3px solid var(--flower);outline-offset:3px}
.error{color:var(--danger);font-weight:700}`;

const FLOR = `<svg class="flores" viewBox="-110 -50 220 100" aria-hidden="true"><g transform="translate(-72 14) scale(.42)"><g fill="var(--petal)" stroke="var(--flower)" stroke-width="3"><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(72)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(144)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(216)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(288)"/></g><g style="fill:var(--flower)"><circle r="2.2" cx="0" cy="-10"/><circle r="2.2" cx="9.5" cy="-3"/><circle r="2.2" cx="6" cy="8"/><circle r="2.2" cx="-6" cy="8"/><circle r="2.2" cx="-9.5" cy="-3"/><circle r="3.5"/></g></g><g transform="translate(0 8)"><g fill="var(--petal)" stroke="var(--flower)" stroke-width="2"><path d="M0 24 C-20 26 -42 16 -47 0 C-30 -4 -12 6 0 24Z"/><path d="M0 24 C20 26 42 16 47 0 C30 -4 12 6 0 24Z"/><path d="M0 24 C-20 16 -30 -6 -27 -26 C-12 -20 -2 -2 0 24Z"/><path d="M0 24 C20 16 30 -6 27 -26 C12 -20 2 -2 0 24Z"/><path d="M0 24 C-14 8 -13 -22 0 -42 C13 -22 14 8 0 24Z"/></g></g><g transform="translate(74 -6) scale(.34) rotate(20)"><g fill="var(--petal)" stroke="var(--flower)" stroke-width="3"><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(72)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(144)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(216)"/><path d="M0 0 C-15 -8 -19 -29 -9 -42 L0 -35 L9 -42 C19 -29 15 -8 0 0Z" transform="rotate(288)"/></g><g style="fill:var(--flower)"><circle r="2.2" cx="0" cy="-10"/><circle r="2.2" cx="9.5" cy="-3"/><circle r="2.2" cx="6" cy="8"/><circle r="2.2" cx="-6" cy="8"/><circle r="2.2" cx="-9.5" cy="-3"/><circle r="3.5"/></g></g></svg>`;

function pagina(titulo, cuerpo, status = 200, extra = {}) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${titulo}</title><style>${CSS}</style></head><body><main>${FLOR}${cuerpo}</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
      ...extra,
    },
  });
}

const proximamente = () =>
  pagina(
    "Tu profe por el mundo · Próximamente",
    `<div class="marca">Tu profe por el mundo</div>
<h1>Estamos preparando la web</h1>
<p>Muy pronto podrás reservar aquí tus clases online de español y de apoyo escolar.</p>
<p class="otros" lang="en">Coming soon · <span lang="fr">Bientôt en ligne</span></p>
<p>Mientras tanto, escríbeme a <a href="mailto:contacto@tuprofeporelmundo.com">contacto@tuprofeporelmundo.com</a></p>`,
  );

const formulario = (error = "") =>
  pagina(
    "Entrar · Tu profe por el mundo",
    `<div class="marca">Tu profe por el mundo</div>
<h1>Entrar</h1>
<p>Solo para ver la web mientras está en construcción.</p>
${error ? `<p class="error" role="alert">${error}</p>` : ""}
<form method="post" action="/entrar">
<label for="pw" style="position:absolute;left:-9999px">Contraseña</label>
<input id="pw" name="pw" type="password" placeholder="Contraseña" autocomplete="current-password" required autofocus>
<button type="submit">Entrar</button>
</form>`,
    error ? 401 : 200,
  );

export default async (req, context) => {
  const url = new URL(req.url);
  const ruta = url.pathname.replace(/\/+$/, "") || "/";

  if (ruta === "/entrar") {
    if (req.method !== "POST") return formulario();
    const datos = await req.formData().catch(() => null);
    const pw = String((datos && datos.get("pw")) || "");
    const k = pw ? await llave(pw) : "";
    if (!k || (await sha256(k)) !== HUELLA) return formulario("Contraseña incorrecta.");
    return new Response(null, {
      status: 303,
      headers: {
        location: "/",
        "set-cookie": `${COOKIE}=${k}; Path=/; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store",
      },
    });
  }

  if (ruta === "/salir") {
    return new Response(null, {
      status: 303,
      headers: { location: "/", "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` },
    });
  }

  const c = leerCookie(req);
  if (c && (await sha256(c)) === HUELLA) return context.next();
  if (LIBRES.has(ruta)) return context.next();
  return proximamente();
};

export const config = { path: "/*", excludedPath: ["/.netlify/*"] };
