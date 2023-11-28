

let stockSearch = document.getElementById("searchBtn");
let displayWindow = document.getElementById("stockInfo");
let stockName = document.getElementById("stockName");

let companyName
let currentPrice

var isLogin = false

// get user name and ID
const hash = window.location.hash.substr(1);
let username
let userId 
if(hash.length != 0){
  // get token
  const tokenParams = new URLSearchParams(hash);
  const idToken = tokenParams.get('id_token');
  const accessToken = tokenParams.get('access_token');

  // console.log('ID Token:', idToken);
  // console.log('Access Token:', accessToken);

  const decodedIdToken = atob(idToken.split('.')[1]);
  const parsedIdToken = JSON.parse(decodedIdToken);

  username = parsedIdToken['cognito:username'];
  // console.log('User name:', username)
  
  userId = parsedIdToken.sub;
  // console.log('User ID:', userId);

  isLogin = true;
}
else{
  console.log("Not login")
}


var loginBtn = document.getElementById("login")
loginBtn.onclick = function(event){
  
  event.preventDefault()
  let url
  if(!isLogin){
    url = "https://myusers.auth.us-west-1.amazoncognito.com/login?client_id=2cmoec7k5o0itvn83sreuo3sef&response_type=token&scope=email+openid+phone&redirect_uri=http%3A%2F%2Flocalhost%3A8080"
    
  }
  else{
    url = "index.html"
  }

  window.location.href = url
  

}

if(isLogin){
  loginBtn.textContent = "Log Out"
  let userName = document.getElementById("user")
  userName.textContent = "Hello " + username 

  updateUser()
  
}


// search current stock price
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
    let queryUrl = "https://query1.finance.yahoo.com/v8/finance/chart/" + company.value + "?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance";
    // let currentStockInfo = JSON.parse(query);
   

    
    // parse return data
    console.log(queryUrl)
    const corsURL = 'https://cors-anywhere.herokuapp.com/';
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

// handle buy and sell actions
let buyBtn = document.getElementById("buyBtn")
let sellBtn = document.getElementById("sellBtn")
let balanceText = document.getElementById("balance")
let balance


buyBtn.addEventListener("click", () => transaction("Buy"))
sellBtn.addEventListener("click", () => transaction("Sell"))

// Update user database

function updateUser(){
  const data = {
    uID: userId,
    userName: username
    
  }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/users', true);
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
}



function transaction(action){
  if(!isLogin){
    alert("Please sign in first")
    return
  }

  if(displayWindow.textContent == ""){
    alert("Please search a symbol first")
    return
  }
  var shareQuantity = prompt('Share quantity: ');
  console.log(shareQuantity);
  if(shareQuantity == "" && Number.isInteger(shareQuantity)){
    alert("Please input a valid number")
    return
  }

  const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const data = {
      uID: userId,
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
    if(!isLogin){
      return
    }
    // const data = {
    //   uID: userId,
    //   userName: username
    // }
    const url = `http://localhost:8080/balance?uID=${userId}&userName=${username}`;

    console.log("user ID : " + userId)
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
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
    if(hash.length != 0){
      url = `inventory.html?param1=${encodeURIComponent(value)}&param2=${hash}`
    }
    window.location.href = url

}

let homePage = document.getElementById("homePage")
homePage.onclick = function(event){
    event.preventDefault()
    let value = balanceText.textContent.split(": ")[1]
    console.log("value = " + value)
    let url = 'index.html'
    if(hash.length != 0){
      url = `#${hash}`
    }
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

// // 配置 AWS SDK
// AWS.config.region = 'us-west-1'; // 您的 Cognito 用户池所在的区域
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: 'us-west-1_qHMDKi3gC' // 您的 Cognito 身份池 ID
// });

// // 创建 CognitoIdentityServiceProvider 对象
// var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// 创建 CognitoUserPool 对象
// var poolData = {
// 	UserPoolId: 'us-west-1_qHMDKi3gC', // Your user pool id here
// 	ClientId: '2cmoec7k5o0itvn83sreuo3sef', // Your client id here
// };
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
// console.log("userPool : " + userPool[0]);


// var cognitoUser = userPool.getCurrentUser();

// if (cognitoUser != null) {
//     cognitoUser.getSession(function(err, session) {
//         if (err) {
//             console.log(err);
//             return;
//         }
        
//         console.log('Session valid');
        
//         // 通过获取当前用户的信息来获取用户名
//         cognitoUser.getUserAttributes(function(err, attributes) {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
            
//             for (var i = 0; i < attributes.length; i++) {
//                 if (attributes[i].getName() === 'username') {
//                     console.log('Username:', attributes[i].getValue());
//                     break;
//                 }
//             }
//         });
//     });
// } else {
//     console.log(cognitoUser);
// }







