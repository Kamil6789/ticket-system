<template>
    <div id="app">
        <Navbar />
        <main role="main">
            <router-view />
        </main>
        <Footer />
    </div>
</template>

<script>

import Navbar from "./views/components/Navbar.vue"
import Footer from "./views/components/Footer.vue"

import "./assets/css/main.css"


export default {
    name: "App",
    components: {Navbar, Footer}
}
</script>