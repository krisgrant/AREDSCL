import { round, score } from "./score.js";
import { store } from "./main.js";

function getDir(mode = store.mode || "challenge") {
    return `/data/${mode}`;
}

/**
 * LIST
 */
export async function fetchList(mode = store.mode || "challenge") {
    const dir = getDir(mode);

    const listResult = await fetch(`${dir}/_list.json`);
    const packResult = await fetch(`${dir}/_packlist.json`);

    if (!listResult.ok || !packResult.ok) {
        console.error("Missing list or pack files for mode:", mode);
        return null;
    }

    try {
        const list = await listResult.json();
        const packsList = await packResult.json();

        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();

                    const packs = packsList
    .filter((x) => x.levels.includes(path))
    .map(p => ({
        ...p,
        _mode: mode
    }));

                    return [
                        {
                            ...level,
                            rank,
                            packs,
                            path,
                            records: level.records.sort((a, b) => b.percent - a.percent),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, rank, path];
                }
            })
        );
    } catch {
        console.error("Failed to load list.");
        return null;
    }
}

/**
 * EDITORS
 */
export async function fetchEditors() {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    try {
        const res = await fetch(`${dir}/_editors.json`);
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * LEADERBOARD (FIXED)
 */
export async function fetchLeaderboard(mode = store.mode || "challenge") {
    const dir = getDir(mode);
    const scoreMode =
    mode === "demons" ||
    window.location.hash.startsWith("#/demons/")
        ? "demons"
        : "normal";

    const list = await fetchList(mode);
    if (!list) return [[], ["Failed to load list"]];

    const packResult = await fetch(`${dir}/_packlist.json`).then(r => r.json());

    const scoreMap = {};
    const errs = [];
    const packMultiplier = 1.5;

    // ----------------------------
    // BUILD SCORES
    // ----------------------------
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        const verifier = level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
            packs: [],
        };

        // VERIFIED (always treated as 100%)
        scoreMap[verifier].verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, scoreMode),
            link: level.verification,
            path: level.path,
        });

        // RECORDS
        level.records.forEach((record) => {
            const user = record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
                packs: [],
            };

            if (record.percent === 100) {
                scoreMap[user].completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, scoreMode),
                    link: record.link,
                    path: level.path,
                });
            } else {
                // still allowed but no partial scoring
                scoreMap[user].progressed.push({
                    rank: rank + 1,
                    level: level.name,
                    percent: record.percent,
                    score: score(rank + 1, scoreMode),
                    link: record.link,
                    path: level.path,
                });
            }
        });
    });

    // ----------------------------
    // PACK CALCULATION
    // ----------------------------
    for (let user of Object.entries(scoreMap)) {
        const levels = [...user[1].verified, ...user[1].completed].map(x => x.path);

        for (let pack of packResult) {
            if (pack.levels.every(e => levels.includes(e))) {
                user[1].packs.push(pack);
            }
        }
    }

    // ----------------------------
    // FINAL OUTPUT
    // ----------------------------
    const res = Object.entries(scoreMap).map(([user, scores]) => {
    const all = [...scores.verified, ...scores.completed, ...scores.progressed];

    const totalWithoutBonus = all.reduce((p, c) => p + c.score, 0);

    let packScore = 0;

    const userLevels = [...scores.verified, ...scores.completed];

    for (let pack of scores.packs) {
        for (let lvl of pack.levels) {
            const found = userLevels.find(x => x.path === lvl);

            if (found) {
                packScore += score(found.rank, scoreMode);
            }
        }
    }

    const packBonus = packScore * (packMultiplier - 1);
    const total = totalWithoutBonus + packBonus;

    return {
        user,
        total: round(total),
        packBonus: round(packBonus),
        ...scores,
    };
});

    return [res.sort((a, b) => b.total - a.total), errs];
}

/**
 * PACKS
 */
export async function fetchPacks() {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    try {
        const res = await fetch(`${dir}/_packlist.json`);
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * PACK LEVELS
 */
export async function fetchPackLevels(packname) {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    const packResult = await fetch(`${dir}/_packlist.json`);
    const packsList = await packResult.json();

    const selected = packsList.find(p => p.name === packname);
    if (!selected) return null;

    try {
        return await Promise.all(
            selected.levels.map(async (path) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();
                    return [{ level, path }, null];
                } catch {
                    return [null, path];
                }
            })
        );
    } catch (e) {
        console.error("Failed to load packs.", e);
        return null;
    }
}