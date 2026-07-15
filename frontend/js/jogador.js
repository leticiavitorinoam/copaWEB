// ==========================================================================
// LÓGICA DA TELA DE PERFIL DO JOGADOR

function parametroURL(nome) {
    return new URLSearchParams(window.location.search).get(nome);
}

function corrigirUrlImagem(url) {
    if (!url) return 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=%3F';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    return `../backend/${url}`;
}

function avatarFallback(nome) {
    const iniciais = encodeURIComponent(nome || "?");
    return `https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=${iniciais}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    const cabecalhoContainer = document.getElementById("jogador-cabecalho");
    const statsContainer = document.getElementById("jogador-estatisticas");

    const jogadorId = parametroURL("id");

    if (!jogadorId) {
        cabecalhoContainer.innerHTML = "<p style='color: var(--texto-secundario); text-align: center;'>Jogador não encontrado. Volte e selecione alguém.</p>";
        return;
    }

   try {
    const perfis = await api.getJogadoresPerfil();
    const listaPerfis = Array.isArray(perfis) ? perfis : Object.values(perfis);

    const respostaArtilheiros = await api.getArtilheiros();
    const artilheiros = Array.isArray(respostaArtilheiros) 
        ? respostaArtilheiros 
        : (respostaArtilheiros.data || Object.values(respostaArtilheiros));

    const termoBusca = jogadorId.toLowerCase().trim();

    const jogador = listaPerfis.find(p => {
        if (String(p.id) === termoBusca) return true;
        if (p.nome && p.nome.toLowerCase() === termoBusca) return true;
        if (p.nomeCurto && p.nomeCurto.toLowerCase() === termoBusca) return true;
        return false;
    });

    const dadosArtilheiro = artilheiros.find(a => {
    if (!a.nome || !jogador?.nome) return false;
    
    const nomeArtilheiro = a.nome.toLowerCase().trim();
    const nomeJogador = jogador.nome.toLowerCase().trim();

    return nomeArtilheiro === nomeJogador || 
           nomeArtilheiro.includes(nomeJogador) || 
           nomeJogador.includes(nomeArtilheiro);
});
    console.log("Jogador Encontrado:", jogador);
    console.log("Lista de Artilheiros:", artilheiros);
    console.log("Dados do Artilheiro Correspondente:", dadosArtilheiro);

    if (jogador) {
            const fotoJogador = corrigirUrlImagem(jogador.foto);
            const escudoSelecao = jogador.selecao?.escudo ? corrigirUrlImagem(jogador.selecao.escudo) : '';

            cabecalhoContainer.innerHTML = `
                <div class="card-jogo" style="display: flex; flex-direction: column; align-items: center; padding: 30px 20px;">
                   <img src="${fotoJogador}" alt="${jogador.nome}" onerror="this.onerror=null; this.src='${avatarFallback(jogador.nome)}';" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--roxo-neon); margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 1.5rem;">${jogador.nome}</h2>
                    <div style="display: flex; align-items: center; margin-top: 8px; color: var(--texto-secundario);">
                       ${escudoSelecao ? `<img src="${escudoSelecao}" onerror="this.onerror=null; this.src='${avatarFallback(jogador.selecao?.nome)}';" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px; object-fit: cover;">` : ''}
                        ${jogador.selecao?.nome || jogador.nacionalidade || 'Seleção desconhecida'} — ${jogador.posicao || 'Posição não informada'}
                    </div>
                </div>
            `;

            const linha = (label, valor) => `
                <div class="stat-row">
                    <div class="stat-label" style="text-align: left; flex: 1;">${label}</div>
                    <span class="stat-value" style="color: var(--verde-stat);">${valor ?? "-"}</span>
                </div>
            `;

            const statsObj = jogador.estatisticas || jogador.stats || jogador;

            statsContainer.innerHTML = `
                <h3 style="font-size: 0.9rem; margin-bottom: 15px; color: var(--texto-secundario);">Informações Físicas</h3>
                ${linha("Altura", jogador.altura ? jogador.altura + " cm" : null)}
                ${linha("Nacionalidade", jogador.nacionalidade)}

                <h3 style="font-size: 0.9rem; margin-top: 25px; margin-bottom: 15px; color: var(--texto-secundario);">Estatísticas na Copa</h3>
                ${linha("Jogos disputados", statsObj.jogos ?? statsObj.matches ?? statsObj.appearances)}
                ${linha("Minutos em campo", statsObj.minutosJogados ?? statsObj.minutesPlayed)}
                ${linha("Gols marcados", statsObj.gols ?? statsObj.goals)}
                ${linha("Assistências", statsObj.assistencias ?? statsObj.assists)}
                ${linha("Chutes ao gol por jogo", statsObj.chutesAoGolPorJogo ?? statsObj.shotsOnTargetPerGame)}
                ${linha("Cartões amarelos", statsObj.cartoesAmarelos ?? statsObj.yellowCards)}
                ${linha("Número da camisa", jogador.numeroCamisa ?? statsObj.numeroCamisa)}
                ${linha("Posição", jogador.posicao)}
            `;
        } else {
            cabecalhoContainer.innerHTML = "<p style='color: var(--texto-secundario); text-align: center;'>Dados detalhados não encontrados para este jogador.</p>";
            statsContainer.innerHTML = "";
        }

    } catch (erro) {
        console.error("Erro ao carregar perfil do jogador:", erro);
        cabecalhoContainer.innerHTML = "<p style='color: var(--texto-secundario); text-align: center;'>Erro ao processar as informações do jogador.</p>";
    }
});