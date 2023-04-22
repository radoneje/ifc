console.log("mounted")
let personalApp=new Vue({
    el:"#app",
    data:{
        section:"profile",
        user:{}
    },
    methods:{
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
