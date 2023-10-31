

let stockSearch = document.getElementById("searchBtn");
let displayWindow = document.getElementById("stockInfo");
let stockName = document.getElementById("stockName");

let companyName
let currentPrice
stockSearch.onclick = function(){
    // get real time stock price
    console.log("click")
    let company = document.getElementById("stockName");
    companyName = company.value;
    let queryUrl = "http://query1.finance.yahoo.com/v8/finance/chart/" + company.value + "?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance";
    // let currentStockInfo = JSON.parse(query);
   
    // parse return data
    console.log(queryUrl)
    const corsURL = 'http://cors-anywhere.herokuapp.com/';
    axios.get(`${corsURL}${queryUrl}`)  
        .then(function (response) {
            var data = response.data
            // var print = toString(data)
            console.log(data);
            // var pos1 = data.
            // print = print.substring(pos1, 1)
            var symbol = data.chart.result[0].meta.symbol;
            currentPrice = data.chart.result[0].meta.regularMarketPrice;
            if(currentPrice != null){
                var priviousPrice = data.chart.result[0].meta.chartPreviousClose;
                var difference = (parseFloat(currentPrice) - parseFloat(priviousPrice)).toFixed(2);
                if(difference < 0){
                    displayWindow.textContent = symbol + "       " + currentPrice + "   - " + difference + "   (-" + (difference*100/parseFloat(priviousPrice)).toFixed(2) +  " %)";
                }
                else{
                    displayWindow.textContent = symbol + "       " + currentPrice + "   + " + difference + "   (+" + (difference*100/parseFloat(priviousPrice)).toFixed(2) + " %)";
                }
            }
            else{
                alert("Company: " + companyName + " not found");
            }
        })
        .catch(function (error) {
            console.error("Error:", error);
            alert("Company: " + companyName + " not found");
        });

    company.value = "";
}

let buyBtn = document.getElementById("buyBtn")
let sellBtn = document.getElementById("sellBtn")
let balanceText = document.getElementById("balance")
let balance


buyBtn.addEventListener("click", () => transaction("Buy"))
sellBtn.addEventListener("click", () => transaction("Sell"))

function transaction(action){
    var shareQuantity = prompt('Share quantity: ');
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const data = {
        companyName: companyName,
        dateTime: dateTime, 
        stockPrice: currentPrice, 
        shareQuantity: shareQuantity,
        action: action,
        changes: (action == "Buy")?currentPrice * shareQuantity * -1 :currentPrice * shareQuantity
        
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/insert', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            console.log('success');
        } else {
            console.error('error');
            var errorMessage = JSON.parse(xhr.responseText).error;
            // alert(xhr.status);
            alert(errorMessage);
        }
    };

    xhr.onerror = function() {
        console.error('error');
    };

    xhr.send(JSON.stringify(data));
    updateBalance()
}

function updateBalance(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/balance', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            console.log(response);
            balance =  100000
            for(let i = 0; i < response.length; i++){
                balance += parseFloat(response[i].changes)
            }
            console.log("balance =" + balance );
            balanceText.textContent = `Available Balance : ${balance.toFixed(2)}` 
          } else {
            console.error('Request failed:', xhr.status, xhr.statusText);
          }
        }
      };
      
      xhr.send();

}

window.onload = updateBalance()