const register = async () => {
    let form = document.querySelector(".regForm");
    let elems = form.querySelectorAll("input");
    let error = false

    let data = {}
    let arr = [];
    arr.push(...elems);
    arr.reverse();
    arr.forEach(elem => {
        elem.parentNode.classList.remove("error");
        if (!elem.value || !elem.value.match(/[A-Za-zА-Яа-я]{2,50}/)) {
            elem.parentNode.classList.add("error");
            elem.focus()
            error = true;
        }
    })

    if (error)
        return;
    arr.forEach(elem => {
        data[elem.name] = elem.value;
    });

    let popup = await createPopUp("/register")
    addProxyBtn.onclick = async () => {
        let res = await fetch("/regProxy")
        if (res.ok) {
            popup.querySelector(".proxyBox").innerHTML = await res.text();
            addProxyBtn.style.display = "none"
            closeProxy.onclick = async () => {
                popup.querySelector(".proxyBox").innerHTML = ""
            }
        }

    }
    selfPayBtn.onclick = async () => {
        let res = await fetch("/regConfirm")
        if (res.ok) {
            popup.querySelector(".paymantTypeBox").innerHTML = await res.text();
            regConfirm.onclick = async () => {
                await confirm();
            }
        }
    }
    await loadAboutCompany();

    /*companyPayBtn.onclick = async () =>*/
    async function loadAboutCompany() {
        let res = await fetch("/regCompany")
        if (res.ok) {
            popup.querySelector(".paymantTypeBox").innerHTML = await res.text();
            regConfirm.onclick = async () => {
                await confirm();
            }
            companyINN.onkeydown = async (e) => {
                //if(!(e.key.match(/\d/) || e.key=="Backspace" || e.key=="Delete"))
                //   return  e.preventDefault();
                if (e.target.value.length > 12)
                    return e.preventDefault();
            }
            isPayCompanyWR.onclick = async () => {
                isPayCompanyWR.classList.toggle("active");
                if (!isPayCompanyWR.classList.contains("active")) {
                    let ret = await fetch("/regPayCompany")
                    if (ret.ok)
                        payCompanyBox.innerHTML = await ret.text()
                    checkPayInn.onclick = async () => {
                        let res = await fetch("/checkInn?inn=" + companyPayINN.value)
                        if (!res.ok)
                            return companyPayINNError.innerHTML = "Компания не найдена, проверьте Инн"
                        companyPayINNError.innerHTML = (await res.json()).html;
                        let card = companyPayINNError.querySelector(".snippetCell")
                        if (!card)
                            return companyPayINNError.innerHTML = "Компания не найдена, проверьте Инн"
                        let company = {inn: companyPayINN.value}

                        let att = card.innerText.split('\n');

                        company.inn = companyINN.value;
                        company.name = att[0]
                        if (company.inn.length < 12) {

                            company.ogrn = att[1]
                            company.address = att[2]
                            if (att[3])
                                company.director = att[3].replace("Руководитель: ", "")
                        }
                        if (company.inn.length == 12) { //ИП
                            company.name = "ИП " + company.name;
                            company.ogrn = att[1]
                            company.address = att[2]
                            company.director = att[0]
                        }
                        card.innerHTML = '<div><input type="text" id="companyPayName" name="companyPayName" placeholder="Наименование компании"/></div>'
                        card.innerHTML += '<div><input type="text"  id="companyPayOgrn" name="companyPayOgrn" placeholder="ОГРН КПП"/></div>'
                        card.innerHTML += '<div><input type="text" id="companyPayAddress" name="companyPayAddress" placeholder="Адрес компании"/></div>'
                        card.innerHTML += '<div><input type="text"  id="companyPayDirector" name="companyPayDirector" placeholder="ФИО Руковоителя" /></div>'
                        card.innerHTML += '<div><input type="text" id="companyPayPhone" name="companyPayPhone" placeholder="телефон компании"/></div>'


                        companyPayName.value = company.name;
                        companyPayOgrn.value = company.ogrn;
                        companyPayAddress.value = company.address;
                        companyPayDirector.value = company.director;
                        companyPayPhone.value = phone.value;
                    }
                } else
                    payCompanyBox.innerHTML = ""
            }
            checkInn.onclick = async () => {
                let res = await fetch("/checkInn?inn=" + companyINN.value)
                if (!res.ok)
                    return companyINNError.innerHTML = "Компания не найдена, проверьте Инн"

                companyINNError.innerHTML = (await res.json()).html;
                let card = companyINNError.querySelector(".snippetCell")
                if (!card)
                    return companyINNError.innerHTML = "Компания не найдена, проверьте Инн"
                let company = {inn: companyINN.value}


                // company.name=card.querySelector("a").innerHTML;
                let att = card.innerText.split('\n');
                console.log(att)
                company.inn = companyINN.value;
                company.name = att[0]
                if (company.inn.length < 12) {

                    company.ogrn = att[1]
                    company.address = att[2]
                    if (att[3])
                        company.director = att[3].replace("Руководитель: ", "")
                }
                if (company.inn.length == 12) { //ИП
                    company.name = "ИП " + company.name;
                    company.ogrn = att[1]
                    company.address = att[2]
                    company.director = att[0]
                }
                card.innerHTML = '<div><input type="text" id="companyName" name="companyName" placeholder="Название компании"/></div>'
                card.innerHTML += '<div><input type="text"  id="companyOgrn" name="companyOgrn" placeholder="ОГРН КПП"/></div>'
                card.innerHTML += '<div><input type="text" id="companyAddress" name="companyAddress" placeholder="Адрес компании"/></div>'
                card.innerHTML += '<div><input type="text"  id="companyDirector" name="companyDirector" placeholder="ФИО Руковоителя" /></div>'
                card.innerHTML += '<div><input type="text" id="companyPhone" name="companyPhone" placeholder="телефон компании"/></div>'
                card.innerHTML += '<div class="mt-2"><div>Название компании на вашем бейдже</div><input type="text" id="companyShort" name="companyShort" placeholder="телефон компании"/></div>'


                companyName.value = company.name;
                companyOgrn.value = company.ogrn;
                companyAddress.value = company.address;
                companyDirector.value = company.director;
                companyPhone.value = phone.value;
                try {
                    console.log(company.name.replace("ООО", ""))
                    // companyShort.value = company.name.replace("OOO", "").replace("ЗАО", "").replace("ПАО", "").trim().replace("ФГУП ", "").replace(/^\"(.+)\"$/, "$1")
                    companyShort.value = company.name.replace(/^ООО|ИП|ПАО|ЗАО/, "").trim().replace(/^\"(.+)\"$/, "$1")
                } catch (e) {
                    console.warn(e)
                    companyShort.value = company.name
                }

            }

        }
    }

    addPhoto.onclick = async () => {
        // if(!Cropper) {
        let script = document.createElement("script")
        script.src = "/static/lib/cropper.min.js"
        document.head.appendChild(script)
        // }
        let inp = document.createElement("input")
        inp.type = "file";
        inp.accept = "image/png, image/jpeg"
        inp.click()

        inp.onchange = async (e) => {

            if (FileReader && inp.files && inp.files.length) {
                var fr = new FileReader();
                fr.onload = function () {
                    let cropBox = document.createElement("div")
                    document.querySelector(".fullScreenBox").appendChild(cropBox)
                    cropBox.classList.add("cropBox")
                    let cropWr = document.createElement("div")
                    cropWr.classList.add("cropWr")
                    cropBox.appendChild(cropWr);
                    let image = document.createElement("img")
                    cropWr.appendChild(image);
                    image.src = fr.result;


                    const cropper = new Cropper(image, {
                        aspectRatio: 1,//35 / 45,
                        viewMode: 1,
                        // aspectRatio:3/4,
                        autoCropArea: 1,
                        zoomable: false,
                        crop(event) {
                            /*console.log(event.detail.x);
                            console.log(event.detail.y);
                            console.log(event.detail.width);
                            console.log(event.detail.height);
                            console.log(event.detail.rotate);
                            console.log(event.detail.scaleX);
                            console.log(event.detail.scaleY);*/
                        },
                    });
                    let btn = document.createElement("div")
                    btn.classList.add("mt-2")
                    btn.innerHTML = "Сохранить"
                    cropWr.appendChild(btn);
                    btn.onclick = () => {
                        var croppedImageDataURL = cropper.getCroppedCanvas().toDataURL("image/png");
                        cropper.getCroppedCanvas().toBlob(async (blob) => {
                            formData = new FormData()
                            formData.append('file', blob, 'userPhoto.png');
                            let ret = await fetch("/api/uploadFile", {
                                method: 'post',
                                body: formData,
                            })
                            if (ret.ok) {


                                let fileId = await ret.json()

                                let ready = document.createElement("img")
                                ready.src = "/static/file/" + fileId
                                let regPhoto = document.querySelector(".regPhoto")
                                regPhoto.innerHTML = "";
                                regPhoto.appendChild(ready)
                                regPhoto.setAttribute("photoId", fileId)
                                cropBox.parentNode.removeChild(cropBox);


                                let hidden = document.createElement("input")
                                hidden.type = "hidden"
                                hidden.name = "photoId"
                                hidden.value = fileId
                                document.querySelector(".regPhoto").appendChild(hidden)
                            }

                        }, 'image/png', 1)

                    }

                    let btnClose = document.createElement("div")
                    btnClose.classList.add("mt-2")
                    btnClose.innerHTML = "Выйти"
                    cropWr.appendChild(btnClose);
                    btnClose.onclick = () => {
                        cropBox.parentNode.removeChild(cropBox);
                    }

                }
                fr.readAsDataURL(inp.files[0]);
            }
        }
    }

    async function confirm() {
        let container = document.querySelector(".fullScreencontent");
        let elems = container.querySelectorAll("input")
        let arr = [];
        arr.push(...elems)
        arr.reverse();
        let error = false;
        arr.forEach(elem => {
            elem.parentNode.classList.remove("error")
            if (!elem.value) {
                elem.parentNode.classList.add("error")
                error = true;
            }
        })
        let regPhoto = document.querySelector(".regPhoto")
        regPhoto.classList.remove("error")
        let photoId = regPhoto.getAttribute("photoId")
        if (!photoId) {
            regPhoto.classList.add("error")
            error = true;
        }
        if (error)
            return

        arr.forEach(elem => {
            data[elem.name] = elem.value;
        })
        let res = await fetchJson("/api/regUser", data)
        console.log(res)
        closePopUp();
    }

}
const showMobileMenu=()=>{
    document.body.style.overflow="hidden"
    mobileMenu.classList.add("mobileMenuVisible")
}
const closeMobileMenu=()=>{
    console.log(11)
    mobileMenu.classList.remove("mobileMenuVisible")
    document.body.style.overflow=null
}
let placeImageArray=["/static/images/place02.png","/static/images/place03.png","/static/images/place04.png"]
let placePhotoBox=document.getElementById("placePhotoBox")
if(placePhotoBox) {
    placeImageArray.push(placePhotoBox.lastChild.src);
    let item= placeImageArray[parseInt(Math.random()*3)]
    placeImageArray=placeImageArray.filter(i=>i!=item);
    placePhotoBox.lastChild.src=item;
}

function movePlaceImg(dir=true){
    if(placePhotoBox) {
        let item =""
        if(dir)
            item=placeImageArray.shift()
        else
            item=placeImageArray.pop()

        let elem = document.createElement("img")
        elem.src = item;
        elem.loading = "lazy"
        //placePhotoBox.appendChild(elem);
        placePhotoBox.insertBefore(elem, placePhotoBox.firstChild);
        elem.onload = () => {
            placePhotoBox.lastChild.style.opacity = 0;
            setTimeout(() => {
                if(dir)
                    placeImageArray.push(placePhotoBox.lastChild.src)
                else
                    placeImageArray.unshift(placePhotoBox.lastChild.src)
                placePhotoBox.removeChild(placePhotoBox.lastChild)
            }, 1000)

        }

    }
}
if(typeof (placeArrowR)!="undefined")
    placeArrowR.onclick=()=>{movePlaceImg(true)}
if(typeof (placeArrowL)!="undefined")
    placeArrowL.onclick=()=>{movePlaceImg(false)}

if(typeof (placePhotoBox)!="undefined"){
    placePhotoBox.onclick=()=>{movePlaceImg(true)}
}

