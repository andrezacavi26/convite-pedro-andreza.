// Ponte entre o site e a planilha Google (Apps Script).
//  GET  /api/rsvp?c=CODIGO            → nomes do convite (grupo)
//  POST /api/rsvp {c, vai:[índices], recado}   → resposta do grupo
//  POST /api/rsvp {nome, presenca, recado}     → confirmação avulsa (sem link)
const PLANILHA_URL = process.env.PLANILHA_URL ||
  "https://script.google.com/macros/s/AKfycbztBr4Ej-z9eWfbFOcccwcWgV34mp0pm7L6ZSX1BlCxbcnPBT6aKpMs1htlK7ZoQ-X1/exec";

async function planilha(params) {
  const r = await fetch(PLANILHA_URL + "?" + new URLSearchParams(params).toString(), { redirect: "follow" });
  const text = await r.text();
  let data = null; try { data = JSON.parse(text); } catch {}
  if (data) return data;
  const login = /accounts\.google\.com|ServiceLogin|Fazer login|Sign in/i.test(text);
  return { ok: false, erro: login ? "A planilha está pedindo login: em 'Quem pode acessar' use 'Qualquer pessoa'."
                                   : "Resposta inesperada da planilha (HTTP " + r.status + ")" };
}

const codigoOk = c => typeof c === "string" && /^[a-z0-9-]{3,40}$/i.test(c);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const c = (req.query && req.query.c) || new URL(req.url, "http://x").searchParams.get("c");
      if (!codigoOk(c)) return res.status(400).json({ ok: false, erro: "Código inválido" });
      const d = await planilha({ acao: "grupo", codigo: c });   // "c" é reservado pelo Google
      return res.status(d.ok ? 200 : 404).json(d);
    }
    if (req.method !== "POST") return res.status(405).json({ ok: false, erro: "Método não permitido" });

    let b = req.body;
    if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
    b = b || {};
    const recado = String(b.recado || "").slice(0, 1000);

    if (b.c) {
      if (!codigoOk(b.c)) return res.status(400).json({ ok: false, erro: "Código inválido" });
      const vai = Array.isArray(b.vai) ? b.vai.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < 50) : [];
      const d = await planilha({ acao: "responder", codigo: b.c, vai: JSON.stringify(vai), recado });
      return res.status(d.ok ? 200 : 502).json(d);
    }

    const nome = String(b.nome || "").trim().slice(0, 120);
    if (!nome) return res.status(400).json({ ok: false, erro: "Nome vazio" });
    const d = await planilha({ nome, presenca: b.presenca === "Não" ? "Não" : "Sim", recado, origem: "site" });
    return res.status(d.ok ? 200 : 502).json(d);
  } catch (e) {
    return res.status(502).json({ ok: false, erro: "Não foi possível falar com a planilha" });
  }
};
