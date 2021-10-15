<template>
    <div id="app">
        <main role="main">
            <router-view />
        </main>
        <Footer />
    </div>
</template>

<script>

import Footer from "./views/components/Footer.vue"

import "./assets/css/main.css"


export default {
    name: "App",
    components: {Footer}
}
</script>