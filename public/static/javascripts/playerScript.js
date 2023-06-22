function initPlayer() {
    let playerApp = new Vue({
        el: "#playerWindow",
        data: {
            status:{},
            halls:[]
        },
        methods: {
            updateLiveStatus:async function(){
                let dt=await getJson("/liveStatus")
                if(dt.liveStatus.updateTime!=this.liveStatus.updateTime)
                    this.status=structuredClone(dt.liveStatus);
                if(this.halls!=dt.hallStatus){
                    this.halls!=dt.hallStatus;
                    console.log("update halls")
                }
                setTimeout(()=>{
                    this.updateLiveStatus();
                },10000)

            }
        },
        mounted: async function () {
            this.updateLiveStatus();
            setTimeout(() => {
                let loader = document.querySelector("#playerLoader")
                loader.parentNode.removeChild(loader)
                document.querySelector("#playerBox").style.display = "block"
            }, 2000)

        }
    })
}
initPlayer();


