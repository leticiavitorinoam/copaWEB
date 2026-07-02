#import das bibliotecas do Flask
from flask import Flask, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv() #lê o arquivo .env

app = Flask(__name__) #vai criar o servidor

API_KEY = os.getenv("API_KEY") #guarda a chave 
BASE_URL = "https://v3.football.api-sports.io"

headers = {"x-apisports-key": API_KEY}

# SELEÇÕES
@app.route("/api/selecoes")
def selecoes():

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

    for selecao in dados:

        team = selecao["team"]

        selecoes.append({
            "id": team["id"],
            "nome": team["name"],
            "sigla": team["code"],
            "pais": team["country"],
            "escudo": team["logo"]
        })

    return jsonify(selecoes)


# TODOS OS JOGOS
@app.route("/api/jogos")
def jogos():

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
            "status": jogo["fixture"]["status"]["long"],
            "fase": jogo["league"]["round"],

            "estadio": jogo["fixture"]["venue"]["name"],
            "cidade": jogo["fixture"]["venue"]["city"],
            "arbitro": jogo["fixture"]["referee"],

            "selecao01": {
                "id": jogo["teams"]["home"]["id"],
                "nome": jogo["teams"]["home"]["name"],
                "escudo": jogo["teams"]["home"]["logo"],
                "venceu": jogo["teams"]["home"]["winner"]
            },

            "selecao02": {
                "id": jogo["teams"]["away"]["id"],
                "nome": jogo["teams"]["away"]["name"],
                "escudo": jogo["teams"]["away"]["logo"],
                "venceu": jogo["teams"]["away"]["winner"]
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

    return jsonify(jogos)


# CLASSIFICAÇÃO
@app.route("/api/classificacao")
def classificacao():

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

            classificacao.append({

                "grupo": grupo[0]["group"].replace("Group ", ""),

                "selecoes": [

                    {
                        "posicao": selecao["rank"],
                        "nome": selecao["team"]["name"],
                        "escudo": selecao["team"]["logo"],

                        "pontos": selecao["points"],

                        "jogos": selecao["all"]["played"],

                        "vitorias": selecao["all"]["win"],
                        "empates": selecao["all"]["draw"],
                        "derrotas": selecao["all"]["lose"],

                        "golsMarcados": selecao["all"]["goals"]["for"],
                        "golsSofridos": selecao["all"]["goals"]["against"],
                        "saldoGols": selecao["goalsDiff"],

                        "classificado": (
                            selecao["description"] is not None
                            and "Promotion" in selecao["description"]
                        )
                    }

                    for selecao in grupo

                ]

            })

    return jsonify(classificacao)


# ARTILHEIROS
@app.route("/api/artilheiros")
def artilheiros():

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

            "posicao": stats["games"]["position"],
            "numeroCamisa": stats["games"]["number"],

            "selecao": team["name"],
            "escudo": team["logo"],

            "gols": stats["goals"]["total"],
            "assistencias": stats["goals"]["assists"],

            "jogos": stats["games"]["appearences"],
            "minutos": stats["games"]["minutes"],

            "nota": stats["games"]["rating"],

            "chutesAoGol": stats["shots"]["on"]

        })

    return jsonify(artilheiros)


# DADOS DE UM JOGADOR
@app.route("/api/jogador/<int:player>")
def jogador(player):

    response = requests.get(
        f"{BASE_URL}/players",
        headers=headers,
        params={
            "id": player,
            "season": 2022
        }
    )

    dados = response.json()["response"]

    if not dados:
        return jsonify({"erro": "Jogador não encontrado"}), 404

    jogador = dados[0]

    player = jogador["player"]
    stats = jogador["statistics"][0]
    team = stats["team"]

    jogador_info = {

        "id": player["id"],
        "nome": player["name"],
        "foto": player["photo"],

        "idade": player["age"],
        "dataNascimento": player["birth"]["date"],
        "localNascimento": player["birth"]["place"],
        "nacionalidade": player["nationality"],

        "altura": player["height"],
        "peso": player["weight"],

        "selecao": {
            "id": team["id"],
            "nome": team["name"],
            "escudo": team["logo"]
        },

        "posicao": stats["games"].get("position"),
        "numeroCamisa": stats["games"].get("number"),

        "estatisticas": {

            "jogos": stats["games"].get("appearences"),
            "minutos": stats["games"].get("minutes"),

            "gols": stats["goals"].get("total"),
            "assistencias": stats["goals"].get("assists"),

            "nota": stats["games"].get("rating"),

            "chutesAoGol": stats["shots"].get("on"),

            "passes": stats["passes"].get("total"),
            "passesPrecisos": stats["passes"].get("key"),
            "percentualPasses": stats["passes"].get("accuracy"),

            "dribles": stats["dribbles"].get("attempts"),
            "driblesCertos": stats["dribbles"].get("success"),

            "desarmes": stats["tackles"].get("total"),
            "interceptacoes": stats["tackles"].get("interceptions"),

            "cartoesAmarelos": stats["cards"].get("yellow"),
            "cartoesVermelhos": stats["cards"].get("red")

        }

    }

    return jsonify(jogador_info)


# ESTATÍSTICAS DE UMA PARTIDA
@app.route("/api/estatisticas/<int:fixture>")
def estatisticas(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/statistics",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    dados = response.json()["response"]

    estatisticas_partida = {}

    for i, equipe in enumerate(dados, start=1):

        stats = {}

        for item in equipe["statistics"]:
            stats[item["type"]] = item["value"]

        estatisticas_partida[f"selecao0{i}"] = {

            "id": equipe["team"]["id"],
            "nome": equipe["team"]["name"],
            "escudo": equipe["team"]["logo"],

            "estatisticas": {

                "posseBola": stats.get("Ball Possession"),
                "finalizacoes": stats.get("Total Shots"),
                "chutesAoGol": stats.get("Shots on Goal"),
                "chutesFora": stats.get("Shots off Goal"),
                "chutesBloqueados": stats.get("Blocked Shots"),

                "escanteios": stats.get("Corner Kicks"),
                "impedimentos": stats.get("Offsides"),
                "faltas": stats.get("Fouls"),

                "cartoesAmarelos": stats.get("Yellow Cards"),
                "cartoesVermelhos": stats.get("Red Cards"),

                "defesas": stats.get("Goalkeeper Saves"),

                "passes": stats.get("Total passes"),
                "passesCertos": stats.get("Passes accurate"),
                "precisaoPasses": stats.get("Passes %")
            }

        }

    return jsonify(estatisticas_partida)



# EVENTOS DE UMA PARTIDA
@app.route("/api/eventos/<int:fixture>")
def eventos(fixture):

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
            "assistencia": evento["assist"]["name"] if evento["assist"] else None,

            "selecao": {
                "id": evento["team"]["id"],
                "nome": evento["team"]["name"],
                "escudo": evento["team"]["logo"]
            }

        })

    return jsonify(eventos)


# ESCALAÇÕES
@app.route("/api/escalacoes/<int:fixture>")
def escalacoes(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/lineups",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    dados = response.json()["response"]

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

    return jsonify(escalacoes)


# ESTATÍSTICAS DOS JOGADORES NA PARRIDA
@app.route("/api/jogadores-partida/<int:fixture>")
def jogadores_partida(fixture):

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

        jogadores_partida[f"selecao0{i}"] = {

            "id": equipe["team"]["id"],
            "nome": equipe["team"]["name"],
            "escudo": equipe["team"]["logo"],

            "jogadores": [

                {

                    "id": jogador["player"]["id"],
                    "nome": jogador["player"]["name"],
                    "foto": jogador["player"]["photo"],

                    "numeroCamisa": jogador["statistics"][0]["games"].get("number"),
                    "posicao": jogador["statistics"][0]["games"].get("position"),

                    "estatisticas": {

                        "minutos": jogador["statistics"][0]["games"].get("minutes"),
                        "nota": jogador["statistics"][0]["games"].get("rating"),

                        "gols": jogador["statistics"][0]["goals"].get("total"),
                        "assistencias": jogador["statistics"][0]["goals"].get("assists"),

                        "chutesAoGol": jogador["statistics"][0]["shots"].get("on"),

                        "passes": jogador["statistics"][0]["passes"].get("total"),
                        "precisaoPasses": jogador["statistics"][0]["passes"].get("accuracy"),

                        "desarmes": jogador["statistics"][0]["tackles"].get("total"),

                        "dribles": jogador["statistics"][0]["dribbles"].get("success"),

                        "cartoesAmarelos": jogador["statistics"][0]["cards"].get("yellow"),
                        "cartoesVermelhos": jogador["statistics"][0]["cards"].get("red")

                    }

                }

                for jogador in equipe["players"]

            ]

        }

    return jsonify(jogadores_partida)

if __name__ == "__main__":
    app.run(debug=True)




    #estrutura:
        #@app.route("/caminho/da/rota")
        #def nome_da_funcao():
            # 1. faz a requisição pra API
            #response = requests.get(f"{BASE_URL}/endpoint", headers=headers, params={...}).json()
    
            # 2. retorna os dados como JSON pro front
            #return jsonify(response["response"])
        