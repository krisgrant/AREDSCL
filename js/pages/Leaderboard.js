import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },

    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        mode: "challenge",
    }),

    computed: {
        entry() {
            return this.leaderboard[this.selected] || null;
        },

        isDemons() {
            return window.location.hash.startsWith("#/demons/");
        },

        // 🔥 FIX: single source of truth for mode everywhere
        scoreMode() {
            return this.isDemons ? "demons" : "normal";
        }
    },

    methods: {
        localize,

        getRank(entry, i) {
            if (!entry) return i + 1;
            return entry.rank ?? (i + 1);
        },

        getRankClass(rank) {
            if (this.isDemons) {
                if (rank <= 75) return "type-label-lg";
                if (rank <= 150) return "extended";
                return "legacy type-label-lg";
            } else {
                if (rank <= 25) return "type-label-lg";
                if (rank <= 50) return "extended";
                return "legacy type-label-lg";
            }
        },

        // 🔥 FIX: DO NOT recalc pack bonus anymore
        getPackBonus(entry) {
            if (!entry) return 0;
            return entry.packBonus ?? 0;
        },

        getTotal(entry) {
            if (!entry) return 0;
            return entry.total ?? 0;
        }
    },

    template: `
        <main v-if="loading">
            <Spinner />
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect: {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">

                            <td class="rank">
                                <p :class="getRankClass(getRank(ientry, i))">
                                    #{{ getRank(ientry, i) }}
                                </p>
                            </td>

                            <td class="user" :class="{ active: selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>

                            <td class="score">
                                <p class="type-label-lg">
                                    {{ localize(getTotal(ientry)) }}
                                </p>
                            </td>

                        </tr>
                    </table>
                </div>

                <div class="player-container" v-if="entry">
                    <div class="player">

                        <h1>{{ entry.user }}</h1>
                        <p>#{{ getRank(entry, selected) }}</p>

                        <h3><b>{{ getTotal(entry) }}</b></h3>

                        <p>Pack Bonus: {{ getPackBonus(entry) }}</p>

                        <div class="packs" v-if="entry.packs?.length > 0">
                            <div
                                v-for="pack in entry.packs"
                                class="tag"
                                :style="{background:pack.colour}"
                            >
                                {{ pack.name }}
                            </div>
                        </div>

                        <br>

                        <h2 v-if="entry.verified?.length">
                            Challenges verified: ({{ entry.verified.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p :class="getRankClass(score.rank)">
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a target="_blank" :href="score.link">
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    +{{ localize(score.score) }}
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed?.length">
                            Challenges completed: ({{ entry.completed.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p :class="getRankClass(score.rank)">
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a target="_blank" :href="score.link">
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    +{{ localize(score.score) }}
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed?.length">
                            Progress on: ({{ entry.progressed.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p :class="getRankClass(score.rank)">
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a target="_blank" :href="score.link">
                                        {{ score.level }} ({{ score.percent }}%)
                                    </a>
                                </td>

                                <td class="score">
                                    +{{ localize(score.score) }}
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>

            </div>
        </main>
    `,

    async mounted() {
        this.mode = this.$route?.meta?.list || "challenge";

        const [leaderboard, err] = await fetchLeaderboard(this.mode);

        this.leaderboard = leaderboard || [];
        this.err = err || [];
        this.loading = false;
    },
};