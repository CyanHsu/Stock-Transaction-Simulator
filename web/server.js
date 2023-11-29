const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const axios = require('axios'); // 如果使用 CommonJS 的方式

app.use(cors())
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许所有来源访问，生产环境中应更安全地配置
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Create connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', 
  password: '', 
  database: 'stock'
});

// Connect to mysql
db.connect((err) => {
  if (err) {
    console.error('Fail to connect to MySQL:', err);
  } else {
    console.log('Connecting to MySQL');
  }
});

// handle user update
app.post('/users', (req, res) =>{
  const { uID, userName } = req.body
  console.log("user : " + uID)
  const query = `SELECT * FROM Users where uID = ?`
  db.query(query, uID, (error, result) => {
    if (result.length === 0){
      const insert = `INSERT INTO Users (uID, userName) VALUES (?, ?)`
      const data = [uID, userName]
      db.query(insert, data,(err, result) => {
        if (err) {
          console.error('error:', err);
        //   res.status(500).send('fail to insert data');
          res.status(500).json({ error: err.message });
        } else {
          console.log('success to insert data to Users');
          // res.status(200).send('success to insert data to Inventory');
        }
      })
    }
    if (error) {
      console.error('Query failed:', error);
      return;
    }
    console.log('Query result:', result);
    res.json(result); // 
  });



});

// handle post request
app.post('/insert', (req, res) => {
  const { uID, companyName, dateTime, stockPrice, shareQuantity , action, changes} = req.body;
  
  const query = `SELECT * FROM Inventory where companyName = ? and uID = ?`

  db.query(query, [companyName, uID], (err,result) =>{
    if (result.length === 0){
      console.log("nothing in inventory")
      const insert = `INSERT INTO Inventory (uID, companyName, stockPrice, shareQuantity, cost) VALUES (?, ?, ?, ?, ?)`;
      const cost = parseFloat(stockPrice)*parseFloat(shareQuantity)
      console.log('cost: ' + cost)
      const data = [uID, companyName.toUpperCase(), stockPrice, shareQuantity, cost]
      db.query(insert, data,(err, result) => {
        if (err) {
          console.error('error:', err);
        //   res.status(500).send('fail to insert data');
          res.status(500).json({ error: err.message });
        } else {
          console.log('success to insert data to Inventory');
          // res.status(200).send('success to insert data to Inventory');
        }
      })
    }
    else if (result[0].shareQuantity + shareQuantity < 0){
        res.status(400).json({ error: 'You do not have enough inventory' });
        return; 
    }
    else{
      const update = `UPDATE Inventory SET stockPrice = ?, shareQuantity = ?, cost = ? WHERE companyName = ? and uID = ?`;
      const updateQuantity = parseFloat(result[0].shareQuantity) + parseFloat(shareQuantity)
      let updatePrice = 0;
      let updateCost = 0;
      
      if(updateQuantity !=0){
        updatePrice = (parseFloat(result[0].stockPrice) * parseFloat(result[0].shareQuantity) + parseFloat(stockPrice) * parseFloat(shareQuantity)) / (parseFloat(result[0].shareQuantity) + parseFloat(shareQuantity))
        updateCost = updateQuantity * updatePrice
      }
      
      db.query(update, [updatePrice, updateQuantity, updateCost, companyName, uID],(err, result) => {
        if (err) {
          console.error('error:', err);
          // res.status(500).json({ error: err.message });
        } else {
          console.log('success to update data to Inventory');
          // res.status(200).send('success to insert data to Inventory');
        }
      })      
    }

    const sql = `INSERT INTO Transactions (uID, companyName, dateTime, stockPrice, shareQuantity, action, changes) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [uID, companyName, dateTime, stockPrice, shareQuantity, action, changes];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('error:', err);
      //   res.status(500).send('fail to insert data');
        res.status(500).json({ error: err.message });
      } else {
        console.log('success to insert data to Transactions');
        res.status(200).send('success to insert data to Transactions');
      }
    });

  })
});



// app.get('/balance', function(req, res) {
//   const { uID, userName } = req.body
//   const query = `SELECT * FROM Transactions where uID = ?`
//   db.query(query,uID, (error, results) => {
//     if (error) {
//       console.error('Query failed and balance:', error);
//       return;
//     }
//     console.log('Query result balance:', results);
//     res.json(results); // 
//   });
// });
const _dirname = '/Users/chunhaohsu/Capstone/webProject/web'
app.use(express.static(_dirname));

app.get('/', (req, res) => {
  res.sendFile(_dirname + '/index.html');
});


const port = 8080; 
app.listen(port, () => {
  console.log(`wait request on http://localhost:${port}`);
});

app.get('/inventory', function(req, res) {
  const { uID} = req.query;
  console.log("inventory: " + uID)
  const query = `SELECT * FROM Inventory WHERE uID = ?`;
  db.query(query, uID, (error, results) => {
    if (error) {
      console.error('Query failed:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
      return;
    }
    console.log('Query result(inventory):', results);
    res.json(results); // 
  });
});

app.get('/balance', (req, res) => {
  const { uID, userName } = req.query;
  console.log("balance: " + uID)
  const query = 'SELECT * FROM Transactions WHERE uID = ?';
  
  db.query(query, uID, (error, result) => {
    if (error) {
      console.error('Query failed:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
      return;
    }
    console.log('Query result(balance):', result);
    res.json(result);
  });
});


app.get('/getStockData', async (req, res) => {
  try {
    
    const { company } = req.query;
    console.log("ask for stock data of " + company)

    let queryUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${company}?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`;

   
      const response = await axios.get(queryUrl);
      console.log(response.data); // 输出获取到的数据
   

    res.status(200).json(response.data);
    // res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


