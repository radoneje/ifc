import express from 'express'
import axios from 'axios'
import config from "../config.js";
const router = express.Router();

/* GET home page. */
router.get("/undefined",(req, res)=>{
  res.sendStatus(401)
})

router.get("/tgpgm/:id",async (req, res)=>{
  try {
   let timeslots= await req.knex("v_pgm_timeslots").where({dayid:req.params.id})
    let day={id:req.params.id,timeslots }
    res.render("tgpgm", {lang: "ru", ru: true, day })
  }
  catch (e){
    console.warn(e)
    res.sendStatus(500)
  }
})
router.get("/hotelconfirm/:guid",async (req, res)=>{
  await req.knex("t_hotel_log").update({confirmDate:new Date()}).where({guid:req.params.guid})
  res.render("hotelconfirm",{lang:"ru", ru:true})
})
router.get('/demo/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/demo/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/demo/ru")
  let news=await req.knex("t_news").where({status:2}).orderBy("sort","desc").limit(4);
  news.sort((a,b)=>{return b.sort-a.sort});
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
router.get('/partner/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/partner/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/partner/ru")
  res.render('pageRegistration',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl, typeid:9} );
});
router.get('/contractor/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/contractor/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/contractor/ru")
  res.render('pageRegistration',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl, typeid:6} );
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
router.get('/speakers/:lang?', async function(req, res, next) {
 try {
   if (!req.params.lang)
     return res.redirect("/speakers/ru")
   if (!req.params.lang.match(/ru|en/))
     res.redirect("/speakers/ru")
   let speakers = await req.knex("t_pgm_spk").where({isEnabled: true,}).orderBy("sort").orderBy("f" + req.params.lang).orderBy("i" + req.params.lang)
   res.render('pageSpeakers', {lang: req.params.lang, ru: req.params.lang == "ru", speakers});
 }
 catch (e) {
   console.warn(e)
   res.text("Ошибка")
 }
});
router.get('/programme/:lang?', async function(req, res, next) {
  try {
    if (!req.params.lang)
      return res.redirect("/programme/ru")
    if (!req.params.lang.match(/ru|en/))
      res.redirect("/programme/ru")
    let pgm = await req.knex("v_pgm")
    let isSpk=false
    if(req.query.spk)
      isSpk=true
    res.render('pageProgramme', {lang: req.params.lang,isSpk, ru: req.params.lang == "ru", pgm});
  }
  catch (e) {
    console.warn(e)
    res.text("Ошибка")
  }
});

router.get('/popupSpeaker/:id/:lang', async function(req, res, next) {
  try {
    let speakers = await req.knex("t_pgm_spk").where({id:req.params.id})
    if(speakers.length==0)
      res.sendStatus(404);
    for(let spk of speakers)
    {
      spk.sessions=await req.knex("v_pgm_sessions")
          .where({moderatorid:spk.id})
          .orWhereRaw(spk.id+"=any(speakersid)")
      spk.sessions=spk.sessions.filter(s=>{return s.isEnabled && !s.isDeleted})
    }
    res.render("popupSpeaker",{spk:speakers[0],lang:req.params.lang })
  }
  catch (e) {
    console.warn(e)
    res.text("Ошибка")
  }
});

router.get('/popupSession/:id/:lang', async function(req, res, next) {
  try {
    let session = await req.knex("v_pgm_session_withdates").where({id:req.params.id})
    if(session.length==0)
      res.sendStatus(404);
    let isSpk=false;
    if(req.query.spk)
      isSpk=true;
    res.render("popupSession",{session:session[0],isSpk,lang:req.params.lang })
  }
  catch (e) {
    console.warn(e)
    res.text("Ошибка")
  }
});

router.get('/participants/:lang?', async function(req, res, next) {
  try {
    if (!req.params.lang)
      return res.redirect("/participants/ru")
    if (!req.params.lang.match(/ru|en/))
      res.redirect("/participants/ru")

    res.render('pageParticipants', {lang: req.params.lang, ru: req.params.lang == "ru"});
  }
  catch (e) {
    console.warn(e)
    res.text("Ошибка")
  }
});
router.all('/pay_result/', async function(req, res, next) {
  try {
   res.json("ok")
  }
  catch (e) {
    console.warn(e)
    res.text("Ошибка")
  }
});
router.get('/info/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/info/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/info/ru")
  let news=await req.knex("t_news").where({status:2}).orderBy("sort","desc").limit(4);
  news.sort((a,b)=>{return b.sort-a.sort});
  res.render('info',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl, news} );
});
router.get('/registration/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/registration/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/registration/ru")
  res.render('pageRegistration',{lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl} );
});
router.get('/photos/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/photos/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/photos/ru")
  let days=await req.knex("v_photo_days");
  days.forEach(d=>{
    if(!d.folders)
      d.folders=[]
    d.folders=d.folders.filter(dd=>{return dd.isEnabled && !dd.isDeleted});
    d.folders.sort((a,b)=>{return a.sort-b.sort});
    d.folders.forEach(f=>{
      if(!f.photos)
        f.photos=[]
      f.photos=f.photos.filter(dd=>{return dd.isEnabled && !dd.isDeleted});
      f.photos.sort((a,b)=>{return a.sort-b.sort});
    })
  })
  res.render('pagePhotos',{days, lang:req.params.lang, ru:req.params.lang=="ru", apiUrl:config.apiUrl} );
});
router.get('/photos/:id/:lang?', async function(req, res, next) {
  try {
    if (!req.params.lang)
      return res.redirect("/photos/" + req.prarams.id + "/ru")
    if (!req.params.lang.match(/ru|en/))
      res.redirect("/photos/" + req.prarams.id + "/ru")
    let f = (await req.knex("v_photo_folders").where({id: req.params.id}))[0];
    let d = (await req.knex("t_pgm_days").where({id: f.dayid}))[0];
    f.day=d

    if (!f.photos)
      f.photos = []
    f.photos = f.photos.filter(dd => {
      return dd.isEnabled && !dd.isDeleted
    });
    f.photos.sort((a, b) => {
      return a.sort - b.sort
    });

    res.render('pagePhotosItems', {
      folder: f,
      lang: req.params.lang,
      ru: req.params.lang == "ru",
      apiUrl: config.apiUrl
    });
  }
  catch (e) {
    console.warn(e)
    res.sendStatus(404)
  }
  });

router.get('/fullScreenPhoto/:folderid/:photoid?', async function(req, res, next) {
  try {
    let f = (await req.knex("v_photo_folders").where({id: req.params.folderid}))[0];
    if (!f.photos)
      f.photos = []
    f.photos = f.photos.filter(dd => {
      return dd.isEnabled && !dd.isDeleted
    });
    f.photos.sort((a, b) => {
      return a.sort - b.sort
    });
    if(req.params.photoid)
    f.photos.forEach(photo=>{
      if(photo.id==req.params.photoid)
        photo.selected=true;
    })
    else
      f.photos[0].selected=true;
    res.render('elems/fullScreenPhoto', {folder:f, ru: req.params.lang == "ru",apiUrl: config.apiUrl});
  }
  catch (e) {
    console.warn(e)
    res.sendStatus(404)
  }
});

router.get('/:lang?', async function(req, res, next) {
 console.log(req.headers.referer)
  if(req.headers.referer=="https://pay.vtb.ru/" && req.session.token){
   let r=await req.knex("t_users").update({statusid:70}).where({id:req.session.token.id})
   return res.redirect("/personal/info/ru?section=pay")
 }
  if(!req.params.lang) {
   let url="/ru"
    if(req.query.adv)
      url+='?adv='+req.query.adv
    return res.redirect(url)


  }
  if(!req.params.lang.match(/ru|en/)) {
    let url="/ru"
    if(req.query.adv)
      url+='?adv='+req.query.adv
    return res.redirect(url)
  }
  let test=false;
  if(req.query.test)
    test=true;
  let news=await req.knex("t_news").where({status:2, lang:req.params.lang}).orderBy("sort","desc").limit(4);
  news.sort((a,b)=>{return b.sort-a.sort});
  res.render('demo',{lang:req.params.lang,test, ru:req.params.lang=="ru", apiUrl:config.apiUrl, news} );
});















export default router;
