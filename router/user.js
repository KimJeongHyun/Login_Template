const router = require('express').Router();
const path = require('path');

router.get('/login',(req,res)=>{
    if (req.session.displayName!='Guest'){
        res.send("<script>alert('이미 로그인되어있습니다.'); document.location.href='/loginInfo'</script>")
    }else{
        res.render("userHTML/login.html");
    }
    
})
router.get('/register',(req,res)=>{
    res.render("userHTML/register.html");
})
router.get('/info',(req,res)=>{
    res.render("infoHTML/info.html");
})
router.get('/loginInfo',(req,res)=>{
    res.render("infoHTML/loginInfo.html",{name:req.session.displayName});
})



module.exports = router;