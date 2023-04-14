let regApp = new Vue({
    el: "#registration",
    data: {
        user: {
            isPaySelf: false,
            company: {isEdo: false},
            //payCompany: {isEdo: false},
            isProxy: false,
            isPersonalAgreement: false,
            isTerms: false,

        },
        isPayCompany: false,
        innStatus: {state: 0, message: "", isInnReadony: false},
        innPayStatus: {state: 0, message: "", isInnReadony: false},
        errors: {company: {}, payCompany: {}},
        photoError: false,
        isPersonalAgreementError: false,

        isTermsError: false,
        isRegSuccess: false,
        isLodinng: false

    },
    methods: {
        uploadPhoto: async function () {

            this.photoIsLoading = true;
            try {
                this.user.photoid = await getPhoto();
            }
            catch (e) {
                alert("err: "+e.message);
            }
            this.$forceUpdate();
            this.photoError = false;

        },
        clear: function (sect) {
            this.user[sect] = {inn: this.user[sect].inn};
            console.log("clear")
            if (sect == "company")
                this.innStatus = {state: 0, message: "", isInnReadony: false}
            else
                this.innPayStatus = {state: 0, message: "", isInnReadony: false}
            //this.$forceUpdate();
        },
        regUser: async function () {
            this.errors = {company: {}, payCompany: {}}


            if (!this.user.photoid) {
                this.photoError = true;
                document.querySelector(".reqPhoto2").scrollIntoView({
                    behavior: 'smooth'
                });
                return;
            }
            if (this.innStatus.state != 2) {

                this.innStatus = {state: 0, message: "Загрузите дынные из ФНС"};
                document.getElementById("inn").focus();
                return;
            }
            if (this.isPayCompany && this.innPayStatus.state != 2) {

                this.innPayStatus = {state: 0, message: "Загрузите дынные из ФНС"};
                document.getElementById("payInn").focus();
                return;
            }
            if(this.user.phone)
            this.user.phone = this.user.phone.replace(/[^\d.-]+/g, '') // remove all non-digits except - and .
                .replace(/^([^.]*\.)|\./g, '$1') // remove all dots except first one
                .replace(/(?!^)-/g, '') // remove all hyphens except first one

            let elems = registration.querySelectorAll("input[must]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!this.user[sect]) {
                    this.errors[sect] = true;
                }
            })
            elems = registration.querySelectorAll("input[email]");
            elems.forEach(e => {
                let sect = e.getAttribute("name")
                if (!this.user[sect] || !validateEmail(this.user[sect])) {
                    this.errors[sect] = true;
                }
            })

            setTimeout(async () => {
                let arr = []
                arr.push(...registration.querySelectorAll(".regRow.error"));

                if (arr.length > 0) {
                    arr[0].scrollIntoView({
                        behavior: 'smooth'
                    });
                    return
                }
                this.isPersonalAgreementError = this.user.isPersonalAgreement ? false : true

                this.isTermsError = this.user.isTerms ? false : true
                if (this.isPersonalAgreementError || this.isTermsError)
                    return;

                if(typeof( type)!="undefined")
                    this.user.types=[{id:type}]
                //////////сюда вставляем код регистрации
                this.isLodinng = true
                let res = await postJson(apiUrl + "/api/regUser2", this.user)
                if (!res) {
                    alert("Произошла ошибка, попробуйте позже")
                    this.isLodinng = false
                    return
                }

                 res = await getJson(apiUrl + "/api/userToApprove/"+ res.user.guid)
                setTimeout(() => {
                    this.isLodinng = false
                    this.isRegSuccess = true;
                }, 2000)

            }, 0)
        },
        changeEdo: function () {
            this.user.company.isEdo = this.toggle(this.user.company.isEdo)
            this.$forceUpdate();
        },
        toggle: function (data) {

            data = data ? false : true;

            setTimeout(() => {
                //this.$forceUpdate();
            }, 0)
            return data;
        },
        loadCompanyInn: async function () {
            return await this.loadInn("company", this.innStatus)
        },
        loadInn: async function (sect, state, inputElemId = "inn") {
            if (state.state == 1)
                return;

            state.state = 1
            state.message = ""
            const error = () => {
                this.errors[sect].inn = true;
                state.state = -1
                this.$forceUpdate();
                document.getElementById(inputElemId).focus();
            }
            if (!this.user[sect].inn)
                return error();
            if (this.user[sect].inn.length < 10)
                return error();
            try {
                let res = await fetch(apiUrl + "/api/loadCompanyByINN/" + this.user[sect].inn)
                if (!res.ok) {
                    state.message = "Компания не найдена, проверьте ИНН"
                    return error();
                }
                let data = await res.json();
                if (data.count < 1) {
                    state.message = "Компания не найдена, проверьте ИНН"
                    return error();
                }

                //let edo=this.user.company.isEdo || false;
                this.user[sect] = data.dt;
                this.user[sect].phone = this.user.phone
                this.user[sect].signater = this.user[sect].director + " на основании Устава"
                //this.user.company.isEdo=edo

                state.state = 2

                this.errors[sect].inn = false;
                state.isInnReadony = true;
                this.$forceUpdate();
            } catch (e) {
                state.message = "Произошла ошибка, проверьте ИНН"
                return error()
            }

        }
    },
    watch: {
        user: function () {

        }
    },
    mounted: async function () {

    }
})
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
