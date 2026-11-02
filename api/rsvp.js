// Recebe a confirmação de presença do site e grava na planilha Google (Apps Script).
// O endereço da planilha pode ser trocado pela variável PLANILHA_URL na Vercel.
const PLANILHA_URL = process.env.PLANILHA_URL ||
  "https://script.google.com/macros/s/AKfycbxx7c7nHxODx9xfASAhnqffDmcqwph75niRddVLnkPEYtomlv7vEWdP9dhlyBM3DFeA/exec";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, erro: "Use POST" });
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const nome = String(b.nome || "").trim().slice(0, 120);
  if (!nome) return res.status(400).json({ ok: false, erro: "Nome vazio" });
  const params = new URLSearchParams({
    nome,
    presenca: b.presenca === "Não" ? "Não" : "Sim",
    recado: String(b.recado || "").slice(0, 1000),
    origem: "site"
  });
  try {
    const r = await fetch(PLANILHA_URL + "?" + params.toString(), { redirect: "follow" });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = null; }
    if (data && data.ok) return res.status(200).json({ ok: true });
    const precisaLogin = /accounts\.google\.com|ServiceLogin|Fazer login|Sign in/i.test(text);
    return res.status(502).json({ ok: false, erro: precisaLogin
      ? "A planilha está pedindo login: na implantação, 'Quem pode acessar' precisa ser 'Qualquer pessoa'."
      : (data && data.erro) || ("Resposta inesperada da planilha (HTTP " + r.status + ")") });
  } catch (e) {
    return res.status(502).json({ ok: false, erro: "Não foi possível falar com a planilha" });
  }
};
