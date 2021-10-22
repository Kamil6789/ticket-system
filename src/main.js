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

router.afterEach((to) => {
    Vue.nextTick(() => {
        document.title = `${to.meta.title} | System zgłoszeń`.replace("{ID}", to.params.id)
    });
});

new Vue({
    router,
    render: h => h(App)
}).$mount("#app")