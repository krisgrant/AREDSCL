import { store } from '../main.js';
import { embed } from '../util.js';
import { score } from '../score.js';
import { fetchEditors, fetchList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    helper: 'user-shield',
    dev: 'code',
    trial: 'user-lock',
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                <tr v-for="([err, rank, level], i) in list">
                <td class="rank">
                    <p v-if="rank === null" class="type-label-lg">&mdash;</p>
                    <p v-else class="type-label-lg" :style="{ color: rank > 100 ? 'rgba(127, 127, 127, 0.5)' : legacy }">#{{ rank }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': err !== null }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </div>
            </div>
            <div class="level-container">
                <div class="level" v-if="list">
                    <h1 v-if="level.rank > 100">{{ level.name }}</h1>
                    <h1 v-else>#{{ level.rank }} - {{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points:</div>
                            <p>{{ score(level.rank, level.percentToQualify, level.percentToQualify) }} (100% = {{ score(level.rank, 100, level.percentToQualify) }})</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID:</div>
                            <p class="type-label-lg">{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password:</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Difficulty:</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="level.rank !== null && level.rank <= 100"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
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
                    <div class="og">
                        <p>All credit goes to <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a> (The Shitty List), whose website this is a replica of. We obtained permission from its owners and have no connection to TSL. Original List by <a href="https://me.redlimerl.com/" target="_blank">RedLime</a></p>
                    </div>
                    <div class="og">
                        <iframe class="discord-box" src="https://discord.com/widget?id=866826240476053514&theme=dark" width="270" height="300" allowtransparency="false" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Frequently Asked Questions</h3>
                    <p>
                        Q: How long will it take for my record to be accepted?
                        <br>
                        A: On an average day, it will take 0–48 hours, occasionally up to 72 hours, which may be slightly unusual, for the record to be acknowledged. You can ask a team member if the record hasn't been accepted yet and they can perhaps help.
                    </p>
                    <p>
                        Q: What does it mean by new, update, and fix records?
                        <br>
                        A: When you submit a record for a level for the first time, choose "New Record," and when you need to update an existing record because you have a new best, pick "Update Record," If there is a problem with one of your records that has to be fixed, select "Fix Record."
                    </p>
                    <p>
                        Q: What time will __ be placed on the list?
                        <br>
                        A: Typically, we add 1-3 demons per changelog. The level(s) in question must be added to the list within 2 to 4 days. However, not everything will be accurate because there could be website troubles or because some levels might take longer to upload than others. Be patient, please!
                    </p>
                    <p>
                        Q: Can I upload a video with multiple levels?
                        <br>
                        A: Yes!
                    </p>
                    <p>
                        If you have any questions or suggestions for any FAQ to put in, DM TAL9988#0729.
                    </p>
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
        listlevels: 0,
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list && this.list[this.selected] && this.list[this.selected][2];
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([err, _, __]) => err)
                    .map(([err, _, __]) => {
                        return `Failed to load level. (${err}.json)`;
                    }),
            );
            if (!this.editors) {
                this.errors.push('Failed to load list editors.');
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
