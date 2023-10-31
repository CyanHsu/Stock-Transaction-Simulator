const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const cors = require('cors')

const app = express();
app.use(cors())

app.use(bodyParser.json());

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

// handle post request
app.post('/insert', (req, res) => {
  const { companyName, dateTime, stockPrice, shareQuantity , action, changes} = req.body;
  
  const query = `SELECT * FROM Inventory where companyName = ?`

  db.query(query, companyName, (err,result) =>{
    if (result.length === 0){
      const insert = `INSERT INTO Inventory (companyName, stockPrice, shareQuantity, cost) VALUES (?, ?, ?, ?)`;
      const cost = parseFloat(stockPrice)*parseFloat(shareQuantity)
      console.log('cost: ' + cost)
      const data = [companyName, stockPrice, shareQuantity, cost]
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
    else{
      if(result[0].shareQuantity + shareQuantity < 0){
        res.status(400).json({ error: 'You do not have enough inventory' });
        return; 
      }

      const update = `UPDATE Inventory SET stockPrice = ?, shareQuantity = ?, cost = ? WHERE companyName = ?`;
      const updateQuantity = parseFloat(result[0].shareQuantity) + parseFloat(shareQuantity)
      let updatePrice = 0;
      let updateCost = 0;
      if(updateQuantity !=0){
        updatePrice = (parseFloat(result[0].stockPrice) * parseFloat(result[0].shareQuantity) + parseFloat(stockPrice) * parseFloat(shareQuantity)) / (parseFloat(result[0].shareQuantity) + parseFloat(shareQuantity))
        updateCost = updateQuantity * updatePrice
      }
      
      db.query(update, [updatePrice, updateQuantity, updateCost, companyName],(err, result) => {
        if (err) {
          console.error('error:', err);
          // res.status(500).json({ error: err.message });
        } else {
          console.log('success to update data to Inventory');
          // res.status(200).send('success to insert data to Inventory');
        }
      })      
    }

    const sql = `INSERT INTO Transactions (companyName, dateTime, stockPrice, shareQuantity, action, changes) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [companyName, dateTime, stockPrice, shareQuantity, action, changes];
  
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

app.get('/inventory', function(req, res) {
  db.query('SELECT * FROM Inventory', (error, results, fields) => {
    if (error) {
      console.error('Query failed:', error);
      return;
    }
    console.log('Query result:', results);
    res.json(results); // 
  });
});

app.get('/balance', function(req, res) {
  db.query('SELECT changes FROM Transactions', (error, results, fields) => {
    if (error) {
      console.error('Query failed:', error);
      return;
    }
    console.log('Query result:', results);
    res.json(results); // 
  });
});


const port = 8080; 
app.listen(port, () => {
  console.log(`wait request on http://localhost:${port}`);
});
