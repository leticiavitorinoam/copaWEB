import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_SOFASCORE_KEY")

BASE_URL = "https://sofascore6.p.rapidapi.com/api/sofascore/v1"

HEADERS = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "sofascore6.p.rapidapi.com",
    "x-rapidapi-key": API_KEY
}

UNIQUE_TOURNAMENT_ID = 16
SEASON_ID = 41087
 
OUTPUT_DIR = "data/sofascore"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =================================
# BUSCAR O ID DAS PARTIDAS MATA-MATA
def buscar_mata_mata():
  
    url = f"{BASE_URL}/unique-tournament/season/cup-trees"  # AJUSTAR conforme o path real
    params = {
        "unique_tournament_id": UNIQUE_TOURNAMENT_ID,
        "season_id": SEASON_ID
    }
 
    resp = requests.get(url, headers=HEADERS, params=params)
 
    if resp.status_code != 200:
        print(f"Erro ao buscar cup trees: {resp.status_code}")
        return []
 
    data = resp.json()

    # a resposta vem como lista de "árvores" (geralmente só 1 pra Copa do Mundo)
    if isinstance(data, list) and len(data) > 0:
        rounds = data[0].get("rounds", [])
    else:
        rounds = []
 
    partidas_mata_mata = []
 
    for round_info in rounds:
        descricao_rodada = round_info.get("description")
        blocks = round_info.get("blocks", [])
 
        for block in blocks:
            match_id = block.get("matchId")
            if not match_id:
                continue
 
            participants = block.get("participants", [])
            home = participants[0] if len(participants) > 0 else {}
            away = participants[1] if len(participants) > 1 else {}
 
            partida_normalizada = {
                "id": match_id,
                "round_descricao": descricao_rodada,
                "finished": block.get("finished"),
                "result": block.get("result"),
                "homeTeam": home.get("team", {}),
                "awayTeam": away.get("team", {}),
                "homeScore": {"current": block.get("homeTeamScore")},
                "awayScore": {"current": block.get("awayTeamScore")},
                "homeWinner": home.get("winner"),
                "awayWinner": away.get("winner"),
            }
            partidas_mata_mata.append(partida_normalizada)
 
    print(f"Mata-mata: {len(partidas_mata_mata)} jogos encontrados.")
    return partidas_mata_mata

 
# ===============================
# PEGAR OS IDS DAS PARTIDAS
def pegar_ids_partidas(max_rounds=10):
    todas_partidas = []
 
    for round_num in range(1, max_rounds + 1):
        url = f"{BASE_URL}/unique-tournament/season/round/matches"
        params = {
            "round": round_num,
            "season_id": SEASON_ID,
            "unique_tournament_id": UNIQUE_TOURNAMENT_ID
        }
 
        resp = requests.get(url, headers=HEADERS, params=params)
 
        if resp.status_code != 200:
            print(f"Rodada {round_num}: erro {resp.status_code}, parando.")
            break
 
        data = resp.json()
 
        if isinstance(data, list):
            partidas_rodada = data
        elif isinstance(data, dict):
            partidas_rodada = data.get("matches") or data.get("events") or []
        else:
            partidas_rodada = []

        if partidas_rodada:
            print(json.dumps(partidas_rodada[0], indent=2, ensure_ascii=False))
 
        if not partidas_rodada:
            print(f"Rodada {round_num}: sem jogos, parando.")
            break
 
        print(f"Rodada {round_num}: {len(partidas_rodada)} jogos encontrados.")
        todas_partidas.extend(partidas_rodada)
 
        time.sleep(1)  
 
    partidas_mata_mata = buscar_mata_mata()
    todas_partidas.extend(partidas_mata_mata)

    ids_partidas = {}
    for partida in todas_partidas:
        match_id = partida.get("id")
        if match_id:
            ids_partidas[match_id] = partida
 
    filepath = os.path.join(OUTPUT_DIR, "ids_partidas.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(ids_partidas, f, ensure_ascii=False, indent=2)
 
    print(f"\nTotal de partidas salvas: {len(ids_partidas)}")
    print(f"Salvo em: {filepath}")
 
    return ids_partidas


# =================================
# JUNTA OS DADOS QUE SERÃO UTILIZADOS
def _extrair_stats_flat(groups):
    grupos_relevantes = ['Match overview', 'Shots', 'Attack', 'Passes']
    flat = {}

    for group in groups:
        if group.get('groupName') not in grupos_relevantes:
            continue
        for item in group.get('statisticsItems', []):
            flat[item['name']] = item

    return flat

# =================================
# FORMATA OS DADOS
def _montar_estatisticas_time(flat, lado):
    def valor(nome_stat, campo):
        item = flat.get(nome_stat)
        if not item:
            return None
        return item.get(campo)

    passes_total = valor('Passes', f'{lado}Value')
    passes_certos = valor('Accurate passes', f'{lado}Value')
    precisao_passes = None
    if passes_total and passes_certos is not None:
        precisao_passes = f"{round((passes_certos / passes_total) * 100)}%"

    return {
        "chutesAoGol": valor('Shots on target', f'{lado}Value'),
        "chutesFora": valor('Shots off target', f'{lado}Value'),
        "totalChutes": valor('Total shots', f'{lado}Value'),
        "posseBola": valor('Ball possession', lado),
        "passes": passes_total,
        "passesCertos": passes_certos,
        "precisaoPasses": precisao_passes,
        "escanteios": valor('Corner kicks', f'{lado}Value'),
        "impedimentos": valor('Offsides', f'{lado}Value'),
        "faltas": valor('Fouls', f'{lado}Value'),
        "cartoesAmarelos": valor('Yellow cards', f'{lado}Value'),
        "cartoesVermelhos": valor('Red cards', f'{lado}Value'),
        "defesasGoleiro": valor('Goalkeeper saves', f'{lado}Value'),
    }

# =================================
# GERA AS ESTATÍSTICAS
def gerar_estatisticas():
    caminho_ids = os.path.join(OUTPUT_DIR, "ids_partidas.json")
    with open(caminho_ids, "r", encoding="utf-8") as f:
        ids_partidas = json.load(f)

    estatisticas_por_jogo = {}

    for match_id, partida in ids_partidas.items():
        print(f"Buscando estatísticas do jogo {match_id}...")

        home_team = partida.get('homeTeam', {})
        away_team = partida.get('awayTeam', {})

        url = f"{BASE_URL}/match/statistics"
        params = {"match_id": match_id}
        resp = requests.get(url, headers=HEADERS, params=params)

        if resp.status_code != 200:
            print(f"  Erro {resp.status_code} no jogo {match_id}")
            estatisticas_por_jogo[match_id] = None
            time.sleep(1)
            continue

        data = resp.json()
        if not data:
            estatisticas_por_jogo[match_id] = None
            time.sleep(1)
            continue

        groups = data[0].get('groups', [])
        flat = _extrair_stats_flat(groups)

        estatisticas_por_jogo[match_id] = {
            "selecao01": {
                "id": home_team.get('id'),
                "nome": home_team.get('name'),
                "escudo": home_team.get('imagePath'),
                "estatisticas": _montar_estatisticas_time(flat, 'home')
            },
            "selecao02": {
                "id": away_team.get('id'),
                "nome": away_team.get('name'),
                "escudo": away_team.get('imagePath'),
                "estatisticas": _montar_estatisticas_time(flat, 'away')
            }
        }

        time.sleep(1)

    filepath = os.path.join(OUTPUT_DIR, "estatisticas.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(estatisticas_por_jogo, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de jogos com estatísticas salvas: {len(estatisticas_por_jogo)}")
    print(f"Salvo em: {filepath}")

    return estatisticas_por_jogo


# =================================
# FILTRA E MONTA A LISTA DE JOGADORES
def _montar_jogadores(players, tipo):
    quer_substituto = (tipo == 'reserva')
    jogadores = []
 
    for p in players:
        if p.get('substitute') != quer_substituto:
            continue
 
        jerseyNumber = p.get('jerseyNumber')
        try:
            numero = int(jerseyNumber) if jerseyNumber is not None else None
        except (ValueError, TypeError):
            numero = jerseyNumber
 
        jogadores.append({
            "id": p.get('id'),
            "nome": p.get('shortName') or p.get('name'),
            "numeroCamisa": numero,
            "posicao": p.get('position'),
            "coordenadas": None  # não disponível nesse endpoint
        })
 
    return jogadores


# =================================
# FAZ A ESCALAÇÃO DAS 64 PARTIDAS
def gerar_escalacoes():
    caminho_ids = os.path.join(OUTPUT_DIR, "ids_partidas.json")
    with open(caminho_ids, "r", encoding="utf-8") as f:
        ids_partidas = json.load(f)
 
    escalacoes_por_jogo = {}
 
    for match_id, partida in ids_partidas.items():
        print(f"Buscando escalação do jogo {match_id}...")
 
        home_team = partida.get('homeTeam', {})
        away_team = partida.get('awayTeam', {})
 
        url = f"{BASE_URL}/match/lineups"
        params = {"match_id": match_id}
        resp = requests.get(url, headers=HEADERS, params=params)
 
        if resp.status_code != 200:
            print(f"  Erro {resp.status_code} no jogo {match_id}")
            escalacoes_por_jogo[match_id] = None
            time.sleep(1)
            continue
 
        data = resp.json()
        home_data = data.get('home', {})
        away_data = data.get('away', {})
 
        escalacoes_por_jogo[match_id] = {
            "selecao01": {
                "id": home_team.get('id'),
                "nome": home_team.get('name'),
                "escudo": home_team.get('imagePath'),
                "tecnico": None,  # não disponível nesse endpoint
                "formacao": home_data.get('formation'),
                "titulares": _montar_jogadores(home_data.get('players', []), 'titular'),
                "reservas": _montar_jogadores(home_data.get('players', []), 'reserva')
            },
            "selecao02": {
                "id": away_team.get('id'),
                "nome": away_team.get('name'),
                "escudo": away_team.get('imagePath'),
                "tecnico": None,
                "formacao": away_data.get('formation'),
                "titulares": _montar_jogadores(away_data.get('players', []), 'titular'),
                "reservas": _montar_jogadores(away_data.get('players', []), 'reserva')
            }
        }
 
        time.sleep(1)  # respeita rate limit do plano free
 
    filepath = os.path.join(OUTPUT_DIR, "escalacoes.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(escalacoes_por_jogo, f, ensure_ascii=False, indent=2)
 
    print(f"\nTotal de jogos com escalações salvas: {len(escalacoes_por_jogo)}")
    print(f"Salvo em: {filepath}")
 
    return escalacoes_por_jogo

# =================================
# TEMPO
def _tempo_por_minuto(minuto):
    if minuto is None:
        return None
    if minuto <= 45:
        return "1º Tempo"
    if minuto <= 90:
        return "2º Tempo"
    return "Prorrogação"

# =================================
# INCIDENTES
def _selecao_do_incidente(incidente, home_team, away_team):
    time = home_team if incidente.get('isHome') else away_team
    return {
        "id": time.get('id'),
        "nome": time.get('name'),
        "escudo": time.get('imagePath')
    }

# =================================
# BUSCA ESSES DADOS DOS EVENTOS
def gerar_eventos():
    caminho_ids = os.path.join(OUTPUT_DIR, "ids_partidas.json")
    with open(caminho_ids, "r", encoding="utf-8") as f:
        ids_partidas = json.load(f)

    eventos_por_jogo = {}

    for match_id, partida in ids_partidas.items():
        print(f"Buscando eventos do jogo {match_id}...")

        home_team = partida.get('homeTeam', {})
        away_team = partida.get('awayTeam', {})

        url = f"{BASE_URL}/match/incidents"
        params = {"match_id": match_id}
        resp = requests.get(url, headers=HEADERS, params=params)

        if resp.status_code != 200:
            print(f"  Erro {resp.status_code} no jogo {match_id}")
            eventos_por_jogo[match_id] = None
            time.sleep(1)
            continue

        data = resp.json()
        eventos_jogo = []

        for inc in data:
            tipo_incidente = inc.get('incidentType')

            if tipo_incidente == 'card':
                classe = inc.get('incidentClass')
                detalhe = {
                    'yellow': 'Yellow Card',
                    'red': 'Red Card',
                    'yellowRed': 'Second Yellow card / Red'
                }.get(classe, classe)

                eventos_jogo.append({
                    "minuto": inc.get('time'),
                    "acrescimos": None,
                    "tempo": _tempo_por_minuto(inc.get('time')),
                    "tipo": "Card",
                    "detalhe": detalhe,
                    "jogador": (inc.get('player') or {}).get('shortName'),
                    "assistencia": None,
                    "selecao": _selecao_do_incidente(inc, home_team, away_team)
                })

            elif tipo_incidente == 'goal':
                classe = inc.get('incidentClass')
                if classe == 'penalty' or inc.get('from') == 'penalty':
                    detalhe = 'Penalty'
                elif classe == 'owngoal':
                    detalhe = 'Own Goal'
                else:
                    detalhe = 'Normal Goal'

                assist = inc.get('assist1')

                eventos_jogo.append({
                    "minuto": inc.get('time'),
                    "acrescimos": None,
                    "tempo": _tempo_por_minuto(inc.get('time')),
                    "tipo": "Goal",
                    "detalhe": detalhe,
                    "jogador": (inc.get('player') or {}).get('shortName'),
                    "assistencia": assist.get('shortName') if assist else None,
                    "selecao": _selecao_do_incidente(inc, home_team, away_team)
                })

            elif tipo_incidente == 'substitution':
                player_in = inc.get('playerIn') or {}
                player_out = inc.get('playerOut') or {}

                eventos_jogo.append({
                    "minuto": inc.get('time'),
                    "acrescimos": None,
                    "tempo": _tempo_por_minuto(inc.get('time')),
                    "tipo": "subst",
                    "detalhe": "Substitution",
                    "jogador": player_in.get('shortName'),
                    "assistencia": player_out.get('shortName'),
                    "selecao": _selecao_do_incidente(inc, home_team, away_team)
                })

        eventos_por_jogo[match_id] = eventos_jogo
        time.sleep(1)  # respeita rate limit do plano free

    filepath = os.path.join(OUTPUT_DIR, "eventos.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(eventos_por_jogo, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de jogos com eventos salvos: {len(eventos_por_jogo)}")
    print(f"Salvo em: {filepath}")

    return eventos_por_jogo


# =================================
# CARTOES DA PARTIDA POR JOGADOR
def _cartoes_do_jogo(match_id, eventos_por_jogo):

    eventos_jogo = eventos_por_jogo.get(match_id) or []
    cartoes = {}

    for ev in eventos_jogo:
        if ev.get('tipo') != 'Card':
            continue

        jogador = ev.get('jogador')
        if not jogador:
            continue

        if jogador not in cartoes:
            cartoes[jogador] = {"amarelo": None, "vermelho": None}

        detalhe = ev.get('detalhe')
        if detalhe == 'Yellow Card':
            cartoes[jogador]["amarelo"] = 1
        elif detalhe in ('Red Card', 'Second Yellow card / Red'):
            cartoes[jogador]["vermelho"] = 1

    return cartoes

# =================================
# ORGANIZANDO 
def _montar_jogadores_partida(players, cartoes_jogo):
    jogadores = []

    for p in players:
        stats = p.get('statistics', {})
        nome = p.get('shortName') or p.get('name')
        cartoes = cartoes_jogo.get(nome, {"amarelo": None, "vermelho": None})

        jogadores.append({
            "id": p.get('id'),
            "nome": nome,
            "posicao": p.get('position'),
            "titular": not p.get('substitute', False),
            "minutosJogados": stats.get('minutesPlayed'),
            "gols": stats.get('goals'),
            "assistencias": stats.get('goalAssist'),
            "nota": stats.get('rating'),
            "chutes": stats.get('totalShots'),
            "finalizacoesNoGol": stats.get('onTargetScoringAttempt'),
            "cartaoAmarelo": cartoes["amarelo"],
            "cartaoVermelho": cartoes["vermelho"]
        })

    return jogadores

# =================================
# ESTATISTICAS INDIVIDUAIS DO JOGADOR
def gerar_jogadores_partida():
    caminho_ids = os.path.join(OUTPUT_DIR, "ids_partidas.json")
    with open(caminho_ids, "r", encoding="utf-8") as f:
        ids_partidas = json.load(f)

    caminho_eventos = os.path.join(OUTPUT_DIR, "eventos.json")
    with open(caminho_eventos, "r", encoding="utf-8") as f:
        eventos_por_jogo = json.load(f)

    jogadores_por_jogo = {}

    for match_id, partida in ids_partidas.items():
        print(f"Buscando desempenho dos jogadores do jogo {match_id}...")

        home_team = partida.get('homeTeam', {})
        away_team = partida.get('awayTeam', {})

        url = f"{BASE_URL}/match/lineups"
        params = {"match_id": match_id}
        resp = requests.get(url, headers=HEADERS, params=params)

        if resp.status_code != 200:
            print(f"  Erro {resp.status_code} no jogo {match_id}")
            jogadores_por_jogo[match_id] = None
            time.sleep(1)
            continue

        data = resp.json()
        home_data = data.get('home', {})
        away_data = data.get('away', {})

        cartoes_jogo = _cartoes_do_jogo(match_id, eventos_por_jogo)

        jogadores_por_jogo[match_id] = {
            "selecao01": {
                "id": home_team.get('id'),
                "nome": home_team.get('name'),
                "escudo": home_team.get('imagePath'),
                "jogadores": _montar_jogadores_partida(home_data.get('players', []), cartoes_jogo)
            },
            "selecao02": {
                "id": away_team.get('id'),
                "nome": away_team.get('name'),
                "escudo": away_team.get('imagePath'),
                "jogadores": _montar_jogadores_partida(away_data.get('players', []), cartoes_jogo)
            }
        }

        time.sleep(1) 

    filepath = os.path.join(OUTPUT_DIR, "jogadores_partida.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(jogadores_por_jogo, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de jogos com desempenho salvo: {len(jogadores_por_jogo)}")
    print(f"Salvo em: {filepath}")

    return jogadores_por_jogo

# =================================
# CHAMA AS FUNÇÕES
#if __name__ == "__main__":
    #pegar_ids_partidas()
    #gerar_estatisticas()
    #gerar_escalacoes()
    #gerar_eventos()
    #gerar_jogadores_partida()