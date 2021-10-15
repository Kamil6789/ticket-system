import Vue from "vue"
import Bootstrap from "bootstrap-vue"

import App from "./App.vue"
import router from "./router.js"

Vue.config.productionTip = false

Vue.use(Bootstrap)

new Vue({
    router,
    render: h => h(App)
}).$mount("#app")