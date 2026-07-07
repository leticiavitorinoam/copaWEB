import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
print("API_KEY:", API_KEY)

BASE_URL = "https://v3.football.api-sports.io"

headers = {
    "x-apisports-key": API_KEY
}


def gerar_selecoes():

    response = requests.get(
        f"{BASE_URL}/teams",
        headers=headers,
        params={
            "league": 1,
            "season": 2022
        }
    )

    # TESTE
    print("Status:", response.status_code)
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))

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

    print("\nArquivo selecoes.json gerado com sucesso!")


if __name__ == "__main__":
    gerar_selecoes()