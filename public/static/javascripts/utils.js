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
    close.innerHTML = "X"
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


const getPhoto = async (aspectRatio=4/5) => {
    return new Promise(async (responce, reject) => {
        let inp = document.createElement("input")
        inp.type = "file"
        inp.accept = "image/*"
        inp.setAttribute("capture","capture")
        inp.click()
        inp.onchange = async () => {
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
                image.onload=()=>{
                    let coof=800/image.width;
                    let canvas = document.createElement('canvas');
                    canvas.width = coof*image.width;
                    canvas.height = coof*image.height;
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                    photoEditorImage.src=canvas.toDataURL('image/jpeg');
                    const cropper = new Cropper(photoEditorImage, {
                        aspectRatio: aspectRatio,//1,//    9/16
                        viewMode: 1,
                        autoCropArea: 1,
                        zoomable: false,
                    });
                    photoSaveBtn.onclick = () => {
                        if(photoSaveBtn.classList.contains("loading"))
                            return;
                        let txt=photoSaveBtn.innerHTML;

                        photoSaveBtn.innerHTML="сохраняю..."
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
var dataURLToBlob = function(dataURL) {
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


