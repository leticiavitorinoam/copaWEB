// ==========================================================================
// artilheiros.js - LÓGICA DA TELA DE ARTILHARIA
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("artilheiros-tabela");
    if (!container) return;

    try {
        const lista = await api.getArtilheiros();

        const linhas = lista.map(a => {
            // CORREÇÃO: Passamos a enviar o NOME do jogador na URL em vez do ID numérico
            const link = `jogador.html?id=${encodeURIComponent(a.nome)}`;

            return `
            <tr>
                <td>${a.rank}</td>
                <td class="col-time">
                    <a href="${link}" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
                        <img src="${a.foto}" alt="${a.nome}" style="width:26px; height:26px; vertical-align:middle; margin-right:8px; border-radius:50%; object-fit:cover;">
                        <strong>${a.nome}</strong>
                    </a>
                </td>
                <td>
                    <img src="${a.selecao.escudo}" alt="${a.selecao.nome}" style="width:18px; height:18px; vertical-align:middle; margin-right:4px;">
                    ${a.selecao.nome}
                </td>
                <td class="val-verde">${a.gols}</td>
                <td>${a.assistencias}</td>
                <td>${a.jogos}</td>
            </tr>
        `}).join("");

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
});