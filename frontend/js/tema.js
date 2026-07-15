// ==========================================================================
// tema.js - CONTROLE DE MODO CLARO / ESCURO
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const botaoTema = document.getElementById("btn-tema");
    const body = document.body;

    // 1. Verifica se o usuário já tinha uma preferência salva anteriormente
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "light") {
        body.classList.add("light-mode");
        atualizarIcone(true);
    } else {
        atualizarIcone(false);
    }

    // 2. Escuta o clique do botão para alternar o modo
    if (botaoTema) {
        botaoTema.addEventListener("click", () => {
            const ehModoClaro = body.classList.toggle("light-mode");
            
            // Salva a escolha do usuário
            localStorage.setItem("tema", ehModoClaro ? "light" : "dark");
            
            // Atualiza o visual do ícone
            atualizarIcone(ehModoClaro);
        });
    }

    // Função para mudar o ícone (Lua para tema escuro, Sol para tema claro)
    function atualizarIcone(ehModoClaro) {
        if (!botaoTema) return;
        const icone = botaoTema.querySelector("i");
        if (icone) {
            if (ehModoClaro) {
                icone.className = "fa-solid fa-sun"; // Ícone de Sol
                botaoTema.style.color = "#FFB300";   // Amarelo solar
            } else {
                icone.className = "fa-solid fa-moon"; // Ícone de Lua
                botaoTema.style.color = "var(--texto-principal)";
            }
        }
    }
});