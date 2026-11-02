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

## Pagamento com cartão (checkout InfinitePay)
O botão "Pagar com cartão" chama `/api/checkout`, que cria a página de pagamento da InfinitePay com o valor do presente já preenchido.
1. Crie a conta na InfinitePay e ative **Configurações → Habilitar checkout integrado**.
2. Na Vercel: **Settings → Environment Variables** → `INFINITEPAY_HANDLE` = sua InfiniteTag (sem o `$`). Faça um novo deploy.
Sem essa variável, o site usa o `cartaoLink` (Mercado Pago) como alternativa.
