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

                    <tr v-for="([level, err], i) in list" :key="level?.id || i">

                        <!-- RANK (FIXED: uses real rank, NOT i+1) -->
                        <td class="rank">

                            <p v-if="isDemons && level.rank === 1" class="type-label-lg top1">#{{ level.rank }}</p>

                            <p v-else-if="isDemons && level.rank <= 75" class="type-label-lg">#{{ level.rank }}</p>

                            <p v-else-if="isDemons && level.rank <= 150" class="extended">#{{ level.rank }}</p>

                            <p v-else-if="isDemons" class="type-label-lg legacy">#{{ level.rank }}</p>

                            <p v-else-if="!isDemons && level.rank === 1" class="type-label-lg top1">#{{ level.rank }}</p>

                            <p v-else-if="!isDemons && level.rank <= 25" class="type-label-lg">#{{ level.rank }}</p>

                            <p v-else-if="!isDemons && level.rank <= 50" class="extended">#{{ level.rank }}</p>

                            <p v-else class="type-label-lg legacy">#{{ level.rank }}</p>

                        </td>

                        <td class="level" :class="{ active: selected == i, error: !level }">
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

                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs"
                             class="tag"
                             :style="{background:pack.colour}">
                            <p>{{ pack.name }}</p>
                        </div>
                    </div>

                    <iframe class="video"
                            :src="embed(level.verification)"
                            frameborder="0"></iframe>

                    <ul class="stats">

                        <li v-if="selected + 1 <= 150">
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(level.rank, isDemons ? "demons" : "normal") }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg">{{ level.id }}</p>
                        </li>

                        <!-- SKILLSET (hidden in demons only) -->
                        <li v-if="!isDemons">
                            <div class="type-title-sm">Skillset</div>
                            <p>{{ level.skillset || 'Not Specified' }}</p>
                        </li>

                        <!-- LENGTH (hidden in demons only) -->
                        <li v-if="!isDemons">
                            <div class="type-title-sm">Length</div>
                            <p>{{ level.length || 'Not Specified' }}</p>
                        </li>

                    </ul>

                    <h2>Records</h2>
                    <p class="extended"><b>{{ level.records.length }}</b> records registered</p>

                    <p v-if="level.rank <= 150"><strong>100%</strong> to qualify</p>
                    <p v-else>You may submit a record for this level, but no list points will be awarded.</p>

                    <table class="records">

                        <tr v-for="record in level.records" class="record" :key="record.user">

                            <!-- FIXED FONT FOR VICTORS -->
                            <td class="percent">
                                <p v-if="record.percent == 100" class="type-label-lg">
                                    <b>{{ record.percent }}%</b>
                                </p>
                                <p v-else class="type-label-lg">
                                    {{ record.percent }}%
                                </p>
                            </td>

                            <td class="user">
                                <a :href="record.link"
                                   target="_blank"
                                   class="type-label-lg">
                                    {{ record.user }}
                                </a>
                            </td>

                            <td class="legacy">
                                <img v-if="record.legacy" src="/assets/legacy.svg">
                            </td>

                            <td class="mobile">
                                <img v-if="record.mobile"
                                     :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`">
                            </td>

                            <td class="hz">
                                <p class="type-label-lg">{{ record.hz }}fps</p>
                            </td>

                        </tr>

                    </table>

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
            if (!this.list?.length) return null;
            return this.list[this.selected]?.[0] || this.list[0][0];
        },

        isDemons() {
            return window.location.hash.startsWith("#/demons/");
        }
    },

    methods: {
        embed,
        score,
    },

    async mounted() {
        this.list = await fetchList(store.mode);
        this.editors = await fetchEditors();
        this.loading = false;
    },
};