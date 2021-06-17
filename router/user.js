const router = require('express').Router();
const path = require('path');

router.get('/login',(req,res)=>{
    res.sendFile(path.resolve("userHTML/login.html"));
})
router.get('/register',(req,res)=>{
    res.sendFile(path.resolve("userHTML/register.html"));
})

module.exports = router;