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

# Seleções
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


# Todos os jogos
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


# Classificação
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


# Artilheiros
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

#=========================continuar====================
# Dados de um jogador
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

    return jsonify(response.json()["response"])


# Estatísticas de uma partida
@app.route("/api/estatisticas/<int:fixture>")
def estatisticas(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/statistics",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    return jsonify(response.json()["response"])


# Eventos da partida
@app.route("/api/eventos/<int:fixture>")
def eventos(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/events",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    return jsonify(response.json()["response"])


# Escalações
@app.route("/api/escalacoes/<int:fixture>")
def escalacoes(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/lineups",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    return jsonify(response.json()["response"])


# Estatísticas dos jogadores na partida
@app.route("/api/jogadores-partida/<int:fixture>")
def jogadores_partida(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures/players",
        headers=headers,
        params={
            "fixture": fixture
        }
    )

    return jsonify(response.json()["response"])

if __name__ == "__main__":
    app.run(debug=True)




    #estrutura:
        #@app.route("/caminho/da/rota")
        #def nome_da_funcao():
            # 1. faz a requisição pra API
            #response = requests.get(f"{BASE_URL}/endpoint", headers=headers, params={...}).json()
    
            # 2. retorna os dados como JSON pro front
            #return jsonify(response["response"])
        