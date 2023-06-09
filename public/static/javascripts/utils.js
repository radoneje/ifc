const urlify=(text) =>{
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1">$1</a>')
}
const createPopUp = async (url, callback) => {

    let elem = document.createElement("div")
    elem.classList.add("fullScreenWr");
    let box = document.createElement("div")
    box.classList.add("fullScreenBox");
    box.classList.add("loading");
    elem.appendChild(box)
    let content = document.createElement("div")
    content.classList.add("fullScreencontent");

    box.appendChild(content)

    let loader = document.createElement("div")
    loader.classList.add("fullScreenLoading");
    loader.innerHTML = "Подождите, идет загрузка..."
    box.appendChild(loader)
    let close = document.createElement("div")
    close.classList.add("fullScreenCloseNotSave");
    close.classList.add("flex");
    close.classList.add("center");
    //close.innerHTML = "X"
    box.appendChild(close)

    document.body.appendChild(elem)

    close.onclick = elem.onclick = () => {
        closePopUp();
    }


    box.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    let res = await fetch(url)
    if (!res.ok) {
        loader.innerHTML = "Произошла ошибка, попробуйте позже";
        return
    }

    box.removeChild(loader)
    content.innerHTML = await res.text();
    document.body.style.overflow = "hidden"

    document.body.querySelectorAll(".fullScreenClose").forEach(e => {
        e.onclick = async () => {
            if (callback && await callback())
                return closePopUp();
            if (!callback)
                return closePopUp();
        }
    })


    return content;

    // box.classList.remove("loading");


}

function closePopUp() {
    let elem = document.querySelector(".fullScreenWr")
    document.body.removeChild(elem)
    document.body.style.overflow = null
}

async function fetchJson(url, obj) {
    let r = await fetch(url,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(obj)
        })

    if (r.ok)
        return await r.json()
    return null;
}

const postJson = fetchJson;

async function getJson(url) {
    let r = await fetch(url)
    if (r.ok)
        return await r.json()
    return null;
}


const getPhoto = async (aspectRatio = 4 / 5) => {
    return new Promise(async (responce, reject) => {
        let inp = document.createElement("input")
        inp.type = "file"
        inp.accept = "image/*"
        inp.addEventListener("change", getFile);
        inp.style.display = "none"
        document.body.appendChild(inp)
        inp.click()

        async function getFile(e) {

            let elem = document.createElement("div")
            elem.classList.add("fullScreenPhotoEditor")
            let res = await fetch("/photoEditor")
            if (!res.ok)
                return responce()
            elem.innerHTML = await res.text();
            document.body.appendChild(elem);
            elem.querySelectorAll(".fullScreenCloseNotSave").forEach(e => e.onclick = () => {
                document.body.removeChild(elem);
            })
            elem.onclick = () => {
                document.body.removeChild(elem);
            }
            elem.querySelector(".fullScreenBox").onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
            }
            var fr = new FileReader();
            fr.readAsDataURL(inp.files[0]);
            fr.onload = () => {
                let image = new Image();
                image.src = fr.result;
                image.onload = () => {
                    let coof = 800 / image.width;
                    let canvas = document.createElement('canvas');
                    canvas.width = coof * image.width;
                    canvas.height = coof * image.height;
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                    photoEditorImage.src = canvas.toDataURL('image/jpeg');
                    const cropper = new Cropper(photoEditorImage, {
                        aspectRatio: aspectRatio,//1,//    9/16
                        viewMode: 1,
                        autoCropArea: 1,
                        zoomable: true,
                    });
                    photoSaveBtn.onclick = () => {
                        if (photoSaveBtn.classList.contains("loading"))
                            return;
                        let txt = photoSaveBtn.innerHTML;

                        photoSaveBtn.innerHTML = "сохраняю..."
                        photoSaveBtn.classList.add("loading")
                        cropper.getCroppedCanvas().toBlob(async (blob) => {
                            let formData = new FormData()
                            formData.append('file', blob, 'userPhoto.png');


                            let ret = await fetch(frontUrl + "/api/uploadFile", {
                                method: 'post',
                                body: formData,
                            })

                            if (ret.ok)
                                responce(await ret.json())
                            document.body.removeChild(inp);
                            document.body.removeChild(elem);
                        }, 'image/png', 1)
                    }

                }

            }
        }
    })
}
const copyToClpboard = async (text) => {
    await navigator.clipboard.writeText(text)
}
const uploadUserFile = async (userid) => {
    let inp = document.createElement("input")
    inp.type = "file"
    inp.setAttribute("multiple", true)
    inp.click()
    inp.onchange = async () => {
        for (let file of inp.files) {
            let fileguid = await uploadUserFileDo(userid, file)
            if (fileguid) {
                let r = await fetch('/userFile/' + fileguid + "/" + userid)
                if (r.ok)
                    if (userDetailFiles)
                        userDetailFiles.innerHTML = await r.text() + userDetailFiles.innerHTML;
            }
        }
    }

}
const uploadUserFileDo = async (userid, file) => {
    formData = new FormData()
    formData.append('file', file, file.name);
    console.log(file)
    let ret = await fetch(frontUrl + "/api/uploadFile", {
        method: 'post',
        body: formData,
    })
    if (ret.ok) {
        let fileid = await ret.json();
        fetchJson("/api/userAddFile/", {userid, fileid})
        return fileid
    } else return null;
}
const downloadFile = (guid) => {
    document.location.href = frontUrl + "/static/file/" + guid
}
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
var dataURLToBlob = function (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}
const showSpeaker=async (id, lang)=>{
    await createPopUp("/popupSpeaker/"+id+"/"+lang,()=>{})
    let elem=document.querySelector(".fullScreencontent")
        elem.style.overflowY="inherit"
        elem.style.overflowX="visible"
}
const showSession=async (id, lang, isSpk=false)=>{
    let url="/popupSession/"+id+"/"+lang
    if(isSpk)
        url+="?spk=show"
    await createPopUp(url,()=>{})
    let elem=document.querySelector(".fullScreencontent")
    elem.style.overflowY="inherit"
    elem.style.overflowX="visible"
}
const clickMenuItem=(elemSelector, redirectPage, lang=null)=>{
    let elem=document.querySelector(elemSelector);
    if(elem)
    {
        closeMobileMenu();
        elem.scrollIntoView({behavior:'smooth'})
    }
    else {
        if(lang)
            redirectPage+="/"+lang
        document.location.href=redirectPage
    }
}
let head=document.querySelector(".upTarget")
let upBtn=document.querySelector(".upBtn")
if(head && upBtn){
    upBtn.addEventListener("click",()=>{
        head.scrollIntoView({behavior: "smooth"})
    })

    let options = {
        root: null,//элемент, который выступает в роли области просмотра для target (предок целевого элемента или null для viewport)
        rootMargin: '0px',//отступы вокруг root
        threshold: 0
    }
    let observer = new IntersectionObserver((entries, observer)=>{
        //console.log(entries[0], entries[0].isVisible)
        if(entries[0].isIntersecting)
            upBtn.classList.remove("active")
        else
            upBtn.classList.add("active")
    }, options)
        observer.observe(head)
}
function FSPhotoNext(ctrl){
    let box=ctrl.parentNode;
    let next =box.nextSibling;
    if(next){
        box.removeAttribute("active")
        next.setAttribute("active","active")
    }
}
function FSPhotoPrev(ctrl){
    let box=ctrl.parentNode;
    let next=box.previousSibling; // #foo1
    if(next){
        box.removeAttribute("active")
        next.setAttribute("active","active")
    }
}

let playBtnWr=document.querySelector(".playBtnWr")
if(playBtnWr)
    checkTrStatus(playBtnWr, document.querySelector(".playNoBtnWr"))

async function checkTrStatus(playBtnWr,playNoBtnWr){
    let r=await getJson("/checkTrStatus")
    if(r)
    {
        if(r.IsButton){
            document.querySelectorAll(".playBtnWr").forEach(b=>{
                b.style.display="block"
            })
            document.querySelectorAll(".playNoBtnWr").forEach(b=>{
                b.style.display="none"
            })

        }
        else
        {
            document.querySelectorAll(".playBtnWr").forEach(b=>{
                b.style.display="none"
            })
            document.querySelectorAll(".playNoBtnWr").forEach(b=>{
                b.style.display="block"
            })
        }
    }

    setTimeout(async ()=>{await checkTrStatus(playBtnWr,playNoBtnWr)},20*1000);
}
async function showRestorant(id){
    let dlg=await createPopUp("/fullScreenRestorant/"+id);
    document.querySelector(".fullScreenBox").classList.add("fsPhotoBoxFirst")
    //dlg.parentNode.style.maxWidth="600px"
    dlg.parentNode.style.padding=0;
    let img=document.querySelector(".FSPhotoItem");
    if(img)
    {
        img.setAttribute("active","active")
        img.classList.add("active")
    }
}
