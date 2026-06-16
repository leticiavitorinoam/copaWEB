// chama o backend, API de forma indireta
async function getClassificacao() {
    const response = await fetch("http://localhost:5000/api/classificacao");
    const dados = await response.json();
    return dados;
}

async function getJogos() {
    const response = await fetch("http://localhost:5000/api/jogos");
    const dados = await response.json();
    return dados;
}

async function getArtilheiros() {
    const response = await fetch("http://localhost:5000/api/artilheiros");
    const dados = await response.json();
    return dados;
}