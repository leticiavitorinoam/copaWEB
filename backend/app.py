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

@app.route("/api/")

@app.route("/api/selecoes")
def selecoes():
    response = requests.get(
        f"{BASE_URL}/teams",
        headers=headers,
        params={"league": 1, "season": 2022}
    ).json()
    return jsonify(response["response"])

# Seleções da Copa
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

    return jsonify(response.json()["response"])


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

    return jsonify(response.json()["response"])


# Um jogo específico
@app.route("/api/jogo/<int:fixture>")
def jogo(fixture):

    response = requests.get(
        f"{BASE_URL}/fixtures",
        headers=headers,
        params={
            "id": fixture
        }
    )

    return jsonify(response.json()["response"])


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

    return jsonify(response.json()["response"])


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

    return jsonify(response.json()["response"])


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
        