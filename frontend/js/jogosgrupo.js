// ==========================================================================
// jogosgrupo.js - EXIBE JOGOS DO GRUPO 
// ==========================================================================

function obterParametroURL(nome) {
    return new URLSearchParams(window.location.search).get(nome);
}

// Função para formatar a data exibindo o ano de 2022 (Ex: "20/11/2022 - 13:00")
function formatarDataHoraIndex(timestamp) {
    if (!timestamp) return "";
    try {
        const milissegundos = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
        const data = new Date(milissegundos);
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = "2022"; // Força o ano correto da Copa do Mundo de 2022
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
    } catch (e) {
        return "";
    }
}

// Mapeamento de estádios da Copa por IDs conhecidos
const mapaEstadiosCopa = {
    "10230541": "Estádio Al Bayt",
    "10230559": "Estádio Al Thumama",
    "10230543": "Estádio Al Thumama",
    "10230551": "Estádio Internacional Khalifa",
    "10230561": "Estádio Internacional Khalifa",
    "10230553": "Estádio Al Bayt",
    "10230544": "Estádio Internacional Khalifa",
    "10230562": "Estádio Ahmad bin Ali",
    "10230554": "Estádio Ahmad bin Ali",
    "10230546": "Estádio Al Bayt",
    "10230556": "Estádio Ahmad bin Ali",
    "10230548": "Estádio Al Thumama",
    "10230547": "Estádio Lusail",
    "10230565": "Estádio 974",
    "10230549": "Estádio Lusail",
    "10230557": "Estádio Education City",
    "10230550": "Estádio 974",
    "10230558": "Estádio Lusail",
    "10230567": "Estádio Education City",
    "10230531": "Estádio Al Janoub",
    "10230533": "Estádio Al Janoub",
    "10230534": "Estádio 974",
    "10230536": "Estádio Al Janoub",
    "10230538": "Estádio Education City",
    "10230563": "Estádio Internacional Khalifa",
    "10230521": "Estádio Al Thumama",
    "10230523": "Estádio Ahmad bin Ali",
    "10230522": "Estádio Al Bayt",
    "10230525": "Estádio Internacional Khalifa",
    "10230527": "Estádio Al Bayt",
    "10230569": "Estádio Al Bayt",
    "10230537": "Estádio Ahmad bin Ali",
    "10230539": "Estádio Al Thumama",
    "10230540": "Estádio Internacional Khalifa",
    "10230542": "Estádio Ahmad bin Ali",
    "10230545": "Estádio Al Thumama",
    "10230568": "Estádio Al Janoub",
    "10230532": "Estádio Lusail",
    "10230535": "Estádio Al Janoub",
    "10230530": "Estádio 974",
    "10230552": "Estádio 974",
    "10230555": "Estádio Lusail",
    "10230574": "Estádio Education City",
    "10230576": "Estádio 974",
    "10230572": "Estádio Education City",
    "10230570": "Estádio Lusail",
    "10230571": "Estádio Education City",
    "10230573": "Estádio Al Janoub"
};

// Localizador de segurança: busca estádios pelo confronto das seleções (Copa do Mundo 2022)
function obterEstadioSeguro(casa, fora, matchId) {
    const idStr = matchId ? String(matchId).trim() : "";
    if (idStr && mapaEstadiosCopa[idStr]) {
        return mapaEstadiosCopa[idStr];
    }

    const c = String(casa).toLowerCase().trim();
    const f = String(fora).toLowerCase().trim();
    const confronto = [c, f].sort().join(" x ");

    const mapaConfrontos = {
        // Grupo A
        "ecuador x qatar": "Estádio Al Bayt",
        "netherlands x senegal": "Estádio Al Thumama",
        "qatar x senegal": "Estádio Al Thumama",
        "ecuador x netherlands": "Estádio Internacional Khalifa",
        "ecuador x senegal": "Estádio Internacional Khalifa",
        "netherlands x qatar": "Estádio Al Bayt",

        // Grupo B
        "england x iran": "Estádio Internacional Khalifa",
        "usa x wales": "Estádio Ahmad bin Ali",
        "iran x wales": "Estádio Ahmad bin Ali",
        "england x usa": "Estádio Al Bayt",
        "england x wales": "Estádio Ahmad bin Ali",
        "iran x usa": "Estádio Al Thumama",

        // Grupo C
        "argentina x saudi arabia": "Estádio Lusail",
        "mexico x poland": "Estádio 974",
        "poland x saudi arabia": "Estádio Education City",
        "argentina x mexico": "Estádio Lusail",
        "argentina x poland": "Estádio 974",
        "mexico x saudi arabia": "Estádio Lusail",

        // Grupo D
        "denmark x tunisia": "Estádio Education City",
        "australia x france": "Estádio Al Janoub",
        "australia x tunisia": "Estádio Al Janoub",
        "denmark x france": "Estádio 974",
        "australia x denmark": "Estádio Al Janoub",
        "france x tunisia": "Estádio Education City",

        // Grupo E
        "germany x japan": "Estádio Internacional Khalifa",
        "costa rica x spain": "Estádio Al Thumama",
        "costa rica x japan": "Estádio Ahmad bin Ali",
        "germany x spain": "Estádio Al Bayt",
        "japan x spain": "Estádio Internacional Khalifa",
        "costa rica x germany": "Estádio Al Bayt",

        // Grupo F
        "croatia x morocco": "Estádio Al Bayt",
        "canada x belgium": "Estádio Ahmad bin Ali",
        "belgium x morocco": "Estádio Al Thumama",
        "canada x croatia": "Estádio Internacional Khalifa",
        "belgium x croatia": "Estádio Ahmad bin Ali",
        "canada x morocco": "Estádio Al Thumama",

        // Grupo G
        "cameroon x switzerland": "Estádio Al Janoub",
        "brazil x seria": "Estádio Lusail",
        "brazil x serbia": "Estádio Lusail",
        "cameroon x serbia": "Estádio Al Janoub",
        "brazil x switzerland": "Estádio 974",
        "serbia x switzerland": "Estádio 974",
        "brazil x cameroon": "Estádio Lusail",

        // Grupo H
        "south korea x uruguay": "Estádio Education City",
        "ghana x portugal": "Estádio 974",
        "ghana x south korea": "Estádio Education City",
        "portugal x uruguay": "Estádio Lusail",
        "portugal x south korea": "Estádio Education City",
        "ghana x uruguay": "Estádio Al Janoub"
    };

    return mapaConfrontos[confronto] || "";
}

document.addEventListener("DOMContentLoaded", async () => {
    const containerJogos = document.getElementById("container-jogos");
    const tituloGrupo = document.getElementById("titulo-grupo");
    if (!containerJogos) return;

    const grupoParam = obterParametroURL("grupo");

    if (!grupoParam) {
        containerJogos.innerHTML = "<p class='mensagem-vazia'>Nenhum grupo selecionado.</p>";
        return;
    }

    const nomeAmigavel = decodeURIComponent(grupoParam).replace("Group ", "Grupo ");
    if (tituloGrupo) {
        tituloGrupo.innerHTML = `⚽ Jogos — ${nomeAmigavel}`;
    }

    try {
        // 1. Carrega as seleções para os escudos
        const selecoesCadastradas = await api.getSelecoes();
        const mapaEscudos = {};
        selecoesCadastradas.forEach(s => {
            if (s.nome) {
                mapaEscudos[s.nome.toLowerCase().trim()] = s.escudo;
            }
        });

        // 2. Carrega a classificação para saber os grupos
        const classificacao = await api.getClassificacao();

        // 3. Carrega o mapa de partidas com os placares reais
        const respostaMapaPartidas = await fetch("../backend/data/sofascore/ids_partidas.json");
        let mapaPartidas = {};
        if (respostaMapaPartidas.ok) {
            mapaPartidas = await respostaMapaPartidas.json();
        }
        
        // 4. Carrega os jogos do arquivo JSON principal
        const respostaJogos = await fetch("../backend/dados_JSON/jogos_sofascore.json");
        if (!respostaJogos.ok) {
            throw new Error("Não foi possível carregar o arquivo de jogos.");
        }
        const todosJogos = await respostaJogos.json();

        const termoGrupoAlvo = decodeURIComponent(grupoParam).toLowerCase().trim().replace("group ", "grupo ");

        const selecoesDoGrupo = classificacao
            .filter(s => s.grupo && s.grupo.toLowerCase().trim().replace("group ", "grupo ") === termoGrupoAlvo)
            .map(s => s.nome.toLowerCase().trim());

        // 5. Filtra os jogos pertencentes ao grupo selecionado
        const jogosFiltrados = todosJogos.filter(j => {
            const timeMandante = j.case || j.casa;
            const timeVisitante = j.fora || j.away;

            const nomeCasa = timeMandante && timeMandante.nome ? timeMandante.nome.toLowerCase().trim() : "";
            const nomeFora = timeVisitante && timeVisitante.nome ? timeVisitante.nome.toLowerCase().trim() : "";
            
            return selecoesDoGrupo.includes(nomeCasa) || selecoesDoGrupo.includes(nomeFora);
        });

        jogosFiltrados.sort((a, b) => (a.rodada || 0) - (b.rodada || 0));

        if (jogosFiltrados.length === 0) {
            containerJogos.innerHTML = "<p class='mensagem-vazia'>Nenhum jogo registrado para este grupo ainda.</p>";
            return;
        }

        // 6. Renderiza as partidas na tela (Modificado com as tags <a> para direcionamento seguro)
        containerJogos.innerHTML = jogosFiltrados.map(j => {
            const timeMandante = j.case || j.casa;
            const timeVisitante = j.fora || j.away;

            const nomeCasa = timeMandante ? timeMandante.nome : "Time Casa";
            const nomeFora = timeVisitante ? timeVisitante.nome : "Time Fora";

            const escudoCasa = mapaEscudos[nomeCasa.toLowerCase().trim()] || 'https://via.placeholder.com/100';
            const escudoFora = mapaEscudos[nomeFora.toLowerCase().trim()] || 'https://via.placeholder.com/100';

            const matchIdStr = j.match_id ? String(j.match_id).trim() : "";
            const dadosPartidaReal = mapaPartidas[matchIdStr];

            let golsCasa = "";
            let golsFora = "";
            let timestamp = j.data || j.startTimestamp || (dadosPartidaReal ? (dadosPartidaReal.startTimestamp || dadosPartidaReal.timestamp) : "");

            if (dadosPartidaReal) {
                golsCasa = dadosPartidaReal.homeScore?.current !== undefined ? dadosPartidaReal.homeScore.current : (dadosPartidaReal.homeTeam?.gols ?? "");
                golsFora = dadosPartidaReal.awayScore?.current !== undefined ? dadosPartidaReal.awayScore.current : (dadosPartidaReal.awayTeam?.gols ?? "");
            }

            // Formatação de data (Ex: 20/11/2022 - 13:00)
            const dataFormatada = formatarDataHoraIndex(timestamp);

            // Resgate seguro do estádio pelo ID ou Confronto
            const estadio = obterEstadioSeguro(nomeCasa, nomeFora, matchIdStr);

            return `
                <a href="../frontend/partidas.html?id=${matchIdStr}" style="text-decoration: none; color: inherit; display: block;" class="link-jogo-clicavel">
                    <div class="card-jogo">
                        <div class="card-top">
                            <span class="status-fase" style="text-transform: uppercase; font-weight: 600; font-size: 0.75rem; color: var(--roxo-neon);">
                                ${nomeAmigavel} — Rodada ${j.rodada || "1"}
                            </span>
                            <span style="font-size: 0.75rem; color: var(--texto-secundario); font-weight: 500;">
                                ${dataFormatada}
                            </span>
                        </div>
                        
                        <div class="teams">
                            <div class="team">
                                <div class="team-flag" style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--bg-elevado); border: 1px solid var(--borda);">
                                    <img src="${escudoCasa}" alt="${nomeCasa}" style="width: 100%; height: 100%; object-fit: contain;">
                                </div>
                                <span style="margin-top: 8px;">${nomeCasa}</span>
                            </div>
                            
                            <div class="score">
                                <span>${golsCasa}</span>
                                <span class="vs" style="font-size: 0.8rem; color: var(--texto-secundario); margin: 0 6px; font-weight: 400;">x</span>
                                <span>${golsFora}</span>
                            </div>
                            
                            <div class="team">
                                <div class="team-flag" style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--bg-elevado); border: 1px solid var(--borda);">
                                    <img src="${escudoFora}" alt="${nomeFora}" style="width: 100%; height: 100%; object-fit: contain;">
                                </div>
                                <span style="margin-top: 8px;">${nomeFora}</span>
                            </div>
                        </div>

                        ${estadio ? `
                            <div class="estadio-container" style="text-align: center; font-size: 0.75rem; color: var(--texto-secundario); border-top: 1px dashed var(--borda); padding-top: 8px; margin-top: 8px;">
                                ${estadio}
                            </div>
                        ` : ""}
                    </div>
                </a>
            `;
        }).join("");

    } catch (erro) {
        console.error("Erro ao carregar os jogos do grupo:", erro);
        containerJogos.innerHTML = "<p class='mensagem-vazia'>Erro ao processar as partidas do grupo.</p>";
    }
});