const router = require('express').Router();
const multer = require('multer');

const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "images/");
    },
    filename(req,file,cb) {
        const postIdx = req.session.writeIdx;
        cb(null, postIdx+'_'+req.session.displayName+`_${Date.now()}_${file.originalname}`);
    }
})

const upload = multer({storage: storage});

router.get('/fileUploadPage',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        res.render('boardHTML/fileUploadPage.html');
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})

router.post('/upload',upload.single('img'),(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        if (typeof req.file=='undefined'){
            res.send("<script>alert('업로드한 파일이 없습니다.'); window.history.back()</script>")
        }else{
            res.send("<script>alert('업로드 완료.'); window.history.back()</script>")
        }
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})

router.get('/uploadedFileDelete',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        const postIdx = req.session.writeIdx;
        const findStr = postIdx+'_'+req.session.displayName;
        const dir = path.join(__dirname,'..','/images/');
        fs.readdir(dir,(err,data)=>{
            if (err) throw err;
            data.forEach((item,i)=>{
                if (item.includes(findStr)){
                    const filePath = dir+item;
                    fs.unlink(filePath,(err)=>{
                        if (err) console.log(err);
                    })
                }
            })
        })
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }

})



module.exports = router;