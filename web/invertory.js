let balanceText = document.getElementById("balance")
let totalStockValue = 0.0
let currentAmount
let balance

function getInventory(){
    // get balance
    const urlParams = new URLSearchParams(window.location.search);
    balance = urlParams.get('param1');
    console.log(balance )
    balanceText.textContent = `Available Balance : ${parseFloat(balance).toFixed(2)}`


    // create table for inventory
    let tableContainer = document.getElementById('tableContainer')
    let table = document.createElement('table')

    let tableHeader = document.createElement('tr')
    tableHeader.innerHTML = '<th>Company Name</th><th>Stock Price</th><th>Share Quantity</th><th>Cost</th><th>Profit</th><th>Profit Rate</th>';
    table.appendChild(tableHeader)
    tableContainer.appendChild(table)
    table.setAttribute('align', 'center')
    table.setAttribute('border', 1)

    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://localhost:8080/inventory', true);
    // xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    // xhr.send();

    fetch('http://localhost:8080/inventory')
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
                        let companyName = element.companyName;
                        let queryUrl = "http://query1.finance.yahoo.com/v8/finance/chart/" + companyName + "?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance";
                        let currentPrice = 0;
                        // parse return data
                        console.log(queryUrl)
                        const corsURL = 'http://cors-anywhere.herokuapp.com/';
                        axios.get(`${corsURL}${queryUrl}`)  
                            .then(function (response) {
                                var data = response.data
                                currentPrice = data.chart.result[0].meta.regularMarketPrice;
                                console.log("Company : " + companyName + " current price = " + currentPrice)
                                let profit = parseFloat(element.cost) - parseFloat(currentPrice) * parseFloat(element.shareQuantity)
                                console.log("Current cost : " + parseFloat(currentPrice) * parseFloat(element.shareQuantity))
                                console.log("element.cost = " + element.cost)
                                let profitRate = profit/parseFloat(element.cost)
                                console.log("profit = " + profit)
                                let row = document.createElement('tr')
                                row.innerHTML = `<td>${element.companyName}</td><td>${element.stockPrice}</td><td>${element.shareQuantity}</td><td>${element.cost}</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:profit.toFixed(2) }</td><td>${(profit.toFixed(2)==0 || profit.toFixed(2)==-0)?0:profitRate.toFixed(2)}</td>`
                                table.appendChild(row)
                                totalStockValue += parseFloat(element.cost)
                            })
                            .catch(function (error) {
                                console.error("Error:", error);
                                alert("Company: " + companyName + " not found");
                            });

         
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
    window.location.href = url

}

let summaryBtn = document.getElementById('summary')
summaryBtn.onclick = function(){
    let newWindow = window.open('', '_blank', 'width=400,height=400');

    let table = document.createElement('table');
    let startRow = table.insertRow();
    // let startRow = row.insertCell(0);
    let currentRow =  table.insertRow();
    let profitRow =  table.insertRow();
    let rateRow =  table.insertRow();
    console.log("stock value : " + totalStockValue)
    console.log("balance : " + balance)
    let currentAmount =  parseFloat(totalStockValue) + parseFloat(balance)
    let profit = 100000 - currentAmount;
    let rate = (profit == 0)?"0%":(profit/100000).toString + "%"

    startRow.innerHTML = `<td>Starting Amount : </td><td>100000</td>`
    currentRow.innerHTML = `<td>Current Amount : </td><td>${currentAmount.toFixed(2)}</td>`
    profitRow.innerHTML = `<td>Current Profit</td><td>${profit}</td>`
    rateRow.innerHTML = `<td>Profit Rate</td><td>${rate}</td>`
    newWindow.document.body.appendChild(table);
}






window.onload = getInventory()