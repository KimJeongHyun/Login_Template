const router = require('express').Router();
const path = require('path');

const mysql = require('../database')();
const conn = mysql.init();

router.get('/info',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        res.send("<script>document.location.href='/loginInfo'</script>")
    }else{
        res.render("infoHTML/info.html");
    }
})

router.get('/login',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        res.send("<script>alert('이미 로그인되어있습니다.'); document.location.href='/loginInfo'</script>")
    }else{
        res.render("userHTML/login.html");
    }
    
})
router.get('/register',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        res.send("<script>alert('이미 로그인되어있습니다.'); document.location.href='/info'</script>")
    }else{
        res.render("userHTML/register.html");
    }
})

router.get('/loginInfo',(req,res)=>{
    const id = req.session.displayName;
    const sql = 'SELECT nick FROM users WHERE id=?';
    conn.getConnection((err,connection)=>{
        if (err) throw err;
        const query = connection.query(sql,[id],function(err,rows){
            if (err) throw err;
            res.render("infoHTML/loginInfo.html",{name:rows[0].nick});
            connection.release();
        })
    })
})

module.exports = router;