export const defaultPersonalities = {
    "Red": { "aggressive": normalRandom( .95, 0.15 ), "cling": normalRandom( 0.2, 0.01 ) },
    "Orange": { "aggressive": normalRandom( 0.4, 0.08 ), "cling": normalRandom( 0.33, 0.05 ) },
    "Gold": { "aggressive": normalRandom( 0.25, 0.2 ), "cling": normalRandom( 0.8, 0.1 ) },
    "Forest Green": { "aggressive": normalRandom( 0.15, 0.1 ), "cling": normalRandom( 0.5, 0.15 ) },
    "Blue": { "aggressive": normalRandom( 0.33, 0.1 ), "cling": normalRandom( 0.25, 0.1 ) },
    "Purple": { "aggressive": normalRandom( 0.6, 0.25 ), "cling": normalRandom( 0.6, 0.3 ) },
}

export function randomPersonality() {
    return {
        "aggressive": normalRandom( 0.5, 0.25 ),
        "cling": normalRandom( 0.5, 0.33 )
    }
}

function normalRandom( mean = 0.5, stdDev = 0.1 ) {
    // Using the Box-Muller transform to generate a normal distribution
    let u1 = Math.random();
    let u2 = Math.random();

    // Box-Muller transform
    let z0 = Math.sqrt( -2 * Math.log( u1 ) ) * Math.cos( 2 * Math.PI * u2 );

    // Return the scaled value (normal distribution)
    return Math.min( Math.max( .01, mean + z0 * stdDev ), 1 );
}