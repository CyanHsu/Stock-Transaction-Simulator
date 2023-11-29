// let balanceText = document.getElementById("balance")
let totalStockValue = 0.0
let currentAmount
let balance
let token

function getInventory(){

    
    // get balance
    const urlParams = new URLSearchParams(window.location.search);
    balance = urlParams.get('param1');
    token = urlParams.get('param2')
    console.log(balance )
    console.log("Token = " + token )

    const tokenParams = new URLSearchParams(token);
    const idToken = tokenParams.get('id_token');
    const accessToken = tokenParams.get('access_token');
  
    // console.log('ID Token:', idToken);
    // console.log('Access Token:', accessToken);
  
    const decodedIdToken = atob(idToken.split('.')[1]);
    const parsedIdToken = JSON.parse(decodedIdToken);
  
    username = parsedIdToken['cognito:username'];
    let user = document.getElementById("user")
    user.textContent = username
    // console.log('User name:', username)
    
    userId = parsedIdToken.sub;

    const url = `http://localhost:8080/inventory?uID=${userId}`;
    console.log("user : " + userId)
    fetch(url)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
                return response.json(); 
            })
            .then(data => {
                console.log(data); 
                data.forEach(element => {
                    if(element.shareQuantity != 0){
                        // let companyName = element.companyName;
                        getStockData(element)
                        // let currentPrice = 0;
                        // parse return data
                      
                        // axios.get(`${corsURL}${queryUrl}`)  
                        //     .then(function (response) {
                        //         var data = response.data
                        //         currentPrice = data.chart.result[0].meta.regularMarketPrice;
                        //         console.log("Company : " + companyName + " current price = " + currentPrice)
                        //         let profit =  parseFloat(currentPrice) * parseFloat(element.shareQuantity) - parseFloat(element.cost) 
                        //         console.log("Current cost : " + parseFloat(currentPrice) * parseFloat(element.shareQuantity))
                        //         console.log("element.cost = " + element.cost)
                        //         let profitRate = profit * 100/parseFloat(element.cost)
                        //         console.log("profit = " + profit)
                        //         let row = document.createElement('tr')
                        //         row.innerHTML = `<td>${element.companyName}</td><td>${element.stockPrice}</td><td>${element.shareQuantity}</td><td>${element.cost}</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:profit.toFixed(2) }</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:(profitRate).toFixed(2)} %</td>`
                        //         table.appendChild(row)
                        //         totalStockValue += parseFloat(element.shareQuantity) * parseFloat(currentPrice)
                        //     })
                        //     .catch(function (error) {
                        //         console.error("Error:", error);
                        //         alert("Company: " + companyName + " not found");
                        //     });

         
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
        });


    
}

let switchPage = document.getElementById("switchPage")
switchPage.onclick = function(event){
    event.preventDefault()
    let value = balanceText.textContent.split(": ")[1]
    console.log("value = " + value)
    
    let url = `inventory.html?param1=${encodeURIComponent(value)}`
    if(token != null){
        url = `inventory.html?param1=${encodeURIComponent(value)}&param2=${token}`
    }
    window.location.href = url

}

let homePage = document.getElementById("homePage")
homePage.onclick = function(event){
    event.preventDefault()
   
    let url = 'index.html'
    if(token != null){
        
      url = `http://localhost:8080/#${token}`
      
    }
    console.log(url)
    window.location.href = url

}

currentAmount = document.getElementById("currentAmount")
let table = document.getElementById("inventoryTable")

const getStockData = async (element) => {
  try {
    let companyName = element.companyName
    const response = await fetch(`http://localhost:8080/getStockData?company=${companyName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    
   
    let currentPrice = 0;
    // parse return data
    currentPrice = data.chart.result[0].meta.regularMarketPrice;
    console.log("Company : " + companyName + " current price = " + currentPrice)
    let profit =  parseFloat(currentPrice) * parseFloat(element.shareQuantity) - parseFloat(element.cost) 
    console.log("Current cost : " + parseFloat(currentPrice) * parseFloat(element.shareQuantity))
    console.log("element.cost = " + element.cost)
    let profitRate = profit * 100/parseFloat(element.cost)
    console.log("profit = " + profit)
    let row = document.createElement('tr')
    row.innerHTML = `<td>${element.companyName}</td><td>${element.stockPrice}</td><td>${element.shareQuantity}</td><td>${element.cost}</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:profit.toFixed(2) }</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:(profitRate).toFixed(2)} %</td>`
    table.appendChild(row)
    totalStockValue += parseFloat(element.shareQuantity) * parseFloat(currentPrice)
    console.log(totalStockValue)
  
          
  } catch (error) {
    console.error('Error:', error.message);
    // 在这里处理错误
  }

  summary()
};




// let summaryBtn = document.getElementById('summary')
// summaryBtn.onclick = function(){
//     let newWindow = window.open('', '_blank', 'width=400,height=400');

//     let table = document.createElement('table');
//     let startRow = table.insertRow();
//     // let startRow = row.insertCell(0);
//     let currentRow =  table.insertRow();
//     let profitRow =  table.insertRow();
//     let rateRow =  table.insertRow();
//     console.log("stock value : " + totalStockValue)
//     console.log("balance : " + balance)
//     let currentAmount =  parseFloat(totalStockValue) + parseFloat(balance)
//     let profit = currentAmount - 100000;
//     let rate = (profit == 0)?"0%":(parseFloat(profit)/1000)

//     startRow.innerHTML = `<td>Starting Amount : </td><td>100000</td>`
//     currentRow.innerHTML = `<td>Current Amount : </td><td>${currentAmount.toFixed(2)}</td>`
//     profitRow.innerHTML = `<td>Current Profit</td><td>${profit.toFixed(2)}</td>`
//     rateRow.innerHTML = `<td>Profit Rate</td><td>${rate.toFixed(2)} %</td>`
//     newWindow.document.body.appendChild(table);
// }


function summary(){
    console.log("stock value: " + totalStockValue)
    console.log("available balance: " + balance)
    let currentAmount =  parseFloat(totalStockValue) + parseFloat(balance)
    let profit = currentAmount - 100000;
    let rate = (profit == 0)?"0%":(parseFloat(profit)/1000)
    let ca = document.getElementById("currentAmount")
    let p = document.getElementById("profit")
    let pr = document.getElementById("profitRate")
    ca.textContent = currentAmount.toFixed(2)
    p.textContent = profit.toFixed(2)
    pr.textContent = (profit == 0)?"0%":(parseFloat(profit)/1000).toFixed(2) + "%"


}

var signoutBtn = document.getElementById("signout")
signoutBtn.onclick = function(event){
  
  event.preventDefault()
  let url = "index.html"
  window.location.href = url

}




window.onload = getInventory()