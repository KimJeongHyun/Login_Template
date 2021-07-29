const router = require('express').Router();
const path = require('path');

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.render('infoHTML/info.html');
})

module.exports = router;