// Cria um link de checkout da InfinitePay com o valor do presente já preenchido.
// Configure na Vercel: Settings → Environment Variables → INFINITEPAY_HANDLE = sua InfiniteTag (sem o $)
// (opcional) INFINITEPAY_API_KEY = chave do checkout integrado, se quiser usar.

const MIN = 1, MAX = 20000;

function findUrl(obj) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of ["url", "link", "checkout_url", "payment_url", "short_url"]) {
    if (typeof obj[k] === "string" && /^https?:\/\//.test(obj[k])) return obj[k];
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "string" && /^https:\/\/[^ ]*infinitepay/.test(v)) return v;
    if (v && typeof v === "object") { const u = findUrl(v); if (u) return u; }
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const handle = (process.env.INFINITEPAY_HANDLE || "silvayarin").replace(/^\$/, "").trim();
  const apiKey = (process.env.INFINITEPAY_API_KEY || "").trim();
  if (!handle && !apiKey) return res.status(503).json({ error: "Checkout ainda não configurado" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const valor = Math.round(Number(body && body.valor) * 100) / 100;
  const nome = String((body && body.nome) || "Presente de casamento").slice(0, 80);
  if (!isFinite(valor) || valor < MIN || valor > MAX) return res.status(400).json({ error: "Valor inválido" });

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const payload = {
    items: [{ quantity: 1, price: Math.round(valor * 100), description: `Presente: ${nome} – Casamento Pedro & Andreza` }],
    order_nsu: "pa-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
    redirect_url: `https://${host}/site/?pago=1#presentes`
  };
  if (handle) payload.handle = handle;

  try {
    const r = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, apiKey ? { "X-Api-Key": apiKey } : {}),
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const url = findUrl(data) || (/^https?:\/\//.test(text.trim()) ? text.trim() : null);
    if (!r.ok || !url) return res.status(502).json({ error: "Falha ao criar o pagamento", status: r.status, detail: data });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(502).json({ error: "Falha ao conectar com a InfinitePay" });
  }
};
