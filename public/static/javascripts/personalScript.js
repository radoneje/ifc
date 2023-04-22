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
        saveUser:async function() {
            this.errors = {company: {}, payCompany: {}}
            if(this.user.phone)
                this.user.phone = this.user.phone.replace(/[^\d.-]+/g, '') // remove all non-digits except - and .
                    .replace(/^([^.]*\.)|\./g, '$1') // remove all dots except first one
                    .replace(/(?!^)-/g, '') // remove all hyphens except first one

            let elems = document.querySelector(".persBodyR").querySelectorAll("input[must]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!this.user[sect]) {
                    this.errors[sect] = true;
                }
            })
            elems = registration.querySelectorAll(".persBodyR input[email]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!this.user[sect] || !validateEmail(this.user[sect])) {
                    this.errors[sect] = true;
                }
            })
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
