<template>
    <div id="app">
        <main role="main">
            <Error500 v-if="err500" />
            <router-view v-else />
        </main>
    </div>
</template>

<script>

import "./assets/css/main.css"
import "./assets/css/login.css"

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.js"


import Error500 from "./views/errors/Error500.vue"

export default {
    name: "App",
    components: {Error500},
    async created() {
        const res = await fetch("/api/user/info");
        if(res.status == 500) return this.err500 = true;
        const body = await res.json();
        if(body.success && window.location.pathname == "/") this.$router.push("/panel");
        else if(window.location.pathname.startsWith("/panel") && !body.success) this.$router.push("/");
    },
    data() {
        return {
            err500: false
        }
    }
}
</script>