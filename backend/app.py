from flask import Flask, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # libera o frontend a acessar essa API

DADOS_DIR = "dados_JSON"
SOFA_DIR = os.path.join("data", "sofascore")


def carregar_json(caminho):
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


# ==========================================
# CARREGA TUDO EM MEMÓRIA NA INICIALIZAÇÃO
# ==========================================

selecoes_dados = carregar_json(os.path.join(DADOS_DIR, "selecoes.json"))
jogos_dados = carregar_json(os.path.join(DADOS_DIR, "jogos.json"))
classificacao_dados = carregar_json(os.path.join(DADOS_DIR, "classificacao.json"))
artilheiros_dados = carregar_json(os.path.join(DADOS_DIR, "artilheiros.json"))
mapa_ids = carregar_json(os.path.join(DADOS_DIR, "mapa_ids.json"))

escalacoes_sofa = carregar_json(os.path.join(SOFA_DIR, "escalacoes.json"))
estatisticas_sofa = carregar_json(os.path.join(SOFA_DIR, "estatisticas.json"))
eventos_sofa = carregar_json(os.path.join(SOFA_DIR, "eventos.json"))
jogadores_partida_sofa = carregar_json(os.path.join(SOFA_DIR, "jogadores_partida.json"))
jogadores_perfil_sofa = carregar_json(os.path.join(SOFA_DIR, "jogadores_perfil.json"))


def buscar_id_sofascore(fixture):
    """Traduz o id da API-Football para o id correspondente na SofaScore."""
    return mapa_ids.get(str(fixture))


# ==========================================
# ROTAS — DADOS DIRETOS DA API-FOOTBALL
# ==========================================

@app.route("/api/selecoes")
def selecoes():
    return jsonify(selecoes_dados)


@app.route("/api/jogos")
def jogos():
    return jsonify(jogos_dados)


@app.route("/api/classificacao")
def classificacao():
    return jsonify(classificacao_dados)


@app.route("/api/artilheiros")
def artilheiros():
    return jsonify(artilheiros_dados)


# ==========================================
# ROTA — PERFIL DE JOGADOR
# ==========================================

@app.route("/api/jogador/<int:player_id>")
def jogador(player_id):
    perfil = jogadores_perfil_sofa.get(str(player_id))

    if not perfil:
        return jsonify({"erro": "Jogador não encontrado"}), 404

    return jsonify(perfil)


# ==========================================
# ROTAS — DADOS DA SOFASCORE CRUZADOS
# ==========================================

@app.route("/api/estatisticas/<int:fixture>")
def estatisticas(fixture):
    sofa_id = buscar_id_sofascore(fixture)

    if not sofa_id:
        return jsonify({"erro": "Jogo não encontrado no mapeamento"}), 404

    dados = estatisticas_sofa.get(sofa_id)

    if not dados:
        return jsonify({"erro": "Estatísticas não encontradas"}), 404

    return jsonify(dados)


@app.route("/api/eventos/<int:fixture>")
def eventos(fixture):
    sofa_id = buscar_id_sofascore(fixture)

    if not sofa_id:
        return jsonify({"erro": "Jogo não encontrado no mapeamento"}), 404

    dados = eventos_sofa.get(sofa_id)

    if dados is None:
        return jsonify({"erro": "Eventos não encontrados"}), 404

    return jsonify(dados)


@app.route("/api/escalacoes/<int:fixture>")
def escalacoes(fixture):
    sofa_id = buscar_id_sofascore(fixture)

    if not sofa_id:
        return jsonify({"erro": "Jogo não encontrado no mapeamento"}), 404

    dados = escalacoes_sofa.get(sofa_id)

    if not dados:
        return jsonify({"erro": "Escalação não encontrada"}), 404

    return jsonify(dados)


@app.route("/api/jogadores-partida/<int:fixture>")
def jogadores_partida(fixture):
    sofa_id = buscar_id_sofascore(fixture)

    if not sofa_id:
        return jsonify({"erro": "Jogo não encontrado no mapeamento"}), 404

    dados = jogadores_partida_sofa.get(sofa_id)

    if not dados:
        return jsonify({"erro": "Dados de jogadores não encontrados"}), 404

    return jsonify(dados)


if __name__ == "__main__":
    app.run(debug=True)