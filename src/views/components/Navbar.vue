<template>
    <nav class="navbar navbar-expand-md fixed-top navbar-dark bg-primary">
        <div class="container-fluid">
            <router-link to="/panel" class="navbar-brand">System zgłoszeń</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link to="/panel" class="nav-link"><i class="fas fa-list"></i> Lista zgłoszeń</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/panel/settings" class="nav-link"><i class="fas fa-user-cog"></i> Ustawienia konta</router-link>
                    </li>
                </ul>
                <a href="#" @click="logout" class="nav-link logout"><i class="fas fa-sign-out-alt"></i> Wyloguj</a>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: "Navbar",
    methods: {
        logout: async function() {
            await fetch("/api/user/logout");
            this.$router.push("/");
        }
    }
}
</script>