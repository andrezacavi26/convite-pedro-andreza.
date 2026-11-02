# Convite digital · Pedro & Andreza

Convite interativo do casamento de Pedro & Andreza — 17/04/2027 às 16h30, Rancho Eventos Cambé.

Site estático (um único `index.html`), pronto para deploy na Vercel.

## Editar
- **Link do site dos noivos:** em `index.html`, procure `const SITE_DOS_NOIVOS = "";` e coloque o endereço.
- **Abertura:** `let CURRENT = "portas";` (opções: `envelope`, `portas`, `ramo`, `livro`).

## Versão padrinhos (`/padrinhos`)
Link personalizado por pessoa:
- `/padrinhos?nome=João&tipo=padrinho`
- `/padrinhos?nome=Maria&tipo=madrinha`
- `/padrinhos?nome=João e Maria&tipo=casal`

## Site do casamento (`/site`)
Edite o bloco `CONFIG` no início do `<script>` de `site/index.html`:
- `whatsapp`: número dos noivos (ex.: `5543999999999`)
- `pixChave`, `pixNome`, `pixCidade`: dados do PIX
- `cartaoLink`: link de pagamento com valor aberto (Mercado Pago, InfinitePay, PagSeguro…)
- `prazoRSVP`: data limite para confirmar
A lista `PRESENTES` e `HOTEIS` também fica ali.
