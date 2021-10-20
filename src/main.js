import Vue from "vue"
import Bootstrap from "bootstrap-vue"
import {VueSpinners} from "@saeris/vue-spinners"

import "vanilla-hcaptcha"

import App from "./App.vue"
import router from "./router.js"

Vue.config.productionTip = false

Vue.use(Bootstrap)
Vue.use(VueSpinners)

Vue.config.ignoredElements = [
    "h-captcha"
];

new Vue({
    router,
    render: h => h(App)
}).$mount("#app")