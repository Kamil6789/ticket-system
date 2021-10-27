<template>
    <div class="container">
        <Navbar />
        <div v-if="authorized">
            <div class="content" v-if="!loading">
                <h1 class="text-center m-5">{{ ticket.title }}</h1>

                <div class="row text-center">

                    <div class="col-lg-7 mx-auto mt-3">
                        <section>
                            <h4 class="text-center">Komentarze</h4>
                            <div v-if="ticket.status !== 2" class="post-comment">
                                <form @submit.prevent="submit_comment">
                                    <div class="form-group m-2">
                                        <textarea class="form-control" name="content" v-model="comment.content" placeholder="Treść komentarza" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary m-2 d-block">Wyślij</button>
                                </form>
                            </div>
                            <p v-else class="text-muted text-center">Nie można dodawać komentarzy do rozpatrzonych zgłoszeń.</p>
                            <div class="comments">
                                <ticket-comment v-for="comment in comments" :key="comment.id" :comment="comment" :isMine="currentUser.id == comment.authorId"></ticket-comment>
                            </div>
                        </section>
                    </div>

                    <div class="col-lg-4 mx-auto">
                        <section>
                            <div class="mt-3">
                                <h4>Informacje</h4>
                                <p>
                                    Zgłoszone przez: <span class="badge badge-primary">{{ user.username }}</span><br />
                                    Przydzielone do: <span class="badge badge-primary">{{ technician.username }}</span><br />
                                    Data otwarcia zgłoszenia: <span class="badge badge-primary">{{ moment(ticket.date).format("DD.MM.YYYY HH:mm") }}</span><br />
                                    Status zgłoszenia: 
                                        <span v-if="ticket.status == 2" class="badge bg-success">{{ getTicketStatus(ticket.status).toUpperCase() }}</span>
                                        <span v-else-if="ticket.status == 1" class="badge bg-info">{{ getTicketStatus(ticket.status).toUpperCase() }}</span>
                                        <span v-else class="badge bg-danger">{{ getTicketStatus(ticket.status).toUpperCase() }}</span>
                                </p>
                            </div>
                            <div class="mt-3">
                                <h4 class="text-center">Opis zgłoszenia</h4>
                                <p>{{ ticket.description }}</p>
                            </div>
                            <div class="manage mt-3" v-if="currentUser.type == 2">
                                <h4>Zarządzaj zgłoszeniem</h4>
                                <form @submit.prevent="submit_update">
                                    <div class="form-group m-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="status" v-model="update.status" value="0">
                                            <label class="form-check-label float-start" for="flexRadioDefault1">&nbsp;Nowe</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="status" v-model="update.status" value="1">
                                            <label class="form-check-label float-start" for="flexRadioDefault1">&nbsp;W trakcie przeglądu</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="status" v-model="update.status" value="2">
                                            <label class="form-check-label float-start" for="flexRadioDefault1">&nbsp;Rozpatrzone</label>
                                        </div>
                                        <button type="submit" class="btn btn-primary m-2 d-block mx-auto">Aktualizuj zgłoszenie</button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Loader v-else class="loader" color="#1470bb" :width="400" :height="5" sizeUnit="px" />
            <Footer />
        </div>
        <Error401 v-else />
    </div>
</template>

<script>
import Error401 from '../errors/Error401.vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import TicketComment from '../components/TicketComment.vue'

import getTicketStatus from '../../helpers/getTicketStatus.js'

import {BarLoader} from "@saeris/vue-spinners"
import moment from 'moment'

export default {
    name: "Ticket",
    components: {
        Error401,
        Navbar,
        Footer,
        TicketComment,
        Loader: BarLoader
    },
    data() {
        return {
            currentUser: null,
            authorized: true,
            loading: true,
            ticket: null,
            comments: [],
            user: null,
            technician: null,
            moment,
            getTicketStatus,
            comment: {
                content: null
            },
            update: {
                status: null
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

        await fetch('/api/user/info').then(res => res.json()).then(data => this.currentUser = data.user);
        await fetch(`/api/comments?ticketId=${this.$route.params.id}`).then(res => res.json()).then(data => this.comments = data).catch(() => this.comments = []);
        await fetch(`/api/users?id=${this.ticket.userId}`).then(res => res.json()).then(data => this.user = data);
        await fetch(`/api/users?id=${this.ticket.technicianId}`).then(res => res.json()).then(data => this.technician = data);
        this.update.status = this.ticket.status;
        this.loading = false;
    },
    methods: {
        submit_update: async function() {
            if (this.update.status) {
                const ticketId = this.ticket.id;
                const status = this.update.status;

                const res = await fetch("/api/tickets/update", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ ticketId, status })
                });
                
                const body = await res.json();
                if (body.success) this.$router.go();
            }
        },
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