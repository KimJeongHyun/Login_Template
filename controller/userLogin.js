const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');



router.post('/loginUser',(req,res)=>{
    const mysql = require('../database')();
    const connection = mysql.init();
    mysql.db_open(connection);
    const userid = req.body.id;
    const userpw = req.body.pw;
    connection.query('SELECT PW, SALT FROM USERS WHERE id = ?',[userid], (err, results, fields) =>{
        if (err){
            throw err;
        }else if (results.length>0){
            crypto.pbkdf2(userpw,results[0].SALT,108326,64,'sha512',(err,key)=>{
                const realPW = key.toString('base64');
                if (realPW==results[0].PW){
                    req.session.displayName=userid;
                    res.render('infoHTML/loginInfo.html',{name:req.session.displayName});
                    //res.send(`<script type="text/javascript">alert("환영합니다! ${req.session.displayName}님!"); document.location.href="/loginInfo"; </script> `);
                }
                else{
                    res.send('<script>alert("로그인 정보가 일치하지 않습니다."); document.location.href="/login";</script>');
                }
            });
        }else{
            res.send('<script>alert("로그인 정보가 일치하지 않습니다."); document.location.href="/login";</script>');
        }
    });
    connection.end();
})


module.exports = router;