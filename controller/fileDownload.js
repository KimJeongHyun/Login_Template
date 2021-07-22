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
    let work_1 = function(){
        return new Promise(function(resolve,reject){
            conn.getConnection((err,connection)=>{
                if (err) reject(err);
                const sql = 'SELECT uploadfilepath FROM board WHERE idx=?';
                connection.query(sql,[postIdx],(err,rows)=>{
                    if (err) reject(err);
                    fileList = rows[0].uploadfilepath;
                    connection.release();
                    resolve('Query 작업 완료');
                })
            })
        })
    }
    let work_2 = function(){
        return new Promise(function(resolve,reject){
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
                        resolve('파일 다운로드 완료.');
                    }
                })
            })
        })
    }

    let worker = async function(){
        console.log(await work_1());
        console.log(await work_2());
    }

    worker().then(function(result){
        console.log(result);
    })
    /*
    conn.getConnection((err,connection)=>{
                if (err) reject(err);
                const sql = 'SELECT uploadfilepath FROM board WHERE idx=?';
                connection.query(sql,[postIdx],(err,rows)=>{
                    if (err) reject(err);
                    fileList = rows[0].uploadfilepath;
                    connection.release();
                    resolve('Query 작업 완료');
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
                        resolve('작업 2 완료');
                    }
                })
            })
    },1000)*/

    
})

module.exports = router;