function initPlayer() {
    let playerApp = new Vue({
        el: "#playerWindow",
        data: {
            status:{},
            halls:[],
            hallsUpdateTime:0
        },
        methods: {
            updateLiveStatus:async function(){
                let dt=await getJson("/liveStatus")
                if(dt.liveStatus.updateTime!=this.status.updateTime)
                    this.status=structuredClone(dt.liveStatus);
                let maxTime=0;
                dt.hallStatus.forEach(h=>{
                    maxTime=Math.max(h.updateTime, maxTime)
                })
                if(this.halls.length!=dt.hallStatus.length || maxTime!=this.hallsUpdateTime ){
                    this.hallsUpdateTime=maxTime
                    this.halls=dt.hallStatus;
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


