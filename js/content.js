import { round, score } from "./score.js";
import { store } from "./main.js";

/**
 * Get current data directory safely
 */
function getDir(mode = store.mode || "challenge") {
    return `/data/${mode}`;
}

/**
 * Safe list loader
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

                    let packs = packsList.filter((x) =>
                        x.levels.includes(path)
                    );

                    return [
                        {
                            ...level,
                            rank,
                            packs,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent
                            ),
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
 * Editors
 */
export async function fetchEditors() {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        return await editorsResults.json();
    } catch {
        return null;
    }
}

/**
 * Leaderboard
 */
export async function fetchLeaderboard() {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    const list = await fetchList(mode);
    if (!list) return [[], ["Failed to load list"]];

    const packResult = await fetch(`${dir}/_packlist.json`).then((r) =>
        r.json()
    );

    const scoreMap = {};
    const errs = [];
    const packMultiplier = 1.5;

    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        const verifier =
            Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === level.verifier.toLowerCase()
            ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
            packs: [],
        };

        scoreMap[verifier].verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
            path: level.path,
        });

        level.records.forEach((record) => {
            const user =
                Object.keys(scoreMap).find(
                    (u) => u.toLowerCase() === record.user.toLowerCase()
                ) || record.user;

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
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                    path: level.path,
                });
                return;
            }

            scoreMap[user].progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
                path: level.path,
            });
        });
    });

    for (let user of Object.entries(scoreMap)) {
        let levels = [...user[1]["verified"], ...user[1]["completed"]].map(
            (x) => x["path"]
        );

        for (let pack of packResult) {
            if (pack.levels.every((e1) => levels.includes(e1))) {
                user[1]["packs"].push(pack);
            }
        }
    }

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;

        let packScore = 0;
        let packScoreMultiplied = 0;

        for (let pack of scores["packs"]) {
            const packLevelScores = [];
            const allUserLevels = [
                ...scores["verified"],
                ...scores["completed"],
            ];

            for (let level of pack["levels"]) {
                let userLevel = allUserLevels.find((lvl) => lvl.path == level);
                if (userLevel) packLevelScores.push(userLevel.score);
            }

            packLevelScores.forEach((score) => (packScore += score));
            packScoreMultiplied = packScore * packMultiplier;
        }

        let totalWithoutBonus = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        const total = totalWithoutBonus - packScore + packScoreMultiplied;

        return {
            user,
            total: round(total),
            packBonus: round(total - totalWithoutBonus),
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}

/**
 * Packs
 */
export async function fetchPacks() {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    try {
        const packResult = await fetch(`${dir}/_packlist.json`);
        return await packResult.json();
    } catch {
        return null;
    }
}

/**
 * Pack levels
 */
export async function fetchPackLevels(packname) {
    const mode = store.mode || "challenge";
    const dir = getDir(mode);

    const packResult = await fetch(`${dir}/_packlist.json`);
    const packsList = await packResult.json();

    const selectedPack = packsList.find((pack) => pack.name == packname);

    if (!selectedPack) return null;

    try {
        return await Promise.all(
            selectedPack.levels.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();
                    return [{ level, path }, null];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            })
        );
    } catch (e) {
        console.error("Failed to load packs.", e);
        return null;
    }
}