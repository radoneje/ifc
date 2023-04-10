import express from 'express'
import axios from 'axios'
const router = express.Router();

/* GET home page. */
router.get('/demo/:lang?', async function(req, res, next) {
  if(!req.params.lang)
    return res.redirect("/demo/ru")
  if(!req.params.lang.match(/ru|en/))
    res.redirect("/demo/ru")
  res.render('demo', );
});







export default router;
