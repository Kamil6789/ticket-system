<template>
    <div class="container">
        <div v-if="!loading.all" class="content">
            <h1 class="text-center m-5">Ustawienia</h1>

            <b-alert v-if="email.status" :variant="messages[email.status].type" show>{{messages[email.status].message}}</b-alert>
            <form @submit.prevent="submit_newemail">
                <h4>Zmień email</h4>
                <div class="form-group m-2">
                    <label for="email">Nowy email</label>
                    <input type="email" name="email" v-model="email.email" class="form-control text-center" required autocomplete>
                </div>
                <button v-if="loading.email" type="submit" class="btn btn-primary m-2 d-block float-end" disabled><FormLoader v-if="loading" class="d-inline-block" color="white" :size="10" sizeUnit="px" /></button>
                <button v-else type="submit" class="btn btn-primary m-2 d-block float-end">Zmień email</button>
            </form>

            <br />
            <b-alert v-if="password.status" :variant="messages[password.status].type" show>{{messages[password.status].message}}</b-alert>
            <form @submit.prevent="submit_newpassword">
                <div class="form-group m-2">
                    <label for="old_password">Stare hasło</label>
                    <input type="password" name="old_password" v-model="password.old_password" class="form-control text-center" autocomplete="current-password" required>
                </div>
                <div class="form-group m-2">
                    <label for="new_password">Nowe hasło</label>
                    <input type="password" name="new_password" v-model="password.new_password" minlength="8" class="form-control text-center" autocomplete="new-password" required>
                </div>
                <button v-if="loading.password" type="submit" class="btn btn-primary m-2 d-block float-end" disabled><FormLoader v-if="loading" class="d-inline-block" color="white" :size="10" sizeUnit="px" /></button>
                <button v-else type="submit" class="btn btn-primary m-2 d-block float-end">Zmień hasło</button>
            </form>

        </div>
        <Loader v-else class="loader" color="#000" :width="400" :height="5" sizeUnit="px" />
    </div>
    
</template>

<script>
import {BarLoader, PulseLoader} from "@saeris/vue-spinners"

export default {
    name: "Settings",
    components: {
        Loader: BarLoader,
        FormLoader: PulseLoader
    },
    async created() {
        this.loading.all = true;
        const res = await fetch("/api/user/info");
        const body = await res.json();
        this.user = body.user;
        this.loading.all = false;
    },
    methods: {
        submit_newemail: async function() {
            if(this.email.email == this.user.email) return this.email.status = "SAME_EMAIL";
            this.loading.email = true;
            const res = await fetch("/api/user/update?type=email", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: this.email.email})
            });
            const body = await res.json();
            this.email.status = body.success ? "EMAIL_CHANGE_SUCCESS" : body.error;
            this.loading.email = false;
        },
        submit_newpassword: async function() {
            if(this.password.old_password == this.password_new_password) return this.password.status = "SAME_PASSWORD";
            this.loading.password = true;
            const res = await fetch("/api/user/update?type=password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({old_password: this.password.old_password, password: this.password.new_password})
            });
            const body = await res.json();
            this.password.status = body.success ? "PASSWORD_CHANGE_SUCCESS" : body.error;
            this.loading.password = false;
        }
    },
    data() {
        return {
            user: null,
            loading: {
                all: true,
                email: false,
                password: false
            },
            email: {
                email: null,
                status: null
            },
            password: {
                old_password: null,
                new_password: null,
                status: null
            },
            messages: {
                INCORRECT_DATA: {
                    message: "Nie podano wszystkich danych lub są one zbyt obszerne.",
                    type: "danger"
                },
                UNKNOWN_ERROR: {
                    message: "Wystąpił nieznany błąd.",
                    type: "danger"
                },
                EMAIL_CHANGE_SUCCESS: {
                    message: "Twój email został pomyślnie zmieniony. Pamiętaj żeby od teraz do logowania używać nowego adresu email.",
                    type: "success"
                },
                SAME_EMAIL: {
                    message: "Należy wprowadzić inny adres email.",
                    type: "danger"
                },
                PASSWORD_CHANGE_SUCCESS: {
                    message: "Pomyślnie zmieniono hasło.",
                    type: "success"
                },
                SAME_PASSWORD: {
                    message: "Nie możesz zmienić hasła na takie samo.",
                    type: "danger"
                },
                WRONG_PASSWORD: {
                    message: "Podano nieprawidłowe hasło.",
                    type: "danger"
                }
            }
        }
    }
}
</script>