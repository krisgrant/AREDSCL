import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import ListPacks from './pages/ListPacks.js';

export default [
    // CHALLENGE
    { path: '/', component: List, meta: { list: 'challenge' } },
    { path: '/leaderboard', component: Leaderboard, meta: { list: 'challenge' } },
    { path: '/roulette', component: Roulette, meta: { list: 'challenge' } },
    { path: '/list-packs', component: ListPacks, meta: { list: 'challenge' } },

    // DEMONS
    { path: '/demons', component: List, meta: { list: 'demon' } },
    { path: '/demons/leaderboard', component: Leaderboard, meta: { list: 'demon' } },
    { path: '/demons/roulette', component: Roulette, meta: { list: 'demon' } },
    { path: '/demons/list-packs', component: ListPacks, meta: { list: 'demon' } },
];