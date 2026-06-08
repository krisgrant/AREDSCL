import { store } from "../main.js";
import { embed, getFontColour } from "../util.js";
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
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 === 1" class="type-label-lg top1">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 <= 25" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 > 25 & i + 1 <= 50" class="extended">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg legacy">#{{ i + 1 }}</p>
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
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
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
                    <p class="extended"><b>{{ level.records.length }}</b> records registered</p>

                    <p v-if="selected + 1 <= 150"><strong>100%</strong> to qualify</p>
                    <p v-else>You may submit a record for this level, but no list points will be awarded.</p>

                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p v-if="record.percent == 100"><b>{{ record.percent }}%</b></p>
                                <p v-else>{{ record.percent }}%</p>
                            </td>

                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">
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

                    <!-- CHANGELLOG -->
                    <div class="dark-bg" v-if="!isDemons">
                        <h2>Changelog:</h2>
                        <br>
                        <p class="extended">June 6th 2026</p>
                        <br><br>

                        <button class="btn-no-cover" @click="jumpTo(37">
                            Ship challenge 4 has been removed (Formerly at #38).
                            This change pushes KrisYas Bad Time back into the Extended List.
                            This change is due to the approved removal of over 50% of server admins.
                        </button>
                    </div>

                    <div class="dark-bg" v-else>
                        <button class="btn-no-cover" @click="jumpTo(6)">
                            Ship challenge 4 has been removed (Formerly at #38).
                            This change pushes KrisYas Bad Time back into the Extended List.
                            This change is due to the approved removal of over 50% of server admins.
                        </button>
                    </div>

                    <!-- GUIDELINES -->
                    <div class="dark-bg" v-if="!isDemons">
                        <h2>Guidelines</h2>
                        <br>
                        <p>
                            Every action is conducted in accordance with our guidelines.
                            In order to guarantee a consistent experience, make sure to verify them before submitting a record!
                        </p>
                        <br><br>
                        <a class="btngl" href="/extended-page/rules.html">Guidelines Page</a>
                    </div>

                    <!-- STAFF -->
                    <div class="dark-bg" v-if="editors">
                        <br>
                        <h3>List Staff:</h3>
                        <br>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`">
                                <a v-if="editor.link" :href="editor.link" target="_blank" class="type-label-lg link">
                                    {{ editor.name }}
                                </a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </div>

                    <div class="og dark-bg">
                        <p>
                            All credit goes to <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a>,
                            whose website this is a replica of.
                            We obtained permission from its owners and have no connection to TSL.
                            Original List by <a href="https://me.redlimerl.com/" target="_blank">RedLime</a>
                        </p>
                    </div>

                    <!-- NAV BUTTONS -->
                    <button class="btngl" @click="selected = nav.top">#1 Challenge</button>
                    <button class="btngl" @click="selected = nav.extended">Extended</button>
                    <button class="btngl" @click="selected = nav.legacy">Legacy</button>

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

        navMap: {
            normal: {
                top: 0,
                extended: 25,
                legacy: 50,
                changelogJump: 37
            },
            demons: {
                top: 0,
                extended: 25,
                legacy: 50,
                changelogJump: 0
            }
        }
    }),

    computed: {
        level() {
            if (!this.list?.length) return null;
            return this.list[this.selected]?.[0] || this.list[0][0];
        },

        isDemons() {
            return window.location.hash.startsWith("#/demons/");
        },

        nav() {
            return this.isDemons ? this.navMap.demons : this.navMap.normal;
        }
    },

    methods: {
        embed,
        score,

        jumpTo(index) {
            this.selected = index;

            this.$nextTick(() => {
                const el = document.querySelector(".level-container");
                if (el) el.scrollTop = 0;
            });
        }
    },

    async mounted() {
        this.list = await fetchList(store.mode);
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level. (${err}.json)`)
            );

            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
};