// Set up canvas
const canvas = document.getElementById( 'gameCanvas' );
const ctx = canvas.getContext( '2d' );

let teams = [
    { id: 0, name: "Red", color: "rgba(255, 0, 0, 0.6)", freeTroops: 0 },
    { id: 1, name: "Green", color: "rgba(0, 255, 0, 0.6)", freeTroops: 0 },
    { id: 2, name: "Blue", color: "rgba(0, 0, 255, 0.6)", freeTroops: 0 },
    { id: 3, name: "Purple", color: "rgba(128, 0, 128, 0.6)", freeTroops: 0 },
    { id: 4, name: "Orange", color: "rgba(255, 128, 10, 0.6)", freeTroops: 0 },
    { id: 5, name: "Yellow", color: "rgba(255, 255, 0, 0.6)", freeTroops: 0 },
];

const AI_personalities = {
    "Red": {
        "aggressive": normalRandom( .75, .15 ),
        "cling": normalRandom( .15, .1 )
    },
    "Green": {
        "aggressive": normalRandom( .5, .15 ),
        "cling": normalRandom( .15, .1 )
    },
    "Blue": {
        "aggressive": normalRandom( .5, .15 ),
        "cling": normalRandom( .15, .1 )
    },
    "Purple": {
        "aggressive": normalRandom( .5, .15 ),
        "cling": normalRandom( .15, .1 )
    },
    "Orange": {
        "aggressive": normalRandom( .6, .1 ),
        "cling": normalRandom( .15, .1 )
    },
    "Yellow": {
        "aggressive": normalRandom( .3, .15 ),
        "cling": normalRandom( .15, .1 )
    }
}
console.log( AI_personalities );

let gameData = {
    territories: territories.map( t => ( { id: t.id, owner: null, troops: 0 } ) )
}

//takes a list of teams and territories and randomizes each territory to a team and puts 1 troop there
//teams - [{id, name, color },...]
//territories - [{id, owner, troops},...]
function randomizeTerritories( teams, territories ) {
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

function executeAttack( gameStateTerritories, attackDetails ) {
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

// Draw function
function drawMap() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );

    // Draw background (placeholder for a map image)
    ctx.fillStyle = "#D3E6F3"; // Ocean blue
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    // Draw territories
    gameData.territories.forEach( t => {
        const territory = territories[t.id];
        const points = territoryPolygons[t.id];
        // Draw territory polygon
        ctx.beginPath();
        ctx.moveTo( points[0][0], points[0][1] );
        for ( let i = 1; i < points.length; i++ ) {
            ctx.lineTo( points[i][0], points[i][1] );
        }
        ctx.closePath();
        ctx.fillStyle = teams[t.owner]?.color || "white";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();

        // Calculate center of polygon for text
        const centerX = points.reduce( ( sum, p ) => sum + p[0], 0 ) / points.length;
        const centerY = points.reduce( ( sum, p ) => sum + p[1], 0 ) / points.length;
        // Draw territory name
        ctx.fillStyle = "black";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText( territory.name, centerX, centerY - 10 );

        // Draw troop count
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText( t.troops, centerX, centerY + 5 );
    } );
}

let gameState = 'initial';
let currentTeam = 0;

function beginGame() {
    randomizeTerritories( teams, gameData.territories );
    drawMap();
    teams.forEach( team => {
        team.freeTroops = 40 - gameData.territories
            .reduce( ( sum, t ) => sum + ( t.owner === team.id ? t.troops : 0 ), 0 )
    } );
}

function nextTurn() {
    let team = teams[currentTeam];
    switch ( gameState ) {
        case 'initial':
            beginGame();
            gameState = 'place'
            break;
        case 'place':
            if ( freeTroopsLeft() ) {
                if ( !team.player ) {
                    if ( team.freeTroops > 0 ) {
                        AI_placeTroop( gameData.territories, territories, team.id, AI_personalities[team.name] );
                        team.freeTroops--;
                    }
                    drawMap();
                    incrementTurn();
                    nextTurn(); // if not a player, go ahead and continue the AI until the game state changes, or the player goes
                } else {

                }
            } else {
                gameState = 'play';
            }
            break;
        case 'play':
            if ( !numberOfTerritories( currentTeam ) ) {
                incrementTurn();
                nextTurn();
            } else if ( numberOfTerritories( currentTeam ) === 42 ) {
                addToGameLog( currentTeam, 'won!' );
            } else {
                if ( !team.player ) {
                    //console.log( team.name );
                    //place phase
                    team.freeTroops = numberOfTroopsToPLace( currentTeam );
                    addToGameLog( currentTeam, `starts their turn by placing ${ team.freeTroops } troops` );
                    while ( team.freeTroops > 0 ) {
                        AI_placeTroop( gameData.territories, territories, team.id, AI_personalities[team.name] );
                        team.freeTroops--;
                    }
                    //attack phase
                    let attackAgain = true;
                    let turnStats = {
                        territoriesWon: 0,
                        troopsLost: 0,
                        troopsKilled: 0
                    };
                    do {
                        let attack = AI_attack( gameData.territories, territories, team.id, AI_personalities[team.name], turnStats );
                        if ( attack.willAttack ) {
                            addToGameLog( currentTeam, `will attack ${ territories[attack.attackTo].name } from ${ territories[attack.attackFrom].name } with ${ attack.troops }` );
                            let results = executeAttack( gameData.territories, attack );
                            turnStats.troopsLost += results.attackerLosses;
                            turnStats.troopsKilled += results.defenderLosses;
                            if ( results.attackerWon ) {
                                addToGameLog( currentTeam, `has conquered ${ territories[attack.attackFrom].name }` );
                                turnStats.territoriesWon++;
                            }
                        } else {
                            attackAgain = false;
                        }
                        drawMap();
                    } while ( attackAgain )
                    addToGameLog( currentTeam, `will end their turn conquering ${ turnStats.territoriesWon } territories, killing ${ turnStats.troopsKilled } troops, and loosing ${ turnStats.troopsLost } troops` );
                    //move phase
                    AI_moveTroops( gameData.territories, territories, team.id, AI_personalities[team.name] );
                    drawMap();
                    incrementTurn();
                    setTimeout( nextTurn, 333 );
                }
            }
            break;
    }
}


//helper
function freeTroopsLeft() {
    return teams.map( t => t.freeTroops ).some( f => f > 0 );
}

function incrementTurn() {
    currentTeam = ( currentTeam + 1 ) % teams.length;
}

function numberOfTerritories( teamID ) {
    return gameData.territories.filter( t => t.owner === teamID ).length;
}

function numberOfTroopsToPLace( teamID ) {
    // Base troops calculation
    const numTerritories = numberOfTerritories( teamID );
    const baseTroops = Math.max( 3, Math.floor( numTerritories / 3 ) ); // Minimum of 3 troops

    // Calculate continent bonuses
    const continentBonuses = continents.reduce( ( totalBonus, continent ) => {
        const ownsAllTerritories = continent.territories.every(
            territoryID => gameData.territories.find( t => t.id === territoryID )?.owner === teamID
        );
        return totalBonus + ( ownsAllTerritories ? continent.bonus : 0 );
    }, 0 );

    // Total troops
    return baseTroops + continentBonuses;
}

function normalRandom( mean = 0.5, stdDev = 0.1 ) {
    // Using the Box-Muller transform to generate a normal distribution
    let u1 = Math.random();
    let u2 = Math.random();

    // Box-Muller transform
    let z0 = Math.sqrt( -2 * Math.log( u1 ) ) * Math.cos( 2 * Math.PI * u2 );

    // Return the scaled value (normal distribution)
    return mean + z0 * stdDev;
}

function addToGameLog( teamID, text ) {
    // Find the team by its ID
    const team = teams.find( t => t.id === teamID );

    if ( team ) {
        // Create a new <p> element for the log message
        const logMessage = document.createElement( 'p' );

        // Set the HTML content, with the team name in the team color
        logMessage.innerHTML = `<span style="color:${ team.color }">${ team.name }</span> ${ text }`;

        // Append the log message to the gameLog div
        document.getElementById( 'gameLog' ).appendChild( logMessage );

        // Optionally, scroll to the bottom of the log
        const gameLog = document.getElementById( 'gameLog' );
        gameLog.scrollTop = gameLog.scrollHeight;
    }
}