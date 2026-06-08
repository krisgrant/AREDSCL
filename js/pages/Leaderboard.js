import { fetchLeaderboard } from '../content.js';
import { getYoutubeIdFromUrl, localize } from '../util.js';

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
        mode: "challenge",
    }),

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },

        isDemons() {
            return window.location.hash.startsWith("#/demons/");
        },

        // ✅ IMPORTANT FIX: single source of truth for scoring mode
        scoreMode() {
            return this.isDemons ? "demons" : "normal";
        }
    },

    methods: {
        localize,
        getYoutubeIdFromUrl,

        getRank(entry, i) {
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

        // ✅ FIXED: pack bonus now uses SAME MODE as scoring
        getPackBonus(entry) {
            if (!entry) return 0;

            if (typeof entry.packBonus === "number") {
                return entry.packBonus;
            }

            if (!entry.packs?.length) return 0;

            let bonus = 0;

            for (const pack of entry.packs) {
                const value =
                    this.scoreMode === "demons"
                        ? (pack.demonBonus ?? pack.bonus ?? 0)
                        : (pack.bonus ?? 0);

                bonus += Number(value) || 0;
            }

            return bonus;
        }
    },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
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
                                    {{ localize(ientry.total) }}
                                </p>
                            </td>

                        </tr>
                    </table>
                </div>

                <div class="player-container">
                    <div class="player">

                        <h1>{{ entry.user }}</h1>
                        <p>#{{ getRank(entry, selected) }}</p>

                        <h3><b>{{ entry.total }}</b></h3>

                        <!-- FIXED: now uses correct mode indirectly -->
                        <p>Pack Bonus: {{ getPackBonus(entry) }}</p>

                        <div class="packs" v-if="entry.packs.length > 0">
                            <div
                                v-for="pack in entry.packs"
                                class="tag"
                                :style="{background:pack.colour}"
                            >
                                {{ pack.name }}
                            </div>
                        </div>

                        <br>

                        <h2 v-if="entry.verified.length > 0">
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(score.score) }}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(score.score) }}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">
                                        {{ score.level }} ({{ score.percent }}%)
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(score.score) }}
                                    </p>
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

        this.leaderboard = leaderboard;
        this.err = err;
        this.loading = false;
    },
};