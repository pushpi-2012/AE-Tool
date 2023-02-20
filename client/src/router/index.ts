import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Published from '../views/Published.vue';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/video',
        name: 'published',
        component: Published
    }
]

const router = new VueRouter({
    routes
})

export default router
