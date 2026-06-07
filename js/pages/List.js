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

    template: `... (UNCHANGED - keep your current template exactly) ...`,

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
        // ✅ THIS is the ONLY important fix here
        const mode = this.$route.meta?.list || store.mode || "challenge";

        this.list = await fetchList(mode);
        this.editors = await fetchEditors();

        // error handling (UNCHANGED logic, safer version)
        if (!this.list) {
            this.errors.push(
                "Failed to load list. Retry in a few minutes or notify list staff."
            );
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level. (${err}.json)`)
            );
        }

        if (!this.editors) {
            this.errors.push("Failed to load list editors.");
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};