<template>
    <div class="container">
        <div class="content" v-if="!loading">
            <h1 class="text-center m-5">{{ ticket.title }}</h1>
            <p>Zgłoszone przez: {{ user.username }}</p>
            <p>Przydzielone do: {{ technician.username }}</p>
            <hr>
            <p>{{ ticket.description }}</p>
        </div>
        <div v-else>
            <h1 class="text-center m-5">Ładowanie</h1>
        </div>
    </div>
</template>

<script>
export default {
    name: "Ticket",
    data() {
        return {
            loading: true,
            ticket: Object,
            user: Object,
            technician: Object
        }
    },
    created: async function() {
        await fetch(`/api/tickets?id=${this.$route.query.id}`).then(res => res.json()).then(data => this.ticket = data);
        await fetch(`/api/users?id=${this.ticket.userId}`).then(res => res.json()).then(data => this.user = data);
        await fetch(`/api/users?id=${this.ticket.technicianId}`).then(res => res.json()).then(data => this.technician = data);
        this.loading = false;
    },
}
</script>