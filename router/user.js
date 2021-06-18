const router = require('express').Router();
const path = require('path');

router.get('/login',(req,res)=>{
    res.render("userHTML/login.html");
})
router.get('/register',(req,res)=>{
    res.render("userHTML/register.html");
})
router.get('/loginInfo',(req,res)=>{
    res.render("infoHTML/loginInfo.html");
})


module.exports = router;