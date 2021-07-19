const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');

const mysql = require('../database')();
const conn = mysql.init();

router.get('/popup/jusoPopup', (req, res) => {
    res.render('userHTML/jusoPopup.html');
  });
  
  router.post('/popup/jusoPopup', (req, res) => {
    res.locals = req.body;
    res.render('userHTML/jusoPopup.html');
  });
  

router.post('/registerUser',(req,res)=>{
    const userid = req.body.id;
    const userpw = req.body.pw;
    const userpw2 = req.body.pw2;
    const username = req.body.uname;
    const nickname = req.body.nickname;
    let birth = req.body.birth;
    const mailID = req.body.mailID;
    const mailISP = req.body.mailISPInserted;
    let mailAddress = mailID+'@'+mailISP;
    let phone = req.body.phonePrefix+req.body.phoneInfix+req.body.phonePostfix;
    let address = req.body.roadAddrPart1 + '/' + req.body.addrDetail + '/' + req.body.zipNo;
    

    if (birth==''){
        birth=null;
    }else if(mailID=='' || mailISP==''){
        mailAddress=null;
    }else if(req.body.roadAddrPart1=='' && req.body.addrDetail=='' && req.body.zipNo==''){
        address=null;
    }else if(phone==''){
        phone=null;
    }

    if (userid && userpw && userpw2 && username && nickname){
        conn.getConnection((err,connection)=>{
            if (err) throw err;
            connection.query('SELECT * FROM USERS WHERE id = ? OR nick = ?',[userid,nickname], (err, results, fields) =>{
                if (err){
                    throw err;
                }else if (results.length<=0 && userpw == userpw2){
                    crypto.randomBytes(64,(err,buf)=>{
                        crypto.pbkdf2(userpw,buf.toString('base64'),108326,64,'sha512',(err,key)=>{
                            const hashedpw = key.toString('base64');
                            const salt = buf.toString('base64');
                            connection.query('INSERT INTO USERS (id, pw, uname, birth, mail, phone, address, nick, salt) VALUES(?,?,?,?,?,?,?,?,?)',[userid,hashedpw,username,birth,mailAddress,phone,address,nickname,salt], (err,data)=>{
                                if (err){
                                    console.log(err);
                                }
                            });
                        });
                    });
                    res.send(`<script type="text/javascript">alert("${nickname}님 환영합니다!"); document.location.href="/";</script>`);
                }else if (userpw!=userpw2){
                    res.send(`<script type="text/javascript">alert("비밀번호가 다릅니다."); document.location.href="/register";</script>`);
                }
                else if (userid==results[0].id){
                    res.send('<script type="text/javascript">alert("이미 존재하는 아이디입니다."); document.location.href="/register";</script>');
                }else if (nickname==results[0].nick){
                    res.send('<script type="text/javascript">alert("이미 존재하는 닉네임입니다."); document.location.href="/register";</script>');
                }else{
                    res.send('<script type="text/javascript">alert("이미 존재하는 유저입니다."); document.location.href="/register";</script>');
                }
                connection.release();
            });
        })
    }else{
        res.send('<script type="text/javascript">alert("정보를 모두 입력해주세요."); document.location.href="/register";</script>');
    }  
})


module.exports = router;