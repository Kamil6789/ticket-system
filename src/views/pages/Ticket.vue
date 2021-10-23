<template>
    <div class="container">
        <div v-if="authorized">
            <div class="content" v-if="!loading">
                <h1 class="text-center m-5">{{ ticket.title }}</h1>
                <p>Zgłoszone przez: {{ user.username }}</p>
                <p>Przydzielone do: {{ technician.username }}</p>
                <h4 class="text-center m-5">Opis zgłoszenia</h4>
                <p>{{ ticket.description }}</p>
                <h4 class="text-center m-5">Komentarze</h4>
                <div class="post-comment">
                    <form @submit.prevent="submit_comment">
                        <div class="form-group m-2">
                            <textarea name="content" v-model="comment.content" placeholder="Treść komentarza" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary m-2 d-block">Wyślij</button>
                    </form>
                </div>
                <div class="comments">
                    <ticket-comment v-for="comment in comments" :key="comment.id" :comment="comment"></ticket-comment>
                </div>
            </div>
            <Loader v-else class="loader" color="#000" :width="400" :height="5" sizeUnit="px" />
        </div>
        <Error401 v-else />
    </div>
</template>

<script>
import Error401 from '../errors/Error401.vue';

import TicketComment from '../components/TicketComment.vue'
import {BarLoader} from "@saeris/vue-spinners"

export default {
    name: "Ticket",
    components: {
        Error401,
        TicketComment,
        Loader: BarLoader
    },
    data() {
        return {
            authorized: true,
            loading: true,
            ticket: null,
            comments: [],
            user: null,
            technician: null,
            comment: {
                content: null
            }
        }
    },
    created: async function() {
        await fetch(`/api/tickets?id=${this.$route.params.id}`).then(async res => {
            switch (res.status) {
                case 200:
                    this.ticket = await res.json();
                    break;

                case 401:
                    this.authorized = false;
                    this.loading = false;
                    break;
            }
        });

        if (!this.authorized) return;

        await fetch(`/api/comments?ticketId=${this.$route.params.id}`).then(res => res.json()).then(data => this.comments = data).catch(() => this.comments = []);
        await fetch(`/api/users?id=${this.ticket.userId}`).then(res => res.json()).then(data => this.user = data);
        await fetch(`/api/users?id=${this.ticket.technicianId}`).then(res => res.json()).then(data => this.technician = data);
        this.loading = false;
    },
    methods: {
        submit_comment: async function() {
            if (this.comment.content) {
                const ticketId = this.ticket.id;
                const content = this.comment.content;

                const res = await fetch("/api/tickets/comment", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ ticketId, content })
                });
                
                const body = await res.json();
                if (body.success) this.$router.go();
            }
        }
    }
}
</script>