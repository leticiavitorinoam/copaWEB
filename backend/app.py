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

@app.route("/api/dia/<data>")
def dia_completo(data):
    # busca TODOS os jogos da copa de uma vez
    todos = requests.get(f"{BASE_URL}/fixtures?league=1&season=2022", headers=headers).json()
    
    # filtra só os do dia escolhido no Python
    jogos_do_dia = [
        jogo for jogo in todos["response"]
        if jogo["fixture"]["date"].startswith(data)
    ]

    return jsonify({"jogos": jogos_do_dia})

@app.route("/api/classificacao")
def classificacao():
    response = requests.get(f"{BASE_URL}/standings?league=1&season=2022", headers=headers)
    return jsonify(response.json())

@app.route("/api/classificacao")
def classificacao():
    response = requests.get(
        f"{BASE_URL}/standings",
        headers=headers,
        params={"league": 1, "season": 2022}
    ).json()
    return jsonify(response["response"])

@app.route("/api/artilheiros")
def artilheiros():
    response = requests.get(f"{BASE_URL}/players/topscorers?league=1&season=2022", headers=headers)
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)






=====================================================

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


if __name__ == "__main__":
    app.run(debug=True)




    #estrutura:
        #@app.route("/caminho/da/rota")
        #def nome_da_funcao():
            # 1. faz a requisição pra API
            #response = requests.get(f"{BASE_URL}/endpoint", headers=headers, params={...}).json()
    
            # 2. retorna os dados como JSON pro front
            #return jsonify(response["response"])
        