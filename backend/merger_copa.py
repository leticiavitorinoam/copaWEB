import json
import requests
from typing import List, Dict

# ==========================================
# 1. CONFIGURAÇÕES E CONSTANTES
# ==========================================
# URLs simuladas para o exemplo (na prática, use variáveis de ambiente)
API_FOOTBALL_URL = "https://v3.football.api-sports.io/fixtures"
API_SOFASCORE_URL = "https://sofascore6.p.rapidapi.com/api/sofascore/v1/events"

HEADERS_FOOTBALL = {"x-rapidapi-key": "SEU_TOKEN_AQUI"}
HEADERS_SOFASCORE = {"x-rapidapi-key": "SEU_TOKEN_AQUI"}

# ==========================================
# 2. FUNÇÕES DE EXTRAÇÃO (FETCH)
# ==========================================
def carregar_dados_locais(caminho_arquivo: str) -> Dict:
    """Função auxiliar caso os dados já estejam salvos nas pastas 'dados_JSON' ou 'data'."""
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
        return {}

def buscar_dados_api(url: str, headers: Dict) -> Dict:
    """Busca dados direto da API, tratando erros HTTP."""
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erro ao acessar {url}: {e}")
        return {}

# ==========================================
# 3. REGRA DE NEGÓCIO E MESCLAGEM
# ==========================================
def mesclar_jogos_estatisticas(jogos_api1: List[Dict], estatisticas_api2: Dict, jogos_sofascore: List[Dict]) -> List[Dict]:
    """
    Mescla os jogos da API-FootBall com as estatísticas da SofaScore.
    Usa o arquivo 'jogos_sofascore.json' como ponte de relacionamento.
    """
    if not jogos_api1 or not estatisticas_api2 or not jogos_sofascore:
        return []

    # PASSO A: Criar um mapa rápido (Dicionário) da ponte SofaScore
    # Como 'jogos_sofascore.json' tem o match_id, criamos uma chave combinada
    # ex: "Brasil-Servia" -> "10230541"
    mapa_ids_sofascore = {}
    for jogo_ponte in jogos_sofascore:
        time_casa = jogo_ponte.get("casa", {}).get("nome")
        time_fora = jogo_ponte.get("fora", {}).get("nome")
        match_id = jogo_ponte.get("match_id")
        
        if time_casa and time_fora:
            chave_confronto = f"{time_casa.lower()}-{time_fora.lower()}"
            mapa_ids_sofascore[chave_confronto] = str(match_id)

    jogos_enriquecidos = []

    # PASSO B: Iterar sobre os jogos principais (API 1) e mesclar
    for jogo in jogos_api1:
        # Pega as selecoes do jogos.json[cite: 1]
        selecao01 = jogo.get("selecoes", {}).get("selecao01", {}).get("nome", "").lower()
        selecao02 = jogo.get("selecoes", {}).get("selecao02", {}).get("nome", "").lower()
        
        chave_busca = f"{selecao01}-{selecao02}"
        match_id_sofascore = mapa_ids_sofascore.get(chave_busca)

        # Copia o objeto original para não mutar os dados iniciais
        jogo_final = jogo.copy()
        jogo_final["estatisticas"] = None # Valor padrão

        # Se achou o ID correspondente na API 2, anexa as estatísticas
        if match_id_sofascore and match_id_sofascore in estatisticas_api2:
            estatisticas_do_jogo = estatisticas_api2[match_id_sofascore]
            # O estatisticas.json tem estatísticas da selecao01 e selecao02[cite: 1]
            jogo_final["estatisticas"] = estatisticas_do_jogo
            
        jogos_enriquecidos.append(jogo_final)

    return jogos_enriquecidos

# ==========================================
# 4. ORQUESTRAÇÃO E EXECUÇÃO
# ==========================================
def executar_integracao():
    print("Iniciando o serviço de integração de dados da Copa...")
    
    # Simulação: Carregando os dados das pastas especificadas[cite: 1]
    # Na prática, você pode trocar carregar_dados_locais por buscar_dados_api
    lista_jogos_api1 = carregar_dados_locais("dados_JSON/jogos.json")
    ponte_jogos_sofa = carregar_dados_locais("dados_JSON/jogos_sofascore.json")
    estatisticas_api2 = carregar_dados_locais("data/estatisticas.json")
    
    resultado = mesclar_jogos_estatisticas(lista_jogos_api1, estatisticas_api2, ponte_jogos_sofa)
    
    if resultado:
        # Salva o resultado final mesclado em um novo arquivo
        with open("resultado_jogos_enriquecidos.json", "w", encoding="utf-8") as f:
            json.dump(resultado, f, ensure_ascii=False, indent=4)
        print(f"Sucesso! {len(resultado)} jogos processados e mesclados no arquivo 'resultado_jogos_enriquecidos.json'.")
    else:
        print("Falha na mesclagem. Verifique as fontes de dados.")

if __name__ == "__main__":
    executar_integracao()