<template>
    <main>
        <div class="container">
            <div class="header">
                <div class="header-content">
                    <hgroup>
                        <h1 class="err display-1 text-white">500</h1>
                        <h2 class="err h4 text-white">Wewnętrzny błąd serwera.</h2>
                    </hgroup>
                </div>
            </div>
        </div>
        <particles-bg class="z-index-1" type="thick" :canvas="{backgroundColor:'#888'}" :bg="true" />
    </main>
</template>

<script>
import {ParticlesBg} from "particles-bg-vue";

export default {
    name: "500",
    components: {
        ParticlesBg
    }
}
</script>