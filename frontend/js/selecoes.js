// ==========================================================================
// selecoes.js - LÓGICA DA TELA DE SELEÇÕES
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("selecoes-grid");
    if (!container) return;

    try {
        const lista = await api.getSelecoes();
        lista.sort((a, b) => a.nome.localeCompare(b.nome));

        container.innerHTML = lista.map(s => {
            // Link atualizado para apontar para perfilselecao.html
            const link = `perfilselecao.html?id=${encodeURIComponent(s.nome)}`;

            return `
                <a href="${link}" style="text-decoration: none; color: inherit;">
                    <div class="selecao-card" style="cursor: pointer; transition: transform 0.2s;">
                        <img src="${s.escudo}" alt="${s.nome}" style="width:50px; height:50px; object-fit:contain; margin-bottom: 8px;">
                        <strong>${s.nome}</strong>
                        <span class="selecao-sigla">Fundada em ${s.fundacao}</span>
                    </div>
                </a>
            `;
        }).join("");

    } catch (erro) {
        console.error("Erro ao carregar seleções:", erro);
        container.innerHTML = "<p style='color: var(--texto-secundario);'>Erro ao carregar as seleções.</p>";
    }
});