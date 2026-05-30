var myHeaders = new Headers();
myHeaders.append("x-apisports-key", "XxXxXxXxXxXxXxXxXxXxXxXx");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://v3.football.api-sports.io/leagues", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));