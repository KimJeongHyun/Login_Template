const express = require('express');
const app = express();
const http = require('http');
const path = require('path');

app.use(express.static('public'));

const configF = require('./config/db_config.json');
const configL = require('./config/db_configLocal.json');

const userRouter = require('./router/user.js');
const boardRouter = require('./router/board.js');

const userLogin = require('./controller/userLogin.js');
const userRegister = require('./controller/userRegister.js');
const userLogout = require('./controller/userLogout.js');
const userProfile = require('./controller/userProfile.js');
const fileUpload = require('./controller/fileUpload.js');
const fileDownload = require('./controller/fileDownload');
const filterSearch = require('./controller/filterSearch.js');
const socketModule = require('./controller/socketChat.js');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// 세션. 나중에 모듈화해도 좋을듯.
app.use(session({
    secret              : configF.secret,
    resave              : false,
    saveUninitialized   : true,
    secure              : true,
    HttpOnly            : true,
    store               : new MySQLStore({
        host    : configL.host,
        port    : 3306,
        user    : configL.user,
        password: configL.password,
        database: configL.database
    })
}));


const port = 5000;

app.use(express.json()); 
app.use(express.urlencoded({extended : true})) 

// HTML 경로 라우터
app.use(userRouter);
app.use(boardRouter);

// 유저 로그인, 회원가입, 마이페이지 라우터
app.use(userLogin);
app.use(userRegister);
app.use(userLogout);
app.use(userProfile);

// 파일 업로드 라우터
app.use(fileUpload);

// 파일 다운로드 라우터
app.use(fileDownload);

// 검색 필터 라우터
app.use(filterSearch);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
    res.render('infoHTML/index.html');
});

const server = http.createServer(app);
socketModule.connectSocket(server);
server.listen(port, ()=>console.log(`Server Start. Port : ${port}`))