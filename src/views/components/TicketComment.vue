<template>
    <div class="comment" v-if="!loading">
        <h6>{{ author.username }}</h6>
        <p>{{ comment.content }}</p>
        <p>{{ new Date(comment.date).toLocaleString('pl-PL') }}</p>
    </div>
</template>

<script>
export default {
    name: 'TicketComment',
    props: {
        comment: Object
    },
    data() {
        return {
            loading: true,
            author: null
        }
    },
    created: async function() {
        await fetch(`/api/users?id=${this.comment.authorId}`).then(res => res.json()).then(data => this.author = data);
        this.loading = false;
    },
}
</script>