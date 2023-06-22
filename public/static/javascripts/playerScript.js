function initPlayer() {
    let playerApp = new Vue({
        el: "playerWindow",
        data: {},
        methods: {},
        mounted: async function () {
            console.log("playerScript")
            setTimeout(() => {
                let loader = document.querySelector("#playerLoader")
                loader.parentNode.removeChild(loader)
                document.querySelector("#playerBox").style.display = "block"
            }, 2000)

        }
    })
}
initPlayer();


