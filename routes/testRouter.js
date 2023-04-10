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
router.get('/adduser', async function (req, res, next) {
    try {
        let sex = (Math.random() < 0.5) ? 'male' : "female"
        let data = {

            "i": faker.name.firstName(sex),
            "f": faker.name.lastName(sex),
            "o": faker.name.middleName(sex),
            "companyPhone": faker.phone.phoneNumber('+0 00 ### ## ##'),
            "companyDirector": faker.name.fullName({sex}),
            "companyAddress": faker.address.cityName() + " " + faker.address.street(),
            "companyOgrn": "ОГРН " + faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
            "companyName": faker.company.companyName(),
            "companyShort": faker.company.companyName(),
            "companyINN": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
            "proxyPhone": faker.phone.phoneNumber('+0 00 ### ## ##'),
            "proxyEmail": faker.internet.email(),
            "proxyI": faker.name.firstName(sex),
            "phone": faker.phone.phoneNumber('+0 00 ### ## ##'),
            "email": faker.internet.email(),
            "passportCode": faker.datatype.number({min: 1000, max: 10000, precision: 1}),
            "passportDate": moment(faker.date.past()).format("DD MMM YYYY"),
            "passportNumber": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}).toString(),
            "passportSerial": faker.datatype.number({min: 1000, max: 10000, precision: 1}),
            "photoId": "e07c1529-17ef-4dc3-a50f-d300a436aa16"
        }
        data = await axios.post("http://localhost:3003/api/regUser", data)
        res.json(data.data);
    } catch (e) {
        res.json(e)
    }

});
router.get("/fakeImage",async(req, res)=>{
    return res.json(await getFakeImage(req));
})
async function getFakeImage(req){
    let imageurl =faker.image.avatar();
    let filename="fake"+Math.random()+".jpg"
    var options = {
        directory: config.uloadPath,
        filename: filename
    }
    console.log(1)
    let r=await get(imageurl,options);
    console.log(2)
    r = await req.knex("t_files").insert({size:0,fieldname:"file",encoding:"7bit",originalname:filename,mimetype:"image/jpeg",filename, path:config.uloadPath+filename, destination:config.uloadPath}, "*")

    return r[0].guid
}
router.get('/adduser2', async function (req, res, next) {
    try {
        let sex = (Math.random() < 0.5) ? 'male' : "female"
        let data =
            {
                "types": [
                    {
                        "id": 1,
                    }
                ],

                "photoid": await getFakeImage(req),
                "company": {
                    "name": faker.company.name(),
                    "shortName": faker.company.name(),
                    "ogrn": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
                    "director": faker.name.fullName({sex}),
                    "address": faker.address.cityName() + " " + faker.address.street(),
                    "phone": "+0 00 740 77 24",
                    "inn": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
                    "signater": faker.name.fullName({sex})
                },
                "companyPay": {
                    "name": faker.company.name(),
                    "shortName": faker.company.name(),
                    "ogrn": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
                    "director": faker.name.fullName({sex}),
                    "address": faker.address.cityName() + " " + faker.address.street(),
                    "phone": "+0 00 740 77 24",
                    "inn": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}),
                    "signater": faker.name.fullName({sex})
                },
                "sityzen": "Russian Federation",
                "i": faker.name.firstName(sex),
                "f": faker.name.lastName(sex),
                "o": faker.name.middleName(sex),
                "passportCode": faker.datatype.number({min: 1000, max: 10000, precision: 1}),
                "passportDate": moment(faker.date.past()).format("DD MMM YYYY"),
                "passportNumber": faker.datatype.number({min: 1000000, max: 10000000, precision: 1}).toString(),
                "passportSerial": faker.datatype.number({min: 1000, max: 10000, precision: 1}),
                "phone": faker.phone.phoneNumber('+0 00 ### ## ##'),
                "email": faker.internet.email(),
                "proxyphone": faker.phone.phoneNumber('+0 00 ### ## ##'),
                "proxyemail": faker.internet.email(),
                "proxyi": faker.name.firstName(sex),
                "isProxy": true,
                "comment": faker.lorem.text()
            }
        data = await axios.post("http://localhost:3003/api/regUser2", data)
        res.json(data.data);
    } catch (e) {
        res.json(e)
    }

});

export default router;
