======================================
PARTE I
    Dados na pasta "dados_JSON":
        - Vindos da API-FootBall ou para facilitar a mescla de dados entre API's
======================================

***********
1) artilheiros.json =
    - Identificação: rank (posição no ranking), id, nome, foto, posicao (função em campo), numeroCamisa

    - Seleção: objeto com id, nome, escudo do time do jogador

    - Números na competição: gols, assistências, partidas disputadas, minutos jogados, nota média, chutesAoGol

***********
2) classificacao.json = 
    — Tabela de classificação por grupo da fase de grupos

    - Identificação: nome do grupo, (ex: "Group A"), posição na tabela do grupo, id, nome, escudo da seleção

    - Desempenho: pontos, jogos (partidas disputadas), vitorias, empates, derrotas

    - Gols: golsPro, golsContra, saldoGols

***********
3) jogos_sofascore.json =
    - Versão simplificada do que tem em ids_partidas.json

    - Identificação: match_id (id do jogo na SofaScore), rodada, data (timestamp), status

    - Times: casa e fora, cada um com id e nome

***********
4) jogos.json =
    - Lista principal de todas as 64 partidas

    - Identificação: id do jogo na API-Football, data(padão ISO), fase (ex: "Group Stage - 1"), estadio, cidade

    - Seleções: selecao01 (casa) e selecao02 (fora), cada uma com id, nome, escudo

    - Placar: score, dividido em intervalo (1º tempo), final, prorrogacao e penaltis — cada um com o placar de selecao01 e selecao02 (os que não aconteceram ficam null)

***********
5) selecoes.json =
    - Lista simples das 32 seleções que disputaram a copa, com dados básicos de cada uma

    - Identificação: id, nome, escudo

    - Adicional: pais (país de origem), ano de fundação da federação/seleção


======================================
PARTE II
    Dados na pasta "data":
        - Vindos da SofaScore
======================================

***********
6) escalacoes.json =
    - Estrutura geral: indexado pelo id da partida na SofaScore (ex: "10230541"), com selecao01 (casa) e selecao02 (fora) dentro de cada jogo

    - Por seleção: id, nome, escudo, tecnico (sempre null, não disponível na API), formacao (ex: "5-3-2")

    - Por jogador (dentro de titulares e reservas): id, nome, numeroCamisa, posicao, coordenadas (sempre null, não disponível na API)

***********
7) estatisticas.json =
    - Estrutura geral: indexado pelo id da partida na SofaScore, com selecao01 (casa) e selecao02 (fora) dentro de cada jogo

    - Por seleção: id, nome, escudo, e o bloco estatisticas com os números do jogo — chutesAoGol, chutesFora, totalChutes, posseBola, passes, passesCertos, precisaoPasses, escanteios, impedimentos, faltas, cartoesAmarelos, cartoesVermelhos (quase sempre null, só aparece quando teve mesmo vermelho), defesasGoleiro

***********
8) eventos.json =
    - Cartões, gols e substituições de cada partida (escanteios e impedimentos não entram aqui, só como contagem total no estatisticas.json).

    - Estrutura geral: indexado pelo id da partida, cada jogo contém uma lista (array) de eventos, em ordem cronológica decrescente (do mais recente pro mais antigo, do fim do jogo pro início)

    - Por evento: minuto, acrescimos (sempre null, não disponível), tempo ("1º Tempo"/"2º Tempo"/"Prorrogação"), tipo ("Card", "Goal" ou "subst"), detalhe (ex: "Yellow Card", "Substitution", "Normal Goal", "Penalty"), jogador, assistencia (quem deu assistência no gol, ou o jogador substituído no caso de troca), selecao (objeto com id, nome, escudo)

***********
9) ids_partidas.json=
    - Bem mais robusto, nem todos os dados serão utilizados

    - Estrutura geral: indexado pelo id da partida — é o arquivo mestre, usado como base pelos outros 4 (eles usam esse id como chave e os campos homeTeam/awayTeam daqui pra montar seus próprios dados)

    - Identificação da partida: id, slug, timestamp (data/hora em Unix), status (se já terminou, ao vivo, etc)

    - Contexto do torneio: tournament (fase específica, ex: "Group A"), uniqueTournament (Copa do Mundo em si), season, round (número da rodada)

    - Times: homeTeam e awayTeam, cada um bem detalhado — id, name, escudo (imagePath), country, ranking FIFA, etc

    - Placar: homeScore/awayScore, com detalhamento por período (period1, period2, normaltime)

    - Outros: homeRedCards/awayRedCards, venue (estádio, mas vem vazio nesse endpoint)


***********
10) jogadores_partida.json =
    -  Desempenho individual de cada jogador naquela partida específica — diferente do artilheiros.json (API-Football), que é acumulado da Copa inteira, não por jogo.

    - Estrutura geral: indexado pelo id da partida, com selecao01 (casa) e selecao02 (fora) dentro de cada jogo

    - Por seleção: id, nome, escudo, e a lista jogadores com todo mundo que atuou (titular ou reserva que entrou)

    - Por jogador: id, nome, posicao, titular (true/false), minutosJogados, gols, assistencias, nota, chutes, finalizacoesNoGol, cartaoAmarelo (1 ou null), cartaoVermelho (1 ou null, cruzado do eventos.json)