import express from 'express'
import axios from 'axios'
import config from "../config.js";
const router = express.Router();

/* GET home page. */
router.get('/demo/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/demo/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/demo/ru")


  let news=await req.knex("t_news").where({status:2}).orderBy("sort","desc").limit(4)
  res.render('demo',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl, news} );
});
router.get('/registration/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/registration/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/registration/ru")
  res.render('pageRegistration',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl} );
});
router.get('/smi/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/smi/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/smi/ru")
  res.render('pageRegistration',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl, typeid:4} );
});

router.get('/news/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/news/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/news/ru")

  let news=await req.knex("t_news").where({status:2, lang:req.params.lang}).orderBy("sort","desc")

  res.render('pageNews',{lang:req.params.lang, ru:req.params.lang=="ru", news} );
});
router.get('/speakers/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/speakers/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/speakers/ru")

  let speakers=await req.knex("t_pgm_spk").where({isEnabled:true,}).orderBy("sort",).orderBy("f"+req.params.lang,).orderBy("i"+req.params.lang,)

  res.render('pageSpeakers',{lang:req.params.lang, ru:req.params.lang=="ru", speakers} );
});

router.get('/photoEditor', async function(req, res, next) {

  res.render('photoEditor' );
});







export default router;
