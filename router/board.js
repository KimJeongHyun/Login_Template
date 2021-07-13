const express = require('express');
const router = express.Router();
const mysql = require('../database')();
const connection = mysql.init();
mysql.db_open(connection);

router.get('/list',function (req,res,next) {
  res.redirect('/list/1')// /board로 접속요청이 들어왔을 때 1페이지로 자동으로 이동하도록 리다이렉트 해줍니다.
})

router.get('/list/:page', function(req, res, next) {
  var query = connection.query('select idx,name,title,content,regdate,modidate,hit from board',function(err,rows){
    if(err) console.log(err)        // 만약 에러값이 존재한다면 로그에 표시합니다.
    res.render('boardHTML/list.html', { title:'Board List',rows: rows }); // view 디렉토리에 있는 list 파일로 이동합니다.
  });
});

router.get('/list/post/:page',function(req,res,next){
  var query = connection.query('select title,name,content from board where idx='+req.params.page,function(err,rows){
    if (err) console.log(err)
    res.render('boardHTML/post.html',{title:rows[0].title, rows:rows});
    var query = connection.query('UPDATE board SET hit=hit+1 WHERE idx='+req.params.page, function(err,rows){
      if (err) console.log(err);
    })
  })
})

router.get('/list/write/new',function(req,res,next){
  if (typeof req.session.displayName!=='undefined'){
    res.render('boardHTML/write.html');
  }else{
    res.send("<script>alert('먼저 로그인을 해주시기 바랍니다'); document.location.href='/list'</script>")
  }
})

router.post('/insert',(req,res)=>{
  const title = req.body.title;
  const content=req.body.content;
  const password = req.body.pw;
  const author = req.session.displayName;
  if (title.length==0 || content.length==0){
    res.send("<script>alert('제목 또는 내용에 아무것도 작성되지 않았습니다.'); document.location.href='/list/write/new'</script>")
  }else if (password.length==0){
    res.send("<script>alert('비밀번호를 설정해주세요!'); window.history.back()</script>") // 값을 유지한채로 이전 페이지로 돌아가는 방법
  }
  else{ 
    const sql = 'INSERT INTO board (title,content,name,regdate,modidate,passwd) VALUES(?,?,?,NOW(),NOW(),?)'
    const query=connection.query(sql,[title,content,author,password],function(err,rows){
      if (err){
        console.log(err);
      }else{
        res.send("<script>alert('작성되었습니다.'); document.location.href='/list'</script>")
      }
    })
  }
})

router.get('/list/post/modify',(req,res)=>{
  res.render('hi')
})


module.exports = router;