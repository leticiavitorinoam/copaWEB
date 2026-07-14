// ==========================================================================
// tabela.js - LÓGICA DA TELA DE CLASSIFICAÇÃO
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

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("tabela-classificacao");
    if (!container) return;

    try {
        const lista = await api.getClassificacao();

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
});