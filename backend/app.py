from flask import Flask, jsonify, request, Response
import json
import os
import requests
from flask_cors import CORS
import unicodedata

app = Flask(__name__)
CORS(app)

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


def calcular_estatisticas_jogadores():
    """
    Soma o desempenho de cada jogador em todos os jogos que ele participou
    de fato (minutosJogados > 0), usando jogadores_partida_sofa.
    Retorna um dicionário: { "<id_jogador>": {jogos, minutosJogados, gols,
    assistencias, chutesAoGolPorJogo, cartoesAmarelos} }
    """
    agregados = {}

    for dados_jogo in jogadores_partida_sofa.values():
        if not dados_jogo:
            continue

        for chave in ["selecao01", "selecao02"]:
            time_info = dados_jogo.get(chave)
            if not time_info:
                continue

            for jog in time_info.get("jogadores", []):
                player_id = jog.get("id")
                minutos = jog.get("minutosJogados")

                if not player_id or not minutos:
                    continue  # não entrou em campo nesse jogo

                if player_id not in agregados:
                    agregados[player_id] = {
                        "jogos": 0,
                        "minutosJogados": 0,
                        "gols": 0,
                        "assistencias": 0,
                        "_somaFinalizacoesNoGol": 0,
                        "cartoesAmarelos": 0
                    }

                a = agregados[player_id]
                a["jogos"] += 1
                a["minutosJogados"] += minutos
                a["gols"] += jog.get("gols") or 0
                a["assistencias"] += jog.get("assistencias") or 0
                a["_somaFinalizacoesNoGol"] += jog.get("finalizacoesNoGol") or 0
                if jog.get("cartaoAmarelo"):
                    a["cartoesAmarelos"] += 1

    # calcula a média de chutes ao gol por jogo, e limpa o campo auxiliar
    for a in agregados.values():
        a["chutesAoGolPorJogo"] = round(a["_somaFinalizacoesNoGol"] / a["jogos"], 1) if a["jogos"] else 0
        del a["_somaFinalizacoesNoGol"]

    return agregados


# calcula uma vez só, na inicialização, e já embute em cada jogador
_estatisticas_por_jogador = calcular_estatisticas_jogadores()

for _player_id, _perfil in jogadores_perfil_sofa.items():
    _perfil["estatisticas"] = _estatisticas_por_jogador.get(int(_player_id), {
        "jogos": 0,
        "minutosJogados": 0,
        "gols": 0,
        "assistencias": 0,
        "chutesAoGolPorJogo": 0,
        "cartoesAmarelos": 0
    })

def _normalizar(nome):
    if not nome:
        return ""
    nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
    return nome.strip().lower()

_escudos_por_nome = {_normalizar(s["nome"]): s["escudo"] for s in selecoes_dados}
_fotos_por_nome = {_normalizar(a["nome"]): a["foto"] for a in artilheiros_dados}

for _perfil in jogadores_perfil_sofa.values():
    nome_selecao = _normalizar((_perfil.get("selecao") or {}).get("nome"))
    if nome_selecao in _escudos_por_nome:
        _perfil["selecao"]["escudo"] = _escudos_por_nome[nome_selecao]

    nome_jogador = _normalizar(_perfil.get("nome"))
    nome_curto = _normalizar(_perfil.get("nomeCurto"))

    if nome_jogador in _fotos_por_nome:
        _perfil["foto"] = _fotos_por_nome[nome_jogador]
    elif nome_curto in _fotos_por_nome:
        _perfil["foto"] = _fotos_por_nome[nome_curto]


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

@app.route("/api/imagem")
def imagem_proxy():

    url = request.args.get("url")

    if not url or not url.startswith("https://img.sofascore.com/"):
        return jsonify({"erro": "URL inválida"}), 400

    resposta = requests.get(
        url,
        headers={
            "Referer": "https://www.sofascore.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
    )

    if resposta.status_code != 200:
        print(f"DEBUG imagem_proxy: status={resposta.status_code}, url={url}")
        print(f"DEBUG imagem_proxy: resposta={resposta.text[:200]}")
        return jsonify({"erro": "Não foi possível carregar a imagem"}), 502
        
    return Response(
        resposta.content,
        mimetype=resposta.headers.get("Content-Type", "image/png")
    )


@app.route("/api/jogadores-perfil")
def jogadores_perfil():
    # lista inteira — usada quando só temos o NOME do jogador (ex: vindo
    # dos artilheiros, que usam id da API-Football, não da SofaScore)
    return jsonify(jogadores_perfil_sofa)


@app.route("/api/jogador/<int:player_id>")
def jogador(player_id):
    perfil = jogadores_perfil_sofa.get(str(player_id))

    if not perfil:
        return jsonify({"erro": "Jogador não encontrado"}), 404

    return jsonify(perfil)


# ==========================================
# ROTAS — DADOS DA SOFASCORE, cruzados
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