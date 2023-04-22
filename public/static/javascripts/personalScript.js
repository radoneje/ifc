let personalApp=new Vue({
    app:"#app",
    data:{
        user:{}
    },
    methods:{},
    watch:{},
    mounted:async function(){
        //this.user=await getJson("/personal/data")
        loader.style.display="none"
        loader.style.display="block"
    }
})
