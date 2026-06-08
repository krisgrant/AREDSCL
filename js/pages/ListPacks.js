import { fetchPacks, fetchPackLevels, fetchList } from "../content.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { store } from "../main.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: {
        Spinner,
        LevelAuthors,
    },

    computed: {
        isDemons() {
            return window.location.hash.startsWith("#/demons/");
        },

        pack() {
            return this.packs?.[this.selected] || null;
        }
    },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="pack-list">
            <div class="packs-nav">
                <div>
                    <button
                        v-for="(pack, i) in packs"
                        :key="pack.name"
                        @click="switchLevels(i)"
                        :style="{background: pack.colour}"
                    >
                        <p>{{ pack.name }}</p>
                    </button>
                </div>
            </div>

            <div class="list-container">
                <table class="list" v-if="selectedPackLevels">
                    <tr v-for="(level, i) in selectedPackLevels" :key="i">
                        <td class="rank">
                            <p class="type-label-lg">
                                #{{ getRealRank(level) }}
                            </p>
                        </td>

                        <td class="level" :class="{ active: selectedLevel == i, error: !level }">
                            <button
                                :style="selectedLevel == i ? {background: pack?.colour} : {}"
                                @click="selectedLevel = i"
                            >
                                <span class="type-label-lg">
                                    {{ level?.[0]?.level?.name || 'Error' }}
                                </span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="level-container">
                <div class="level" v-if="selectedPackLevels?.[selectedLevel]">
                    <h1>{{ selectedPackLevels[selectedLevel][0].level.name }}</h1>

                    <LevelAuthors
                        :author="selectedPackLevels[selectedLevel][0].level.author"
                        :creators="selectedPackLevels[selectedLevel][0].level.creators"
                        :verifier="selectedPackLevels[selectedLevel][0].level.verifier"
                    />

                    <iframe
                        class="video"
                        :src="embed(selectedPackLevels[selectedLevel][0].level.verification)"
                        frameborder="0"
                    ></iframe>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg">
                                {{ selectedPackLevels[selectedLevel][0].level.id }}
                            </p>
                        </li>

                        <li v-if="!isDemons">
                            <div class="type-title-sm">Skillset</div>
                            <p>
                                {{ selectedPackLevels[selectedLevel][0].level.skillset || 'Not Specified' }}
                            </p>
                        </li>

                        <li v-if="!isDemons">
                            <div class="type-title-sm">Length</div>
                            <p>
                                {{ selectedPackLevels[selectedLevel][0].level.length || 'Not Specified' }}
                            </p>
                        </li>
                    </ul>

                    <h2>Records</h2>

                    <table class="records">
                        <tr
                            v-for="record in selectedPackLevels[selectedLevel][0].level.records"
                            :key="record.user"
                            class="record"
                        >
                            <td class="percent">
                                <b v-if="record.percent == 100" class="type-label-lg">
                                    {{ record.percent }}%
                                </b>
                                <span v-else class="type-label-lg">
                                    {{ record.percent }}%
                                </span>
                            </td>

                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">
                                    {{ record.user }}
                                </a>
                            </td>

                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>

                    <div class="dark-bg">
                        <h1>Packs</h1>
                        <br>
                        <p>
                            You can complete levels for these list packs.
                        </p>
                    </div>

                    <h3>Credits:</h3>
                    <p>
                        <a class="type-label-lg" href="https://youtube.com/@krisgra" target="_blank">
                            KrisGra
                        </a>
                    </p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        list: [],
        packs: [],
        errors: [],
        selected: 0,
        selectedLevel: 0,
        selectedPackLevels: [],
        loading: true,
        loadingPack: true
    }),

    async mounted() {
        this.packs = await fetchPacks();

        if (!this.packs?.length) {
            this.loading = false;
            return;
        }

        this.list = await fetchList(store.mode);

        const levels = await fetchPackLevels(this.packs[0].name);
        this.selectedPackLevels = this.sortPackLevels(levels);

        this.loading = false;
        this.loadingPack = false;
    },

    methods: {
        async switchLevels(i) {
            this.loadingPack = true;

            this.selected = i;
            this.selectedLevel = 0;

            if (!this.packs?.[i]) {
                this.loadingPack = false;
                return;
            }

            const levels = await fetchPackLevels(this.packs[i].name);
            this.selectedPackLevels = this.sortPackLevels(levels);

            this.loadingPack = false;
        },

        score,
        embed,

        // ✅ ONLY ADDITION: SORT SYSTEM
        sortPackLevels(levels) {
            if (!Array.isArray(levels)) return levels;

            const getDiff = (l) =>
                String(l?.[0]?.level?.difficulty || "unknown").toLowerCase();

            const order = {
                easy: 1,
                normal: 2,
                medium: 3,
                hard: 4,
                insane: 5,
                extreme: 6,
                demon: 7,
                unknown: 999
            };

            return [...levels].sort((a, b) => {
                return (order[getDiff(a)] ?? 999) - (order[getDiff(b)] ?? 999);
            });
        },

        // unchanged
        getRealRank(level) {
            if (!this.list?.length || !level?.[0]?.level?.name) return "?";

            const idx = this.list.findIndex(
                (l) => l?.[0]?.level?.name === level?.[0]?.level?.name
            );

            return idx >= 0 ? idx + 1 : "?";
        }
    }
};