## Stock-Transaction-Simulator
A full-stack stock trading simulation website, allowing users to practice stock trading without risk. Every user will get 10k at the beginning.

On the home page, before the user signs in, it can only be used to look up the real-time stock price. It will display the current price and the change after the last closing price.

![This is an image](https://github.com/CyanHsu/Stock-Transaction-Simulator/blob/main/Home%20page%20without%20logging%20in.png)

Home page(without the user logging in)

![This is an image](https://github.com/CyanHsu/Stock-Transaction-Simulator/blob/main/Search1.png)

Search current stock price

Once the user logs in, it will show the user's available balance and the buy/sell buttons. Users can buy or sell the select symbol by querying the stock information. Users can buy with enough available balance and sell with enough inventory.

![This is an image](https://github.com/CyanHsu/Stock-Transaction-Simulator/blob/main/After%20logging%20in.png)

Users can make a new transaction, the browser will send the request to the back-end server, and the server will communicate with the database to update the transaction table.

![This is an image](https://github.com/CyanHsu/Stock-Transaction-Simulator/blob/main/buy.png)

On the inventory page, the browser will request the server to ask for the inventory data with the user ID. Before displaying it on the web page, it will also calculate the reward rate based on the current stock price. 

![This is an image](https://github.com/CyanHsu/Stock-Transaction-Simulator/blob/main/Inventory.png)

