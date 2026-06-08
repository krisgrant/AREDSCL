export function score(rank, mode = "normal") {
    if (mode === "normal" && rank > 50) return 0;
    if (mode === "demons" && rank > 150) return 0;

    const points =
        mode === "demons"
            ? [
                [1, 500],
                [10, 300],
                [35, 200],
                [75, 100],
                [100, 70],
                [150, 20]
            ]
            : [
                [1, 100],
                [10, 75],
                [25, 50],
                [50, 20]
            ];

    for (let i = 0; i < points.length - 1; i++) {
        const [r1, s1] = points[i];
        const [r2, s2] = points[i + 1];

        if (rank >= r1 && rank <= r2) {
            const t = (rank - r1) / (r2 - r1);
            const score = s1 + (s2 - s1) * t;
            return Math.max(round(score), 0);
        }
    }

    return 0;
}