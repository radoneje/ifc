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


/* GET home page. */
router.get('/file/:id', async function (req, res, next) {
    try {
        let r = await req.knex("t_files").where({guid: req.params.id})
        if (!r)
            return res.sendStatus(404)
        res.download(r[0].path, r[0].originalname)
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

        return res.download(r[0].path, r[0].originalname)

        let orig=__dirname+"/../"+r[0].path;
        let small=orig.replace("uploads","uploads/"+req.params.size)
        console.log(orig,small )

        if(fs.existsSync(small))
            return res.download(r[0].path, small)
        let dir=__dirname+"/../public/uploads/"+req.params.size;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
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
                    return res.download(small)
                }
                else {
                    console.warn(err)
                    res.sendStatus(500)
                }
            });

        //res.download(r[0].path, r[0].originalname)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
});


export default router;
