const router = require('express').Router();
const multer = require('multer');

const mysql = require('../database')();
const conn = mysql.init();

const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "public/uploadedFiles/");
    },
    filename(req,file,cb) {
        const postIdx = req.session.writeIdx;
        cb(null, postIdx+';'+req.session.displayName+`;${Date.now()};${file.originalname}`);
    }
})

const upload = multer({storage: storage});

router.get('/fileUploadPage',(req,res)=>{
    const updateIdx = req.session.updateIdx;
    const sql = 'SELECT uploadfilepath from board where idx=?';
    let filePath = '';
    conn.getConnection((err,connection)=>{
        if (err) throw err;
        if (updateIdx!='' && typeof updateIdx !=='undefined'){
            connection.query(sql,[req.session.updateIdx],(err,rows)=>{
                if (err) throw err;
                filePath = rows[0].uploadfilepath;
            });
        }else{
            filePath='';
        }
        connection.release();
    })
    req.session.filepath=filePath;
    console.log(req.session.filepath);
    if (typeof req.session.displayName!=='undefined'){
        res.render('boardHTML/fileUploadPage.html');
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})

router.post('/upload',upload.single('img'),(req,res)=>{
    let filePath='';
    if (req.session.filepath==''){
        filePath=req.file.path;
    }else{
        filePath+=req.session.filepath+'+'+req.file.path;
    }
    req.session.filepath=filePath;
    console.log(req.session.filepath);
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
        const findStr = postIdx+';'+req.session.displayName;
        const dir = path.join(__dirname,'..','/public/uploadedFiles/');
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