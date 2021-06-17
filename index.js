const express = require('express');
const app = express();
const path = require('path');
const userRouter = require('./router/user.js');
const port = 5000;

app.use(express.json()); 
app.use(express.urlencoded({ extended : true})) 
app.use(userRouter);

app.get('/',(req,res)=>res.sendFile(path.resolve("infoHTML/info.html")));

app.listen(port, ()=>console.log(`Server Start. Port : ${port}`))

const mysql = require('./database')();
const connection = mysql.init();
mysql.db_open(connection);

