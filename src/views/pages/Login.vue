<template>
    <header>
        <div class="container">
            <div class="header">
                <div class="header-content rounded shadow-lg p-3 mb-5 bg-white">
                    <h1 class="h2">System zgłoszeń</h1>
                    <b-tabs align="center" content-class="mt-3" class="mt-2 p-3">
                        <b-tab active>
                            <template #title>
                                <i class="fas fa-sign-in-alt"></i> Logowanie
                            </template>
                            <h2 class="h5 m-3">Zaloguj się</h2>
                            <form @submit.prevent="submit_login">
                                <div class="form-group m-2">
                                    <label for="email">Email</label>
                                    <input type="email" name="email" v-model="login.email" class="form-control text-center" placeholder="jankowalski@example.com" autofocus autocomplete required>
                                </div>
                                <div class="form-group m-2">
                                    <label for="password">Hasło</label>
                                    <input type="password" name="password" v-model="login.password" class="form-control text-center" placeholder="*********" autocomplete="current-password" required>
                                </div>
                                <button type="submit" class="btn btn-primary m-2 d-block float-end">Zaloguj</button>
                            </form>
                        </b-tab>

                        <b-tab>
                            <template #title>
                                <i class="fas fa-user-plus"></i> Rejestracja
                            </template>
                            <h2 class="h5 m-3">Zarejestruj się</h2>
                            <form @submit.prevent="submit_register">
                                <div class="form-group m-2">
                                    <label for="username">Nazwa</label>
                                    <input type="text" name="username" v-model="register.username" class="form-control text-center" placeholder="Jan Kowalski" autocomplete required>
                                </div>
                                <div class="form-group m-2">
                                    <label for="email">Email</label>
                                    <input type="email" name="email" v-model="register.email" class="form-control text-center" placeholder="jankowalski@example.com" autocomplete required>
                                </div>
                                <div class="form-group m-2">
                                    <label for="password">Hasło</label>
                                    <input type="password" name="password" v-model="register.password" class="form-control text-center" placeholder="********" autocomplete="new-password" required>
                                </div>
                                <div class="form-group m-2">
                                    <label for="password">Powtórz hasło</label>
                                    <input type="password" name="repeat_password" v-model="register.repeat_password" class="form-control text-center" placeholder="********" autocomplete="new-password" required>
                                </div>
                                <button type="submit" class="btn btn-primary m-2 d-block float-end">Zarejestruj</button>
                            </form>
                        </b-tab>
                            
                    </b-tabs>
                </div>
            </div>
        </div>
        <particles-bg class="z-index-1" type="tadpole" :canvas="{backgroundColor:'#888'}" :bg="true" />
    </header>
</template>

<script>
import {ParticlesBg} from "particles-bg-vue";

export default {
    name: "Login",
    components: {
        ParticlesBg
    },
    methods: {
        submit_login: async function() {
            console.log("Login")
        },
        submit_register: async function() {
            console.log("Register")
        }
    },
    data() {
        return {
            login: {
                email: null,
                password: null,
            },
            register: {
                username: null,
                email: null,
                password: null,
                repeat_password: null,
            }
        }
    }
}
</script>