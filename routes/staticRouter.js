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
import moment from 'moment'


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

router.get('/invoiceshort/:guid', async function (req, res, next) {
    try {
        let invoices=await req.knex("v_invoice").where({guid:req.params.guid})
        if(invoices.length==0)
            return res.sendStatus(404);

        let inv=invoices[0]
        let filename=__dirname+"/var/ifc_data/invoices/shorts/invoice_"+String(inv.id).padStart(3, '0')+"___"+moment(inv.date).format("DD_MM_YYYY")+".pdf"
        if (fs.existsSync(filename)) {
            return res.download(filename);
        }

        let recvizit=inv.company[0].name+","
        recvizit+="\nИНН "+inv.company[0].inn+", КПП "+inv.company[0].kpp+","
        recvizit+="\n"+inv.company[0].address
        if(inv.isPaySelf) {
            recvizit = inv.user[0].f + " " + inv.user[0].i + " "+ inv.user[0].o
            recvizit += "\nпаспорт:" +(inv.user[0].passportSerial || "")+" "+ inv.user[0].passportNumber +", выдан: "+ inv.user[0].passportDate+", код подразделения "+ inv.user[0].passportCode
        }
        var doc = new PDFDocument({size: 'a4', layout: 'portrait'});

        doc.pipe(fs.createWriteStream(filename));

        doc
            .image(__dirname+"/../forpdf/invoice/01.png",0,0,{width:600})
            .font("/var/fonts/Arial.ttf")///var/fonts/OpenSans-Regular-2.ttf")
            .fontSize(12)
            .fillColor('#000000')
            .text( inv.id+" от " +moment(inv.date).format("DD.MM.YYYY")+"г.", /*x*/ 260 , /*y*/ 163,{width: 400})
            .text( recvizit, /*x*/ 178 , /*y*/ 273,{width: 400})
            .text( inv.user[0].id+" от " +moment(inv.user[0].date).format("DD.MM.YYYY")+"г.", /*x*/ 243 , /*y*/ 340,{width: 400})
        doc.addPage()
            .image(__dirname+"/../forpdf/invoice/02.png",0,0,{width:600})
        doc.addPage()
            .image(__dirname+"/../forpdf/invoice/03.png",0,0,{width:600})
        doc.addPage()
            .image(__dirname+"/../forpdf/invoice/04.png",0,0,{width:600})


        doc.end();
        setTimeout(()=>{res.download(filename)},1000)



    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
});

router.get('/invoice/:guid', async function (req, res, next) {
        try {
            let invoices=await req.knex("v_invoice").where({guid:req.params.guid})
            if(invoices.length==0)
                return res.sendStatus(404);

            let inv=invoices[0]
            let filename=__dirname+"/var/ifc_data/invoices/all/invoice_"+String(inv.id).padStart(3, '0')+"___"+moment(inv.date).format("DD_MM_YYYY")+".pdf"
            if (fs.existsSync(filename)) {
                return res.download(filename);
            }

            let recvizit=inv.company[0].name+","
            recvizit+="\nИНН "+inv.company[0].inn+", КПП "+inv.company[0].kpp+","
            recvizit+="\n"+inv.company[0].address
            if(inv.isPaySelf) {
                recvizit = inv.user[0].f + " " + inv.user[0].i + " "+ inv.user[0].o
                recvizit += "\nпаспорт:" +(inv.user[0].passportSerial || "")+" "+ inv.user[0].passportNumber +", выдан: "+ inv.user[0].passportDate+", код подразделения "+ inv.user[0].passportCode
            }
            var doc = new PDFDocument({size: 'a4', layout: 'portrait'});

            doc.pipe(fs.createWriteStream(filename));

            doc
                .image(__dirname+"/../forpdf/invoice/01.png",0,0,{width:600})
                .font("/var/fonts/Arial.ttf")///var/fonts/OpenSans-Regular-2.ttf")
                .fontSize(12)
                .fillColor('#000000')
                .text( inv.id+" от " +moment(inv.date).format("DD.MM.YYYY")+"г.", /*x*/ 260 , /*y*/ 163,{width: 400})
                .text( recvizit, /*x*/ 178 , /*y*/ 273,{width: 400})
                .text( inv.user[0].id+" от " +moment(inv.user[0].date).format("DD.MM.YYYY")+"г.", /*x*/ 243 , /*y*/ 340,{width: 400})
            doc.addPage()
                .image(__dirname+"/../forpdf/invoice/02.png",0,0,{width:600})
            doc.addPage()
                .image(__dirname+"/../forpdf/invoice/03.png",0,0,{width:600})
            doc.addPage()
                .image(__dirname+"/../forpdf/invoice/04.png",0,0,{width:600})


            doc.end();
            setTimeout(()=>{res.download(filename)},1000)



    } catch (e) {
            console.error(e)
            res.sendStatus(500)
        }
});



export default router;
