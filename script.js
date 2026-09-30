// ====== CONFIGURAÇÃO ======
const CODIGO_DA_TURMA = "TURMA2026"; // troque pelo código do seu grupo
const MEDIA_MINIMA = 6;              // média para aprovação
const CHAVE_STORAGE = "media-escolar:notas";

let notas = []; // cada item: { materia, valor }

const $ = (id) => document.getElementById(id);

// ====== SALVAR / CARREGAR (no navegador do aluno) ======
function salvar() {
  try { localStorage.setItem(CHAVE_STORAGE, JSON.stringify(notas)); } catch (e) {}
}
function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
    if (Array.isArray(dados)) notas = dados;
  } catch (e) {}
}

// ====== ACESSO ======
function entrar() {
  if ($("codigo").value.trim() === CODIGO_DA_TURMA) {
    $("telaAcesso").classList.add("oculto");
    $("telaNotas").classList.remove("oculto");
    $("erroAcesso").textContent = "";
    $("materia").focus();
  } else {
    $("erroAcesso").textContent = "Código incorreto. Confira com o seu grupo e tente de novo.";
  }
}

function sair() {
  $("codigo").value = "";
  $("telaNotas").classList.add("oculto");
  $("telaAcesso").classList.remove("oculto");
}

// ====== NOTAS ======
function adicionar() {
  const materia = $("materia").value.trim();
  const valor = parseFloat($("nota").value.replace(",", "."));
  const erro = $("erroNota");

  if (!materia) { erro.textContent = "Digite o nome da matéria."; return; }
  if (isNaN(valor) || valor < 0 || valor > 10) {
    erro.textContent = "A nota deve ser um número de 0 a 10."; return;
  }
  if (notas.some(n => n.materia.toLowerCase() === materia.toLowerCase())) {
    erro.textContent = "Essa matéria já foi adicionada. Remova-a para lançar outra nota."; return;
  }

  erro.textContent = "";
  notas.push({ materia, valor });
  $("materia").value = "";
  $("nota").value = "";
  $("materia").focus();
  salvar();
  desenhar();
}

function remover(i) {
  notas.splice(i, 1);
  salvar();
  desenhar();
}

function limparTudo() {
  notas = [];
  salvar();
  desenhar();
}

function desenhar() {
  const ul = $("lista");
  ul.innerHTML = "";
  notas.forEach((n, i) => {
    const li = document.createElement("li");
    const nome = document.createElement("span");
    nome.textContent = n.materia;

    const dir = document.createElement("span");
    const b = document.createElement("b");
    b.textContent = n.valor.toFixed(1).replace(".", ",");
    const x = document.createElement("button");
    x.className = "x";
    x.textContent = "×";
    x.setAttribute("aria-label", "Remover " + n.materia);
    x.onclick = () => remover(i);

    dir.append(b, x);
    li.append(nome, dir);
    ul.append(li);
  });
  $("vazio").classList.toggle("oculto", notas.length > 0);
  $("resultado").classList.add("oculto"); // o resultado antigo deixa de valer
}

// ====== MÉDIA ======
function calcular() {
  if (notas.length === 0) {
    $("erroNota").textContent = "Adicione pelo menos uma nota para calcular a média.";
    return;
  }
  $("erroNota").textContent = "";

  const soma = notas.reduce((total, n) => total + n.valor, 0);
  const media = soma / notas.length;

  $("media").textContent = media.toFixed(2).replace(".", ",");
  const aprovado = media >= MEDIA_MINIMA;
  const st = $("status");
  st.textContent = aprovado
    ? "Acima da média mínima (" + MEDIA_MINIMA + ")"
    : "Abaixo da média mínima (" + MEDIA_MINIMA + ")";
  st.className = "status " + (aprovado ? "ok" : "bad");
  $("resultado").classList.remove("oculto");
}

// ====== EVENTOS ======
$("btnEntrar").onclick = entrar;
$("codigo").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
$("btnSair").onclick = sair;
$("btnAdd").onclick = adicionar;
$("nota").addEventListener("keydown", e => { if (e.key === "Enter") adicionar(); });
$("btnCalc").onclick = calcular;
$("btnLimpar").onclick = limparTudo;

carregar();
desenhar();
