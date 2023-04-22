let personalApp=new Vue({
    app:"#app",
    data:{
        user:{}
    },
    methods:{},
    watch:{},
    mounted:async function(){
        console.log("mounted")
        //this.user=await getJson("/personal/data")
        loader.style.display="none"
        app.style.display="block"
    }
})
