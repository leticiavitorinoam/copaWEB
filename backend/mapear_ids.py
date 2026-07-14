import json
import unicodedata

def normalizar(nome):
    """Remove acentos e deixa em minúsculo, pra comparação segura."""
    if not nome:
        return ""
    nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
    return nome.strip().lower()


def gerar_mapa_ids():
    with open("dados_JSON/jogos.json", "r", encoding="utf-8") as f:
        jogos_api_football = json.load(f)

    with open("data/sofascore/ids_partidas.json", "r", encoding="utf-8") as f:
        jogos_sofascore = json.load(f)

    # monta um índice da SofaScore normalizado
    indice_sofascore = {}
    for sof_id, partida in jogos_sofascore.items():
        home = normalizar(partida.get('homeTeam', {}).get('name'))
        away = normalizar(partida.get('awayTeam', {}).get('name'))
        indice_sofascore[(home, away)] = sof_id

    mapa = {}
    nao_encontrados = []

    for jogo in jogos_api_football:
        af_id = jogo.get('id')
        casa = normalizar(jogo.get('selecao01', {}).get('nome'))
        fora = normalizar(jogo.get('selecao02', {}).get('nome'))

        sof_id = indice_sofascore.get((casa, fora))

        # tenta invertido
        if not sof_id:
            sof_id = indice_sofascore.get((fora, casa))

        if sof_id:
            mapa[str(af_id)] = sof_id
        else:
            nao_encontrados.append({
                "id_api_football": af_id,
                "casa": jogo.get('selecao01', {}).get('nome'),
                "fora": jogo.get('selecao02', {}).get('nome')
            })

    with open("dados_JSON/mapa_ids.json", "w", encoding="utf-8") as f:
        json.dump(mapa, f, ensure_ascii=False, indent=2)

    print(f"Total mapeado: {len(mapa)} de {len(jogos_api_football)} jogos")

    if nao_encontrados:
        print(f"\nNAO ENCONTRADOS ({len(nao_encontrados)}):")
        for item in nao_encontrados:
            print(f"  id {item['id_api_football']}: {item['casa']} x {item['fora']}")
    else:
        print("Todos os jogos foram mapeados com sucesso!")

    return mapa


if __name__ == "__main__":
    gerar_mapa_ids()