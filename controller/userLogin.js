const router = require('express').Router();
const path = require('path');


router.post('/login',(req,res)=>{
    const mysql = require('../database')();
    const connection = mysql.init();
    mysql.db_open(connection);
    const userid = req.body.id;
    const userpw = req.body.pw;
    connection.query('SELECT * FROM USERS WHERE id = ? AND pw = ? ',[userid, userpw], (err, results, fields) =>{
        // pw 직접 비교에서 해싱된 값 비교로 변경해야함.
        if (err){
            throw err;
        }else if (results.length>0){
            res.send('<script type="text/javascript">alert("환영합니다!");</script>');
        }else{
            res.send('<script>alert("로그인 정보가 일치하지 않습니다."); document.location.href="/login";</script>');
        }
        connection.end(); // DB 연결 끊기
    });
    
})


module.exports = router;