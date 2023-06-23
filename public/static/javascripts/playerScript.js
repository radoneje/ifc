"use strict";

function initPlayer() {
    let playerApp = new Vue({
        el: "#playerWindow",
        data: {
            status: {},
            halls: [],
            hallsUpdateTime: 0,
            activeHall: null,
        },
        methods: {
            updateLiveStatus: async function () {
                let dt = await getJson("/liveStatus")
                if (dt.liveStatus.updateTime != this.status.updateTime)
                    this.status = (dt.liveStatus);
                let maxTime = 0;
                dt.hallStatus.forEach(h => {
                    maxTime = Math.max(h.updateTime, maxTime)
                })
                if (dt.hallStatus.length > 0)
                    if (this.halls.length != dt.hallStatus.length || maxTime != this.hallsUpdateTime) {
                        this.hallsUpdateTime = maxTime
                        this.halls = dt.hallStatus;
                        if (!this.activeHall)
                            this.activeHall = this.halls[0]
                        if (this.halls.filter(h => h.id == this.activeHall.id).length == 0)
                            this.activeHall = this.halls[0]

                        console.log("update halls")
                    }
                setTimeout(() => {
                    this.updateLiveStatus();
                }, 10000)

            }
        },
        mounted: async function () {
            console.log("this")
            this.updateLiveStatus();
            setTimeout(() => {
                let loader = document.querySelector("#playerLoader")
                if(loader) {
                    loader.parentNode.removeChild(loader)
                    document.querySelector("#playerBox").style.display = "block"
                }
            }, 2000)

        }
    })
}

initPlayer();


