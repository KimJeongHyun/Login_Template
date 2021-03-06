const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');

const mysql = require('../database')();
const conn = mysql.init();

router.post('/loginUser',(req,res)=>{
    const userid = req.body.id;
    const userpw = req.body.pw;
    conn.getConnection((err,connection)=>{
        if (err) throw err;
        connection.query('SELECT pw, salt, nick FROM USERS WHERE id = ?',[userid], (err, results) =>{
            if (err){
                throw err;
            }else if (results.length>0){
                crypto.pbkdf2(userpw,results[0].salt,108326,64,'sha512',(err,key)=>{
                    const realPW = key.toString('base64');
                    if (realPW==results[0].pw){
                        req.session.displayName=userid;
                        res.send('<script>document.location.href="loginInfo";</script>')
                        //res.render('infoHTML/loginInfo.html',{name:results[0].nick});
                        //res.send(`<script type="text/javascript">alert("환영합니다! ${req.session.displayName}님!"); document.location.href="/loginInfo"; </script> `);
                    }
                    else{
                        res.send('<script>alert("로그인 정보가 일치하지 않습니다."); document.location.href="/login";</script>');
                    }
                });
            }else{
                res.send('<script>alert("로그인 정보가 일치하지 않습니다."); document.location.href="/login";</script>');
            }
            connection.release();
        });
    })
})


module.exports = router;