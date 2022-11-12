import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

export default {
    components: {
        Spinner,
        LevelAuthors,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p v-if="ientry.total > 0" class="type-label-lg">#{{ i + 1 }}</p>
                                <p v-else class="legacy" class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                            <td class="score">
                            <p v-if="ientry.total > 0" class="type-label-lg">{{ localize(ientry.total) }}</p>
                            <p v-else class="legacy" class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} - {{ entry.user }}</h1>
                        <h3>Score: {{entry.total}}</h3>
                        <h3>Total Demons: {{ entry.completed.length + entry.verified.length }}</h3>
                        <h3>Verifications: {{ entry.verified.length }}</h3>
                        <h3>Completions: {{ entry.completed.length }}</h3>
                        <br>
                        <h2 v-if="entry.verified.length > 0">Demons verified:</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                <p v-if="score.rank <= 100">#{{ score.rank }}</p>
                                <p v-else class="legacy">#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Demons completed:</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                <p v-if="score.rank <= 100">#{{ score.rank }}</p>
                                <p v-else class="legacy">#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progress on:</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                <p v-if="score.rank <= 100">#{{ score.rank }}</p>
                                <p v-else class="legacy">#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% - {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        localize,
    },
};
