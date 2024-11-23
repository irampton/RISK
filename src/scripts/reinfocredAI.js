// REINFORCE.js - Reinforcement learning agent for Risk Game
function flattenConnections(arr) {
    const flatArray = [];

    // Loop over each item in the array
    arr.forEach((item) => {
        item.connections.forEach((connection) => {
            flatArray.push([item.id,connection]); // Add each connection to the flat array
        });
    });

    return flatArray;
}

function reverseLookup(flatArray, index) {
    return flatArray[index];
}

// Function to save an AI model to localStorage
function saveAIModel(name, modelJSON) {
    // Ensure the modelJSON is a valid object
    if (typeof modelJSON === 'object' && modelJSON !== null) {
        // Convert the model object to a string and save it in localStorage
        localStorage.setItem(name, JSON.stringify(modelJSON));
    } else {
        console.error("Invalid model data, must be a valid JSON object.");
    }
}

// Function to load an AI model from localStorage
function loadAIModel(name) {
    // Retrieve the model data from localStorage
    const modelData = localStorage.getItem(name);

    // If the data exists, parse it and return as an object
    if (modelData) {
        try {
            return JSON.parse(modelData);
        } catch (error) {
            console.error("Error parsing model data:", error);
            return null;
        }
    } else {
        console.error("Model not found.");
        return null;
    }
}

export function NewReinforcedAI( name, territories) {
// Define the number of territories as a constant
    const NUM_TERRITORIES = territories.length; // You can change this value as needed
    const FLAT_TERRITORIES = flattenConnections(territories);

    let illegalCount = 0;

    const env = {};
// Update the environment's number of states and max number of actions based on NUM_TERRITORIES
    env.getNumStates = function () {
        return 2 * NUM_TERRITORIES;
    } // 2 properties (troops + ownership) * NUM_TERRITORIES
// Update the environment to include "no attack"
    env.getMaxNumActions = function () {
        return FLAT_TERRITORIES.length + 1; // Add 1 for the "no attack" action
    };

// Initialize the DQN agent with the environment
    const spec = {
        alpha: 0.01, // Learning rate
        update: 'qlearn', // qlearn | sarsa
        gamma: 0.9, // discount factor, [0, 1)
        epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
        experience_add_every: 10, // number of time steps before we add another experience to replay memory
        experience_size: 5000, // size of experience replay memory
        learning_steps_per_iteration: 20,
        tderror_clamp: 1.0, // for robustness
        num_hidden_units: 100 // number of neurons in hidden layer
    };
    const agent = new RL.DQNAgent( env, spec );

    let model = loadAIModel(name);
    if(model){
        agent.fromJSON(model.attack);
    }

// Translate the game state into a format the agent can process (state)
    function translateGameStateToArray( gameStateTerritories, teamID ) {
        let state = [];

        // Loop through the territories and create a state array of troop count and ownership
        gameStateTerritories.forEach( territory => {
            // Normalize the number of troops (assuming max 100 troops per territory)
            state.push( territory.troops / 100 ); // Troop count normalized

            // Add 1 if the territory is owned by the agent, 0 if owned by the opponent
            state.push( territory.owner === teamID ? 1 : 0 );
        } );

        return state; // Returns a flat array of size 2 * NUM_TERRITORIES
    }

// Convert the action output from the agent into game-specific actions
    function translateActionToGame( action, gameStateTerritories, teamID ) {
        // If action corresponds to "no attack" (last action in action space)
        if ( action === 0 ) {
            return { willAttack: false, attackFrom: null, attackTo: null, troops: 0 };
        }

        // Otherwise, process the attack action
        let attackFromIndex,attackToIndex;
        [attackToIndex, attackFromIndex] = reverseLookup(FLAT_TERRITORIES, action - 1)

        // Retrieve the territories involved
        const attackFrom = gameStateTerritories[attackFromIndex];
        const attackTo = gameStateTerritories[attackToIndex];

        const troops = attackFrom.troops - 1;
        //console.log(action);
        //console.log( attackFrom.name, attackTo.name, attackFrom.owner === teamID, attackTo.owner !== teamID, attackFrom.connections.includes( attackTo.id ), attackFrom.troops );

        // Check for invalid attack conditions (not owned, wrong enemy, not connected)
        if ( attackFrom.owner !== teamID || attackTo.owner === teamID || !attackFrom.connections.includes( attackTo.id ) || !( troops >= 2 ) ) {
            illegalCount++;
            return { invalid: true };
        }

        // Return the attack decision
        return { willAttack: true, attackFrom: attackFrom.id, attackTo: attackTo.id, troops: troops };
    }

// Learning loop (runs repeatedly to train the agent)
    function getAction( gameState, teamID ) {
        // Step 1: Translate the game state to the agent's input format
        const state = translateGameStateToArray( gameState, teamID );

        // Step 2: Agent selects an action
        const action = agent.act( state );  // Agent selects an action

        // Step 3: Convert action to game-specific action
        return translateActionToGame( action, gameState, teamID );  // Convert action to game-specific action

    }

    function rewardAgent( previousState, currentState, teamID ) {
        const pOwnTerritories = previousState.filter( t => t.owner === teamID );
        const cOwnTerritories = currentState.filter( t => t.owner === teamID );
        const cEnemyTerritories = currentState.filter( t => t.owner !== teamID );
        let reward = 0;

        let maxTroopRatio = Math.max( ...pOwnTerritories
            .map( t => {
                let enemyConnections = t.connections.filter( u => previousState[u].owner !== teamID ).map( u => previousState[u].troops );
                if ( enemyConnections.length > 0 ) {
                    return t.troops / Math.min( ...enemyConnections )
                } else {
                    return 1;
                }
            } )
        );
        const cTroopSum = cOwnTerritories.reduce( ( sum, t ) => sum + t.troops, 0 );
        const cEnemyTroopSum = cEnemyTerritories.reduce( ( sum, t ) => sum + t.troops, 0 );

        //reward for having more/less territories than last turn
        reward += ( cOwnTerritories.length - pOwnTerritories.length ) * 2;
        //reward for having more/less troops than last turn
        reward += ( cTroopSum - pOwnTerritories.reduce( ( sum, t ) => sum + t.troops, 0 ) - 4 ) * .5;
        //reward for having more of the map
        reward += ((cOwnTerritories.length / currentState.length) - .99) * 2;
        //punish for have very few territories
        if(cOwnTerritories.length <= 4){
            reward -= (5 - cOwnTerritories.length) * 2;
        }
        //punishment for having a high troop ratio
        if(maxTroopRatio > 2){
            reward -= maxTroopRatio;
        }
        //punish if there are a lot more enemy troops and no attacks
        let troopDifference = cTroopSum / Math.max(cEnemyTroopSum, 1);
        if(cOwnTerritories.length <= pOwnTerritories.length && troopDifference > 1.5){
            reward -= troopDifference * 2;
        }

        //console.log( reward );
        agent.learn( reward );  // Agent learns from the outcome
    }

    let previousGameState = undefined;
    let previousTurnStats = undefined;
    let startOfTurnStats = undefined;

    function attack( gameStateTerritories, territories, teamID, turnStats ) {
        let gameState = gameStateTerritories.map( t => ( {
            ...t, connections: territories[t.id].connections, name: territories[t.id].name
        } ) );

        if ( previousGameState ) {
            rewardAgent( previousGameState, gameState, teamID );
            startOfTurnStats = undefined;
        } else if ( previousTurnStats ) {
            //console.log(turnStats.territoriesWon, previousTurnStats.territoriesWon, turnStats.territoriesWon > previousTurnStats.territoriesWon ? 1 : -1);
            agent.learn( turnStats.territoriesWon > previousTurnStats.territoriesWon ? 1 : -1 );
        }else{
            startOfTurnStats = structuredClone(gameState);
        }

        previousGameState = undefined;
        previousTurnStats = undefined;

        let action;
        do {
            action = getAction( gameState, teamID );
            if ( action.invalid ) {
                //console.count( "invalid" );
                agent.learn( -10 ); //negative reward for illegal move
            }
        } while ( action.invalid )

        if ( !action.willAttack ) {
            previousGameState = startOfTurnStats;
        }else{
            previousTurnStats = structuredClone(turnStats);
        }

        return action;
    }

    function gameOver(won){
        //reward/punish the AI based on a win or loss
        console.log(`Tried to make ${illegalCount} illegal moves this game`);
        agent.learn(won ? 16 : -4);
    }

    function saveModel(){
        let data = {
            attack: agent.toJSON()
        }
        saveAIModel(name,data);
    }

    return {
        attack,
        saveModel,
        gameOver
    };
}
