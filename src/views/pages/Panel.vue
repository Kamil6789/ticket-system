<template>
    <div class="container">
        <div class="content" v-if="!loading">
            <h1 class="text-center m-5">Przypisane zgłoszenia</h1>
            <table class="table text-center">
                <thead>
                    <tr>
                        <th>Zgłoszone przez</th>
                        <th>Przydzielone do</th>
                        <th>Status</th>
                        <th>Tytuł</th>
                        <th>Opis</th>
                    </tr>
                </thead>
                <tbody class="align-middle">
                    <tr v-for="ticket in tickets" :key="ticket.id">
                        <td class="col-md-2">{{ getUserById(ticket.userId).username }}</td>
                        <td class="col-md-2">{{ getUserById(ticket.technicianId).username }}</td>
                        <td class="col-md-1">{{ getTicketStatus(ticket.status) }}</td>
                        <td class="col-md-3">{{ ticket.title }}</td>
                        <td class="col-md-4">{{ ticket.description }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <h1 class="text-center m-5">Ładowanie</h1>
        </div>
    </div>
</template>

<script>
export default {
    name: "Panel",
    data() {
        return {
            loading: true,
            tickets: [],
            users: []
        }
    },
    created: async function() {
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
        }
    }
}
</script>