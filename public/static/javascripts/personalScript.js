console.log("mounted")
let personalApp=new Vue({
    el:"#app",
    data:{
        section:"profile",
        user:{},
        isLoading:false,
        isComplite:false,
        errors: {company: {}, payCompany: {}},
        innStatus: {state: 0, message: "", isInnReadony: false},
        innError:false,
    },
    methods:{
        loadInn:async function(state){
            if (state.state == 1)
                return;

            state.state = 1
            state.message = ""
            const error = () => {
                this.innError= true;
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
                this.user.payCompany.signater = this.user[sect].director + " на основании Устава"
                //this.user.company.isEdo=edo
                this.innError=false;
                state.state = 2


                state.isInnReadony = true;
                this.$forceUpdate();
            } catch (e) {
                state.message = "Произошла ошибка, проверьте ИНН"
                return error()
            }


        },
        getDocumentsFromMainCompany:async function(){
            this.isLoading=true
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
            }
            catch (e){
                alert("произошла ошибка, попробуйте позже")
                this.isLoading = false
            }

        },
        isPayCompany: function (){
            this.user.payCompany={}
            this.$forceUpdate();
            setTimeout(()=>{
                document.querySelector(".persHead").scrollIntoView();
                inn.focus();
            },0)
        },
        changeCompanyEdo:function(){
          this.user.company.isEdo= this.user.company.isEdo?false:true
        },
        setPaySelf:async function(isPaySelf) {
            let res = await postJson("/personal/setPaySelf",{isPaySelf})

            this.user=res;
        },
        saveUser:async function() {
            if(this.isLoading)
                return;
            this.errors = {company: {}, payCompany: {}}
            if(this.user.phone)
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
            setTimeout(async ()=>{
                let arr = []
                arr.push(...document.body.querySelectorAll(".persBodyR .regRow.error"));

                if (arr.length > 0) {
                    arr[0].scrollIntoView({
                        behavior: 'smooth'
                    });
                    return
                }
                this.isLoading = true
                let res = await postJson("/personal/changeUser", {photoid:this.user.photoid, companyShort:this.user.companyShort,phone:this.user.phone, email:this.user.email})
                if (!res) {
                    alert("Произошла ошибка, попробуйте позже")
                    this.isLoading = false
                    return
                }
                setTimeout(()=>{
                    this.isLoading = false
                    this.isComplite=true;
                    setTimeout(()=>{
                        this.isComplite=false;
                    },4000)

                },2000)

            },0)
        },

        uploadPhoto:async function(){
            let photoid=await getPhoto(4/5)
            if(photoid)
                this.user.photoid=photoid;
        },
    },
    watch:{},
    mounted:async function(){
        console.log("mounted 1")
        this.user=await getJson("/personal/data")
        setTimeout(()=>{
            loader.style.display="none"
            app.style.display="block"
        },500)

    }
})
