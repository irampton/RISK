export const AI = {
    placeTroop,
    attack,
    moveTroops
};

function placeTroop( gameStateTerritories, territories, teamId, personality ) {
    const { aggressive, cling } = personality;

    // Get all territories owned by the AI
    const ownedTerritories = gameStateTerritories.filter( t => t.owner === teamId );

    // Calculate the priority for each owned territory
    const territoryScores = ownedTerritories.map( territory => {
        const territoryData = territories.find( t => t.id === territory.id );
        const connections = territoryData.connections;

        // Calculate the number of enemy neighbors
        const enemyNeighbors = connections.filter( connId => {
            const neighbor = gameStateTerritories.find( t => t.id === connId );
            return neighbor && neighbor.owner !== teamId;
        } );

        // Score calculation
        const defensiveWeight = ( 1 - cling ) * enemyNeighbors.length; // Defensive priority
        const aggressiveWeight = aggressive * ( territory.troops || 1 ); // Offensive priority
        const troopPenalty = 1 / ( territory.troops + 1 ); // Reduces score as troops increase

        return {
            id: territory.id,
            score: ( defensiveWeight + aggressiveWeight ) * ( troopPenalty / 2 )
        };
    } );

    // Find the territory with the highest score
    const bestTerritory = territoryScores.reduce( ( best, current ) =>
        current.score > best.score ? current : best
    );

    // Place 1 troop on the selected territory
    const targetTerritory = gameStateTerritories.find( t => t.id === bestTerritory.id );
    if ( targetTerritory ) {
        targetTerritory.troops += 1;
    }
}

function attack( gameStateTerritories, territories, teamId, personality, turnStats ) {
    const { aggressive, cling } = personality;

    // Helper function to check if a territory helps the AI control a continent
    function isContinentTarget( territoryId ) {
        const territory = territories.find( t => t.id === territoryId );
        const continentTerritories = territories.filter( t => t.continent === territory.continent );
        const ownedContinentTerritories = gameStateTerritories.filter( t => t.owner === teamId && continentTerritories.some( ct => ct.id === t.id ) );

        return ownedContinentTerritories.length >= continentTerritories.length - 2; // Nearing full control of the continent
    }

    // Helper function to calculate how many owned territories are connected to a target
    function getConnectedOwnedTerritories( targetId ) {
        const targetData = territories.find( t => t.id === targetId );
        const ownedTerritories = gameStateTerritories.filter( t => t.owner === teamId );
        const connectedOwnedTerritories = targetData.connections.filter( connId => {
            return ownedTerritories.some( t => t.id === connId );
        } );

        return connectedOwnedTerritories.length;
    }

    // Get AI's territories
    const ownedTerritories = gameStateTerritories.filter( t => t.owner === teamId );

    // Determine potential attacks
    const attackOptions = [];
    ownedTerritories.forEach( attacker => {
        if ( attacker.troops <= 1 ) return; // Cannot attack with 1 or fewer troops

        const attackerData = territories.find( t => t.id === attacker.id );
        attackerData.connections.forEach( targetId => {
            const target = gameStateTerritories.find( t => t.id === targetId );
            if ( target.owner !== teamId ) {
                // Calculate attack desirability
                const troopDifference = attacker.troops - target.troops;
                const offensiveScore = aggressive * troopDifference; // Favor attacking weaker enemies
                const defensiveRisk = ( 1 - cling ) * target.troops; // Consider potential losses
                const priorAggressionPenalty = turnStats.territoriesWon * ( 1 - aggressive ); // Penalize attacking after many wins
                const consolidationBonus = isContinentTarget( targetId ) ? ( 4 * aggressive ) : 0; // Bonus for capturing a continent
                const connectedOwnedBonus = getConnectedOwnedTerritories( targetId ) * ( aggressive + .2 ); // Bonus for territories connected to more owned ones
                const gapBonus = troopDifference >= 8 ? ( 8 * Math.min( 1, aggressive * +.33 ) ) : 0;

                // Adjust desirability with the consolidation and connection bonuses
                const desirability = offensiveScore - defensiveRisk - priorAggressionPenalty + consolidationBonus + connectedOwnedBonus + gapBonus;

                attackOptions.push( {
                    from: attacker.id,
                    to: target.id,
                    troopDifference,
                    attackerTroops: attacker.troops,
                    score: desirability,
                    targetContinent: territories.find( t => t.id === target.id ).continent
                } );
            }
        } );
    } );

    // Sort attack options by score (highest first)
    attackOptions.sort( ( a, b ) => b.score - a.score );

    // Decide whether to attack
    const bestAttack = attackOptions[0];
    if ( !bestAttack || bestAttack.score <= 0 ) {
        // No viable attack option or all scores are negative
        return { willAttack: false, attackFrom: null, attackTo: null, troops: 0, attempts: 0 };
    }

    // Determine number of troops to commit based on troop difference and aggressiveness
    const baseTroops = Math.max( 1, Math.floor( bestAttack.troopDifference * ( aggressive + .5 ) ) );
    const troopsToUse = Math.min( baseTroops, bestAttack.attackerTroops - 1 ); // Always leave 1 troop behind

    // Decide attempts based on aggressiveness, make AI more likely to attack
    const attempts = aggressive > 0.7 ? -1 : Math.ceil( troopsToUse / 2 );

    return {
        willAttack: true,
        attackFrom: bestAttack.from,
        attackTo: bestAttack.to,
        troops: troopsToUse,
        attempts
    };
}


function moveTroops( gameStateTerritories, territories, teamId, personality ) {
    const { aggressive, cling } = personality;

    // Helper function to check for an unbroken line of connected territories
    function hasPath( sourceId, targetId, visited = new Set() ) {
        if ( sourceId === targetId ) return true;
        visited.add( sourceId );

        const sourceTerritory = territories.find( t => t.id === sourceId );
        const neighbors = sourceTerritory.connections.filter( connId => {
            const neighbor = gameStateTerritories.find( t => t.id === connId );
            return neighbor.owner === teamId && !visited.has( connId );
        } );

        return neighbors.some( neighborId => hasPath( neighborId, targetId, visited ) );
    }

    // Get AI's territories
    const ownedTerritories = gameStateTerritories.filter( t => t.owner === teamId );

    // Find territories with surplus troops (more than 1 troop)
    const surplusTerritories = ownedTerritories
        .filter( t => t.troops > 1 )
        .map( t => {
            const territoryData = territories.find( td => td.id === t.id );
            return {
                id: t.id,
                troops: t.troops,
                connections: territoryData.connections
            };
        } );

    // Find territories with defensive needs (enemy neighbors)
    const needyTerritories = ownedTerritories
        .map( t => {
            const territoryData = territories.find( td => td.id === t.id );
            const enemyNeighbors = territoryData.connections.filter( connId => {
                const neighbor = gameStateTerritories.find( nt => nt.id === connId );
                return neighbor && neighbor.owner !== teamId;
            } );
            return {
                id: t.id,
                troops: t.troops,
                enemyCount: enemyNeighbors.length
            };
        } )
        .filter( t => t.enemyCount > 0 );

    // Move troops based on priority (balance aggressive and cling)
    surplusTerritories.forEach( source => {
        needyTerritories.forEach( target => {
            if ( source.id === target.id || source.troops <= 1 ) return; // Skip if source is target or no troops to move

            // Check if there's a valid path
            if ( !hasPath( source.id, target.id ) ) return;

            const distance = 1; // Assuming immediate neighbors for simplicity
            const priority = aggressive * target.enemyCount - cling * distance;

            if ( priority > 0 ) {
                // Move troops to a target with defensive needs, but don't send all troops
                const troopsToMove = Math.max( 1, Math.floor( ( source.troops - 1 ) * 0.5 ) ); // Move half of surplus, but at least 1 troop
                if ( troopsToMove > 0 ) {
                    // Update troop counts directly in gameStateTerritories
                    const sourceTerritory = gameStateTerritories.find( t => t.id === source.id );
                    const targetTerritory = gameStateTerritories.find( t => t.id === target.id );

                    // Ensure no negative troop counts
                    if ( sourceTerritory.troops > troopsToMove ) {
                        sourceTerritory.troops -= troopsToMove;
                        targetTerritory.troops += troopsToMove;
                    }
                }
            }
        } );
    } );
}