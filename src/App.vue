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

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.js"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"

export default {
    name: "App",
    components: {Footer}
}
</script>