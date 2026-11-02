/**
 * Confirmações de presença – Casamento Pedro & Andreza  (versão com lista de convidados)
 *
 * ATUALIZAR (você já tem a planilha e a implantação):
 * 1. Extensões › Apps Script: apague tudo, cole TODO este código e salve.
 * 2. No topo, escolha a função  criarListaConvidados  e clique em ▶ Executar  (uma vez só).
 *    → cria a aba "Convidados" (com o link de cada convite) e refaz a aba "Resumo".
 * 3. Implantar › Gerenciar implantações › lápis › Versão: "Nova versão" › Implantar.
 *    (o endereço /exec continua o mesmo)
 *
 * Na aba "Convidados" você pode trocar nomes ("Esposa", "Filha"…), mover pessoas de grupo
 * (mudando o Código) ou acrescentar linhas novas. Não apague a coluna Código.
 */

const PLANILHA_ID = "";   // só preencha se o código NÃO estiver dentro da planilha
const SITE = "https://convite-pedro-andreza.vercel.app";

const ABA = "Confirmações";             // confirmações feitas sem link personalizado
const ABA_CONV = "Convidados";
const PEND = "⏳ Pendente", VAI = "✅ Vai", NAO = "❌ Não vai";

const LISTA = [
  ["ana-alice-aff", "Ana Alice e Pai", ["Ana Alice", "Pai"]],
  ["lorenzo-f32", "Lorenzo, Mariana, Helena e Andreyne", ["Lorenzo", "Mariana", "Helena", "Andreyne"]],
  ["carol-564", "Carol, Tedesco, Martina e Ana Luiza", ["Carol", "Tedesco", "Martina", "Ana Luiza"]],
  ["soraia-aba", "Soraia e Milton", ["Soraia", "Milton"]],
  ["suellen-6e7", "Suellen, Sidney e Samir", ["Suellen", "Sidney", "Samir"]],
  ["sandra-856", "Sandra, Farid e Mariana", ["Sandra", "Farid", "Mariana"]],
  ["elo-bfb", "Elo e Marido Elo", ["Elo", "Marido Elo"]],
  ["avo-07a", "Avó, Telina, Rodrigo, Enzo e Maria Valentina", ["Avó", "Telina", "Rodrigo", "Enzo", "Maria Valentina"]],
  ["joao-victor-f37", "João Victor, Pollyane, Noah e Teodoro", ["João Victor", "Pollyane", "Noah", "Teodoro"]],
  ["luana-ccb", "Luana, Julivan e Marcos Gregorio", ["Luana", "Julivan", "Marcos Gregorio"]],
  ["lorena-e9e", "Lorena e Vinicius", ["Lorena", "Vinicius"]],
  ["marilsa-3d7", "Tia Marilsa e Tio Mauri", ["Tia Marilsa", "Tio Mauri"]],
  ["suzi-c6b", "Suzi e Dua", ["Suzi", "Dua"]],
  ["samia-17a", "Samia, Samuel, Laura, Daniel e Camila", ["Samia", "Samuel", "Laura", "Daniel", "Camila"]],
  ["gabriel-703", "Gabriel e Esposa", ["Gabriel", "Esposa"]],
  ["laura-f4a", "Laura e Filha 1", ["Laura", "Filha 1"]],
  ["pai-492", "Pai e Mãe", ["Pai", "Mãe"]],
  ["nadir-ae8", "Tio Nadir", ["Tio Nadir"]],
  ["chico-8f7", "Tio Chico", ["Tio Chico"]],
  ["felipe-6de", "Felipe", ["Felipe"]],
  ["rafa-bd2", "Rafa", ["Rafa"]],
  ["franci-5ae", "Franci", ["Franci"]],
  ["neide-3bf", "Vó Neide", ["Vó Neide"]],
  ["ernesto-fd4", "Vó Ernesto e Vó Ema", ["Vó Ernesto", "Vó Ema"]],
  ["mira-158", "Tio Mira e Tia Nice", ["Tio Mira", "Tia Nice"]],
  ["damiao-4f4", "Tio Damião", ["Tio Damião"]],
  ["marcos-76d", "Marcos e Letícia", ["Marcos", "Letícia"]],
  ["valdir-a1b", "Tio Valdir e Tia Angela", ["Tio Valdir", "Tia Angela"]],
  ["bruno-172", "Bruno e Adrieli", ["Bruno", "Adrieli"]],
  ["fernando-832", "Fernando e Natália", ["Fernando", "Natália"]],
  ["orandir-eac", "Tio Orandir e Tia Márcia", ["Tio Orandir", "Tia Márcia"]],
  ["gustavo-ea1", "Gustavo e Daiane", ["Gustavo", "Daiane"]],
  ["sandro-656", "Sandro", ["Sandro"]],
  ["fia-73d", "Tia Fia", ["Tia Fia"]],
  ["lurde-6c9", "Tia Lurde", ["Tia Lurde"]],
  ["giovana-cf0", "Giovana e Danilo", ["Giovana", "Danilo"]],
  ["suzan-279", "Suzan e Degan", ["Suzan", "Degan"]],
  ["natalia-f95", "Natália e João (Natália)", ["Natália", "João (Natália)"]],
  ["debora-123", "Débora e Daniel", ["Débora", "Daniel"]],
  ["lorena-408", "Lorena e João Pedro", ["Lorena", "João Pedro"]],
  ["halila-20c", "Halila", ["Halila"]],
  ["renata-1e4", "Renata e Nick", ["Renata", "Nick"]],
  ["larissa-10a", "Larissa e Beto", ["Larissa", "Beto"]],
  ["lu-091", "Lu", ["Lu"]],
  ["liandra-393", "Liandra", ["Liandra"]],
  ["dona-aurea-6a7", "Dona Áurea", ["Dona Áurea"]],
  ["mamau-18d", "Mamau e Esposa", ["Mamau", "Esposa"]],
  ["marcos-785", "Marcos, Larissa e Esposa", ["Marcos", "Larissa", "Esposa"]],
  ["nene-22c", "Nenê", ["Nenê"]],
  ["monica-f6f", "Mônica", ["Mônica"]],
  ["igual-d1a", "Igual, Esposa, Filha e Filha", ["Igual", "Esposa", "Filha", "Filha"]]
];

/* ---------------- utilidades ---------------- */
function planilha_() {
  const ss = PLANILHA_ID ? SpreadsheetApp.openById(PLANILHA_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Planilha não encontrada: preencha PLANILHA_ID no topo do código.");
  return ss;
}
function saida_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function norm_(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(); }

/* ---------------- montar a lista (rodar uma vez) ---------------- */
function criarListaConvidados() {
  const ss = planilha_();
  let sh = ss.getSheetByName(ABA_CONV);
  if (sh && sh.getLastRow() > 1) {
    SpreadsheetApp.getUi && Logger.log("A aba Convidados já existe — nada foi apagado. Só o Resumo foi refeito.");
  } else {
    if (!sh) sh = ss.insertSheet(ABA_CONV, 0);
    const cab = ["Código", "Convite", "Pessoa", "Resposta", "Respondido em", "Recado", "Link do convite"];
    const linhas = [];
    LISTA.forEach(([cod, convite, pessoas]) => pessoas.forEach((p, i) =>
      linhas.push([cod, convite, p, PEND, "", "", i === 0 ? SITE + "/?c=" + cod : ""])));
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight("bold").setBackground("#3b4723").setFontColor("#f3eee2");
    sh.getRange(2, 1, linhas.length, cab.length).setValues(linhas);
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 110); sh.setColumnWidth(2, 260); sh.setColumnWidth(3, 170); sh.setColumnWidth(4, 110);
    sh.setColumnWidth(5, 130); sh.setColumnWidth(6, 260); sh.setColumnWidth(7, 330);
    const rules = [
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(VAI).setBackground("#d9e3c0").setRanges([sh.getRange("D2:D")]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(NAO).setBackground("#f3d9cf").setRanges([sh.getRange("D2:D")]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(PEND).setBackground("#f6efd9").setRanges([sh.getRange("D2:D")]).build()
    ];
    sh.setConditionalFormatRules(rules);
    sh.getRange("D2:D").setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList([PEND, VAI, NAO], true).build());
  }
  resumo_(ss, true);
}

function resumo_(ss, refazer) {
  let r = ss.getSheetByName("Resumo");
  if (r && !refazer) return;
  if (r) r.clear(); else r = ss.insertSheet("Resumo", 1);
  const C = "'" + ABA_CONV + "'";
  const linhas = [
    ["Resumo do casamento", ""],
    ["Pessoas convidadas", `=COUNTA(${C}!C2:C)`],
    ["✅ Vão", `=COUNTIF(${C}!D2:D,"${VAI}")`],
    ["❌ Não vão", `=COUNTIF(${C}!D2:D,"${NAO}")`],
    ["⏳ Ainda não responderam", `=COUNTIF(${C}!D2:D,"${PEND}")`],
    ["", ""],
    ["Convites enviados (grupos)", `=COUNTUNIQUE(${C}!A2:A)`],
    ["Confirmações sem link (aba Confirmações)", `=MAX(0,COUNTA('${ABA}'!B2:B))`]
  ];
  r.getRange(1, 1, linhas.length, 2).setValues(linhas.map(l => [l[0], ""]));
  linhas.forEach((l, i) => { if (l[1]) r.getRange(i + 1, 2).setFormula(l[1]); });
  r.getRange("A1").setFontWeight("bold").setFontSize(13);
  r.getRange("B2:B8").setFontWeight("bold").setFontSize(12);
  r.setColumnWidth(1, 320); r.setColumnWidth(2, 90);
  if (!ss.getSheetByName(ABA)) {
    const a = ss.insertSheet(ABA);
    a.appendRow(["Data/hora", "Nome", "Vai?", "Recado", "Respostas"]);
    a.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#3b4723").setFontColor("#f3eee2");
  }
}

/* ---------------- grupo (link personalizado) ---------------- */
function linhasDoGrupo_(sh, cod) {
  const n = sh.getLastRow() - 1; if (n < 1) return [];
  const v = sh.getRange(2, 1, n, 6).getValues(), out = [];
  v.forEach((r, i) => { if (norm_(r[0]) === norm_(cod)) out.push({ linha: i + 2, convite: r[1], nome: r[2], resposta: r[3], recado: r[5] }); });
  return out;
}

function grupo_(cod) {
  const sh = planilha_().getSheetByName(ABA_CONV);
  if (!sh) return { ok: false, erro: "Lista de convidados não criada" };
  const g = linhasDoGrupo_(sh, cod);
  if (!g.length) return { ok: false, erro: "Convite não encontrado" };
  return { ok: true, convite: g[0].convite, respondido: g.some(x => x.resposta && x.resposta !== PEND),
           pessoas: g.map((x, i) => ({ i, nome: x.nome, resposta: x.resposta === VAI ? "sim" : x.resposta === NAO ? "nao" : "" })) };
}

function responder_(p) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = planilha_().getSheetByName(ABA_CONV);
    if (!sh) return { ok: false, erro: "Lista de convidados não criada" };
    const g = linhasDoGrupo_(sh, p.c);
    if (!g.length) return { ok: false, erro: "Convite não encontrado" };
    let vai = []; try { vai = JSON.parse(p.vai || "[]").map(Number); } catch (e) {}
    const recado = String(p.recado || "").slice(0, 1000), agora = new Date();
    g.forEach((x, i) => {
      sh.getRange(x.linha, 4, 1, 3).setValues([[vai.indexOf(i) >= 0 ? VAI : NAO, agora, i === 0 ? (recado || x.recado || "") : (x.recado || "")]]);
      sh.getRange(x.linha, 5).setNumberFormat("dd/MM/yyyy HH:mm");
    });
    return { ok: true, vao: vai.length, total: g.length };
  } finally { lock.releaseLock(); }
}

/* ---------------- confirmação avulsa (sem link) ---------------- */
function registrar_(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const nome = String(p.nome || "").trim().slice(0, 120);
    if (!nome) return saida_({ ok: false, erro: "nome vazio" });
    const presenca = p.presenca === "Não" ? "Não" : "Sim";
    const recado = String(p.recado || "").trim().slice(0, 1000);
    const ss = planilha_(); resumo_(ss, false);
    const sh = ss.getSheetByName(ABA);
    const dados = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues() : [];
    let linha = -1;
    for (let i = 0; i < dados.length; i++) if (norm_(dados[i][0]) === norm_(nome)) { linha = i + 2; break; }
    const agora = new Date();
    if (linha > 0) {
      const vezes = Number(sh.getRange(linha, 5).getValue() || 1) + 1;
      sh.getRange(linha, 1, 1, 5).setValues([[agora, nome, presenca, recado || sh.getRange(linha, 4).getValue(), vezes]]);
    } else { sh.appendRow([agora, nome, presenca, recado, 1]); linha = sh.getLastRow(); }
    sh.getRange(linha, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    return saida_({ ok: true });
  } catch (err) { return saida_({ ok: false, erro: String(err) }); }
  finally { lock.releaseLock(); }
}

/* ---------------- entrada web ---------------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.acao === "grupo") return saida_(grupo_(p.c));
    if (p.acao === "responder") return saida_(responder_(p));
    if (p.nome) return registrar_(e);
    return saida_({ ok: true, info: "Planilha de confirmações ativa", planilha: planilha_().getName() });
  } catch (err) { return saida_({ ok: false, erro: String(err) }); }
}
function doPost(e) { return doGet(e); }

function testeManual() {
  Logger.log(JSON.stringify(grupo_(LISTA[0][0])));
}
