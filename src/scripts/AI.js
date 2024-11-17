import { territories } from "@/scripts/territories.js";

const personalities = {
    "Red": { "aggressive": normalRandom( .95, 0.15 ), "cling": normalRandom( 0.02, 0.01 ) },
    "Orange": { "aggressive": normalRandom( 0.325, 0.08 ), "cling": normalRandom( 0.1, 0.05 ) },
    "Gold": { "aggressive": normalRandom( 0.25, 0.2 ), "cling": normalRandom( 0.15, 0.1 ) },
    "Forest Green": { "aggressive": normalRandom( 0.15, 0.2 ), "cling": normalRandom( 0.5, 0.15 ) },
    "Blue": { "aggressive": normalRandom( 0.33, 0.1 ), "cling": normalRandom( 0.05, 0.2 ) },
    "Purple": { "aggressive": normalRandom( 0.33, 0.25 ), "cling": normalRandom( 0.6, 0.3 ) },
}

export const AI = {
    placeTroop,
    attack,
    moveTroops,
    personalities
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
            priorityScore += cling * 3; // High bonus for near-continent control
        } else if ( remainingTerritories <= 4 ) {
            priorityScore += cling; // Smaller bonus
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
                const consolidationBonus = isContinentTarget( targetId, ownedTerritories ) ? (4 * aggressive) : 0;
                const connectedOwnedBonus = getConnectedOwnedTerritories( targetId, ownedTerritories ) * (aggressive + .2);
                const gapBonus = troopDifference >= 8 ? (8 * Math.min( 1, aggressive * .33 )) : 0;

                // Get support from neighboring territories
                const supportingNeighbors = getSupportingNeighbors( attacker.id, targetId, ownedTerritories );
                const supportingTroops = supportingNeighbors.reduce( ( total, neighbor ) => total + neighbor.troops, 0 );
                const multiTerritoryBonus = supportingTroops > 0 ? (supportingTroops * 0.3 * aggressive) : 0; // Boost if there are supporting troops

                let desirability = offensiveScore - defensiveRisk - priorAggressionPenalty + consolidationBonus + connectedOwnedBonus + gapBonus + multiTerritoryBonus;

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

    // Helper function to calculate vulnerability for a territory
    function calculateVulnerability( territory ) {
        if ( vulnerabilityCache.has( territory.id ) ) {
            return vulnerabilityCache.get( territory.id );
        }

        const connectedTerritories = connectionMap.get( territory.id ).map( id => territoryMap.get( id ) );
        let vulnerability = 0;

        connectedTerritories.forEach( neighbor => {
            if ( neighbor && neighbor.owner !== teamId ) {
                const troopDifference = neighbor.troops - territory.troops;
                if ( troopDifference > 0 ) {
                    vulnerability += troopDifference;
                }
            }
        } );

        vulnerabilityCache.set( territory.id, vulnerability );
        return vulnerability;
    }

    // Helper function to calculate exponential penalty for overstacking
    function calculateExponentialPenalty( territory ) {
        if ( overstackPenaltyCache.has( territory.id ) ) {
            return overstackPenaltyCache.get( territory.id );
        }

        const connectedTerritories = connectionMap.get( territory.id ).map( id => territoryMap.get( id ) );
        let penalty = 0;

        connectedTerritories.forEach( neighbor => {
            if ( neighbor ) {
                const troopDifference = territory.troops - neighbor.troops;
                if ( troopDifference > 3 ) {
                    penalty += Math.exp( troopDifference / 3 );
                }
            }
        } );

        overstackPenaltyCache.set( territory.id, penalty );
        return penalty;
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

                let priorityScore = 0;

                // Factor 1: Protect vulnerable territories
                const targetVulnerability = calculateVulnerability( target );
                priorityScore += cling * targetVulnerability;

                // Factor 2: Avoid leaving extra troops in safe territories
                const sourceVulnerability = calculateVulnerability( source );
                if ( sourceVulnerability === 0 ) {
                    priorityScore += aggressive * -source.troops; // Penalize leaving extra troops in safe areas
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
                const connectedTerritories = connectionMap.get( target.id ).map( id => territoryMap.get( id ) );
                connectedTerritories.forEach( neighbor => {
                    if ( neighbor ) {
                        const troopDifference = target.troops - neighbor.troops;
                        if ( troopDifference > 0 ) {
                            priorityScore -= cling * troopDifference * .5;
                        }
                    }
                } );

                // Factor 5: Prioritize protection for weak territories with adjacent enemy presence
                const adjacentEnemies = connectionMap.get( target.id )
                    .map( id => territoryMap.get( id ) )
                    .filter( neighbor => neighbor && neighbor.owner !== teamId );
                adjacentEnemies.forEach( enemy => {
                    const enemyTroopDifference = enemy.troops - target.troops;
                    if ( enemyTroopDifference > 0 ) {
                        priorityScore += cling * enemyTroopDifference;
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

                // **Force movement out of safe territories if reinforcement is needed**
                if ( isSafe( source ) && calculateVulnerability( target ) ) {
                    priorityScore += 1e4;
                }

                // Factor 7: Apply exponential penalty for overstacking
                const overstackPenalty = calculateExponentialPenalty( target );
                priorityScore -= overstackPenalty;

                // New Factor: Encourage spreading out troops to less populated territories
                if ( target.troops < source.troops ) {
                    priorityScore += aggressive * (source.troops - target.troops); // Favor moving to weaker territories
                }

                // Check if this move is better than the current best
                if ( priorityScore > maxPriority ) {
                    const troopsToMove = Math.min( maxTroopsToMove, source.troops - 1 );
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


export function hasPath( gameStateTerritories, teamId, sourceId, targetId, visited = new Set() ) {
    if ( sourceId === targetId ) return true;
    visited.add( sourceId );
    const sourceTerritory = territories[sourceId];
    const neighbors = sourceTerritory.connections.filter( connId => {
        const neighbor = gameStateTerritories.find( t => t.id === connId );
        return neighbor.owner === teamId && !visited.has( connId );
    } );

    return neighbors.some( neighborId => hasPath( gameStateTerritories, teamId, neighborId, targetId, visited ) );
}

export function randomPersonality() {
    return {
        "aggressive": normalRandom( 0.33, 0.25 ),
        "cling": normalRandom( 0.1, 0.2 )
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
