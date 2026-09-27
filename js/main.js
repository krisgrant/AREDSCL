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

// Change website branding depending on the current list
function setBranding(list) {
    let title;
    let favicon;

    if (list === 'demon') {
        title = 'EDS Demonlist';
        favicon = '/images/Extreme_Demon.avif';
    } else if (list === 'teeth') {
        title = 'Teeth Achievements List';
        favicon = '/images/Teeth.avif';
    } else {
        title = 'EDS Challenge List';
        favicon = '/images/Trollface.avif';
    }

    // Change browser tab title
    document.title = title;

    // Change browser tab icon
    const faviconElement = document.querySelector("link[rel~='icon']");

    if (faviconElement) {
        faviconElement.href = favicon;
    }
}

router.beforeEach((to) => {
    const list = to.meta?.list || 'challenge';

    store.mode = list;

    setBranding(list);
});

app.use(router);
app.mount('#app');