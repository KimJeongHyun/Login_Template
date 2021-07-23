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
        const idxArray = req.headers.referer.split('/');
        const idx = idxArray[idxArray.length-1];
        cb(null, idx+';'+req.session.displayName+`;${Date.now()};${file.originalname}`);
    }
})

const upload = multer({storage: storage});

router.get('/fileUploadPage/:idx',(req,res)=>{
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

router.get('/uploadedFileDelete/:idx',(req,res)=>{
    if (typeof req.session.displayName!=='undefined'){
        const postIdx = req.params.idx;
        conn.getConnection((err,connection)=>{
            if (err) throw err;
            let selSqlWork = function(){
                return new Promise(function(resolve,reject){
                    const sql = 'SELECT uploadfilepath FROM board WHERE idx=?';
                    req.session.filepath='';
                    connection.query(sql,[postIdx],(err,rows)=>{
                        if (err) reject(err);
                        if (rows.length==0 || (rows[0].uploadfilepath==null || rows[0].uploadfilepath=='')){
                            reject('Undetect uploadfilepath in DB')
                        }else{
                            resolve('Detect uploadfilepath in DB');
                        }
                    });
                })
            }
            let updateAllSqlWork = function(){
                return new Promise(function(resolve,reject){
                    const sql = 'UPDATE board SET uploadfilepath=null WHERE idx=?';
                    connection.query(sql,[postIdx],(err,rows)=>{
                        if (err) reject(err);
                        connection.release();
                        resolve('Delete uploadfilepath from DB')
                    })
                })
            }
            let deleteAllUploadedFiles = function(){
                return new Promise(function(resolve,reject){
                    const findStr = postIdx+';'+req.session.displayName;
                    const dir = path.join(__dirname,'..','/public/uploadedFiles/');
                    fs.readdir(dir,(err,data)=>{
                        if (err) reject(err);
                        data.forEach((item,i)=>{
                            if (item.includes(findStr)){
                                const filePath = dir+item;
                                fs.unlink(filePath,(err)=>{
                                    if (err) reject(err);
                                    resolve('Clear uploadedFiles');
                                })
                            }
                        })
                    })
                })
            }
            let worker = async function(){
                try{
                    let work1 = await selSqlWork();
                    console.log('Uploaded files detected, path is in DB');
                    let work2 = await updateAllSqlWork();
                    let work3 = await deleteAllUploadedFiles();
                }catch{
                    console.log('There is no uploaded files or path is not in DB');
                    console.log(await deleteAllUploadedFiles());
                }
            }
            worker();
        })
        
    }else{
        res.send("<script>alert('비정상적인 접근입니다.'); document.location.href='/info'</script>")
    }
})



module.exports = router;