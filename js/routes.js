import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import ListPacks from './pages/ListPacks.js';

function meta(list) {
    return { meta: { list } };
}

export default [
    // ================= CHALLENGE =================
    { path: '/', component: List, ...meta('challenge') },
    { path: '/leaderboard', component: Leaderboard, ...meta('challenge') },
    { path: '/roulette', component: Roulette, ...meta('challenge') },
    { path: '/list-packs', component: ListPacks, ...meta('challenge') },

    // ================= DEMON =================
    { path: '/demons', component: List, ...meta('demon') },
    { path: '/demons/leaderboard', component: Leaderboard, ...meta('demon') },
    { path: '/demons/roulette', component: Roulette, ...meta('demon') },
    { path: '/demons/list-packs', component: ListPacks, ...meta('demon') },
];