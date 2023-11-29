

let stockSearch = document.getElementById("searchBtn");
// let displayWindow = document.getElementById("stockInfo");
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
let btnContainer = document.getElementById("btnContainer")
let buyBtn 
let sellBtn 

if(isLogin){
  loginBtn.textContent = "Sign Out"
  let userName = document.getElementById("user")
  userName.textContent = "Hello, " + username  + "!"
  buyBtn = document.createElement("button")
  buyBtn.classList = "btn btn-outline-success"
  buyBtn.style.marginRight= "10px"
  buyBtn.textContent = "Buy"
  sellBtn = document.createElement("button")
  sellBtn.classList = "btn btn-outline-danger"
  sellBtn.style.marginLeft = "10px"
  sellBtn.textContent = "Sell"

  btnContainer.appendChild(buyBtn)
  btnContainer.appendChild(sellBtn)
  buyBtn.addEventListener("click", () => transaction("Buy"))
  sellBtn.addEventListener("click", () => transaction("Sell"))
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

    if(companyName == ""){
      alert("Please enter a symbol")
      return
    }

    getStockData(companyName)
}



let balanceText = document.getElementById("balance")
let balance


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
  let curStock = document.getElementById("stocks")
  console.log(curStock)
  if(curStock == null ){
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
  if(!isLogin){
    alert("Please sign in to view your inventory")
    return
  }
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

let stockWidget = document.getElementById("stockWidget")
const getStockData = async (companyName) => {
  try {
    const response = await fetch(`http://localhost:8080/getStockData?company=${companyName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
  
              
    console.log('Stock data:', data);
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
      while (stockWidget.firstChild) {
        stockWidget.removeChild(stockWidget.firstChild);
      }
            

      // let stockWidgetContainer = document.getElementById("stockWidgetContainer")
      
      // stockWidget.classList.add('stockWidget')

      let infoDiv = document.createElement('div');
      infoDiv.classList.add('info')

      let nameDiv = document.createElement('div');
      nameDiv.classList.add('name');
      nameDiv.id = 'stocks';
      nameDiv.textContent = symbol;
      infoDiv.appendChild(nameDiv);

      badgeDiv = document.createElement('div');
      badgeDiv.classList.add('badge');

      valueSpan = document.createElement('span');
      valueSpan.classList.add('value');
      valueSpan.textContent = currentPrice;

      badgeDiv.appendChild(valueSpan);

      let moreDataDiv = document.createElement('div');
      moreDataDiv.classList.add('more-data');

      let changeDiv = document.createElement('div');
      
      changeDiv.textContent = difference;

      const changePercentageDiv = document.createElement('div');
      
      changePercentageDiv.textContent = (difference*100/parseFloat(priviousPrice)).toFixed(2) +  " %";

      if(difference > 0){
        changeDiv.classList.add('change', 'earn');
        changePercentageDiv.classList.add('change-percentage', 'earn');
        badgeDiv.style.backgroundColor = "green"
      }
      else{
        changeDiv.classList.add('change', 'loss');
        changePercentageDiv.classList.add('change-percentage', 'loss');
        badgeDiv.style.backgroundColor = "red"
      }
      moreDataDiv.appendChild(changeDiv);
      moreDataDiv.appendChild(changePercentageDiv);

      stockWidget.appendChild(infoDiv);
      stockWidget.appendChild(badgeDiv);
      stockWidget.appendChild(moreDataDiv);
      stockWidget.style.marginLeft = "50px"
      // stockWidgetContainer.appendChild(stockWidget);

      tradingView(symbol)
    }
    else{
        alert("Company: " + companyName + " not found");
    }
          
  } catch (error) {
    console.error('Error:', error.message);
  
  }
};









