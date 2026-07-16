const API_URL = "https://copaweb.onrender.com";

// Busca dados no backend Flask
async function fetchAPI(endpoint) {
    const resposta = await fetch(`${API_URL}${endpoint}`);
    if (!resposta.ok) {
        throw new Error(`Não foi possível carregar API ${endpoint} (status ${resposta.status})`);
    }
    return resposta.json();
}

// TUDO passa pelo Flask agora.
const api = {
    getJogos: () => fetchAPI("/api/jogos"),
    getClassificacao: () => fetchAPI("/api/classificacao"),
    getArtilheiros: () => fetchAPI("/api/artilheiros"),
    getSelecoes: () => fetchAPI("/api/selecoes"),

    // Dados por partida — recebem o id da API-Football. O Flask traduz 
    // pro id da SofaScore usando o mapa_ids.json.
    getEstatisticas: (fixtureId) => fetchAPI(`/api/estatisticas/${fixtureId}`),
    getEventos: (fixtureId) => fetchAPI(`/api/eventos/${fixtureId}`),
    getEscalacoes: (fixtureId) => fetchAPI(`/api/escalacoes/${fixtureId}`),
    getJogadoresPartida: (fixtureId) => fetchAPI(`/api/jogadores-partida/${fixtureId}`),

    // Perfil de jogador — lista inteira
    getJogadoresPerfil: () => fetchAPI(`/api/jogadores-perfil`),

    getJogadorPerfil: (playerId) => fetchAPI(`/api/jogador/${playerId}`)
};

// ==========================================================================
// CONSTANTES E FUNÇÕES ÚTEIS (Compartilhadas)
// ==========================================================================
const ORDEM_FASES = [
    "Group Stage - 1", "Group Stage - 2", "Group Stage - 3",
    "Round of 16", "Quarter-finals", "Semi-finals", "3rd Place Final", "Final"
];

const ROTULO_FASE = {
    "Group Stage - 1": "Fase de Grupos — Rodada 1",
    "Group Stage - 2": "Fase de Grupos — Rodada 2",
    "Group Stage - 3": "Fase de Grupos — Rodada 3",
    "Round of 16": "Oitavas de Final",
    "Quarter-finals": "Quartas de Final",
    "Semi-finals": "Semifinal",
    "3rd Place Final": "Disputa de 3º Lugar",
    "Final": "Final"
};

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return {
        dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
}

function placarTexto(score) {
    if (score.penaltis.selecao01 !== null && score.penaltis.selecao02 !== null) {
        return `${score.final.selecao01} (${score.penaltis.selecao01}) • ${score.final.selecao02} (${score.penaltis.selecao02})`;
    }
    if (score.prorrogacao.selecao01 !== null && score.prorrogacao.selecao02 !== null) {
        return `${score.prorrogacao.selecao01} • ${score.prorrogacao.selecao02}`;
    }
    return `${score.final.selecao01} • ${score.final.selecao02}`;
}