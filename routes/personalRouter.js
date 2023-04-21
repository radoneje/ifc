import express from 'express'
import axios from 'axios'

const router = express.Router();
import {faker} from '@faker-js/faker/locale/ru';
import config from "../config.js"
import moment from "moment";

import path from 'path'
import fs from 'fs'
import {fileURLToPath} from "url";
import gm from 'gm'
import FormData  from 'form-data'

import get  from "async-get-file"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* GET home page. */
router.get('/info/:lang?', async function(req, res, next) {
    try {
        if(!req.params.lang.match(/ru|en/))
            req.params.lang="ru";
        console.log("here",req.query.token )
        if(!req.query.token)
            return res.redirect("/personal/"+req.params.lang)


        res.json("info")

    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

router.get('/:lang?', async function(req, res, next) {
    try {
        console.log(req.params.lang)
        if(!(req.params.lang && req.params.lang.match(/ru|en/)))
            req.params.lang="ru";

        if(!(req.query.token && req.session.token && req.session.token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)))
            return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
        if(req.query.token)
        {
            console.log("user have a token")
            req.session.token=null;
            let usr=await req.knex("v_lk_access").where({guid:req.query.token})
            if(usr.length==0)
                return res.redirect("/personal/"+req.params.lang)
            else {
                console.log("user is OK")
                req.session.token = usr[0]
                return res.redirect("/personal/info/"+req.params.lang)
            }
        }
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

export default router;
