export function randomizeTerritories( teams, territories ) {
    // Create an array of territory IDs and shuffle it
    const shuffledIndices = [ ...territories.keys() ].sort( () => Math.random() - 0.5 );

    // Assign territories to teams in a round-robin fashion
    let teamIndex = 0;
    shuffledIndices.forEach( ( index ) => {
        territories[index].owner = teams[teamIndex].id; // Assign team ID as the owner
        territories[index].troops = 1; // Each territory starts with 1 troop
        teamIndex = ( teamIndex + 1 ) % teams.length; // Cycle through the teams
    } );
}

export function executeAttack( gameStateTerritories, attackDetails ) {
    const { attackFrom, attackTo, troops, attempts } = attackDetails;

    const attacker = gameStateTerritories.find( t => t.id === attackFrom );
    const defender = gameStateTerritories.find( t => t.id === attackTo );

    if ( !attacker || !defender ) {
        console.error( "Invalid territory IDs" );
        return null;
    }

    if ( attacker.troops <= 1 || troops > attacker.troops - 1 ) {
        console.error( "Not enough troops to attack" );
        return null;
    }

    let attackingTroops = Math.min( troops, attacker.troops - 1 ); // Can only commit troops-1 for attack
    let defendingTroops = defender.troops;

    let attackRounds = 0;
    let attackerLosses = 0;
    let defenderLosses = 0;

    // Run attack rounds
    while ( attackingTroops > 0 && defendingTroops > 0 ) {
        // Limit rounds if attempts is not -1
        if ( attempts !== -1 && attackRounds >= attempts ) break;

        attackRounds++;

        // Determine number of dice rolls
        const attackerDiceCount = Math.min( attackingTroops, 3 ); // Max 3 dice for attacker
        const defenderDiceCount = Math.min( defendingTroops, 2 ); // Max 2 dice for defender

        // Roll dice
        const attackerRolls = Array.from( { length: attackerDiceCount }, () => Math.floor( Math.random() * 6 ) + 1 ).sort( ( a, b ) => b - a );
        const defenderRolls = Array.from( { length: defenderDiceCount }, () => Math.floor( Math.random() * 6 ) + 1 ).sort( ( a, b ) => b - a );

        // Compare rolls
        for ( let i = 0; i < Math.min( attackerRolls.length, defenderRolls.length ); i++ ) {
            if ( attackerRolls[i] > defenderRolls[i] ) {
                defendingTroops--; // Defender loses a troop
                defenderLosses++;
            } else {
                attackingTroops--; // Attacker loses a troop
                attackerLosses++;
            }
        }
    }

    if ( defendingTroops < 0 ) {
        defendingTroops = 0;
    }
    if ( attackingTroops < 0 ) {
        attackingTroops = 0;
    }

    // Update game state
    attacker.troops -= troops - attackingTroops; // Deduct lost attacking troops
    defender.troops = defendingTroops;

    let attackerWon = false;

    // Handle territory capture
    if ( defendingTroops === 0 ) {
        defender.owner = attacker.owner; // Change ownership
        defender.troops = attackingTroops; // Move remaining attacking troops into captured territory
        attacker.troops -= attackingTroops; // Remaining attacking troops move
        attackerWon = true;
    }

    return {
        attackerLosses,
        defenderLosses,
        attackerWon
    };
}

export function hasPath( gameStateTerritories, territories, teamId, sourceId, targetId, visited = new Set() ) {
    if ( sourceId === targetId ) return true;
    visited.add( sourceId );
    const sourceTerritory = territories[sourceId];
    const neighbors = sourceTerritory.connections.filter( connId => {
        const neighbor = gameStateTerritories.find( t => t.id === connId );
        return neighbor.owner === teamId && !visited.has( connId );
    } );

    return neighbors.some( neighborId => hasPath( gameStateTerritories, territories, teamId, neighborId, targetId, visited ) );
}

export function round(num, precision = 1){
    return Math.floor(num * precision) / precision;
}