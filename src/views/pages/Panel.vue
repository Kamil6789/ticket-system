<template>
    <div class="container">
        <div class="content" v-if="!loading">
            <div class="send-ticket" v-if="currentUser.type == 1">
                <h1 class="text-center m-5">Wyślij zgłoszenie</h1>
                <form @submit.prevent="submit_ticket">
                    <div class="form-group m-2">
                        <input type="text" name="title" v-model="ticket.title" placeholder="Tytuł" maxlength="255" required>
                        <br>
                        <textarea name="description" v-model="ticket.description" placeholder="Opis" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary m-2 d-block">Wyślij</button>
                </form>
            </div>
            <h1 class="text-center m-5">Przypisane zgłoszenia</h1>
            <table class="table text-center">
                <thead>
                    <tr>
                        <th>Zgłoszone przez</th>
                        <th>Przydzielone do</th>
                        <th>Tytuł</th>
                        <th>Status</th>
                        <th>Akcja</th>
                    </tr>
                </thead>
                <tbody class="align-middle">
                    <tr v-for="ticket in tickets" :key="ticket.id">
                        <td class="col-md-2">{{ getUserById(ticket.userId).username }}</td>
                        <td class="col-md-2">{{ getUserById(ticket.technicianId).username }}</td>
                        <td class="col-md-5">{{ ticket.title }}</td>
                        <td class="col-md-1">{{ getTicketStatus(ticket.status) }}</td>
                        <td class="col-md-2">
                            <a :href="'/panel/' + ticket.id">Sprawdź zgłoszenie</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Loader v-else class="loader" color="#000" :width="400" :height="5" sizeUnit="px" />
    </div>
</template>

<script>
import {BarLoader} from "@saeris/vue-spinners"

export default {
    name: "Panel",
    components: {
        Loader: BarLoader
    },
    data() {
        return {
            currentUser: null,
            loading: true,
            tickets: [],
            users: [],
            ticket: {
                title: null,
                description: null
            }
        }
    },
    created: async function() {
        await fetch('/api/user/info').then(res => res.json()).then(data => this.currentUser = data.user);
        await fetch('/api/tickets').then(res => res.json()).then(data => this.tickets = data);
        await fetch('/api/users').then(res => res.json()).then(data => this.users = data);
        this.loading = false;
    },
    methods: {
        getUserById(id) {
            return this.users.find(user => user.id == id);
        },
        getTicketStatus(status) {
            switch (status) {
                case 0: return 'nowe';
                case 1: return 'w trakcie przeglądu';
                case 2: return 'rozpatrzone';
                default: return '';
            }
        },
        submit_ticket: async function() {
            if (this.ticket.title.length <= 255 && this.ticket.description) {
                const title = this.ticket.title;
                const description = this.ticket.description;

                const res = await fetch("/api/tickets/send", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ title, description })
                });
                
                const body = await res.json();
                if (body.success) this.$router.go();
            }
        }
    }
}
</script>