const API_URL = "http://127.0.0.1:5000"; 

// 1. Busca os dados no servidor Python (porta 5000)
async function fetchAPI(endpoint) {
    const resposta = await fetch(`${API_URL}${endpoint}`);
    if (!resposta.ok) {
        throw new Error(`Não foi possível carregar API ${endpoint} (status ${resposta.status})`);
    }
    return resposta.json();
}

// 2. Busca os arquivos locais da própria pasta do projeto (porta 5500)
async function fetchLocal(caminho) {
    const resposta = await fetch(caminho);
    if (!resposta.ok) {
        throw new Error(`Não foi possível carregar local ${caminho} (status ${resposta.status})`);
    }
    return resposta.json();
}

// Objeto centralizado para buscar os dados
const api = {
    // O jogo vem do Flask na porta 5000
    getJogos: () => fetchAPI("/api/jogos"), 
    
    // Arquivos da pasta backend/dados_JSON
    getClassificacao: () => fetchLocal("../backend/dados_JSON/classificacao.json"),
    getArtilheiros: () => fetchLocal("../backend/dados_JSON/artilheiros.json"),
    getSelecoes: () => fetchLocal("../backend/dados_JSON/selecoes.json"),
    
    getMapaIds: () => fetchLocal("../backend/dados_JSON/mapa_ids.json"),
    
    // Arquivos da pasta backend/data/sofascore
    getEstatisticas: () => fetchLocal("../backend/data/sofascore/estatisticas.json"),
    getEventos: () => fetchLocal("../backend/data/sofascore/eventos.json"),
    getEscalacoes: () => fetchLocal("../backend/data/sofascore/escalacoes.json"),
    getJogadoresPartida: () => fetchLocal("../backend/data/sofascore/jogadores_partida.json"),
    getJogadoresPerfil: () => fetchLocal("../backend/data/sofascore/jogadores_perfil.json")
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