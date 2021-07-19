const express = require('express');
const router = express.Router();

const mysql = require('../database')();
const conn = mysql.init();

router.get('/board/list',function (req,res,next) {
  res.redirect('/board/list/1')// /board로 접속요청이 들어왔을 때 1페이지로 자동으로 이동하도록 리다이렉트 해줍니다.
  req.session.refresh = true; // 무한 새로고침으로 조회수 폭증을 막는 세션 값
})

router.get('/board/list/:page', function(req, res, next) {
  req.session.refresh = true;
  const page = req.params.page;
  const sql = 'SELECT idx, nick, title, content, hit FROM board ORDER BY idx DESC'; // 페이징 포스트가 최근 작성된 것부터 보이도록 DESC 처리.
  conn.getConnection((err,connection)=>{
    if (err) throw err;
    const query = connection.query(sql,function(err,rows){
      if (err) console.log(err);
      if (rows.length==0){
        const idxInit = 'ALTER TABLE board AUTO_INCREMENT=1;'
        const idxInitQuery = connection.query(idxInit,function(err,rows){
          if (err) console.log(err);
        })
        res.render('boardHTML/pageEmpty.html',{title:'게시판 리스트',lastidx:1});
      }else{
        res.render('boardHTML/page.html',{title:'게시판 리스트',rows:rows, page:page, length:rows.length-1, page_num:10, lastidx:rows[0].idx+1});
      }
      connection.release();
    })
  })
});

router.get('/board/list/post/:page',function(req,res,next){
  const page = req.params.page;
  conn.getConnection((err,connection)=>{
    if (err) throw err;
    const query = connection.query('SELECT idx, title, name, nick, content, hit, recommend FROM board where idx='+page,function(err,rows){
      if (err) console.log(err)
      if (rows[0].name==req.session.displayName){
        res.render('boardHTML/postUser.html',{title:rows[0].title, rows:rows});
      }else{
        res.render('boardHTML/postGuest.html',{title:rows[0].title,rows:rows});
      }
      if (req.session.refresh==true){
        const query = connection.query('UPDATE board SET hit=hit+1 WHERE idx='+page, function(err,rows){
          if (err) console.log(err);
        })
      }
      connection.release();
      req.session.refresh=false; // 조회수 증가 후에는 새로고침 세션 값을 false로 돌려 post에서 update가 발생하지 않도록 방지한다.
    })
  })
})

router.get('/board/write/:idx',function(req,res,next){
    req.session.writeIdx = req.params.idx;
    res.render('boardHTML/write.html',{id:req.params.idx});
})

router.post('/insert',(req,res)=>{
  if (typeof req.session.displayName!=='undefined'){
    const title = req.body.title;
    const content = req.body.content;
    const author = req.session.displayName;
    if (title.length==0 || content.length==0){
     res.send("<script>alert('제목 또는 내용에 아무것도 작성되지 않았습니다.'); document.location.href='/list/write/new'</script>")
    }
    else{
      const selSql = 'SELECT idx FROM board';
      const idxInit = 'ALTER TABLE board AUTO_INCREMENT=?;' 
      //SET @COUNT =0; UPDATE board SET board.idx = @COUNT:=@COUNT+1; 요걸 쓰면 AUTO_INCREMENT 속성을 초기화할 수 있다.
      const authSql = 'SELECT nick FROM users WHERE id=?';
      const insertSql = 'INSERT INTO board (title, content, name, regdate, modidate, nick) VALUES(?,?,?,NOW(),NOW(),?)'
      conn.getConnection((err,connection)=>{
        if (err) throw err;
        const selQuery = connection.query(selSql, function(err,rows){
          if (err){
            console.log(err);
          }else{
            const initQuery = connection.query(idxInit,[rows.length], function(err,rows){
              if (err) console.log(err);
            })
          }
        })
        const authQuery = connection.query(authSql,[author],function(err,rows){
          if (err){
            console.log(err);
          }else{
            const insertQuery=connection.query(insertSql,[title,content,author,rows[0].nick],function(err,rows){
              if (err){
                console.log(err);
              }else{
                res.send("<script>alert('작성되었습니다.'); document.location.href='/board/list'</script>")
                req.session.writeIdx="";
              }
            })
          }
        connection.release();
        })
      })     
    }
  }else{
    res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    req.session.writeIdx="";
  }
})

router.get('/board/update/:idx',(req,res)=>{
  const idx = req.params.idx;
  conn.getConnection((err,connection)=>{
    if (err) throw err;
    const query = connection.query('SELECT idx, title, name, content FROM board WHERE idx='+idx, function(err,rows){
      if (err) console.log(err);
      if (rows[0].name==req.session.displayName){
        res.render('boardHTML/postDetail.html',{rows:rows});
      }else{
        res.send("<script>alert('작성자가 아닙니다.'); document.location.href='/board/list'</script>")
      }
      connection.release();
    })
  })
})

router.post('/board/update',(req,res)=>{
  const title = req.body.title;
  const content = req.body.content;
  const idx = req.body.idx;
  const updateSql = 'UPDATE board SET title=?, content=?, modidate=NOW() WHERE idx=?'
  conn.getConnection((err,connection)=>{
    if (err) throw err;
    const updateQuery = connection.query(updateSql,[title,content,idx],function(err,rows){
      if (err) console.log(err);
      res.send("<script>alert('작성되었습니다.'); document.location.href='/board/list'</script>")
      connection.release();
    })
  })
})

router.get('/board/delete/:idx',(req,res)=>{
  const idx = req.params.idx;
  const authSql = 'SELECT name FROM board WHERE idx=?';
  const delSql = 'DELETE FROM board WHERE idx=?';
  conn.getConnection((err,connection)=>{
    if (err) throw err;
    const query = connection.query(authSql,[idx],function(err,rows){
      if (err) console.log(err);
      if (rows[0].name==req.session.displayName){
        const query = connection.query(delSql,[idx],function(err,rows){
          res.send("<script>alert('삭제되었습니다.'); document.location.href='/board/list'</script>")
        })
      }else{
        res.send("<script>alert('작성자가 아닙니다.'); document.location.href='/board/list'</script>")
      }
      connection.release();
    })
  })
})

router.get('/recommend/:idx',(req,res)=>{
  if (typeof req.session.displayName!=='undefined'){
    const idx = req.params.idx;
    const selSql = 'SELECT name from board where idx=?';
    const recomSql = 'UPDATE board SET recommend=recommend+1 where idx=?';
    conn.getConnection((err,connection)=>{
      if (err) throw err;
      const query = connection.query(selSql,[idx],function(err,rows){
        if (err) console.log(err);
        if (rows[0].name==req.session.displayName){
          res.send("<script>alert('자기 자신의 게시글에 추천을 누를 수 없습니다.'); location.reload();</script>");
        }else{
          const query = connection.query(recomSql,[idx],function(err,rows){
            if (err) console.log(err);
            res.send("<script>document.location.href='/board/list/post/"+idx+"'</script>")
          })
        }
        connection.release();
      })
    })
  }else{
    res.send("<script>alert('로그인한 유저만 추천을 누를 수 있습니다.'); window.history.back();</script>")
  }
})


module.exports = router;