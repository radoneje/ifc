console.log("mounted")
let personalApp=new Vue({
    el:"#app",
    data:{
        user:{}
    },
    methods:{},
    watch:{},
    mounted:async function(){
        console.log("mounted 1")
        //this.user=await getJson("/personal/data")
        loader.style.display="none"
        app.style.display="block"
    }
})