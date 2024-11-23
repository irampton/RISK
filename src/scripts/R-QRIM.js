// REINFORCE.js - Reinforcement learning agent for Risk Game
function flattenConnections( arr ) {
    const flatArray = [];

    // Loop over each item in the array
    arr.forEach( ( item ) => {
        item.connections.forEach( ( connection ) => {
            flatArray.push( [item.id, connection] ); // Add each connection to the flat array
        } );
    } );

    return flatArray;
}

function reverseLookup( flatArray, index ) {
    return flatArray[index];
}

function computePaths( gameStateTerritories, territories ) {
    // Create a lookup map for easier access to game state territories
    const territoryMap = new Map( gameStateTerritories.map( t => [t.id, t] ) );

    // Helper function to perform a depth-first search
    function dfs( currentId, owner, visited, connectionsMap ) {
        visited.add( currentId );
        const connectedTerritories = connectionsMap[currentId] || [];
        for ( const neighborId of connectedTerritories ) {
            if ( !visited.has( neighborId ) && territoryMap.get( neighborId )?.owner === owner ) {
                dfs( neighborId, owner, visited, connectionsMap );
            }
        }
    }

    // Build a map of connections for quick lookup
    const connectionsMap = {};
    for ( const territory of territories ) {
        connectionsMap[territory.id] = territory.connections;
    }

    // Compute paths for each territory
    const result = gameStateTerritories.map( ( { id, owner } ) => {
        const visited = new Set();
        dfs( id, owner, visited, connectionsMap );
        return { id, owner, paths: Array.from( visited ) };
    } );

    return result;
}

function distanceBetweenIndexes( index1, index2, arraySize ) {
    // Ensure the result is positive and wraps around the array size
    return (index2 - index1 + arraySize) % arraySize;
}


// Function to save an AI model to localStorage
function saveAIModel( name, modelJSON ) {
    // Ensure the modelJSON is a valid object
    if ( typeof modelJSON === 'object' && modelJSON !== null ) {
        // Convert the model object to a string and save it in localStorage
        localStorage.setItem( name, JSON.stringify( modelJSON ) );
    } else {
        console.error( "Invalid model data, must be a valid JSON object." );
    }
}

// Function to load an AI model from localStorage
function loadAIModel( name ) {
    // Retrieve the model data from localStorage
    const modelData = localStorage.getItem( name );

    // If the data exists, parse it and return as an object
    if ( modelData ) {
        try {
            return JSON.parse( modelData );
        } catch ( error ) {
            console.error( "Error parsing model data:", error );
            return null;
        }
    } else {
        console.error( "Model not found." );
        return null;
    }
}

export function NewR_QRIM( name, territories ) {
    // Reward values
    const INVALID_ACTION_REWARD = -4;
    const WIN_REWARD = 15;
    const LOSE_REWARD = -4;
    const LEGAL_PLACE_REWARD = .25;
    const LEGAL_ATTACK_REWARD = 5;
    const LEGAL_MOVE_REWARD = .25;
    const TOO_LONG_ROUNDS = 20
    const TOO_LONG_SCALE = .01;

    // Define the number of territories as a constant
    const NUM_TERRITORIES = territories.length; // You can change this value as needed
    const FLAT_TERRITORIES = flattenConnections( territories );

    let illegalCount = 0;
    let actionCount = 0;

    const env = {};
    // Update the environment's number of states and max number of actions based on NUM_TERRITORIES
    env.getNumStates = function () {
        return 1 + 2 * NUM_TERRITORIES;
    } // 2 properties (troops + ownership) * NUM_TERRITORIES
    // Update the environment to include "no attack"
    env.getMaxNumActions = function () {
        return 1 + FLAT_TERRITORIES.length; // Add 1 for the "no attack" action
    };

    // Initialize the DQN agent with the environment
    const spec = {
        alpha: 0.01, // Learning rate
        update: 'qlearn', // qlearn | sarsa
        gamma: 0.9, // discount factor, [0, 1)
        epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
        //experience_add_every: 10, // number of time steps before we add another experience to replay memory
        experience_size: 1000, // size of experience replay memory
        //learning_steps_per_iteration: 20,
        tderror_clamp: 1.0, // for robustness
        num_hidden_units: 256 // number of neurons in hidden layer
    };
    const agent = new RL.DQNAgent( env, spec );

    let model = loadAIModel( name );
    if ( model ) {
        agent.fromJSON( model.attack );
    }

    // Translate the game state into a format the agent can process (state)
    function translateGameStateToArray( phase, gameStateTerritories, numTeams, teamID ) {
        let state = [phase];

        // Loop through the territories and create a state array of troop count and ownership
        gameStateTerritories.forEach( territory => {
            state.push( territory.troops );

            // Set the team id, 1 is always the AI
            state.push( distanceBetweenIndexes( teamID, territory.owner, numTeams ) + 1 );
        } );

        return state; // Returns a flat array of size 2 * NUM_TERRITORIES
    }

    function modelAct( state ) {
        actionCount++;
        return agent.act( state );
    }

    function modelReward( reward ) {
        /*if(reward > 0) {
            console.log( reward );
        }*/
        agent.learn( reward )
    }

    function translatePlaceActionToGame( action, gameStateTerritories, teamID ) {
        //can't pass here
        if ( action === 0 ) {
            return { invalid: true }; // Done moving troops; pass turn
        }

        // Retrieve the territory picked
        let placeAtIndex = reverseLookup( FLAT_TERRITORIES, action - 1 )[0]
        const placeAt = gameStateTerritories[placeAtIndex];

        if ( placeAt.owner !== teamID ) {
            return { invalid: true };
        }

        // Return the move decision
        return { placeAt: placeAt.id };
    }

    function translateAttackActionToGame( action, gameStateTerritories, teamID ) {
        // If action corresponds to "no attack" (last action in action space)
        if ( action === 0 ) {
            return { willAttack: false, attackFrom: null, attackTo: null, troops: 0 };
        }

        // Otherwise, process the attack action
        let attackFromIndex, attackToIndex;
        [attackFromIndex, attackToIndex] = reverseLookup( FLAT_TERRITORIES, action - 1 )

        // Retrieve the territories involved
        const attackFrom = gameStateTerritories[attackFromIndex];
        const attackTo = gameStateTerritories[attackToIndex];

        const troops = attackFrom.troops - 1;
        //console.log(action);
        //console.log( attackFrom.name, attackTo.name, attackFrom.owner === teamID, attackTo.owner !== teamID, attackFrom.connections.includes( attackTo.id ), attackFrom.troops );

        // Check for invalid attack conditions (not owned, wrong enemy, not connected)
        if ( attackFrom.owner !== teamID || attackTo.owner === teamID || !attackFrom.connections.includes( attackTo.id ) || !(troops >= 2) ) {
            return { invalid: true };
        }

        // Return the attack decision
        return { willAttack: true, attackFrom: attackFrom.id, attackTo: attackTo.id, troops: troops };
    }

    function translateMoveActionToGame( action, gameStateTerritories, teamID ) {
        // If action corresponds to "no attack" (last action in action space)
        if ( action === 0 ) {
            return { done: true }; // Done moving troops; pass turn
        }

        // Otherwise, process the attack action
        let moveFromIndex, moveToIndex;
        [moveFromIndex, moveToIndex] = reverseLookup( FLAT_TERRITORIES, action - 1 )

        // Retrieve the territories involved
        const moveFrom = gameStateTerritories[moveFromIndex];
        const moveTo = gameStateTerritories[moveToIndex];


        if (
            moveFrom.owner !== teamID
            || moveTo.owner !== teamID
            || moveFrom.troops <= 1
            || !moveFrom.connections.includes( moveToIndex.id ) ) {
            return { invalid: true };
        }

        // Return the move decision
        return { moveFrom: moveFrom.id, moveTo: moveTo.id };
    }

    function place( gameStateTerritories, territories, numTeams, teamID ) {
        let gameState = gameStateTerritories.map( t => ({
            ...t, connections: territories[t.id].connections
        }) );

        // Translate the game state to the agent's input format
        // Move phase is 3
        let state = translateGameStateToArray( 1, gameState, numTeams, teamID );

        let action;
        do {
            action = translatePlaceActionToGame( modelAct( state ), gameState, teamID );
        } while ( action.invalid )

        gameStateTerritories[action.placeAt].troops++;
        if ( LEGAL_PLACE_REWARD ) {
            modelReward( LEGAL_PLACE_REWARD );
        }
    }

    let lastAttackOnRound = null;

    function attack( gameStateTerritories, territories, numTeams, teamID, roundNumber ) {
        let gameState = gameStateTerritories.map( t => ({
            ...t, connections: territories[t.id].connections, name: territories[t.id].name
        }) );

        // Translate the game state to the agent's input format
        // Attack phase is 2
        const state = translateGameStateToArray( 2, gameState, numTeams, teamID );

        let action;
        do {
            action = translateAttackActionToGame( modelAct( state ), gameState, teamID );
            if ( action.invalid ) {
                //console.count( "invalid" );
                illegalCount++;
                modelReward( INVALID_ACTION_REWARD ); //negative reward for illegal move
            } else if ( action.willAttack && LEGAL_ATTACK_REWARD ) {
                lastAttackOnRound = roundNumber;
                modelReward( LEGAL_ATTACK_REWARD )
            }

            if ( action === 0 ) {
                if ( roundNumber > TOO_LONG_ROUNDS && roundNumber !== lastAttackOnRound ) {
                    let reward = (roundNumber - TOO_LONG_ROUNDS) * -TOO_LONG_SCALE;
                    modelReward( reward );
                }
            }
        } while ( action.invalid )

        return action;
    }

    function move( gameStateTerritories, territories, numTeams, teamID ) {

        let action;
        do {
            let gameState = gameStateTerritories.map( t => ({
                ...t, connections: territories[t.id].connections
            }) );

            // Translate the game state to the agent's input format
            // Move phase is 3
            let state = translateGameStateToArray( 3, gameState, numTeams, teamID );

            action = translateMoveActionToGame( modelAct( state ), gameState, teamID );
            if ( action.invalid ) {
                //console.count( "invalid" );
                illegalCount++;
                modelReward( INVALID_ACTION_REWARD ); //negative reward for illegal move
            } else if ( !action.done ) {
                // Move troops - this changes the game state
                gameStateTerritories[action.moveFrom].troops--;
                gameStateTerritories[action.moveTo].troops++;
                if ( LEGAL_MOVE_REWARD ) {
                    modelReward( LEGAL_MOVE_REWARD );
                }
            }
        } while ( !action.done )
    }

    function gameOver( won ) {
        //reward/punish the AI based on a win or loss
        modelReward( won ? WIN_REWARD : LOSE_REWARD );
        return {
            illegalMoves: illegalCount,
            totalMoves: actionCount
        }
    }

    function saveModel() {
        let data = {
            attack: agent.toJSON()
        }
        saveAIModel( name, data );
    }

    return {
        place,
        attack,
        move,
        saveModel,
        gameOver
    };
}
