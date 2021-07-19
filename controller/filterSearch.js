const express = require('express');
const router = express.Router();
const mysql = require('../database.js')();
const conn = mysql.init();

router.post('/board/list/filterSelect',(req,res)=>{
    const filterSearch = req.body.filterSearch;
    const textContent = req.body.textContent;
    if (textContent.length==0){
        res.redirect('/board/list/1');
    }else if(textContent.length>0){
        if (filterSearch=='Title'){
            const titleSql = 'SELECT * FROM board WHERE title=? ORDER BY idx DESC';
            conn.getConnection((err,connection)=>{
                if (err) throw err;
                connection.query(titleSql,[textContent],(err,rows)=>{
                    if (rows.length==0){
                        res.render('boardHTML/pageEmpty.html',{title:'게시판 리스트',lastidx:1});
                    }else{
                        res.render('boardHTML/page.html',{title:'게시판 리스트',rows:rows, page:1, length:rows.length-1, page_num:10, lastidx:rows[0].idx+1});
                    }
                    connection.release();
                })
            })
        }
        if (filterSearch=='Author'){
            const authorSql = 'SELECT * FROM board WHERE nick=? ORDER BY idx DESC';
            conn.getConnection((err,connection)=>{
                if (err) throw err;
                connection.query(authorSql,[textContent],(err,rows)=>{
                    if (rows.length==0){
                        res.render('boardHTML/pageEmpty.html',{title:'게시판 리스트',lastidx:1});
                    }else{
                        res.render('boardHTML/page.html',{title:'게시판 리스트',rows:rows, page:1, length:rows.length-1, page_num:10, lastidx:rows[0].idx+1});
                    }
                    connection.release();
                })
            })
        }
        if (filterSearch=='TitlePContent'){ 
            const titlePlusContentSql = 'SELECT * FROM board WHERE title=? or content LIKE "%'+textContent+'%" ORDER BY idx DESC';
            conn.getConnection((err,connection)=>{
                if (err) throw err;
                connection.query(titlePlusContentSql,[textContent],(err,rows)=>{
                    if (rows.length==0){
                        res.render('boardHTML/pageEmpty.html',{title:'게시판 리스트',lastidx:1});
                    }else{
                        res.render('boardHTML/page.html',{title:'게시판 리스트',rows:rows, page:1, length:rows.length-1, page_num:10, lastidx:rows[0].idx+1});
                    }
                    connection.release();
                })
            })
        }
    }
})

module.exports=router;