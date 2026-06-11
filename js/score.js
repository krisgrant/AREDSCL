const scale = 2;

export function score(rank, mode = "normal") {
    const points =
        mode === "demons"
            ? [
                [1, 500],
                [25, 190],
                [50, 120],
                [75, 88],
                [100, 58],
                [125, 36],
                [150, 25]
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
            const value = s1 + (s2 - s1) * t;
            return Math.max(round(value), 0);
        }
    }

    return 0;
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        const arr = ('' + num).split('e');
        const sig = (+arr[1] + scale > 0 ? '+' : '');
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}