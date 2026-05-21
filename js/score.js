/**
 * Numbers of decimal digits to round to
 */
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

    // Old formula
    /*
    let score = (100 / Math.sqrt((rank - 1) / 50 + 0.444444) - 50) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    // New formula
    let score = (-6.2 * Math.pow(rank - 1, 0.75) + 100);

    score = Math.max(0, score);

    return Math.max(round(score), 0);
}

export function score(rank) {
    if (rank > 50) {
        return 0;
    }

    let t = (rank - 1) / 49;

    let score = 100 - (80 * Math.pow(t, 1.6));

    score = Math.max(0, score);

    return Math.max(round(score), 0);
}