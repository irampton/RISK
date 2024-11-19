export const AI = {
    placeTroop,
    attack,
    moveTroops
};

function placeTroop( gameStateTerritories, territories, teamId, personality ) {
    const { aggressive, cling } = personality;

    // Get all territories owned by the AI
    const aiTerritories = gameStateTerritories.filter( t => t.owner === teamId );

    // Initialize variables to track the best choice and max priority score
    let bestTerritory = null;
    let maxPriority = -Infinity;

    // Evaluate each owned territory
    aiTerritories.forEach( aiTerritory => {
        const territoryData = territories.find( t => t.id === aiTerritory.id );
        let priorityScore = 0;

        // Factor 1: Nearby positions with low troop counts
        const connectedTerritories = territoryData.connections.map( id => {
            return gameStateTerritories.find( t => t.id === id );
        } );

        connectedTerritories.forEach( neighbor => {
            if ( neighbor ) {
                if ( neighbor.owner !== teamId ) {
                    const troopDifference = aiTerritory.troops - neighbor.troops;
                    if ( troopDifference > 0 ) {
                        priorityScore += (aggressive * troopDifference); // Aggression boosts attack potential
                    } else {
                        priorityScore += (cling * Math.abs( troopDifference )); // Clinginess boosts defense
                    }

                    // Factor 5: Single troop attack bonus
                    if ( neighbor.troops <= 2 && aiTerritory.troops < 4 ) {
                        priorityScore += aggressive * 10 / neighbor.troops; // Large boost for opportunistic attack
                    }
                }
            }
        } );

        // Factor 2: Heavily penalize overstacking
        const totalNeighborTroops = connectedTerritories.reduce(
            ( sum, neighbor ) => (neighbor ? sum + neighbor.troops : sum),
            0
        );
        const neighborTroopAvg = totalNeighborTroops / connectedTerritories.length || 0;
        const overstackDifference = aiTerritory.troops - neighborTroopAvg;

        if ( overstackDifference > 0 ) {
            // Quadratic penalty for overstacking
            priorityScore -= cling * (overstackDifference ** 2);
        }

        // Factor 3: Continent control - Bonus for nearly controlled continents
        const continentTerritories = territories.filter( t => t.continent === territoryData.continent );
        const ownedInContinent = continentTerritories.filter( t => gameStateTerritories.find( gt => gt.id === t.id && gt.owner === teamId ) ).length;

        const remainingTerritories = continentTerritories.length - ownedInContinent;
        if ( remainingTerritories <= 2 ) {
            priorityScore += (cling + .25) * 3 + 4; // High bonus for near-continent control
        } else if ( remainingTerritories <= 4 ) {
            priorityScore += cling * 2; // Smaller bonus
        }

        // Factor 4: Random variability
        priorityScore += Math.random() * 2;

        // Decide if this territory has the highest priority score so far
        if ( priorityScore > maxPriority ) {
            bestTerritory = aiTerritory;
            maxPriority = priorityScore;
        }
    } );

    // Place the troop on the best territory (if one was found)
    if ( bestTerritory ) {
        bestTerritory.troops += 1;
    }
}


function attack( gameStateTerritories, territories, teamId, personality, turnStats ) {
    const ownedTerritories = gameStateTerritories.filter( t => t.owner === teamId );

    const totalTroops = ownedTerritories.reduce( ( sum, t ) => sum + t.troops, 0 );

    const cling = personality.cling;
    //const aggressive = personality.aggressive + Math.floor( totalTroops / 50 ) * (totalTroops / 500);
    const aggressive = personality.aggressive + (2 ** Math.floor( totalTroops / 50 ) - 1) * .1;
    //const aggressive = personality.aggressive

    // Prepare for optimization
    const territoryMap = new Map( territories.map( t => [t.id, t] ) );
    const continentMap = getContinentTerritories( territories );

    // Helper functions...
    function isContinentTarget( territoryId, ownedTerritories ) {
        const territory = territoryMap.get( territoryId );
        const continentTerritories = continentMap[territory.continent];
        const ownedContinentTerritories = ownedTerritories.filter( t => continentTerritories.includes( t.id ) );
        return ownedContinentTerritories.length >= continentTerritories.length - 2;
    }

    function getConnectedOwnedTerritories( targetId, ownedTerritories ) {
        const targetData = territoryMap.get( targetId );
        return targetData.connections.filter( connId => ownedTerritories.some( t => t.id === connId ) ).length;
    }

    function getSupportingNeighbors( attackerId, targetId, ownedTerritories ) {
        // Find the target territory and its connections
        const target = territoryMap.get( targetId );
        const targetConnections = target.connections;

        // Find all neighboring owned territories that can support the attack
        const supportingNeighbors = targetConnections.filter( connId => {
            const neighbor = territoryMap.get( connId );
            return neighbor.owner === teamId && neighbor.id !== attackerId && neighbor.troops > 2; // Neighbor must have troops
        } );

        return supportingNeighbors;
    }

    //avoid attacking if you have little troops
    const troopToTerritoryPenalty = ((totalTroops / ownedTerritories.length) < 4) ? ((1 - aggressive) * 10) : 0;

    // Attack options
    const attackOptions = [];
    ownedTerritories.forEach( attacker => {
        if ( attacker.troops <= 1 ) return;

        territories[attacker.id].connections.forEach( targetId => {
            const target = gameStateTerritories.find( t => t.id === targetId );
            if ( target.owner !== teamId ) {
                // Desirability calculation...
                const troopDifference = attacker.troops - target.troops;
                const offensiveScore = aggressive * ((troopDifference <= 0 && troopDifference > -2) ? ((troopDifference + 3) / 8) : troopDifference);
                const defensiveRisk = (1 - cling) * Math.min( target.troops, 20 );
                const priorAggressionPenalty = turnStats.territoriesWon * (1 - aggressive);
                const consolidationBonus = isContinentTarget( targetId, ownedTerritories ) ? (4 * (aggressive + .5)) : 0;
                const connectedOwnedBonus = getConnectedOwnedTerritories( targetId, ownedTerritories ) * (aggressive + .2) * 3;
                const gapBonus = troopDifference >= 8 ? (8 * Math.min( 1, aggressive * .33 )) : 0;

                // Get support from neighboring territories
                const supportingNeighbors = getSupportingNeighbors( attacker.id, targetId, ownedTerritories );
                const supportingTroops = supportingNeighbors.reduce( ( total, neighbor ) => total + neighbor.troops, 0 );
                const multiTerritoryBonus = supportingTroops > 0 ? (supportingTroops * 2 * aggressive) : 0; // Boost if there are supporting troops

                let desirability = offensiveScore
                    - defensiveRisk
                    - priorAggressionPenalty
                    + consolidationBonus
                    + connectedOwnedBonus
                    + gapBonus
                    + multiTerritoryBonus
                    - troopToTerritoryPenalty;

                if ( target.troops <= 1 ) desirability += 10; // Favor easy targets

                attackOptions.push( {
                    from: attacker.id,
                    to: target.id,
                    troopDifference,
                    attackerTroops: attacker.troops,
                    score: desirability,
                    supportingNeighbors
                } );
            }
        } );
    } );

    // Sort attack options
    attackOptions.sort( ( a, b ) => b.score - a.score );

    // Decide whether to attack
    const bestAttack = attackOptions[0];
    if ( !bestAttack || bestAttack.score <= 0 ) {
        return { willAttack: false, attackFrom: null, attackTo: null, troops: 0, attempts: 0 };
    }

    const baseTroops = Math.max( 1, Math.floor( bestAttack.troopDifference * (aggressive + .5) ) );
    const troopsToUse = Math.min( baseTroops, bestAttack.attackerTroops - 1 );

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

    // Find all AI-owned territories
    const aiTerritories = gameStateTerritories.filter( t => t.owner === teamId );
    const troopCount = aiTerritories.reduce( ( sum, t ) => sum + t.troops, 0 );

    if ( aiTerritories.length <= 1 || troopCount === aiTerritories.length ) {
        return;
    }

    // Precompute territory connections and vulnerability data for faster lookup
    const territoryMap = new Map( gameStateTerritories.map( t => [t.id, t] ) );
    const connectionMap = new Map( territories.map( t => [t.id, t.connections] ) );
    const vulnerabilityCache = new Map();
    const overstackPenaltyCache = new Map();

    // Precompute all paths between territories
    const pathCache = new Map();

    function precomputePaths() {
        function bfs( startId ) {
            const visited = new Set();
            const queue = [startId];
            const paths = new Map();
            visited.add( startId );
            paths.set( startId, true ); // A territory has a path to itself

            while ( queue.length > 0 ) {
                const currentId = queue.shift();
                const neighbors = connectionMap.get( currentId ) || [];
                neighbors.forEach( neighborId => {
                    if ( !visited.has( neighborId ) ) {
                        visited.add( neighborId );
                        queue.push( neighborId );
                        paths.set( neighborId, true );
                    }
                } );
            }
            return paths;
        }

        gameStateTerritories.forEach( territory => {
            pathCache.set( territory.id, bfs( territory.id ) );
        } );
    }

    precomputePaths();

    function hasPath( sourceId, targetId ) {
        const sourcePaths = pathCache.get( sourceId );
        return sourcePaths ? sourcePaths.has( targetId ) : false;
    }

    // Helper function to check if a territory is safe
    function isSafe( territory ) {
        return connectionMap.get( territory.id ).every( id => territoryMap.get( id ).owner === territory.owner );
    }

    let movesMade = 0;
    let maxTroopsToMove = 5;  // Move up to 5 troops at a time

    // Continue moving troops as long as the AI wants to make moves
    while ( movesMade < troopCount ) {
        let bestMove = null;
        let maxPriority = -Infinity;
        let moveMadeThisRound = false;

        // Evaluate all possible source and target pairs
        aiTerritories.forEach( source => {
            if ( source.troops <= 1 ) return; // Skip if source can't spare troops

            aiTerritories.forEach( target => {
                if ( source.id === target.id ) return; // Skip if source and target are the same
                if ( !hasPath( source.id, target.id ) ) return; // Skip if no path exists

                //source troop difference
                //If the source has a large number of troops, consider dividing them
                const sourceConnectedTerritories = connectionMap.get( source.id ).map( id => territoryMap.get( id ) );
                const sourceEnemyTroops = sourceConnectedTerritories
                    .filter( neighbor => neighbor && neighbor.owner !== teamId )
                    .reduce( ( sum, t ) => sum + t.troops, 0 );
                const sourceTroopGap = source.troops - sourceEnemyTroops;

                //target troop difference
                const targetConnectedTerritories = connectionMap.get( target.id ).map( id => territoryMap.get( id ) );
                const targetEnemyTroops = targetConnectedTerritories
                    .filter( neighbor => neighbor && neighbor.owner !== teamId )
                    .reduce( ( sum, t ) => sum + t.troops, 0 );
                const targetTroopGap = target.troops - targetEnemyTroops;

                let priorityScore = 0;

                // Factor 1: Protect vulnerable territories
                if ( !isSafe( target ) ) {
                    priorityScore += Math.min( cling + .5, 1 ) * -(targetTroopGap - 1) * 5;
                    if ( targetTroopGap < 0 ) {
                        priorityScore += 4;
                    } else if ( targetTroopGap === 0 ) {
                        priorityScore += 2;
                    }
                }

                // Factor 2: Avoid leaving extra troops in safe territories
                if ( isSafe( source ) ) {
                    priorityScore += (aggressive + .4) * source.troops * 3; // Penalize leaving extra troops in safe areas
                }

                // Factor 3: Optimize attack potential
                const targetConnections = connectionMap.get( target.id ).map( id => territoryMap.get( id ) );
                targetConnections.forEach( neighbor => {
                    if ( neighbor && neighbor.owner !== teamId ) {
                        const troopDifference = target.troops - neighbor.troops;
                        if ( troopDifference > 0 ) {
                            priorityScore += aggressive * troopDifference;
                        }
                    }
                } );

                // Factor 4: Penalize large stacks based on troop difference with neighbors
                if ( targetTroopGap > 0 ) {
                    priorityScore -= (cling + .1) * targetTroopGap * 5;
                }

                // Factor 5: Prioritize protection for weak territories with adjacent enemy presence
                const adjacentEnemies = connectionMap.get( target.id )
                    .map( id => territoryMap.get( id ) )
                    .filter( neighbor => neighbor && neighbor.owner !== teamId );
                adjacentEnemies.forEach( enemy => {
                    const enemyTroopDifference = enemy.troops - target.troops;
                    if ( enemyTroopDifference >= 0 ) {
                        priorityScore += (cling + .25) * (2 ** enemyTroopDifference);
                    }
                } );

                // Factor 6: Increase priority for safe territories (with no enemy neighbors)
                if ( isSafe( source ) ) {
                    priorityScore += 1e3;
                }

                // **Prevent moving troops into safe territories**
                if ( isSafe( target ) ) {
                    priorityScore -= 1e10;
                }

                // New Factor: Encourage spreading out troops to less populated territories
                if ( target.troops < source.troops ) {
                    priorityScore += aggressive * (source.troops - target.troops); // Favor moving to weaker territories
                }

                if ( sourceTroopGap > 2 ) {
                    priorityScore += (cling + .25) * (2 ** (sourceTroopGap / 2));
                }

                // If the territory is not safe, do not move troops out of it unless the gap is larger than 2 * nearby enemy troops
                if ( !isSafe( source ) && (sourceEnemyTroops * 2 > source.troops) ) {
                    priorityScore = -Infinity;
                }

                // Check if this move is better than the current best
                if ( priorityScore > maxPriority ) {
                    let troopsToMove;
                    if ( isSafe( source ) ) {
                        troopsToMove = Math.min( maxTroopsToMove, source.troops - 1 );
                    } else {
                        troopsToMove = Math.min( Math.max( 1, Math.floor( source.troops - (targetTroopGap * 1.5) ) ), source.troops - 1 )
                    }

                    bestMove = { source, target, troopsToMove };
                    maxPriority = priorityScore;
                    moveMadeThisRound = true;
                }
            } );
        } );

        // If a valid move was found, make the move
        if ( bestMove ) {
            bestMove.source.troops -= bestMove.troopsToMove;
            bestMove.target.troops += bestMove.troopsToMove;
            movesMade++;
        } else {
            break;
        }
    }
}

function getContinentTerritories( territories ) {
    const continentMap = {};

    territories.forEach( territory => {
        if ( !continentMap[territory.continent] ) {
            continentMap[territory.continent] = [];
        }
        continentMap[territory.continent].push( territory.id );
    } );

    return continentMap;
}
