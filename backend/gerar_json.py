import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://v3.football.api-sports.io"

headers = {
    "x-apisports-key": API_KEY
}


# SELEÇÕES
# ==========================================
def gerar_selecoes():

    response = requests.get(
        f"{BASE_URL}/teams",
        headers=headers,
        params={
            "league": 1,
            "season": 2022
        }
    )

    dados = response.json()["response"]

    selecoes = []

    for team in dados:

        selecoes.append({

            "id": team["team"]["id"],
            "nome": team["team"]["name"],
            "pais": team["team"]["country"],
            "fundacao": team["team"]["founded"],
            "escudo": team["team"]["logo"]

        })

    os.makedirs("dados_JSON", exist_ok=True)

    with open(
        "dados_JSON/selecoes.json",
        "w",
        encoding="utf-8"
    ) as arquivo:

        json.dump(selecoes, arquivo, ensure_ascii=False, indent=4)

    print("selecoes.json gerado com sucesso!")


# JOGOS
# ==========================================
def gerar_jogos():

    response = requests.get(
        f"{BASE_URL}/fixtures",
        headers=headers,
        params={
            "league": 1,
            "season": 2022
        }
    )

    dados = response.json()["response"]

    jogos = []

    for jogo in dados:

        jogos.append({

            "id": jogo["fixture"]["id"],

            "data": jogo["fixture"]["date"],

            "fase": jogo["league"]["round"],

            "estadio": jogo["fixture"]["venue"]["name"],
            "cidade": jogo["fixture"]["venue"]["city"],

            "selecao01": {
                "id": jogo["teams"]["home"]["id"],
                "nome": jogo["teams"]["home"]["name"],
                "escudo": jogo["teams"]["home"]["logo"]
            },

            "selecao02": {
                "id": jogo["teams"]["away"]["id"],
                "nome": jogo["teams"]["away"]["name"],
                "escudo": jogo["teams"]["away"]["logo"]
            },

            "score": {

                "intervalo": {
                    "selecao01": jogo["score"]["halftime"]["home"],
                    "selecao02": jogo["score"]["halftime"]["away"]
                },

                "final": {
                    "selecao01": jogo["score"]["fulltime"]["home"],
                    "selecao02": jogo["score"]["fulltime"]["away"]
                },

                "prorrogacao": {
                    "selecao01": jogo["score"]["extratime"]["home"],
                    "selecao02": jogo["score"]["extratime"]["away"]
                },

                "penaltis": {
                    "selecao01": jogo["score"]["penalty"]["home"],
                    "selecao02": jogo["score"]["penalty"]["away"]
                }

            }

        })

    with open(
        "dados_JSON/jogos.json",
        "w",
        encoding="utf-8"
    ) as arquivo:

        json.dump(jogos, arquivo, ensure_ascii=False, indent=4)

    print("jogos.json gerado com sucesso!")

# JOGADORES DA PARTIDA
# ==========================================
def gerar_jogadores_partida():

    os.makedirs("dados_JSON/jogadores_partida", exist_ok=True)

    with open("dados_JSON/jogos.json", "r", encoding="utf-8") as arquivo:
        jogos = json.load(arquivo)

    for jogo in jogos:

        fixture = jogo["id"]

        response = requests.get(
            f"{BASE_URL}/fixtures/players",
            headers=headers,
            params={
                "fixture": fixture
            }
        )

        dados = response.json()["response"]

        jogadores_partida = {}

        for i, equipe in enumerate(dados, start=1):

            jogadores = []

            for jogador in equipe["players"]:

                stats = jogador["statistics"][0]

                jogadores.append({

                    "id": jogador["player"]["id"],
                    "nome": jogador["player"]["name"],
                    "foto": jogador["player"]["photo"],

                    "numeroCamisa": stats["games"].get("number"),
                    "posicao": stats["games"].get("position"),

                    "estatisticas": {

                        "minutos": stats["games"].get("minutes"),
                        "nota": stats["games"].get("rating"),

                        "gols": stats["goals"].get("total"),
                        "assistencias": stats["goals"].get("assists"),

                        "chutesAoGol": stats["shots"].get("on"),

                        "passes": stats["passes"].get("total"),
                        "precisaoPasses": stats["passes"].get("accuracy"),

                        "desarmes": stats["tackles"].get("total"),

                        "dribles": stats["dribbles"].get("success"),

                        "cartoesAmarelos": stats["cards"].get("yellow"),
                        "cartoesVermelhos": stats["cards"].get("red")

                    }

                })

            jogadores_partida[f"selecao0{i}"] = {

                "id": equipe["team"]["id"],
                "nome": equipe["team"]["name"],
                "escudo": equipe["team"]["logo"],

                "jogadores": jogadores

            }

        with open(
            f"dados_JSON/jogadores_partida/{fixture}.json",
            "w",
            encoding="utf-8"
        ) as arquivo:

            json.dump(
                jogadores_partida,
                arquivo,
                ensure_ascii=False,
                indent=4
            )

    print("jogadores_partida gerados com sucesso!")

# JOGADORES
# ==========================================
def gerar_jogadores():

    os.makedirs("dados_JSON/jogadores", exist_ok=True)

    with open("dados_JSON/artilheiros.json", "r", encoding="utf-8") as arquivo:
        artilheiros = json.load(arquivo)

    for jogador in artilheiros:

        player_id = jogador["id"]

        response = requests.get(
            f"{BASE_URL}/players",
            headers=headers,
            params={
                "id": player_id,
                "season": 2022
            }
        )

        dados = response.json()["response"]

        if not dados:
            continue

        player = dados[0]["player"]
        statistics = dados[0]["statistics"][0]

        jogador_json = {

            "id": player["id"],
            "nome": player["name"],
            "foto": player["photo"],
            "idade": player["age"],
            "nacionalidade": player["nationality"],
            "altura": player["height"],
            "peso": player["weight"],

            "selecao": {
                "id": statistics["team"]["id"],
                "nome": statistics["team"]["name"],
                "escudo": statistics["team"]["logo"]
            },

            "numeroCamisa": statistics["games"].get("number"),
            "posicao": statistics["games"].get("position"),

            "estatisticas": {

                "jogos": statistics["games"].get("appearences"),
                "minutos": statistics["games"].get("minutes"),
                "nota": statistics["games"].get("rating"),

                "gols": statistics["goals"].get("total"),
                "assistencias": statistics["goals"].get("assists"),

                "chutesAoGol": statistics["shots"].get("on"),

                "passes": statistics["passes"].get("total"),
                "precisaoPasses": statistics["passes"].get("accuracy"),

                "dribles": statistics["dribbles"].get("success"),
                "desarmes": statistics["tackles"].get("total"),

                "cartoesAmarelos": statistics["cards"].get("yellow"),
                "cartoesVermelhos": statistics["cards"].get("red")

            }

        }

        with open(
            f"dados_JSON/jogadores/{player_id}.json",
            "w",
            encoding="utf-8"
        ) as arquivo:

            json.dump(
                jogador_json,
                arquivo,
                ensure_ascii=False,
                indent=4
            )

    print("jogadores gerados com sucesso!")

# EVENTOS DAS PARTIDAS
# ==========================================
def gerar_eventos():

    os.makedirs("dados_JSON/eventos", exist_ok=True)

    with open("dados_JSON/jogos.json", "r", encoding="utf-8") as arquivo:
        jogos = json.load(arquivo)

    for jogo in jogos:

        fixture = jogo["id"]

        response = requests.get(
            f"{BASE_URL}/fixtures/events",
            headers=headers,
            params={
                "fixture": fixture
            }
        )

        dados = response.json()["response"]

        eventos = []

        for evento in dados:

            minuto = evento["time"]["elapsed"]

            if minuto <= 45:
                tempo = "1º Tempo"
            elif minuto <= 90:
                tempo = "2º Tempo"
            else:
                tempo = "Prorrogação"

            eventos.append({

                "minuto": minuto,
                "acrescimos": evento["time"]["extra"],

                "tempo": tempo,

                "tipo": evento["type"],
                "detalhe": evento["detail"],

                "jogador": evento["player"]["name"],

                "assistencia": (
                    evento["assist"]["name"]
                    if evento["assist"] else None
                ),

                "selecao": {
                    "id": evento["team"]["id"],
                    "nome": evento["team"]["name"],
                    "escudo": evento["team"]["logo"]
                }

            })

        with open(
            f"dados_JSON/eventos/{fixture}.json",
            "w",
            encoding="utf-8"
        ) as arquivo:

            json.dump(
                eventos,
                arquivo,
                ensure_ascii=False,
                indent=4
            )

    print("eventos gerados com sucesso!")

# ESTATÍSTICAS DA PARTIDA
# ==========================================
def gerar_estatisticas():

    os.makedirs("dados_JSON/estatisticas", exist_ok=True)

    with open("dados_JSON/jogos.json", "r", encoding="utf-8") as arquivo:
        jogos = json.load(arquivo)

    for jogo in jogos:

        fixture = jogo["id"]

        response = requests.get(
            f"{BASE_URL}/fixtures/statistics",
            headers=headers,
            params={
                "fixture": fixture
            }
        )

        dados = response.json()["response"]

        estatisticas = {}

        for i, equipe in enumerate(dados, start=1):

            stats = {}

            for item in equipe["statistics"]:

                stats[item["type"]] = item["value"]

            estatisticas[f"selecao0{i}"] = {

                "id": equipe["team"]["id"],
                "nome": equipe["team"]["name"],
                "escudo": equipe["team"]["logo"],

                "estatisticas": {

                    "chutesAoGol": stats.get("Shots on Goal"),
                    "chutesFora": stats.get("Shots off Goal"),
                    "totalChutes": stats.get("Total Shots"),

                    "posseBola": stats.get("Ball Possession"),

                    "passes": stats.get("Total passes"),
                    "passesCertos": stats.get("Passes accurate"),
                    "precisaoPasses": stats.get("Passes %"),

                    "escanteios": stats.get("Corner Kicks"),

                    "impedimentos": stats.get("Offsides"),

                    "faltas": stats.get("Fouls"),

                    "cartoesAmarelos": stats.get("Yellow Cards"),
                    "cartoesVermelhos": stats.get("Red Cards"),

                    "defesasGoleiro": stats.get("Goalkeeper Saves")

                }

            }

        with open(
            f"dados_JSON/estatisticas/{fixture}.json",
            "w",
            encoding="utf-8"
        ) as arquivo:

            json.dump(
                estatisticas,
                arquivo,
                ensure_ascii=False,
                indent=4
            )

    print("estatisticas geradas com sucesso!")

# ESCALAÇÕES DA PARTIDA
# ==========================================
def gerar_escalacoes():

    os.makedirs("dados_JSON/escalacoes", exist_ok=True)

    with open("dados_JSON/jogos.json", "r", encoding="utf-8") as arquivo:
        jogos = json.load(arquivo)

    for jogo in jogos:

        fixture = jogo["id"]

        response = requests.get(
            f"{BASE_URL}/fixtures/lineups",
            headers=headers,
            params={
                "fixture": fixture
            }
        )

        dados = response.json()["response"]

       # if not dados:
           # print(f"Sem escalação para a partida {fixture}")
            #continue

        escalacoes = {}

        for i, equipe in enumerate(dados, start=1):

            escalacoes[f"selecao0{i}"] = {

                "id": equipe["team"]["id"],
                "nome": equipe["team"]["name"],
                "escudo": equipe["team"]["logo"],

                "tecnico": equipe["coach"]["name"],
                "formacao": equipe.get("formation"),

                "titulares": [

                    {
                        "id": jogador["player"]["id"],
                        "nome": jogador["player"]["name"],
                        "numeroCamisa": jogador["player"].get("number"),
                        "posicao": jogador["player"].get("pos"),
                        "coordenadas": jogador["player"].get("grid")
                    }

                    for jogador in equipe["startXI"]

                ],

                "reservas": [

                    {
                        "id": jogador["player"]["id"],
                        "nome": jogador["player"]["name"],
                        "numeroCamisa": jogador["player"].get("number"),
                        "posicao": jogador["player"].get("pos")
                    }

                    for jogador in equipe["substitutes"]

                ]

            }

        with open(
            f"dados_JSON/escalacoes/{fixture}.json",
            "w",
            encoding="utf-8"
        ) as arquivo:

            json.dump(
                escalacoes,
                arquivo,
                ensure_ascii=False,
                indent=4
            )

    print("escalacoes geradas com sucesso!")

# CLASSIFICAÇÃO
# ==========================================
def gerar_classificacao():

    response = requests.get(
        f"{BASE_URL}/standings",
        headers=headers,
        params={
            "league": 1,
            "season": 2022
        }
    )

    dados = response.json()["response"]

    classificacao = []

    for liga in dados:

        for grupo in liga["league"]["standings"]:

            for time in grupo:

                classificacao.append({

                    "grupo": time["group"],

                    "posicao": time["rank"],

                    "id": time["team"]["id"],
                    "nome": time["team"]["name"],
                    "escudo": time["team"]["logo"],

                    "pontos": time["points"],

                    "jogos": time["all"]["played"],
                    "vitorias": time["all"]["win"],
                    "empates": time["all"]["draw"],
                    "derrotas": time["all"]["lose"],

                    "golsPro": time["all"]["goals"]["for"],
                    "golsContra": time["all"]["goals"]["against"],
                    "saldoGols": time["goalsDiff"]

                })

    with open(
        "dados_JSON/classificacao.json",
        "w",
        encoding="utf-8"
    ) as arquivo:

        json.dump(
            classificacao,
            arquivo,
            ensure_ascii=False,
            indent=4
        )

    print("classificacao.json gerado com sucesso!")


# ARTILHEIROS
# ==========================================
def gerar_artilheiros():

    response = requests.get(
        f"{BASE_URL}/players/topscorers",
        headers=headers,
        params={
            "league": 1,
            "season": 2022
        }
    )

    dados = response.json()["response"]

    artilheiros = []

    for rank, jogador in enumerate(dados, start=1):

        player = jogador["player"]
        stats = jogador["statistics"][0]
        team = stats["team"]

        artilheiros.append({

            "rank": rank,

            "id": player["id"],
            "nome": player["name"],
            "foto": player["photo"],

            "posicao": stats["games"].get("position"),

            "selecao": {
                "id": team["id"],
                "nome": team["name"],
                "escudo": team["logo"]
            },

            "gols": stats["goals"].get("total"),
            "assistencias": stats["goals"].get("assists"),

            "jogos": stats["games"].get("appearences"),
            "minutos": stats["games"].get("minutes"),

            "nota": stats["games"].get("rating"),

            "chutesAoGol": stats["shots"].get("on"),

            "numeroCamisa": stats["games"].get("number")

        })

    with open(
        "dados_JSON/artilheiros.json",
        "w",
        encoding="utf-8"
    ) as arquivo:

        json.dump(
            artilheiros,
            arquivo,
            ensure_ascii=False,
            indent=4
        )

    print("artilheiros.json gerado com sucesso!")


# CHAMA AS FUNÇÕES
# ==========================================
if __name__ == "__main__":

    # (OK) gerar_selecoes()
    # (OK) gerar_jogos()
    # (OK) gerar_classificacao()
    # (OK) gerar_artilheiros()

    # (OK) gerar_jogadores()
    # (OK) gerar_estatisticas()
    # (OK) gerar_eventos()
    # daqui pra baixo deu problema :)
    gerar_escalacoes()
    # gerar_jogadores_partida()
