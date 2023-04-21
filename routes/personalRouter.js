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
        if(!req.params.lang.match(/ru|en/))
            req.params.lang="ru";

        if(!(req.query.token || req.session.token))
            return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
        if(req.query.token)
        {
            req.session.token=null;
            let usr=await ret.knex("v_lk_access").where({guid:req.query.token})
            if(usr.length==0)
                return res.redirect("/personal/"+req.params.lang)
            else {
                req.session.token = usr[0]
                return res.redirect("/personal/info")
            }
        }
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

export default router;
