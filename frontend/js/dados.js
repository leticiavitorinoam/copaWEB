const API_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  carregarPaginaInicial();
});

async function carregarPaginaInicial() {
  try {
    const resposta = await fetch(`${API_URL}/api/jogos`);

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const jogos = await resposta.json();

    exibirDestaque(jogos);
    exibirJogosPorFase(jogos);
  } catch (erro) {
    console.error("Erro ao carregar jogos:", erro);

    const destaque = document.getElementById("jogo-destaque");
    if (destaque) {
      destaque.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar os dados.</p>';
    }

    const lista = document.getElementById("lista-jogos");
    if (lista) {
      lista.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar os dados.</p>';
    }
  }
}

// ------------------------------------------------------------------
// Monta o HTML de um card de jogo (usado tanto na lista quanto no destaque)
// ------------------------------------------------------------------
function montarCardJogo(jogo) {
  const placarA = jogo.score.final.selecao01;
  const placarB = jogo.score.final.selecao02;

  const temPenaltis = jogo.score.penaltis.selecao01 !== null;
  const placarPenaltis = temPenaltis
    ? `<div class="mensagem-vazia" style="padding:4px 0;">Pên: ${jogo.score.penaltis.selecao01} x ${jogo.score.penaltis.selecao02}</div>`
    : "";

  return `
    <a href="partidas.html?id=${jogo.id}" style="text-decoration:none; color:inherit;">
      <div class="card-jogo">
        <div class="card-top">
          <span>${jogo.fase}</span>
          <span>${jogo.estadio ?? ""}</span>
        </div>
        <div class="teams">
          <div class="team">
            <div class="team-flag">
              <img src="${jogo.selecao01.escudo}" alt="${jogo.selecao01.nome}"
                   style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
            </div>
            <span>${jogo.selecao01.nome}</span>
          </div>

          <div class="score">${placarA ?? "-"} x ${placarB ?? "-"}</div>

          <div class="team">
            <div class="team-flag">
              <img src="${jogo.selecao02.escudo}" alt="${jogo.selecao02.nome}"
                   style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
            </div>
            <span>${jogo.selecao02.nome}</span>
          </div>
        </div>
        ${placarPenaltis}
      </div>
    </a>
  `;
}

// ------------------------------------------------------------------
// Seção "A Grande Final"
// ------------------------------------------------------------------
function exibirDestaque(jogos) {
  const container = document.getElementById("jogo-destaque");
  if (!container) return;

  let final = jogos.find((j) => j.fase && j.fase.toLowerCase() === "final");

  // fallback: se não achar pelo nome exato da fase, pega o último jogo
  // da lista (a final é sempre o último jogo cronologicamente)
  if (!final) {
    final = jogos[jogos.length - 1];
  }

  container.innerHTML = montarCardJogo(final);
}

// ------------------------------------------------------------------
// Seção "Resultados por Fase" — agrupado
// ------------------------------------------------------------------
function exibirJogosPorFase(jogos) {
  const container = document.getElementById("lista-jogos");
  if (!container) return;

  // agrupa os jogos pela chave "fase", mantendo a ordem em que aparecem
  const grupos = {};
  const ordemFases = [];

  jogos.forEach((jogo) => {
    const fase = jogo.fase || "Outros";

    if (!grupos[fase]) {
      grupos[fase] = [];
      ordemFases.push(fase);
    }

    grupos[fase].push(jogo);
  });

  let html = "";

  ordemFases.forEach((fase) => {
    html += `<h3>${fase}</h3>`;
    grupos[fase].forEach((jogo) => {
      html += montarCardJogo(jogo);
    });
  });

  container.innerHTML = html;
}