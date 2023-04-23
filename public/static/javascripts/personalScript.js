console.log("mounted")
let personalApp=new Vue({
    el:"#app",
    data:{
        section:"profile",
        user:{},
        isLoading:false,
        isComplite:false,
        errors: {company: {}, payCompany: {}},


    },
    methods:{
        isPayCompany: function (){
            this.user.payCompany={}
            this.$forceUpdate();
            setTimeout(()=>{
                document.querySelector(".persHead").scrollIntoView();
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
