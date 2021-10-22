<template>
    <div class="container">
        <div v-if="!loading.all" class="content">
            <h1 class="text-center m-5">Ustawienia</h1>
        </div>
        <Loader v-else class="loader" color="#000" :width="400" :height="5" :sizeUnit="px" />
    </div>
    
</template>

<script>
import {BarLoader} from "@saeris/vue-spinners"

export default {
    name: "Settings",
    components: {
        Loader: BarLoader
    },
    async created() {
        this.loading.all = true;
        const res = await fetch("/api/user/info");
        const body = await res.json();
        this.user = body.user;
        this.loading.all = false;
    },
    data() {
        return {
            user: null,
            loading: {
                all: true,
                email: false,
                password: false
            }
        }
    }
}
</script>