// ==========================================================================
// home.js - LÓGICA DA TELA INICIAL
// ==========================================================================

function criarCardJogo(jogo, destaque = false) {
    const { dia } = formatarData(jogo.data);
    
    // CORREÇÃO: Garante que ele pegue o ID certo, seja jogo.id ou jogo.matchIdSofascore
    const idDaPartida = jogo.id || jogo.matchIdSofascore;
    const link = idDaPartida ? `frontend/partidas.html?id=${idDaPartida}` : "#";

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

document.addEventListener("DOMContentLoaded", async () => {
    const containerDestaque = document.getElementById("jogo-destaque");
    const containerLista = document.getElementById("lista-jogos");

    if (!containerDestaque && !containerLista) return;

    try {
        const jogos = await api.getJogos();
        const final = jogos.find(j => j.fase === "Final") || jogos[jogos.length - 1];

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
        if (containerDestaque) containerDestaque.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar os dados.</p>";
    }
});