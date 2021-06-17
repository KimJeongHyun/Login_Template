const express = require('express');
const app = express();
const port = 5000;

app.get('/',(req,res)=>res.send('Server Start'));

app.listen(port, ()=>console.log(`Server Start. Port : ${port}`))

const mysql = require('./database')();

const connection = mysql.init();

mysql.db_open(connection);

connection.query('SELECT * FROM  USERS', function (error, results, fields){
    if (error){
        console.log(error);
    }
    console.log(results);
})