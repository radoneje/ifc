import express from 'express'
import axios from 'axios'

const router = express.Router();
import config from "../config.js"

import path from 'path'
import fs from 'fs'
import {fileURLToPath} from "url";
import gm from 'gm'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import PDFDocument from 'pdfkit';


/* GET home page. */
router.get('/file/:id', async function (req, res, next) {
    try {
        let r = await req.knex("t_files").where({guid: req.params.id})
        if (r.length==0)
            return res.sendStatus(404)
        console.log(req.query)
        if( req.query.open)
            return  res.sendFile(r[0].path)

        res.download(r[0].path, r[0].originalname)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
});


router.get('/key/:key', async function (req, res, next) {
    try {


        let r = await req.knex("t_staticfiles").where({key:req.params.key})
        if (r.length==0)
            return res.sendStatus(404)
        let url="/static/file/"+r[0].fileid

        if( req.query.open)
            url+="?open=true"
        res.redirect(url)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
});

router.get('/image/:size/:id', async function (req, res, next) {
    try {
        let r = await req.knex("t_files").where({guid: req.params.id})
        if (!r)
            return res.sendStatus(404)

        //return res.download(r[0].path, r[0].originalname)

        let orig=/*__dirname+"/../"+*/r[0].path;
        let small=orig.replace("uploads","uploads/"+req.params.size)
       // console.log(orig,small )

        if(fs.existsSync(small)) {
            //console.log("downlod from cache", small)
            return res.download(small)
        }
        //console.log("try resize")

        let size=150;
        if(req.params.size=="small")
            size=150
        if(req.params.size=="middle")
            size=800
        if(req.params.size=="hi")
            size=1200

        gm(orig)
            .resizeExact(size)
            .write(small, function (err) {
                if (!err) {
                    //console.log("resize file "+small+ " to size:"+size)
                    return res.download(small)
                }
                else {
                    console.warn(err)
                    res.sendStatus(500)
                }
            });

       // res.download(r[0].path, r[0].originalname)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
});

router.get('/invoice/:guid', async function (req, res, next) {
        try {
            var doc = new PDFDocument({bufferPages: true, encoding ; 'UTF-8'});
            let filename=__dirname+"/../public/static/invoices/invoice_22.pdf"
            doc.pipe(fs.createWriteStream(filename));
            doc.text("Счет номер 5\nПлательщик 11", 0, 0)
            doc.end();
            setTimeout(()=>{res.download(filename)},1000)



    } catch (e) {
            console.error(e)
            res.sendStatus(500)
        }
});



export default router;
