const express = require('express');
const router = express.Router();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const mysql = require('../database')();
const connection = mysql.init();
mysql.db_open(connection);

router.get('/board/list',function (req,res,next) {
  res.redirect('/board/list/1')// /board로 접속요청이 들어왔을 때 1페이지로 자동으로 이동하도록 리다이렉트 해줍니다.
})

router.get('/board/list/:page', function(req, res, next) {
  var query = connection.query('SELECT idx, nick, title, content, hit FROM board',function(err,rows){
    if(err) console.log(err)        // 만약 에러값이 존재한다면 로그에 표시합니다.
    res.render('boardHTML/list.html', { title:'Board List',rows: rows }); // view 디렉토리에 있는 list 파일로 이동합니다.
  });
});

router.get('/board/list/post/:page',function(req,res,next){
  const page = req.params.page;
  var query = connection.query('SELECT idx, title, name, nick, content, hit, recommend FROM board where idx='+page,function(err,rows){
    if (err) console.log(err)
    if (rows[0].name==req.session.displayName){
      res.render('boardHTML/postUser.html',{title:rows[0].title, rows:rows});
    }else{
      res.render('boardHTML/postGuest.html',{title:rows[0].title,rows:rows});
    }
    var query = connection.query('UPDATE board SET hit=hit+1 WHERE idx='+page, function(err,rows){
      if (err) console.log(err);
    })
  })
})

router.get('/board/write/',function(req,res,next){
  if (typeof req.session.displayName!=='undefined'){
    res.render('boardHTML/write.html');
  }else{
    res.send("<script>alert('먼저 로그인을 해주시기 바랍니다'); document.location.href='/board/list'</script>")
  }
})

router.post('/insert',(req,res)=>{
  const title = req.body.title;
  const content = req.body.content;
  const author = req.session.displayName;
  if (title.length==0 || content.length==0){
    res.send("<script>alert('제목 또는 내용에 아무것도 작성되지 않았습니다.'); document.location.href='/list/write/new'</script>")
  }
  else{
    const authSql = 'SELECT nick FROM users WHERE id=?';
    const insertSql = 'INSERT INTO board (title, content, name, regdate, modidate, nick) VALUES(?,?,?,NOW(),NOW(),?)'
    const authQuery = connection.query(authSql,[author],function(err,rows){
      if (err){
        console.log(err);
      }else{
        const insertQuery=connection.query(insertSql,[title,content,author,rows[0].nick],function(err,rows){
          if (err){
            console.log(err);
          }else{
            res.send("<script>alert('작성되었습니다.'); document.location.href='/board/list'</script>")
          }
        })
      }
    })
    
  }
})

router.get('/board/update/:idx',(req,res)=>{
  const idx = req.params.idx;
  const query = connection.query('SELECT idx, title, name, content FROM board WHERE idx='+idx, function(err,rows){
    if (err) console.log(err);
    if (rows[0].name==req.session.displayName){
      res.render('boardHTML/postDetail.html',{rows:rows});
    }else{
      res.send("<script>alert('작성자가 아닙니다.'); document.location.href='/board/list'</script>")
    }
    
  })
})

router.post('/board/update',(req,res)=>{
  const title = req.body.title;
  const content = req.body.content;
  const idx = req.body.idx;
  const updateSql = 'UPDATE board SET title=?, content=?, modidate=NOW() WHERE idx=?'
      const updateQuery = connection.query(updateSql,[title,content,idx],function(err,rows){
        if (err) console.log(err);
        res.send("<script>alert('작성되었습니다.'); document.location.href='/board/list'</script>")
      })
})

router.get('/board/delete/:idx',(req,res)=>{
  const idx = req.params.idx;
  const authSql = 'SELECT name FROM board WHERE idx=?';
  const delSql = 'DELETE FROM board WHERE idx=?';
  const query = connection.query(authSql,[idx],function(err,rows){
    if (err) console.log(err);
    if (rows[0].name==req.session.displayName){
      const query = connection.query(delSql,[idx],function(err,rows){
        res.send("<script>alert('삭제되었습니다.'); document.location.href='/board/list'</script>")
      })
    }else{
      res.send("<script>alert('작성자가 아닙니다.'); document.location.href='/board/list'</script>")
    }
  })
})

router.get('/recommend/:idx',(req,res)=>{
  const idx = req.params.idx;
  const selSql = 'SELECT name from board where idx=?';
  const recomSql = 'UPDATE board SET recommend=recommend+1 where idx=?';
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
  })
})

module.exports = router;