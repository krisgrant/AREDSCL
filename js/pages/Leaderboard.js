import { fetchLeaderboard } from '../content.js';
import { getYoutubeIdFromUrl, localize } from '../util.js';
import { score } from '../score.js';

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

        scoreMode() {
            return this.isDemons ? "demons" : "normal";
        }
    },

    methods: {
        localize,
        getYoutubeIdFromUrl,
        score,

        getRank(ientry, i) {
            return ientry.rank ?? (i + 1);
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

        // ✅ correct 2dp rounding ONLY (no integer rounding loss)
        round2(num) {
            return Math.round((num + Number.EPSILON) * 100) / 100;
        },

        computeTotal(entry) {
            const mode = this.scoreMode;

            const sum = (arr) =>
                (arr || []).reduce(
                    (a, s) => a + this.score(s.rank, mode),
                    0
                );

            const total =
                sum(entry.verified) +
                sum(entry.completed) +
                sum(entry.progressed) +
                (entry.packBonus || 0);

            return this.round2(total);
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
                                    {{ localize(computeTotal(ientry)) }}
                                </p>
                            </td>

                        </tr>
                    </table>
                </div>

                <div class="player-container">
                    <div class="player">

                        <h1>{{ entry.user }}</h1>
                        <p>#{{ getRank(entry, selected) }}</p>

                        <h3><b>{{ computeTotal(entry) }}</b></h3>

                        <p>Pack Bonus: {{ entry.packBonus }}</p>

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
                            <tr v-for="scoreItem in entry.verified">

                                <td class="rank">
                                    <p :class="getRankClass(scoreItem.rank)">
                                        #{{ scoreItem.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="scoreItem.link">
                                        {{ scoreItem.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(round2(score(scoreItem.rank, scoreMode))) }}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">
                            Challenges completed: ({{ entry.completed.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="scoreItem in entry.completed">

                                <td class="rank">
                                    <p :class="getRankClass(scoreItem.rank)">
                                        #{{ scoreItem.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="scoreItem.link">
                                        {{ scoreItem.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(round2(score(scoreItem.rank, scoreMode))) }}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">
                            Progress on: ({{ entry.progressed.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="scoreItem in entry.progressed">

                                <td class="rank">
                                    <p :class="getRankClass(scoreItem.rank)">
                                        #{{ scoreItem.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="scoreItem.link">
                                        {{ scoreItem.level }} ({{ scoreItem.percent }}%)
                                    </a>
                                </td>

                                <td class="score">
                                    <p class="type-label-lg">
                                        +{{ localize(round2(score(scoreItem.rank, scoreMode))) }}
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