// ==========================================================================
// CONFIGURAÇÃO DE CAMINHOS
// Página em subpasta (ex: tabela/tabela.html) deve definir antes deste script:
// <script>const DADOS_PREFIX = "../";</script>
// ==========================================================================

const PREFIXO = (typeof DADOS_PREFIX !== "undefined") ? DADOS_PREFIX : "";

async function carregarJSON(caminhoRelativo) {
    const resposta = await fetch(PREFIXO + caminhoRelativo);
    if (!resposta.ok) {
        throw new Error(`Não foi possível carregar ${caminhoRelativo} (status ${resposta.status})`);
    }
    return resposta.json();
}

// ==========================================================================
// FASES DA COPA (ordem de exibição e rótulos em pt-BR)
// ==========================================================================

const ORDEM_FASES = [
    "Group Stage - 1", "Group Stage - 2", "Group Stage - 3",
    "Round of 16", "Quarter-finals", "Semi-finals", "3rd Place Final", "Final"
];

const ROTULO_FASE = {
    "Group Stage - 1": "Fase de Grupos — Rodada 1",
    "Group Stage - 2": "Fase de Grupos — Rodada 2",
    "Group Stage - 3": "Fase de Grupos — Rodada 3",
    "Round of 16": "Oitavas de Final",
    "Quarter-finals": "Quartas de Final",
    "Semi-finals": "Semifinal",
    "3rd Place Final": "Disputa de 3º Lugar",
    "Final": "Final"
};

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return {
        dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
}

// ==========================================================================
// CARD DE JOGO (usado no index.html)
// ==========================================================================

function placarTexto(score) {
    if (score.penaltis.selecao01 !== null && score.penaltis.selecao02 !== null) {
        return `${score.final.selecao01} (${score.penaltis.selecao01}) • ${score.final.selecao02} (${score.penaltis.selecao02})`;
    }
    if (score.prorrogacao.selecao01 !== null && score.prorrogacao.selecao02 !== null) {
        return `${score.prorrogacao.selecao01} • ${score.prorrogacao.selecao02}`;
    }
    return `${score.final.selecao01} • ${score.final.selecao02}`;
}

function criarCardJogo(jogo, destaque = false) {
    const { dia } = formatarData(jogo.data);
    const link = jogo.matchIdSofascore ? `partida.html?id=${jogo.matchIdSofascore}` : "#";

    return `
        <a href="${link}" style="text-decoration:none; color:inherit;">
            <div class="card-jogo" style="${destaque ? 'border: 1px solid var(--roxo-neon);' : ''}">
                <div class="card-top">
                    <span style="color: var(--texto-secundario);">${ROTULO_FASE[jogo.fase] || jogo.fase}</span>
                    <span style="color: var(--texto-secundario);">${dia}</span>
                </div>
                <div class="teams">
                    <div class="team">
                        <div class="team-flag">
                            <img src="${jogo.selecao01.escudo}" alt="${jogo.selecao01.nome}" style="width:100%; height:100%; border-radius:50%; object-fit: cover;">
                        </div>
                        <span>${jogo.selecao01.nome}</span>
                    </div>
                    <div class="score">${placarTexto(jogo.score)}</div>
                    <div class="team">
                        <div class="team-flag">
                            <img src="${jogo.selecao02.escudo}" alt="${jogo.selecao02.nome}" style="width:100%; height:100%; border-radius:50%; object-fit: cover;">
                        </div>
                        <span>${jogo.selecao02.nome}</span>
                    </div>
                </div>
                <div style="text-align:center; font-size:0.8rem; color: var(--texto-secundario);">${jogo.estadio} — ${jogo.cidade}</div>
            </div>
        </a>
    `;
}

async function renderizarJogos() {
    const containerDestaque = document.getElementById("jogo-destaque");
    const containerLista = document.getElementById("lista-jogos");

    if (!containerDestaque && !containerLista) return;

    try {
        const jogos = await carregarJSON("dados_JSON/jogos.json");
        const final = jogos.find(j => j.fase === "Final");

        if (containerDestaque && final) {
            containerDestaque.innerHTML = criarCardJogo(final, true);
        }

        if (containerLista) {
            const porFase = {};
            for (const jogo of jogos) {
                if (jogo.fase === "Final") continue;
                if (!porFase[jogo.fase]) porFase[jogo.fase] = [];
                porFase[jogo.fase].push(jogo);
            }

            let html = "";
            for (const fase of ORDEM_FASES) {
                if (fase === "Final" || !porFase[fase]) continue;
                html += `<h3 class="section-header" style="font-size:1rem; margin-top:1.5rem;">${ROTULO_FASE[fase]}</h3>`;
                html += porFase[fase].map(j => criarCardJogo(j)).join("");
            }
            containerLista.innerHTML = html;
        }

    } catch (erro) {
        console.error("Erro ao carregar jogos:", erro);
        if (containerLista) containerLista.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar os jogos.</p>";
    }
}

// ==========================================================================
// CLASSIFICAÇÃO (tabela.html)
// ==========================================================================

function criarGrupoTabela(grupoNome, selecoes) {
    selecoes.sort((a, b) => a.posicao - b.posicao);

    const linhas = selecoes.map(s => `
        <tr>
            <td>${s.posicao}</td>
            <td class="col-time">
                <img src="${s.escudo}" alt="${s.nome}" style="width:22px; height:22px; vertical-align:middle; margin-right:8px; border-radius:50%;">
                ${s.nome}
                ${s.posicao <= 2 ? '<span style="color: var(--verde-stat); font-size:0.7rem; margin-left:6px;">●</span>' : ''}
            </td>
            <td>${s.pontos}</td>
            <td>${s.jogos}</td>
            <td>${s.vitorias}</td>
            <td>${s.empates}</td>
            <td>${s.derrotas}</td>
            <td>${s.saldoGols}</td>
        </tr>
    `).join("");

    return `
        <div class="stats-panel" style="margin-bottom: 2rem;">
            <h3 class="section-header" style="font-size: 1rem;">${grupoNome.replace("Group ", "Grupo ")}</h3>
            <table class="tabela-classificacao">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Seleção</th>
                        <th>Pts</th>
                        <th>J</th>
                        <th>V</th>
                        <th>E</th>
                        <th>D</th>
                        <th>SG</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
            <div style="font-size:0.7rem; color: var(--texto-secundario); margin-top:0.5rem;">
                <span style="color: var(--verde-stat);">●</span> classificado para as oitavas
            </div>
        </div>
    `;
}

async function renderizarClassificacao() {
    const container = document.getElementById("tabela-classificacao");
    if (!container) return;

    try {
        const lista = await carregarJSON("dados_JSON/classificacao.json");

        const porGrupo = {};
        for (const s of lista) {
            if (!porGrupo[s.grupo]) porGrupo[s.grupo] = [];
            porGrupo[s.grupo].push(s);
        }

        const gruposOrdenados = Object.keys(porGrupo).sort();
        container.innerHTML = gruposOrdenados.map(g => criarGrupoTabela(g, porGrupo[g])).join("");

    } catch (erro) {
        console.error("Erro ao carregar classificação:", erro);
        container.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar a classificação.</p>";
    }
}

// ==========================================================================
// ARTILHEIROS (artilheiros.html)
// ==========================================================================

async function renderizarArtilheiros() {
    const container = document.getElementById("artilheiros-tabela");
    if (!container) return;

    try {
        const lista = await carregarJSON("dados_JSON/artilheiros.json");

        const linhas = lista.map(a => `
            <tr>
                <td>${a.rank}</td>
                <td class="col-time">
                    <img src="${a.foto}" alt="${a.nome}" style="width:26px; height:26px; vertical-align:middle; margin-right:8px; border-radius:50%; object-fit:cover;">
                    ${a.nome}
                </td>
                <td>
                    <img src="${a.selecao.escudo}" alt="${a.selecao.nome}" style="width:18px; height:18px; vertical-align:middle; margin-right:4px;">
                    ${a.selecao.nome}
                </td>
                <td class="val-verde">${a.gols}</td>
                <td>${a.assistencias}</td>
                <td>${a.jogos}</td>
            </tr>
        `).join("");

        container.innerHTML = `
            <table class="tabela-classificacao">
                <thead>
                    <tr>
                        <th>#</th>
                        <th style="text-align:left;">Jogador</th>
                        <th>Seleção</th>
                        <th>Gols</th>
                        <th>Assist.</th>
                        <th>Jogos</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        `;

    } catch (erro) {
        console.error("Erro ao carregar artilheiros:", erro);
        container.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar os artilheiros.</p>";
    }
}

// ==========================================================================
// SELEÇÕES (selecoes.html)
// ==========================================================================

async function renderizarSelecoes() {
    const container = document.getElementById("selecoes-grid");
    if (!container) return;

    try {
        const lista = await carregarJSON("dados_JSON/selecoes.json");
        lista.sort((a, b) => a.nome.localeCompare(b.nome));

        container.innerHTML = lista.map(s => `
            <div class="selecao-card">
                <img src="${s.escudo}" alt="${s.nome}" style="width:50px; height:50px; object-fit:contain;">
                <strong>${s.nome}</strong>
                <span class="selecao-sigla">Fundada em ${s.fundacao}</span>
            </div>
        `).join("");

    } catch (erro) {
        console.error("Erro ao carregar seleções:", erro);
        container.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar as seleções.</p>";
    }
}

// ==========================================================================
// DETALHES DA PARTIDA (partida.html?id=<matchIdSofascore>)
// ==========================================================================

function parametroURL(nome) {
    return new URLSearchParams(window.location.search).get(nome);
}

async function renderizarPartida() {
    const containerPlacar = document.getElementById("partida-placar");
    if (!containerPlacar) return;

    const matchId = parametroURL("id");

    if (!matchId) {
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Nenhuma partida selecionada. Volte e escolha um jogo.</p>";
        return;
    }

    try {
        const [jogos, estatisticas, eventos, escalacoes, jogadoresPartida] = await Promise.all([
            carregarJSON("dados_JSON/jogos.json"),
            carregarJSON("dados_JSON/sofascore/estatisticas.json"),
            carregarJSON("dados_JSON/sofascore/eventos.json"),
            carregarJSON("dados_JSON/sofascore/escalacoes.json"),
            carregarJSON("dados_JSON/sofascore/jogadores_partida.json")
        ]);

        const jogo = jogos.find(j => String(j.matchIdSofascore) === String(matchId));

        if (jogo) {
            const { dia } = formatarData(jogo.data);
            containerPlacar.innerHTML = `
                <div class="card-jogo">
                    <div class="card-top">
                        <span style="color: var(--texto-secundario);">${ROTULO_FASE[jogo.fase] || jogo.fase}</span>
                        <span style="color: var(--texto-secundario);">${dia}</span>
                    </div>
                    <div class="teams">
                        <div class="team">
                            <div class="team-flag"><img src="${jogo.selecao01.escudo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                            <span>${jogo.selecao01.nome}</span>
                        </div>
                        <div class="score">${placarTexto(jogo.score)}</div>
                        <div class="team">
                            <div class="team-flag"><img src="${jogo.selecao02.escudo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                            <span>${jogo.selecao02.nome}</span>
                        </div>
                    </div>
                    <div style="text-align:center; font-size:0.85rem; color: var(--texto-secundario);">${jogo.estadio} — ${jogo.cidade}</div>
                </div>
            `;
        } else {
            containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Partida não encontrada.</p>";
        }

        const containerStats = document.getElementById("partida-estatisticas");
        const stats = estatisticas[matchId];
        if (containerStats && stats) {
            const e1 = stats.selecao01.estatisticas;
            const e2 = stats.selecao02.estatisticas;

            const linha = (label, v1, v2) => `
                <div class="stat-row">
                    <span class="stat-value val-verde">${v1 ?? "-"}</span>
                    <div class="stat-label">${label}</div>
                    <span class="stat-value val-vermelho">${v2 ?? "-"}</span>
                </div>
            `;

            containerStats.innerHTML = `
                <div class="stat-row">
                    <span class="stat-value val-verde">${e1.posseBola ?? "-"}</span>
                    <div class="progress-container">
                        <div class="progress-a" style="width: ${parseInt(e1.posseBola) || 50}%;"></div>
                        <div class="progress-b" style="width: ${100 - (parseInt(e1.posseBola) || 50)}%;"></div>
                    </div>
                    <span class="stat-value val-vermelho">${e2.posseBola ?? "-"}</span>
                </div>
                <div style="text-align:center; font-size:0.75rem; color: var(--texto-secundario); margin-top:-10px; margin-bottom:15px;">Posse de bola</div>
                ${linha("Finalizações", e1.totalChutes, e2.totalChutes)}
                ${linha("Chutes ao gol", e1.chutesAoGol, e2.chutesAoGol)}
                ${linha("Passes", e1.passes, e2.passes)}
                ${linha("Precisão de passes", e1.precisaoPasses, e2.precisaoPasses)}
                ${linha("Escanteios", e1.escanteios, e2.escanteios)}
                ${linha("Faltas", e1.faltas, e2.faltas)}
                ${linha("Cartões amarelos", e1.cartoesAmarelos ?? 0, e2.cartoesAmarelos ?? 0)}
                ${linha("Defesas do goleiro", e1.defesasGoleiro, e2.defesasGoleiro)}
            `;
        } else if (containerStats) {
            containerStats.innerHTML = "<p style='color: var(--texto-secundario);'>Estatísticas não disponíveis para esta partida.</p>";
        }

        const containerEventos = document.getElementById("partida-eventos");
        const listaEventos = eventos[matchId];
        if (containerEventos && listaEventos) {
            const ordenados = [...listaEventos].sort((a, b) => a.minuto - b.minuto);
            containerEventos.innerHTML = ordenados.map(ev => `
                <div class="evento-item">
                    <span class="evento-minuto">${ev.minuto}'</span>
                    <span>
                        ${iconeEvento(ev.tipo)} <strong>${ev.jogador}</strong>
                        ${ev.assistencia ? ` (assist.: ${ev.assistencia})` : ""}
                        — ${ev.selecao.nome}
                    </span>
                </div>
            `).join("") || "<p style='color: var(--texto-secundario);'>Sem eventos registrados.</p>";
        } else if (containerEventos) {
            containerEventos.innerHTML = "<p style='color: var(--texto-secundario);'>Eventos não disponíveis para esta partida.</p>";
        }

        const containerEscalacoes = document.getElementById("partida-escalacoes");
        const escalacao = escalacoes[matchId];
        if (containerEscalacoes && escalacao) {
            containerEscalacoes.innerHTML = ["selecao01", "selecao02"].map(chave => {
                const time = escalacao[chave];
                if (!time) return "";
                return `
                    <div class="stats-panel" style="margin-bottom:1.2rem;">
                        <h3 style="font-size:0.95rem; margin-bottom:0.8rem;">
                            <img src="${time.escudo}" style="width:20px; height:20px; vertical-align:middle; margin-right:6px;">
                            ${time.nome} ${time.formacao ? `— ${time.formacao}` : ""}
                        </h3>
                        <ul class="lista-jogadores">
                            ${time.titulares.map(j => `<li>${j.numeroCamisa ?? ""} ${j.nome} <span style="color: var(--texto-secundario);">(${j.posicao ?? ""})</span></li>`).join("")}
                        </ul>
                    </div>
                `;
            }).join("");
        } else if (containerEscalacoes) {
            containerEscalacoes.innerHTML = "<p style='color: var(--texto-secundario);'>Escalações não disponíveis para esta partida.</p>";
        }

        const containerDestaques = document.getElementById("partida-destaques");
        const jogadoresDaPartida = jogadoresPartida[matchId];
        if (containerDestaques && jogadoresDaPartida) {
            const todos = [
                ...jogadoresDaPartida.selecao01.jogadores.map(j => ({ ...j, time: jogadoresDaPartida.selecao01.nome })),
                ...jogadoresDaPartida.selecao02.jogadores.map(j => ({ ...j, time: jogadoresDaPartida.selecao02.nome }))
            ].filter(j => j.nota);

            todos.sort((a, b) => b.nota - a.nota);
            const top3 = todos.slice(0, 3);

            containerDestaques.innerHTML = top3.map(j => `
                <div class="evento-item">
                    <span class="evento-minuto" style="color: var(--verde-stat);">${j.nota.toFixed(1)}</span>
                    <span><strong>${j.nome}</strong> — ${j.time} ${j.gols ? `⚽x${j.gols}` : ""}</span>
                </div>
            `).join("") || "<p style='color: var(--texto-secundario);'>Sem dados de desempenho.</p>";
        } else if (containerDestaques) {
            containerDestaques.innerHTML = "<p style='color: var(--texto-secundario);'>Sem dados de desempenho.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar detalhes da partida:", erro);
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar os dados da partida.</p>";
    }
}

function iconeEvento(tipo) {
    const t = (tipo || "").toLowerCase();
    if (t.includes("goal")) return "⚽";
    if (t.includes("card")) return "🟨";
    if (t.includes("subst")) return "🔄";
    if (t.includes("var")) return "📺";
    return "•";
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    renderizarJogos();
    renderizarClassificacao();
    renderizarArtilheiros();
    renderizarSelecoes();
    renderizarPartida();
});