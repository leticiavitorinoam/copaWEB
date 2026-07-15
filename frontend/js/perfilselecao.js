const id = Number(new URLSearchParams(window.location.search).get("id"));

fetch("../backend/dados_JSON/selecoes.json")
.then(res=>res.json())
.then(lista=>{

    const selecao = lista.find(s=>s.id===id);

    if(!selecao) return;

    document.getElementById("escudo").src = selecao.escudo;

    document.getElementById("nome").innerText = selecao.nome;

    document.getElementById("fundacao").innerText = selecao.fundacao;

    document.getElementById("sigla").innerText = selecao.sigla;

    document.getElementById("titulos").innerText = selecao.titulosCopa;

    document.getElementById("ranking").innerText =
        selecao.rankingFifa ?? "Não informado";

    document.getElementById("confederacao").innerText =
        "FIFA";
});