

let stockSearch = document.getElementById("searchBtn");
let displayWindow = document.getElementById("stockInfo");
let stockName = document.getElementById("stockName");

let companyName
let currentPrice

var closePrice
var highPrice
var lowPrice
var openPrice
var timestamp
var volume
var symbol
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
            symbol = data.chart.result[0].meta.symbol;
            closePrice = data.chart.result[0].indicators.quote[0].close
            openPrice = data.chart.result[0].indicators.quote[0].open
            highPrice = data.chart.result[0].indicators.quote[0].high
            lowPrice = data.chart.result[0].indicators.quote[0].low
            volume = data.chart.result[0].indicators.quote[0].volume
            timestamp = data.chart.result[0].timestamp
            // console.log(closePrice)
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
                // chart()
                tradingView(symbol)

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
        shareQuantity: (action == "Buy")?shareQuantity * 1 :shareQuantity *-1,
        action: action,
        changes: (action == "Buy")?currentPrice * shareQuantity * -1 :currentPrice * shareQuantity
        
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/insert', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(data));

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            console.log('success');
            updateBalance()
        } else {
            console.error('error');
            var errorMessage = JSON.parse(xhr.responseText).error;
            // alert(xhr.status);
            alert(errorMessage);
        }
    };

    xhr.onerror = function(err) {
        alert(err)
        console.error('error');
    };

    
    updateBalance()
}

function updateBalance(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8080/balance', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();

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
      
     

}

let switchPage = document.getElementById("switchPage")
switchPage.onclick = function(event){
    event.preventDefault()
    let value = balanceText.textContent.split(": ")[1]
    console.log("value = " + value)
    
    let url = `inventory.html?param1=${encodeURIComponent(value)}`
    window.location.href = url

}



window.onload = updateBalance()


function chart(){
    var jsonData = [];
    var startDate = new Date(timestamp[0] * 1000);

    for (var i = 0; i < closePrice.length; i++) {
        
      var dataPoint = {
        date: startDate.toISOString().split('T')[0],
        open: openPrice[i],
        high: highPrice[i],
        low: lowPrice[i],
        close: closePrice[i],
        volume: volume[i]
      };
      jsonData.push(dataPoint);
      startDate.setDate(startDate.getDate() - 1);
    }
    
    var jsonString = JSON.stringify(jsonData);
    console.log(jsonString)

    var stockChart = new ej.charts.StockChart({
        primaryYAxis: {
          lineStyle: { color: "transparent" },
          majorTickLines: { color: "transparent", width: 0 },
          crosshairTooltip: { enable: true }
        },
        primaryXAxis: {
          majorGridLines: { color: "transparent" },
          crosshairTooltip: { enable: true },
          title: "Months"
        },
        
      
      
        enableSelector: false,
        series: [
          {
            dataSource: jsonData,
            type: "Candle",
      
           
          }
        ],
       title: symbol + " Stock Price"
      });

    // document.getElementById("chart-container").appendChild(st)
    document.getElementById("chart-container").style.width = 800
      stockChart.appendTo("#chart-container");

}

function tradingView(symbol){

 



  new TradingView.widget(
    {
    "autosize": true,
    "symbol": "NASDAQ:"+symbol,
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "enable_publishing": false,
    "allow_symbol_change": false,
    "container_id": "tradingview_21a5f"
  }
    );
}

