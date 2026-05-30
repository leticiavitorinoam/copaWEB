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

@app.route("/api/classificacao")
def classificacao():
    response = requests.get(f"{BASE_URL}/standings?league=1&season=2026", headers=headers)
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)