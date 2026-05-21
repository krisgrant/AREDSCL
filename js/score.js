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

    // normalise rank (0 → 1)
    const t = (rank - 1) / 49;

    // fitted curve coefficients
    const score =
        100 +
        (-61.743 * t) +
        (14.985 * Math.pow(t, 2)) +
        (-33.242 * Math.pow(t, 3));

    return Math.max(round(score), 0);
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