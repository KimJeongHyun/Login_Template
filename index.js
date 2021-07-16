const express = require('express');
const app = express();
const path = require('path');

const userRouter = require('./router/user.js');
const boardRouter = require('./router/board.js');

const userLogin = require('./controller/userLogin.js');
const userRegister = require('./controller/userRegister.js');
const userLogout = require('./controller/userLogout.js');
const fileUpload = require('./controller/fileUpload.js');


const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);


app.use(session({
    secret              : '#CLASSIC@ORIGINAL!',
    resave              : false,
    saveUninitialized   : true,
    secure              : true,
    HttpOnly            : true,
    store               : new MySQLStore({
        host    : 'localhost',
        port    : 3306,
        user    : 'root',
        password: '#original3480',
        database: 'TEST_DB'
    })
}));

const port = 5000;

app.use(express.json()); 
app.use(express.urlencoded({extended : true})) 

// HTML 경로 라우터
app.use(userRouter);
app.use(boardRouter);

// 유저 로그인, 회원가입 라우터
app.use(userLogin);
app.use(userRegister);
app.use(userLogout);

// 파일 업로드 라우터
app.use(fileUpload);



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
    res.render('infoHTML/index.html');
});

app.listen(port, ()=>console.log(`Server Start. Port : ${port}`))

