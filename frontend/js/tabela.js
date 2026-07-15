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

    // Formata o nome do grupo de "Group A" para "Grupo A" na exibição
    const nomeFormatado = grupoNome.replace("Group ", "Grupo ");
    
    // REDIRECIONAMENTO SEGURO: Aponta diretamente para jogosgrupo.html passando o ID correto do grupo
    const linkGrupo = `jogosgrupo.html?grupo=${encodeURIComponent(grupoNome)}`;

    return `
        <div class="stats-panel grupo-clicavel" style="margin-bottom: 2rem;">
            <a href="${linkGrupo}" style="text-decoration: none; color: inherit; display: block;">
                <div class="header-link-grupo" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--borda); padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 class="section-header" style="font-size: 1rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                        <span>📊</span> ${nomeFormatado}
                    </h3>
                    <span class="botao-ver-jogos" style="font-size: 0.8rem; color: var(--roxo-neon); font-weight: 600; transition: color 0.2s ease;">Ver Jogos ➔</span>
                </div>
            </a>
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