const scale = 2;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @returns {Number}
 */
export function score(rank) {
    if (rank > 50) {
        return 0;
    }

    // anchor points (rank → score)
    const points = [
        [1, 100],
        [10, 80],
        [25, 50],
        [50, 20]
    ];

    // find which segment the rank is in
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

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}