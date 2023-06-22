function initPlayer() {
    let playerApp = new Vue({
        el: "playerWindow",
        data: {
            status:{}
        },
        methods: {
            updateLiveStatus:async function(){
                let dt=await getJson("/liveStatus")
                if(dt.updateTime!=this.status.updateTime)
                    this.status=structuredClone(dt);

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


