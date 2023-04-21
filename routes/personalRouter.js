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


router.get('/personal/', async function(req, res, next) {
    try {

        res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
    catch (e) {
        console.warn(e)
        res.text("Ошибка")
    }
});

export default router;
