import express from 'express'
import axios from 'axios'
import validator from 'validator';
import pug from 'pug';


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
const checkAccess=(req, res, next)=>{
    if(!req.session.token)
        return res.redirect("/personal/"+req.params.lang)
    next();
}
/* GET home page. */



router.post('/googleToken', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        await req.knex("t_users_google_tokens").insert({userid:req.session.token.id,token:req.body.googleToken})
        res.json(true)
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});


router.get('/colleguesDialog', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)


        req.body.userid=req.session.token.id;
        let r=await req.knex("t_users").where({companyid:req.session.token.companyid}).orderBy("f").orderBy("i")
        return res.render('personal/colleguesDialog', {users:r, lang: req.params.lang, ru: req.params.lang == "ru"});
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.post('/transfers', async function(req, res, next) {
    try {

        if(!req.session.token)
            return res.sendStatus(401)

        delete req.body.id;
        req.body.createDate=new Date();
        req.body.userid=req.session.token.id;
        let r=await req.knex("t_transfers").insert(req.body, "*")
        res.json( r[0]);

    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.get('/transfers', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)


        req.body.userid=req.session.token.id;
        let r=await req.knex("t_transfers").where({userid:req.session.token.id}).orderBy("id","desc")
        if(r.length==0)
            return res.json(false)
        res.json( r[0]);

    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

router.get('/badgeDelivery', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)
        let r=await req.knex("t_bage_delivery").where({userid:req.session.token.id}).orderBy("id", "desc")
        if(r.length==0)
            return res.json(false)
        r=r[0];
        delete r["userid"]
        delete r["dateCreate"]

         res.json(r);
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});


router.post('/badgeDelivery', async function(req, res, next) {
    try {

        if(!req.session.token)
            return res.sendStatus(401)

        delete req.body.id;
        req.body.collegues=JSON.stringify(req.body.collegues)
        req.body.userid=req.session.token.id;
        let r=await req.knex("t_bage_delivery").insert(req.body, "*")
        res.json( r[0]);



    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

router.post('/hotelRoom', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        let user=(await req.knex("t_users").update({roomid:req.body.roomid},"*").where({id:req.session.token.id}))[0]
        let room=(await req.knex("t_hotel_rooms").where({id:req.body.roomid}))[0]
        let hotel=(await req.knex("t_hotels").where({id:room.hotelid}))[0]

        let log=(await req.knex("t_hotel_log").insert({roomid:req.body.roomid, userid:user.id },"*"))[0]

        let text="<html><body>Добрый день!<br><br>"
        text+=user.f+" " + user.i +" " + user.o+" запрашивает бронирование номера категории "+ room.titleru +" по цене " + room.price+"р. <br><br>"
        text+="Контакты участника: "+ (user.isProxy?("(его референта "+user.proxyi+") +"+user.proxyphone+", "+ user.proxyemail):("+"+user.phone+", "+ user.email))
        text+="<br><br>Пожалуйста, <a href='https://ifcongress.ru/hotelconfirm/"+log.guid+"'>откройте эту ссылку</a> для подтверждения получения письма."
        text+="<br><br>C уважением,<br>Оргкомитет <br>Финансового конгресса Банка России<br>8 800 300-69-23<br>INFO@IFCONGRESS.RU"
        text+="</body></html>"
        let subj="Заявка на бронирование: Финансовый конгресс Банка России"
        await req.knex("t_email_messages_to_another_person").insert({email:hotel.email,subj,text })

        let filename=__dirname+"/../views/emails/310_hotel_confirm.pug"
        text= pug.renderFile(filename, {user, hotel:hotel.nameru})
        subj="Заявка на бронирование отеля: Финансовый конгресс Банка России"
        await req.knex("t_email_messages_to_another_person").insert({email:user.email,subj,text })
        if(user.isProxy)
            await req.knex("t_email_messages_to_another_person").insert({email:user.proxyemail,subj,text })

        res.json(1)
    }
    catch (e) {
        console.warn(e)
        return res.json("error")
    }
});
router.post('/feedbackMessage', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)
        let r=await req.knex("t_feedback").insert({userid:req.session.token.id, files:req.body.files, text:req.body.text})

        let tgUsers=await req.knex("t_bot_users").where({isOperatorUsers:true})
        for(let tg of tgUsers){
            await req.knex("t_sysbot_messagesstack").insert({
                to:tg.tgid,
                message:"Новый вопрос с сайта\n\n <a href='https://ifca.usermod.ru/feedback'>посмотреть</a>"
            })
        }
        //t_sysbot_messagesstack
        res.json(r)
    }
    catch (e) {
        console.warn(e)
        return res.json("error")
    }
});
router.post('/returnToPaymentSelect', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        await req.knex("t_users").update({payCompanyId:null, statusid:60}).where({id:req.session.token.id})
        let r=await req.knex("v_personal_data").where({guid:req.session.token.guid})

        res.json(r[0])
    }
    catch (e) {
        console.warn(e)
        return res.json("error")
    }
});
router.get('/personalDataAgreement', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        res.redirect("/static/personalDataAgreement/"+req.session.token.guid);
    }
    catch (e) {
        console.warn(e)
        return res.json("error")
    }
});

router.get('/edoAgreement', async function(req, res, next) {

    try {
        if(!req.session.token)
            return res.sendStatus(401)
        let r=await req.knex("t_invoces").where({userid:req.session.token.id}).orderBy("id","desc")
        res.redirect("/static/edoAgreement/"+r[0].guid);
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }


});
router.get('/invoice', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)
        let r=await req.knex("t_invoces").where({userid:req.session.token.id}).orderBy("id","desc")
        res.redirect("/static/invoice/"+r[0].guid);
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.post('/getDocumentsFromMainCompany', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        let r=await req.knex("t_company")
            .update({isEdo:req.body.isEdo,phone:req.body.phone,signater:req.body.signater})
            .where({guid:req.body.companyguid})

        r=await req.knex("t_users").update({statusid:65}).where({guid:req.session.token.guid})
        r=await req.knex("v_personal_data").where({guid:req.session.token.guid})
        res.json(r[0])
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});

router.post('/getDocumentsFromPayCompany', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        let r = await req.knex("t_company").where({inn: req.body.payCompany.inn})
        let company={}
        if (r.length == 0)
            company = (await req.knex("t_company").insert(req.body.payCompany, "*"))[0]
        else
            company = r[0]


        r=await req.knex("t_users").update({statusid:65, payCompanyId:company.id}).where({guid:req.session.token.guid})
        r=await req.knex("v_personal_data").where({guid:req.session.token.guid})
        res.json(r[0])
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.post('/changeUser', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)
        if(!(req.body.photoid && req.body.companyShort && req.body.phone && req.body.email))
            return res.sendStatus(422)

        req.body.email= validator.trim(req.body.email);
        //req.body.email= validator.normalizeEmail(req.body.email)


        if(!req.body.photoid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
            return res.sendStatus(422)
        if(req.body.companyShort.length>128)
            return res.sendStatus(422)
        if(req.body.phone.length>50)
            return res.sendStatus(422)
        if(req.body.position.length>1024)
            return res.sendStatus(422)
        if(req.body.postAddress.length>2048)
            return res.sendStatus(422)



        let r= await req.knex("t_users")
            .update({postAddress:req.body.postAddress,position:req.body.position, photoid:req.body.photoid,companyShort:req.body.companyShort,phone:req.body.phone,email:req.body.email  })
            .where({guid:req.session.token.guid})


        res.json(r)
    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, apiUrl:config.apiUrl, ru: req.params.lang == "ru"});
    }
});
router.post('/setPaySelf', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)

        req.body.isPaySelf=req.body.isPaySelf?true:false;
        let r= await req.knex("t_users")
            .update({isPaySelf:req.body.isPaySelf, statusid:req.body.isPaySelf?65:60 })
            .where({guid:req.session.token.guid})
        r=await req.knex("v_personal_data").where({guid:req.session.token.guid})
        res.json(r[0])

    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.get('/data', async function(req, res, next) {
    try {
        if(!req.session.token)
            return res.sendStatus(401)
        let r=await req.knex("v_personal_data").where({guid:req.session.token.guid})

        if(r[0].info)
        r[0].info.sort((a,b)=>{return b.id-a.id})

        r[0].files=[]
        for(let guid of r[0].filesid){

            let f=await req.knex("t_files").where({guid})
            r[0].files.push({name:f[0].originalname, guid})
        }
        delete r[0].filesid;
        let companyid=r[0].companyid;
        delete r[0].companyid

        let c=await req.knex("t_company").where({id:companyid})
        for(let guid of c[0].filesid) {
            let f=await req.knex("t_files").where({guid})
            r[0].files.push({name:f[0].originalname, guid})
        }

        res.json(r[0])

    }
    catch (e) {
        console.warn(e)
        return res.json("error")
    }
});
router.get('/info/:lang?', checkAccess, async function(req, res, next) {
    try {
        if(!req.params.lang.match(/ru|en/))
            req.params.lang="ru";

        let hotels=await req.knex("v_hotels").where({isEnabled:true}).orderBy("stars").orderBy("nameru")
        let section="";
        if(req.query.section)
            section=req.query.section;
        res.render("personal/layout", {section, lang:req.params.lang, ru:req.params.lang == "ru", apiUrl:config.apiUrl, hotels}, )


    }
    catch (e) {
        console.warn(e)
        return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
    }
});
router.get('/playerRegistration', async function(req, res, next) {
    try {
        req.session.player=null

        res.render("/personal/playerRegistration")
    }
    catch (e) {
        console.warn(e)
        return res.sendStatus(404)
    }
});

router.get('/playerWindow', async function(req, res, next) {
    try {
        id(!req.session.player && !req.session.token)
         return    res.redirect("/personal/playerRegistration")
        id(!req.session.player && req.session.token)
        req.session.player=req.session.token;

        await req.knex("t_player_openlog").insert({
            userid:req.session.player.id,
            playeruserid:req.session.player.playeruserid

        })

            res.render("/personal/playerWindow")
    }
    catch (e) {
        console.warn(e)
        return res.sendStatus(404)
    }
});
router.get('/exit/:lang?', async function(req, res, next) {
    try {
        req.session.token=null;
        res.redirect("/")
    }
    catch (e) {
            console.warn(e)
            return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
        }
    });
router.get('/:lang?', async function(req, res, next) {
    try {

        if(!(req.params.lang && req.params.lang.match(/ru|en/)))
            req.params.lang="ru";

        if(req.session.token && req.query.token)
            req.session.token=null;

        if(req.session.token)
            return res.redirect("/personal/info/"+req.params.lang)

        if(!(req.query.token && req.query.token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)))
            return res.render('pagePersonalNotLogin', {lang: req.params.lang, ru: req.params.lang == "ru"});
        if(req.query.token)
        {

            req.session.token=null;
            let usr=await req.knex("v_lk_access").where({guid:req.query.token})
            if(usr.length==0)
                return res.redirect("/personal/"+req.params.lang)
            else {

                if(usr[0].statusid<60)
                    return res.sendStatus(401)

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
