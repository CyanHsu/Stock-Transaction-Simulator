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

  const sql = `INSERT INTO Transactions (companyName, dateTime, stockPrice, shareQuantity, action, changes) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [companyName, dateTime, stockPrice, shareQuantity, action, changes];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('error:', err);
    //   res.status(500).send('fail to insert data');
      res.status(500).json({ error: err.message });
    } else {
      console.log('success to insert data to MySQL');
      res.status(200).send('success to insert data to MySQL');
    }
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


const port = 3000; 
app.listen(port, () => {
  console.log(`wait request on http://localhost:${port}`);
});
