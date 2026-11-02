/**
 * Confirmações de presença – Casamento Pedro & Andreza
 * Grava na planilha "Casamento | Pedro & Andreza" (abas Convidados, Resumo e Confirmações).
 *
 * ATUALIZAR:
 * 1. Extensões › Apps Script: apague tudo, cole TODO este código e salve.
 * 2. Escolha a função  testeManual  e clique em ▶ Executar  → autorize o acesso à planilha.
 * 3. Implantar › Gerenciar implantações › lápis › Versão: "Nova versão" › Implantar.
 *
 * NÃO precisa rodar criarListaConvidados (a lista já está na aba Convidados).
 */

const PLANILHA_ID = "1Ka0VuoH6MQSmbPERCW8zGhCVNWrV9lI0zEtB9zduH5g";   // planilha "Casamento | Pedro & Andreza"
const SITE = "https://convite-pedro-andreza.vercel.app";

const ABA = "Confirmações";             // confirmações feitas sem link personalizado
const ABA_CONV = "Convidados";
const PEND = "⏳ Pendente", VAI = "✅ Vai", NAO = "❌ Não vai";

const LISTA = [];   // a lista agora fica na aba "Convidados" da planilha

/* ---------------- utilidades ---------------- */
function planilha_() {
  const ss = PLANILHA_ID ? SpreadsheetApp.openById(PLANILHA_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Planilha não encontrada: preencha PLANILHA_ID no topo do código.");
  return ss;
}
function saida_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function norm_(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim(); }

/* ---------------- resumo / aba de confirmações avulsas ---------------- */
function resumo_(ss, refazer) {
  let r = ss.getSheetByName("Resumo");
  if (r && !refazer) return;
  if (!r) r = ss.insertSheet("Resumo");
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
  Logger.log(JSON.stringify(grupo_("luiz-59c")));
}
