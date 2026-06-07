import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },

    template: `
        <main v-if="loading">
            <Spinner />
        </main>

        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list" :key="i">
                        <td class="rank">
                            <p v-if="i + 1 === 1" class="type-label-lg top1">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 <= 25" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 <= 50" class="extended">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg legacy">#{{ i + 1 }}</p>
                        </td>

                        <td class="level" :class="{ active: selected === i, error: !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">
                                    {{ level?.name || \`Error (\${err}.json)\` }}
                                </span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>

                    <LevelAuthors
                        :author="level.author"
                        :creators="level.creators"
                        :verifier="level.verifier"
                    />

                    <div class="packs" v-if="level.packs?.length">
                        <div
                            v-for="pack in level.packs"
                            :key="pack.name"
                            class="tag"
                            :style="{ background: pack.colour }"
                        >
                            <p>{{ pack.name }}</p>
                        </div>
                    </div>

                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>

                    <ul class="stats">
                        <li v-if="selected + 1 <= 150">
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(selected + 1, 100, 100) }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg">{{ level.id }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">Skillset</div>
                            <p>{{ level.skillset || 'Not Specified' }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">Length</div>
                            <p>{{ level.length || 'Not Specified' }}</p>
                        </li>
                    </ul>

                    <h2>Records</h2>
                    <p class="extended">
                        <b>{{ level.records.length }}</b> records registered
                    </p>

                    <table class="records">
                        <tr v-for="record in level.records" :key="record.user" class="record">
                            <td class="percent">
                                <b v-if="record.percent === 100">{{ record.percent }}%</b>
                                <span v-else>{{ record.percent }}%</span>
                            </td>

                            <td class="user">
                                <a :href="record.link" target="_blank">
                                    {{ record.user }}
                                </a>
                            </td>

                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level empty">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <!-- ✅ RESTORED RIGHT SIDEBAR -->
            <div class="meta-container">
                <div class="meta">

                    <div class="errors" v-if="errors.length">
                        <p class="error" v-for="error in errors" :key="error">
                            {{ error }}
                        </p>
                    </div>

                    <div class="dark-bg">
                        <h2>Changelog:</h2>
                        <br>
                        <p class="extended">June 7th 2026</p>
                        <br><br>
                        <p>
                            Ship challenge 4 has been removed (Formerly at #38).
                            This affects list ordering and pushes some levels into Extended.
                        </p>
                    </div>

                    <div class="dark-bg">
                        <h2>Guidelines</h2>
                        <br>
                        <p>
                            All submissions must follow the official guidelines to ensure fairness and consistency.
                        </p>
                        <br><br>
                        <a class="btngl" href="/extended-page/rules.html">
                            Guidelines Page
                        </a>
                    </div>

                    <div class="dark-bg" v-if="editors">
                        <h3>List Staff:</h3>
                        <br>

                        <ol class="editors">
                            <li v-for="editor in editors" :key="editor.name">
                                <img
                                    :src="`/assets/${roleIconMap[editor.role]}${store.dark ? '-dark' : ''}.svg`"
                                    :alt="editor.role"
                                />
                                <a v-if="editor.link" :href="editor.link" target="_blank">
                                    {{ editor.name }}
                                </a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </div>

                    <div class="og dark-bg">
                        <p>
                            All credit goes to TSL. This is a modified replica with permission.
                        </p>
                    </div>

                    <button class="btngl" @click="selected = 0">#1 Challenge</button>
                    <button class="btngl" @click="selected = 25">Extended</button>
                    <button class="btngl" @click="selected = 50">Legacy</button>

                </div>
            </div>

        </main>
    `,

    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),

    computed: {
        level() {
            return this.list?.[this.selected]?.[0];
        },
    },

    async mounted() {
        const mode = this.$route.meta?.list || store.mode || "challenge";

        this.list = await fetchList(mode);
        this.editors = await fetchEditors();

        if (!this.list) this.errors.push("Failed to load list.");
        if (!this.editors) this.errors.push("Failed to load editors.");

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};