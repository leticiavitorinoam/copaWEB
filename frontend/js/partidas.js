// ==========================================================================
// partidas.js - LÓGICA DA TELA DE DETALHE DA PARTIDA
// ==========================================================================

function parametroURL(nome) {
    return new URLSearchParams(window.location.search).get(nome);
}

function iconeEvento(tipo) {
    const t = (tipo || "").toLowerCase();
    if (t.includes("goal")) return "⚽";
    if (t.includes("card")) return "🟨";
    if (t.includes("subst")) return "🔄";
    return "•";
}

async function safeFetch(promise, valorPadrao) {
    try {
        return await promise;
    } catch (erro) {
        console.error("Falha ao carregar um dos dados da partida:", erro);
        return valorPadrao;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const containerPlacar = document.getElementById("partida-placar");
    if (!containerPlacar) return;

    const matchId = parametroURL("id");

    if (!matchId) {
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Nenhuma partida selecionada. Volte e escolha um jogo.</p>";
        return;
    }

    try {
        // matchId aqui é o id da API-Football (o mesmo que está em jogo.id
        // dentro de /api/jogos) — o Flask já traduz pra SofaScore por trás,
        // não precisamos mais buscar/ler o mapa_ids.json no frontend.
        const jogos = await safeFetch(api.getJogos(), []);
        const estatisticas = await safeFetch(api.getEstatisticas(matchId), null);
        const listaEventos = await safeFetch(api.getEventos(matchId), null);
        const escalacao = await safeFetch(api.getEscalacoes(matchId), null);
        const jogadoresDaPartida = await safeFetch(api.getJogadoresPartida(matchId), null);

        if (jogos.length === 0) {
            throw new Error("A API de jogos não retornou nenhum dado.");
        }

        const jogo = jogos.find(j => String(j.id) === String(matchId));

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
            containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Partida não encontrada nos dados.</p>";
            return;
        }

        // ESTATÍSTICAS
        const containerStats = document.getElementById("partida-estatisticas");
        if (containerStats && estatisticas) {
            const e1 = estatisticas.selecao01.estatisticas;
            const e2 = estatisticas.selecao02.estatisticas;

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

        // EVENTOS
        const containerEventos = document.getElementById("partida-eventos");
        if (containerEventos && listaEventos && listaEventos.length) {
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
            `).join("");
        } else if (containerEventos) {
            containerEventos.innerHTML = "<p style='color: var(--texto-secundario);'>Sem eventos registrados.</p>";
        }

        // ESCALAÇÕES
        const containerEscalacoes = document.getElementById("partida-escalacoes");
        if (containerEscalacoes && escalacao) {
            containerEscalacoes.innerHTML = ["selecao01", "selecao02"].map(chave => {
                const time = escalacao[chave];
                if (!time) return "";

                // pega o escudo direto do objeto "jogo" (API-Football),
                // que sabemos que sempre vem certo
                const escudoCorreto = jogo[chave].escudo;

                return `
                    <div class="stats-panel" style="margin-bottom:1.2rem;">
                        <h3 style="font-size:0.95rem; margin-bottom:0.8rem;">
                            <img src="${escudoCorreto}" style="width:20px; height:20px; vertical-align:middle; margin-right:6px; object-fit:cover; border-radius:50%;">
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

        // DESTAQUES DA PARTIDA
        const containerDestaques = document.getElementById("partida-destaques");
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
        console.error("Erro fatal ao carregar detalhes:", erro);
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao processar a partida.</p>";
    }
});