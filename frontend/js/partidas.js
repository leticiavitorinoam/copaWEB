// ==========================================================================
// partidas.js - DETECTANDO STRINGS OU OBJETOS NO MAPA DE IDS
// ==========================================================================

function parametroURL(nome) {
    return new URLSearchParams(window.location.search).get(nome);
}

function iconeEvento(tipo) {
    const t = (tipo || "").toLowerCase();
    if (t.includes("gol")) return "fa-solid fa-futbol";
    if (t.includes("cartão")) return "fa-solid fa-clone";
    if (t.includes("subst")) return "fa-solid fa-rotate";
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

const traducaoTimes = {
    "qatar": "catar",
    "netherlands": "países baixos",
    "senegal": "senegal",
    "ecuador": "equador",
    "england": "inglaterra",
    "iran": "irã",
    "usa": "estados unidos",
    "wales": "país de gales",
    "argentina": "argentina",
    "saudi arabia": "arábia saudita",
    "mexico": "méxico",
    "poland": "polônia",
    "denmark": "dinamarca",
    "tunisia": "tunísia",
    "australia": "austrália",
    "france": "frança",
    "germany": "alemanha",
    "japan": "japão",
    "costa rica": "costa rica",
    "spain": "espanha",
    "croatia": "croácia",
    "morocco": "marrocos",
    "canada": "canadá",
    "belgium": "bélgica",
    "cameroon": "camarões",
    "switzerland": "suíça",
    "brazil": "brasil",
    "serbia": "sérvia",
    "south korea": "coreia do sul",
    "ghana": "gana",
    "portugal": "portugal",
    "uruguay": "uruguai"
};
 
function traduzirTime(nome) {
    const chave = String(nome).toLowerCase().trim();
    return traducaoTimes[chave] || chave;
}

document.addEventListener("DOMContentLoaded", async () => {
    const containerPlacar = document.getElementById("partida-placar");
    if (!containerPlacar) return;

    const urlId = parametroURL("match_id") || parametroURL("id");

    if (!urlId) {
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Nenhuma partida selecionada. Volte e escolha um jogo.</p>";
        return;
    }

    try {
        let matchId = urlId; 
        console.log("ID recebido da URL:", urlId);

        // 1. Carrega a lista de jogos do banco da API
        const jogos = await safeFetch(api.getJogos(), []);

        if (urlId.length === 8) {
            console.log("Detectado ID do SofaScore. Iniciando busca inteligente por correspondência...");
            
            try {
                const respostaMapaPartidas = await fetch("../backend/data/sofascore/ids_partidas.json");
                
                if (respostaMapaPartidas.ok) {
                    const mapaPartidas = await respostaMapaPartidas.json();
                    const dadosMapeados = mapaPartidas[urlId];
                    
                    if (dadosMapeados) {
                        // Extrai com segurança o nome do time da casa (seja ele objeto ou string simples)
                        let casaJson = "";
                        if (typeof dadosMapeados.homeTeam === 'object' && dadosMapeados.homeTeam !== null) {
                            casaJson = dadosMapeados.homeTeam.name || dadosMapeados.homeTeam.nome || "";
                        } else {
                            casaJson = dadosMapeados.homeTeam || "";
                        }

                        // Extrai com segurança o nome do time visitante (seja ele objeto ou string simples)
                        let foraJson = "";
                        if (typeof dadosMapeados.awayTeam === 'object' && dadosMapeados.awayTeam !== null) {
                            foraJson = dadosMapeados.awayTeam.name || dadosMapeados.awayTeam.nome || "";
                        } else {
                            foraJson = dadosMapeados.awayTeam || "";
                        }

                        casaJson = traduzirTime(casaJson);
                        foraJson = traduzirTime(foraJson);

                        console.log(`Buscando correspondência de times no banco: ${casaJson} x ${foraJson}`);

                        if (casaJson && foraJson) {
                            // Procuramos na lista de jogos reais qual partida tem esses mesmos times
                            const jogoCorrespondente = jogos.find(j => {
                                const nome01 = String(j.selecao01.nome).toLowerCase().trim();
                                const nome02 = String(j.selecao02.nome).toLowerCase().trim();

                                return (nome01.includes(casaJson) || casaJson.includes(nome01)) && 
                                       (nome02.includes(foraJson) || foraJson.includes(nome02)) ||
                                       (nome01.includes(foraJson) || foraJson.includes(nome01)) && 
                                       (nome02.includes(casaJson) || casaJson.includes(nome02));
                            });

                            if (jogoCorrespondente) {
                                matchId = String(jogoCorrespondente.id);
                                console.log("Sucesso! ID real da API-Football localizado:", matchId);
                            } else {
                                console.warn("Nenhum jogo correspondente encontrado para esses times.");
                            }
                        }
                    }
                }
            } catch (erroBusca) {
                console.error("Erro ao tentar buscar jogo correspondente:", erroBusca);
            }
        }

        console.log("Disparando requisições para a API Flask com o ID:", matchId);

        // 2. Faz as requisições principais à sua API Flask com o ID correto descoberto
        const estatisticas = await safeFetch(api.getEstatisticas(matchId), null);
        const listaEventos = await safeFetch(api.getEventos(matchId), null);
        const escalacao = await safeFetch(api.getEscalacoes(matchId), null);
        const jogadoresDaPartida = await safeFetch(api.getJogadoresPartida(matchId), null);

        if (jogos.length === 0) {
            throw new Error("A API de jogos não retornou nenhum dado.");
        }

        // Encontra o jogo usando o ID traduzido
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

            const htmlLinha = (label, v1, v2) => `
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
                ${htmlLinha("Finalizações", e1.totalChutes, e2.totalChutes)}
                ${htmlLinha("Chutes ao gol", e1.chutesAoGol, e2.chutesAoGol)}
                ${htmlLinha("Passes", e1.passes, e2.passes)}
                ${htmlLinha("Precisão de passes", e1.precisaoPasses, e2.precisaoPasses)}
                ${htmlLinha("Escanteios", e1.escanteios, e2.escanteios)}
                ${htmlLinha("Faltas", e1.faltas, e2.faltas)}
                ${htmlLinha("Cartões amarelos", e1.cartoesAmarelos ?? 0, e2.cartoesAmarelos ?? 0)}
                ${htmlLinha("Defesas do goleiro", e1.defesasGoleiro, e2.defesasGoleiro)}
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
                        <i class="${iconeEvento(ev.tipo)}"></i> <strong>${ev.jogador}</strong>
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

                containerDestaques.innerHTML = top3.map(j => {
                    const nomePaisTraduzido = traduzirTime(j.time).replace(/^\w/, c => c.toUpperCase());
                
                    return `
                        <div class="evento-item">
                            <span class="evento-minuto" style="color: var(--verde-stat);">${j.nota.toFixed(1)}</span>
                            <span>
                                <strong>${j.nome}</strong> — 
                                ${nomePaisTraduzido} 
                                ${j.gols ? ` <span class="info-card-icon" style="margin-left: 6px;"><i class="fa-regular fa-futbol"></i></span>x${j.gols}` : ""}
                        </span>
                    </div>
                `;
            }).join("") || "<p style='color: var(--texto-secundario);'>Sem dados de desempenho.</p>";
        } else if (containerDestaques) {
            containerDestaques.innerHTML = "<p style='color: var(--texto-secundario);'>Sem dados de desempenho.</p>";
        }

    } catch (erro) {
        console.error("Erro fatal ao carregar detalhes:", erro);
        containerPlacar.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao processar a partida.</p>";
    }
});