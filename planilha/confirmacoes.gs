/**
 * Confirmações de presença – Casamento Pedro & Andreza
 *
 * COMO INSTALAR (uma vez só):
 * 1. Crie uma planilha no Google Planilhas (sheets.new) chamada "Confirmações – Pedro & Andreza".
 * 2. Menu Extensões › Apps Script. Apague o que estiver lá e cole TODO este código. Salve (ícone de disquete).
 * 3. Clique em Implantar › Nova implantação › (engrenagem) Aplicativo da Web.
 *      - Executar como: Eu
 *      - Quem pode acessar: Qualquer pessoa
 *    Clique em Implantar, autorize com sua conta Google e COPIE o "URL do app da Web" (termina em /exec).
 * 4. Mande esse endereço para o Claude colocar no site (CONFIG.planilhaURL).
 *
 * Se a mesma pessoa responder de novo (mesmo nome), a linha dela é ATUALIZADA — não duplica.
 */

// Se o código NÃO foi aberto por Extensões › Apps Script dentro da planilha,
// cole aqui o ID da planilha (o trecho entre /d/ e /edit no endereço dela):
const PLANILHA_ID = "";

const ABA = "Confirmações";
const CABECALHO = ["Data/hora", "Nome", "Vai?", "Recado", "Respostas"];

function planilha_() {
  const ss = PLANILHA_ID ? SpreadsheetApp.openById(PLANILHA_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Planilha não encontrada: preencha PLANILHA_ID no topo do código.");
  return ss;
}

function aba_() {
  const ss = planilha_();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA, 0);
    sh.appendRow(CABECALHO);
    sh.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold").setBackground("#3b4723").setFontColor("#f3eee2");
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, 1, 150); sh.setColumnWidth(2, 240); sh.setColumnWidth(3, 70); sh.setColumnWidth(4, 360); sh.setColumnWidth(5, 90);
    resumo_(ss);
  }
  return sh;
}

function resumo_(ss) {
  let r = ss.getSheetByName("Resumo");
  if (r) return;
  r = ss.insertSheet("Resumo", 1);
  r.getRange("A1:B1").setValues([["Resumo", ""]]).setFontWeight("bold");
  r.getRange("A2:A4").setValues([["Confirmados (Sim)"], ["Não vão"], ["Total de respostas"]]);
  r.getRange("B2").setFormula(`=COUNTIF('${ABA}'!C:C;"Sim")`);
  r.getRange("B3").setFormula(`=COUNTIF('${ABA}'!C:C;"Não")`);
  r.getRange("B4").setFormula(`=COUNTA('${ABA}'!B:B)-1`);
  r.setColumnWidth(1, 200);
}

function doPost(e) { return registrar_(e); }

function registrar_(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const nome = String(p.nome || "").trim().slice(0, 120);
    if (!nome) return saida_({ ok: false, erro: "nome vazio" });
    const presenca = p.presenca === "Não" ? "Não" : "Sim";
    const recado = String(p.recado || "").trim().slice(0, 1000);

    const sh = aba_();
    const chave = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
    const dados = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues() : [];
    let linha = -1;
    for (let i = 0; i < dados.length; i++) {
      const n = String(dados[i][0]).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
      if (n === chave) { linha = i + 2; break; }
    }
    const agora = new Date();
    if (linha > 0) {
      const vezes = Number(sh.getRange(linha, 5).getValue() || 1) + 1;
      sh.getRange(linha, 1, 1, 5).setValues([[agora, nome, presenca, recado || sh.getRange(linha, 4).getValue(), vezes]]);
    } else {
      sh.appendRow([agora, nome, presenca, recado, 1]);
      linha = sh.getLastRow();
    }
    sh.getRange(linha, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    sh.getRange(linha, 3).setBackground(presenca === "Sim" ? "#e4e6cf" : "#f3d9cf");
    return saida_({ ok: true });
  } catch (err) {
    return saida_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.nome) return registrar_(e);   // também aceita envio por GET
  return saida_({ ok: true, info: "Planilha de confirmações ativa", planilha: planilha_().getName() });
}

// Rode esta função pelo editor (▶ Executar) para testar sem o site.
function testeManual() {
  registrar_({ parameter: { nome: "Teste pelo editor", presenca: "Sim", recado: "funcionou" } });
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
