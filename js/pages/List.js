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
                    <p v-if="rank === null" class="type-label-lg">–</p>
                    <p v-else-if="rank === 1" class="type-label-lg" class="top1">#{{ rank }}</p>
                    <p v-else-if="rank <= 75" class="type-label-lg">#{{ rank }}</p>
                    <p v-else class="extended" :style="{ color: rank > 150 ? 'var(--color-legacy)' : legacy }">#{{ rank }}</p>
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
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <span class="tags">{{ level.tag || 'None' }}</span>
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
                            <p>{{ level.password || 'Free Copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Difficulty:</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="level.rank !== null && level.rank <= 150"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
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
                    <div class="dark-bg">
                    <h2>Guidelines</h2>
                    <br>
                    <p>Every action is conducted in accordance with our guidelines. In order to guarantee a consistent experience, make sure to verify them before submitting a record!</p>
                    <br><br>
                    <a class="btngl" href="/extended-page/rules.html">Guidelines Page</a>
                    </div>
                    <div class="dark-bg" v-if="editors">
                    <br>
                        <h3>List Staff:</h3>
                        <br>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </div>
                    <div class="og">
                        <iframe class="discord-box" src="https://discord.com/widget?id=866826240476053514&theme=dark" width="270" height="300" allowtransparency="false" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                    </div>
                    <div class="og" class="dark-bg">
                        <p>All credit goes to <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a>, whose website this is a replica of. We obtained permission from its owners and have no connection to TSL. Original List by <a href="https://me.redlimerl.com/" target="_blank">RedLime</a></p>
                    </div>
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
