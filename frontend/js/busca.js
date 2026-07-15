document.addEventListener("DOMContentLoaded", () => {
    const campoPesquisa = document.getElementById("campo-pesquisa");
    if (!campoPesquisa) return;

    campoPesquisa.addEventListener("input", (evento) => {
        const termoBusca = evento.target.value.toLowerCase().trim();

        // 1. Primeiro, filtramos os itens individuais normalmente
        const seletores = [
            ".card-jogo", 
            ".card-jogador", 
            ".selecao-card", 
            "tbody tr", // As linhas das tabelas de classificação
            ".stat-row",
            ".selecao-item"
        ];

        const itens = document.querySelectorAll(seletores.join(", "));

        itens.forEach(item => {
            const textoItem = item.textContent.toLowerCase();

            // Tratamento especial para o link do card de seleção
            const elementoParaEsconder = item.classList.contains("selecao-card") && item.parentElement.tagName === "A"
                ? item.parentElement 
                : item;

            if (textoItem.includes(termoBusca)) {
                elementoParaEsconder.style.display = ""; 
            } else {
                elementoParaEsconder.style.display = "none"; 
            }
        });

        // 2. AGORA A MÁGICA: Esconder os grupos/tabelas que ficaram vazios
        // Procuramos todas as tabelas na página de classificação
        const tabelas = document.querySelectorAll("table");

        tabelas.forEach(tabela => {
            // Conta quantas linhas de dados (no tbody) ainda estão visíveis após o filtro
            const linhasVisiveis = tabela.querySelectorAll("tbody tr:not([style*='display: none'])");
            
            // Tentamos encontrar o contêiner do grupo que envolve essa tabela.
            // Geralmente é uma div que fica algumas posições acima da tabela.
            // Procuramos pelo elemento pai mais comum que representa o "Card" do grupo.
            const cardGrupo = tabela.closest(".grupo-card") || 
                              tabela.closest(".card-grupo") || 
                              tabela.closest(".grupo-container") || 
                              tabela.closest("div[style*='background']") || // Se o estilo estiver direto na div
                              tabela.parentElement; // Caso padrão se não achar classe específica

            if (cardGrupo) {
                if (termoBusca === "") {
                    // Se a busca estiver vazia, garante que todos os grupos apareçam de volta
                    cardGrupo.style.display = "";
                } else if (linhasVisiveis.length === 0) {
                    // Se não sobrou nenhum time visível nesse grupo, esconde o grupo inteiro!
                    cardGrupo.style.display = "none";
                } else {
                    // Se tiver pelo menos um time visível, mostra o grupo
                    cardGrupo.style.display = "";
                }
            }
        });
    });
});