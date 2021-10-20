<template>
    <div class="container">
        <div class="content" v-if="!loading">
            <h1 class="text-center m-5">{{ ticket.title }}</h1>
            <p>Zgłoszone przez: {{ user.username }}</p>
            <p>Przydzielone do: {{ technician.username }}</p>
            <h4 class="text-center m-5">Opis zgłoszenia</h4>
            <p>{{ ticket.description }}</p>
            <h4 class="text-center m-5">Komentarze</h4>
            <div class="comments">
                <ticket-comment v-for="comment in comments" :key="comment.id" :comment="comment"></ticket-comment>
            </div>
        </div>
        <div v-else>
            <h1 class="text-center m-5">Ładowanie</h1>
        </div>
    </div>
</template>

<script>
import TicketComment from '../components/TicketComment.vue'

export default {
    name: "Ticket",
    components: {
        TicketComment
    },
    data() {
        return {
            loading: true,
            ticket: null,
            comments: [],
            user: null,
            technician: null
        }
    },
    created: async function() {
        await fetch(`/api/tickets?id=${this.$route.params.id}`).then(res => res.json()).then(data => this.ticket = data);
        await fetch(`/api/comments?ticketId=${this.$route.params.id}`).then(res => res.json()).then(data => this.comments = data).catch(() => this.comments = []);
        await fetch(`/api/users?id=${this.ticket.userId}`).then(res => res.json()).then(data => this.user = data);
        await fetch(`/api/users?id=${this.ticket.technicianId}`).then(res => res.json()).then(data => this.technician = data);
        this.loading = false;
    },
}
</script>