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
                            <b-alert v-if="login.status" :variant="messages[login.status].type" show>{{messages[login.status].message}}</b-alert>
                            <form @submit.prevent="submit_login">
                                <div class="form-group m-2">
                                    <label for="email">Email</label>
                                    <input type="email" name="email" v-model="login.email" class="form-control text-center" placeholder="jankowalski@example.com" autofocus autocomplete required>
                                </div>
                                <div class="form-group m-2">
                                    <label for="password">Hasło</label>
                                    <input type="password" name="password" v-model="login.password" class="form-control text-center" placeholder="*********" autocomplete="current-password" required>
                                </div>
                                <button v-if="loading" type="submit" class="btn btn-primary m-2 d-block float-end" disabled><Loader v-if="loading" class="d-inline-block" color="white" :size="10" sizeUnit="px" /></button>
                                <button v-else type="submit" class="btn btn-primary m-2 d-block float-end">Zaloguj</button>
                            </form>
                        </b-tab>

                        <b-tab>
                            <template #title>
                                <i class="fas fa-user-plus"></i> Rejestracja
                            </template>
                            <h2 class="h5 m-3">Zarejestruj się</h2>
                            <b-alert v-if="register.status" :variant="messages[register.status].type" show>{{messages[register.status].message}}</b-alert>
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
                                <button v-if="loading" type="submit" class="btn btn-primary m-2 d-block float-end" disabled><Loader v-if="loading" class="d-inline-block" color="white" :size="10" sizeUnit="px" /></button>
                                <button v-else type="submit" class="btn btn-primary m-2 d-block float-end">Zarejestruj</button>                            </form>
                        </b-tab>
                            
                    </b-tabs>
                </div>
            </div>
        </div>
        <particles-bg class="z-index-1" type="thick" :canvas="{backgroundColor:'#888'}" :bg="true" />
    </header>
</template>

<script>
import {ParticlesBg} from "particles-bg-vue";
import {PulseLoader} from "@saeris/vue-spinners"

export default {
    name: "Login",
    components: {
        ParticlesBg,
        Loader: PulseLoader
    },
    methods: {
        submit_login: async function() {
            this.loading = true;
            if(!this.login.email || !this.login.password) return;
            const {email, password} = this.login;
            const res = await fetch("/api/user/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });
            const body = await res.json();
            body.success ? this.$router.push("/panel") : this.login.status = body.error;
            return this.loading = false;
        },
        submit_register: async function() {
            this.loading = true;
            if(!this.register.username || !this.register.email || !this.register.password || !this.register.repeat_password) return;
            if(this.register.password !== this.register.repeat_password) {
                this.register.status = "PASSWORD_NOT_MATCH";
                return this.loading = false;
            }
            const {username, email, password} = this.register;
            const res = await fetch("/api/user/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password})
            });
            const body = await res.json();
            this.register.status = body.success ? "REGISTER_SUCCESS" : body.error;
            return this.loading = false;
        }
    },
    data() {
        return {
            login: {
                email: null,
                password: null,
                status: null,
            },
            register: {
                username: null,
                email: null,
                password: null,
                repeat_password: null,
                status: null
            },
            loading: false,
            messages: {
                PASSWORD_NOT_MATCH: {
                    message: "Hasła się nie zgadzają.",
                    type: "danger"
                },
                INCORRECT_DATA: {
                    message: "Nie podano wszystkich danych lub są one zbyt obszerne.",
                    type: "danger"
                },
                UNKNOWN_ERROR: {
                    message: "Wystąpił nieznany błąd.",
                    type: "danger"
                },
                USER_ALREADY_EXISTS: {
                    message: "Konto z takimi danymi już jest zarejestrowane.",
                    type: "danger"
                },
                REGISTER_SUCCESS: {
                    message: "Zarejestrowano pomyślnie. Teraz możesz się zalogować.",
                    type: "success"
                },
                WRONG_PASSWORD: {
                    message: "Podane dane logowania są nieprawidłowe.",
                    type: "danger"
                }
            }
        }
    }
}
</script>