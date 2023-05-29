console.log("mounted")
let personalApp = new Vue({
    el: "#app",
    data: {
        section: "profile",
        user: {},
        isLoading: false,
        isComplite: false,
        errors: {company: {}, payCompany: {}},
        innStatus: {state: 0, message: "", isInnReadony: false},
        innError: false,
        feedback: {text: "", files: []},
        newInfo: 0,
        badgeDelivery:{
            nameRecipient:"",
            phone:"",
            address:"",
            dateDelivery:"",
            timeDelivery:"",
            otherParticipaintsNames:""
        },
        transfers:{arrival:{from:"", hotel:"", date:"", time:""},departure:{from:"", date:"", time:""}}

    },
    methods: {
        sendBadgeDelivery: async function (event) {
            let error=false
            document.querySelectorAll(".bageInput.must").forEach(box=>{
                box.classList.remove("error")
                let input=box.querySelector("input")
                if(!input.value || input.value.length==0)
                {
                    error=true;
                    box.classList.add("error")
                }
            })
            if(error)
                return document.querySelector(".bageInput.must.error input").focus()
            this.isLoading=true;
            console.log(this.badgeDelivery)
            this.badgeDelivery=await postJson("/personal/badgeDelivery",this.badgeDelivery)
            console.log(this.badgeDelivery)
            setTimeout(()=>{this.isLoading=false}, 2000)

        },
        selectTransferDialog: function (event) {
            let box=event.target.closest(".bageInput")
            let input=box.querySelector("input")
            this.transfers[input.getAttribute("field")][input.getAttribute("subfield")]=event.target.innerText;
            this.closeBageDialog(event);

        },
        selectBageDialog: function (event) {
            let box=event.target.closest(".bageInput")

            this.badgeDelivery[box.querySelector("input").getAttribute("field")]=event.target.innerText;

            this.closeBageDialog(event);

        },
        closeBageDialog: function (event) {
            document.querySelectorAll(".bageInput").forEach(e=>{
                e.classList.remove("active")
            })
        },
        showBageDialog: function (event) {
            event.target.closest(".bageInput").classList.add("active")
        },
        checkIsOld: function (infoItem) {
            console.log("checkIsOld", infoItem)
        },
        personalMobileMenuClose: function () {
            document.body.style.overflow = null;
            document.querySelector(".persBodyL").classList.remove("persMobileMenu")
        },
        personalMobileMenuShow: function () {
            document.body.style.overflow = "hidden"
            document.querySelector(".persBodyL").classList.add("persMobileMenu")
        },
        bookRoom: async function (roomid, hotel) {
            if (confirm("Вы хотите подать заявку на бронирование номера в отеле " + hotel + "?")) {
                this.user.roomid = roomid;
                await postJson("/personal/hotelRoom/", {roomid})
            }
        },
        getHtml: function (txt) {
            if (txt) {
                txt.replace(/<[^>]*>?/gm, '');
                return urlify(txt)
            } else
                return ""

        },
        sendFeedback: async function (ru=true) {
            if (this.isLodinng)
                return
            if (this.feedback.text.length < 2) {
                document.querySelector(".personalFeedback").focus();
                return;
            }
            let filesguid = []
            let err = false;
            this.feedback.files.forEach(file => {
                if (file.loading)
                    err = true
                if (file.guid)
                    filesguid.push(file.guid)
            })
            if (err) {
                if(ru)
                alert("Не все файлы загружены, подождите")
                else
                    alert("Any files is loading, pleas wailt")
                return;
            }
            this.isLoading = true;
            let msg = {text: this.feedback.text, files: filesguid}
            await postJson("/personal/feedbackMessage", msg)
            this.feedback = {text: "", files: []}
            if(ru)
            alert("Сообщение отправлено")
            else
                alert("The message is send successfully")

            this.isLoading = false;
        },
        feedbackAddFile: async function () {
            let inp = document.createElement("input")
            inp.type = "file"
            // inp.accept = "*"

            inp.style.display = "none"
            document.body.appendChild(inp)
            inp.click()
            inp.addEventListener("change", async () => {

                for (let file of inp.files) {
                    let fileItem = {name: file.name, guid: null, loading: true}
                    this.feedback.files.push(fileItem)
                    let formData = new FormData()
                    formData.append('file', file, file.originalname);
                    let ret = await fetch(apiUrl + "/api/uploadFile", {
                        method: 'post',
                        body: formData,
                    })

                    if (ret.ok)
                        fileItem.guid = (await ret.json())
                    fileItem.loading = false
                }
            });

        },
        returnToPaymentSelect: async function () {
            this.isLoading = true
            try {
                let res = await postJson("/personal/returnToPaymentSelect", {})
                setTimeout(() => {
                    this.user = res;
                    this.isLoading = false
                }, 2000)
            } catch (e) {
                alert("произошла ошибка, попробуйте позже")
                this.isLoading = false
                console.warn(e)
            }
        },
        changePayCompanyInn: function () {
            this.user.payCompany.name = null;
        },
        loadInn: async function (state) {
            if (state.state == 1)
                return;

            state.state = 1
            state.message = ""
            const error = () => {
                this.innError = true;
                state.state = -1
                this.$forceUpdate();
                document.getElementById("inn").focus();
            }
            if (!this.user.payCompany.inn)
                return error();
            if (this.user.payCompany.inn.length < 10)
                return error();
            try {
                let res = await fetch(apiUrl + "/api/loadCompanyByINN/" + this.user.payCompany.inn)
                if (!res.ok) {
                    state.message = "Компания не найдена, проверьте ИНН"
                    return error();
                }
                let data = await res.json();
                if (data.count < 1) {
                    state.message = "Компания не найдена, проверьте ИНН"
                    return error();
                }

                //let edo=this.user.company.isEdo || false;
                this.user.payCompany = data.dt;
                this.user.payCompany.phone = this.user.phone
                this.user.payCompany.signater = this.user.payCompany.director + " на основании Устава"
                this.user.company.isEdo = false
                this.innError = false;
                state.state = 2


                state.isInnReadony = true;
                this.$forceUpdate();
            } catch (e) {
                state.message = "Произошла ошибка, проверьте ИНН"
                return error()
            }


        },
        getDocumentsFromPayCompany: async function () {
            this.isLoading = true
            try {
                let res = await postJson("/personal/getDocumentsFromPayCompany", {
                    payCompany: this.user.payCompany
                })
                setTimeout(() => {
                    this.user = res;
                    this.isLoading = false
                }, 2000)
            } catch (e) {
                alert("произошла ошибка, попробуйте позже")
                this.isLoading = false
                console.warn(e)
            }

        },
        getDocumentsFromMainCompany: async function () {
            this.isLoading = true
            try {
                let res = await postJson("/personal/getDocumentsFromMainCompany", {
                    isEdo: this.user.company.isEdo,
                    phone: this.user.company.phone,
                    signater: this.user.company.signater,
                    companyguid: this.user.company.guid
                })
                setTimeout(() => {
                    this.user = res;
                    this.isLoading = false
                }, 2000)
            } catch (e) {
                alert("произошла ошибка, попробуйте позже")
                this.isLoading = false
            }

        },
        isPayCompany: function () {
            this.user.payCompany = {}
            this.$forceUpdate();
            setTimeout(() => {
                document.querySelector(".persHead").scrollIntoView();
                inn.focus();
            }, 0)
        },
        changePayCompanyEdo: function () {
            this.user.payCompany.isEdo = this.user.payCompany.isEdo ? false : true
            this.$forceUpdate();
        },
        changeCompanyEdo: function () {
            this.user.company.isEdo = this.user.company.isEdo ? false : true
        },
        setPaySelf: async function (isPaySelf) {
            let res = await postJson("/personal/setPaySelf", {isPaySelf})

            this.user = res;
        },
        saveUser: async function () {
            if (this.isLoading)
                return;
            this.errors = {company: {}, payCompany: {}}
            if (this.user.phone)
                this.user.phone = this.user.phone.replace(/[^\d.-]+/g, '') // remove all non-digits except - and .
                    .replace(/^([^.]*\.)|\./g, '$1') // remove all dots except first one
                    .replace(/(?!^)-/g, '') // remove all hyphens except first one

            let elems = document.body.querySelectorAll(".persBodyR input[must]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!this.user[sect]) {
                    this.errors[sect] = true;
                }
            })
            elems = document.body.querySelectorAll(".persBodyR input[email]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!(this.user[sect] && validateEmail(this.user[sect]))) {
                    this.errors[sect] = true;
                }
            })
            setTimeout(async () => {
                let arr = []
                arr.push(...document.body.querySelectorAll(".persBodyR .regRow.error"));

                if (arr.length > 0) {
                    arr[0].scrollIntoView({
                        behavior: 'smooth'
                    });
                    return
                }
                this.isLoading = true
                let res = await postJson("/personal/changeUser", {
                    photoid: this.user.photoid,
                    companyShort: this.user.companyShort,
                    phone: this.user.phone,
                    email: this.user.email,
                    position: this.user.position,
                    postAddress: this.user.postAddress
                })
                if (!res) {
                    alert("Произошла ошибка, попробуйте позже")
                    this.isLoading = false
                    return
                }
                setTimeout(() => {
                    this.isLoading = false
                    this.isComplite = true;
                    setTimeout(() => {
                        this.isComplite = false;
                    }, 4000)

                }, 2000)

            }, 0)
        },

        uploadPhoto: async function () {
            let photoid = await getPhoto(4 / 5)
            if (photoid)
                this.user.photoid = photoid;
        },
    },
    watch: {
        section: function () {
            if (this.section == "info") {

                this.newInfo = 0
                this.user.info.forEach(i => {
                    try {
                        localStorage.setItem("info_" + i.id, new Date())
                    } catch (e) {
                        console.warn(e)
                    }
                })
            }
        }
    },
    mounted: async function () {

        this.user = await getJson("/personal/data")
        if(this.user.info)
        this.user.info.forEach(i => {
            try {
                let storage = localStorage.getItem("info_" + i.id)
                if (!storage)
                    this.newInfo++;
            } catch (e) {
                console.warn(e)
                this.newInfo++;
            }
        })

        setTimeout(async () => {
            loader.style.display = "none"
            app.style.display = "block";
             let r= await getJson("/personal/badgeDelivery")
            if(r)
                this.badgeDelivery=r;
        }, 500)

    }
})
