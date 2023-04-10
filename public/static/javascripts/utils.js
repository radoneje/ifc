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
    let elem=document.querySelector(".fullScreenWr")
    document.body.removeChild(elem)
    document.body.style.overflow = null
}
async function fetchJson(url, obj){
    let r=await fetch(url,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(obj)
        })

    if(r.ok)
        return await r.json()
    return null;

}
