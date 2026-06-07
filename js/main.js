import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,

    // list mode
    mode: localStorage.getItem('mode') || 'challenge',

    setMode(mode) {
        this.mode = mode;
        localStorage.setItem('mode', mode);
    },

    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

/**
 * 🔥 KEEP STORE IN SYNC WITH ROUTES
 */
router.afterEach((to) => {
    if (to.path.startsWith('/demons')) {
        store.setMode('demon');
    } else {
        store.setMode('challenge');
    }
});

app.use(router);
app.mount('#app');