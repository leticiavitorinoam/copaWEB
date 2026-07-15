import json
import unicodedata


def normalizar(nome):
    if not nome:
        return ""
    nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
    return nome.strip().lower()


# Títulos de Copa do Mundo até 2022 (inclui o título do Brasil/Argentina de
# cada ano). Ajuste se quiser conferir/corrigir algum número.
TITULOS_COPA = {
    "brazil": 5,
    "germany": 4,
    "italy": 4,
    "argentina": 3,  # inclui o título de 2022
    "france": 2,
    "uruguay": 2,
    "england": 1,
    "spain": 1,
}


def atualizar_selecoes():
    with open("dados_JSON/selecoes.json", "r", encoding="utf-8") as f:
        selecoes = json.load(f)

    with open("data/sofascore/ids_partidas.json", "r", encoding="utf-8") as f:
        jogos_sofascore = json.load(f)

    # monta um índice nome -> {sigla, rankingFifa}, a partir dos times que
    # aparecem em qualquer jogo (home ou away) do ids_partidas.json
    indice_times = {}
    for partida in jogos_sofascore.values():
        for lado in ["homeTeam", "awayTeam"]:
            time = partida.get(lado, {})
            nome_norm = normalizar(time.get("name"))
            if nome_norm and nome_norm not in indice_times:
                indice_times[nome_norm] = {
                    "sigla": time.get("nameCode"),
                    "rankingFifa": time.get("ranking")
                }

    nao_encontrados = []

    for selecao in selecoes:
        nome_norm = normalizar(selecao.get("nome"))
        dados_extras = indice_times.get(nome_norm)

        if dados_extras:
            selecao["sigla"] = dados_extras["sigla"]
            selecao["rankingFifa"] = dados_extras["rankingFifa"]
        else:
            selecao["sigla"] = None
            selecao["rankingFifa"] = None
            nao_encontrados.append(selecao.get("nome"))

        selecao["titulosCopa"] = TITULOS_COPA.get(nome_norm, 0)

    with open("dados_JSON/selecoes.json", "w", encoding="utf-8") as f:
        json.dump(selecoes, f, ensure_ascii=False, indent=2)

    print(f"Total de seleções atualizadas: {len(selecoes)}")

    if nao_encontrados:
        print(f"\nNAO ENCONTRADOS no ids_partidas.json ({len(nao_encontrados)}):")
        for nome in nao_encontrados:
            print(f"  {nome}")
    else:
        print("Todas as seleções foram cruzadas com sucesso!")


if __name__ == "__main__":
    atualizar_selecoes()