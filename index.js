const express = require('express');
const app = express();
const path = require('path');
const userRouter = require('./router/user.js');
const userLogin = require('./controller/userLogin.js');
const userRegister = require('./controller/userRegister.js');
const port = 5000;

app.use(express.json()); 
app.use(express.urlencoded({extended : true})) 
app.use(userRouter);
app.use(userLogin);
app.use(userRegister);

app.get('/',(req,res)=>res.sendFile(path.resolve("infoHTML/info.html")));

app.listen(port, ()=>console.log(`Server Start. Port : ${port}`))


