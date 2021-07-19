const router = require('express').Router();
const path = require('path');
const mysql = require('../database')();
const conn = mysql.init();

router.get('/myProfile',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        const sql = 'SELECT id, uname, date_format(birth, "%Y-%m-%d") as birthF, mail, phone, address, nick FROM users WHERE id=?';
        conn.getConnection((err,connection)=>{
            if (err) throw err;
            const query = connection.query(sql,[req.session.displayName],function(err,rows){
                if (err) console.log(err);
                if (rows[0].phone.slice(0,2)=='02' && rows[0].phone[2]!=' '){
                    rows[0].phone = '02 '+rows[0].phone.slice(2);
                }
                res.render("userHTML/myProfile.html",{rows:rows});
                connection.release();
            })
        })
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})

router.get('/myProfileEdit',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        const sql = 'SELECT id, uname, nick, date_format(birth, "%Y-%m-%d") as birthF, phone, address FROM users WHERE id=?'
        conn.getConnection((err,connection)=>{
            if (err) throw err;
            const query = connection.query(sql,req.session.displayName,function(err,rows){
                if (err) console.log(err);
                if (rows[0].phone.slice(0,2)=='02' && rows[0].phone[2]!=' '){
                    rows[0].phone = '02 '+rows[0].phone.slice(2);
                }
                res.render("userHTML/myProfileEdit.html",{rows:rows});
                connection.release();
            })
        })
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})

router.post('/myProfileEditSubmit',(req,res)=>{
    let birth = req.body.birth;
    const mailID = req.body.mailID;
    const mailISP = req.body.mailISPInserted;
    let mailAddress = mailID+'@'+mailISP;
    let phone = req.body.phonePrefix+req.body.phoneInfix+req.body.phonePostfix;
    let address = req.body.roadAddrPart1 + ' ' + req.body.addrDetail + ' ' + req.body.zipNo;
    
    
    if (birth==''){
        birth=null;
    }else if(mailID=='' || mailISP==''){
        mailAddress=null;
    }else if(req.body.roadAddrPart1=='' || req.body.addrDetail=='' || req.body.zipNo==''){
        address=null;
    }else if(phone==''){
        phone=null;
    }

    const authSql = 'SELECT id FROM users WHERE id=?';
    conn.getConnection((err,connection)=>{
        if (err) throw err;
        const authQuery = connection.query(authSql,[req.session.displayName],function(err,rows){
            const updateSql = 'UPDATE users SET birth=?, mail=?, phone=?, address=? WHERE id = ?';
            const updateQuery = connection.query(updateSql,[birth,mailAddress,phone,address,req.session.displayName],function(err,rows){
                if (err) console.log(err);
                res.send("<script>alert('업데이트되었습니다.'); document.location.href='/myProfile'</script>")
            })
            connection.release();
        })
    })
})

module.exports = router;
