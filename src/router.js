import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

const routes = [
    {
        path: "/",
        name: "Login",
        component: () => import("./views/pages/Login.vue"),
        meta: {
            title: "Logowanie"
        }
    },
    {
        path: "/panel",
        name: "Panel",
        component: () => import("./views/pages/Panel.vue"),
        meta: {
            title: "Zgłoszenia"
        }
    },
    {
        path: "/panel/ustawienia",
        name: "Ticket",
        component: () => import("./views/pages/Settings.vue"),
        meta: {
            title: "Ustawienia"
        }
    },
    {
        path: "/panel/:id",
        name: "Ticket",
        component: () => import("./views/pages/Ticket.vue"),
        meta: {
            title: "Zgłoszenie #{ID}"
        }
    },
    {
        path: "*",
        name: "404",
        component: () => import("./views/errors/Error404.vue"),
        meta: {
            title: "404"
        }
    }
]

const router = new VueRouter({
    mode: "history",
    routes,
    scrollBehavior() {
        return {x: 0, y: 0}
    }
});

export default router
