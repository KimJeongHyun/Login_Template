const router = require('express').Router();
const multer = require('multer');

const fs = require('fs');
const path = require('path');

const mysql = require('../database')();
const conn = mysql.init();

router.get('/fileDownload/',(req,res)=>{
    res.send("<script>alert('비정상적인 접근입니다.'); window.history.back()</script>")
})

router.get('/fileDownload/:idx/:name/',(req,res)=>{
    const postIdx = req.params.idx;
    let fileName = '';
    let fileList = '';
    conn.getConnection((err,connection)=>{
        const sql = 'SELECT uploadfilepath FROM board WHERE idx=?';
        connection.query(sql,[postIdx],(err,rows)=>{
            if (err) throw err;
            fileList = rows[0].uploadfilepath;
            connection.release();
        })
    })

    setTimeout(function(){
        fileList = fileList.split('+');
        for (let i=0; i<fileList.length; i++){
            fileList[i]=fileList[i].split('\\')[2];
            if (fileList[i].includes(fileName)){
                fileName = fileList[i];
            }
        }
        let dir = __dirname+'\\..\\public\\uploadedFiles'; 
        fs.readdir(dir,(err,data)=>{
            if (err) throw err;
            data.forEach((item,i)=>{
                if (item.includes(fileName)){
                    const filePath = dir+'\\'+item;
                    res.download(filePath,req.params.name);
                }
            })
        })
    },1000)

    
})

module.exports = router;