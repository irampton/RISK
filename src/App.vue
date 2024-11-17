<template>
  <h1 style="text-align: center;">RISK</h1>
  <div style="display: flex; flex-direction: row">
    <div style="width: 33%">
      <div class="log">
        <div id="gameSettings" v-if="gameState === 'initial'">
          <h3>Teams</h3>
          <div style="display: flex; flex-direction: row; width: 100%;">
            <div style="width: 20%">Enable</div>
            <div style="width: 60%">Name</div>
            <div style="width: 20%">Player</div>
          </div>
          <div v-for="team in possibleTeams" style="display: flex; flex-direction: row; width: 100%;">
            <div style="width: 20%">
              <input type="checkbox" v-model="team.enabled">
            </div>
            <div :style="`width: 60%; color:${team.color};`">
              {{ team.name }}
            </div>
            <div style="width: 20%">
              <input type="checkbox" v-model="team.player">
            </div>
          </div>
        </div>
        <div id="gameLog" v-if="gameState === 'play'">
          <p v-for="message in gameLog">
            <span :style="`color: ${teams[message.teamID].color}`">{{ teams[message.teamID].name }}</span>
            {{ message.text }}
          </p>
        </div>
      </div>
    </div>
    <div style="text-align: center; width: 66%">
      <canvas id="gameCanvas" width="968" height="656"></canvas>
      <br>
      <div style="display: flex; flex-direction: row; width: 100%; justify-content: space-between">
        <div style="width: 20%; padding-left: 50px">
          <template v-if="UImode === 'place'">
            <span :style="`color: ${teams[currentTeam].color}`">{{ teams[currentTeam].name }}</span>, place your troops
            <br>
            You have {{ teams[currentTeam].freeTroops }} remaining
          </template>
          <template v-if="UImode === 'attack'">
            It's <span :style="`color: ${teams[currentTeam].color}`">{{ teams[currentTeam].name }}</span>'s turn to
            attack
            <br>
            Attack from {{ territories[playerAttack.from]?.name || '???' }} to
            {{ territories[playerAttack.to]?.name || '???' }}
            <br>
            Commit <input type="number" v-model="playerAttack.troops"> troops
          </template>
          <template v-if="UImode === 'move'">
            It's <span :style="`color: ${teams[currentTeam].color}`">{{ teams[currentTeam].name }}</span>'s turn to
            move
            <br>
            Move from {{ territories[playerAttack.from]?.name || '???' }} to
            {{ territories[playerAttack.to]?.name || '???' }}
            <br>
            Move <input type="number" v-model="playerAttack.troops"> troops
          </template>
        </div>
        <div>
          <button v-if="!UImode" @click="nextTurn">{{ buttonText }}</button>
          <button v-if="UImode === 'attack'" @click="attackButtonResolve('attack')">Attack</button>
          <button v-if="UImode === 'attack'" @click="attackButtonResolve('attackInf')">Attack Infinite</button>
          <button v-if="UImode === 'attack'" @click="attackButtonResolve('done')">Done Attacking</button>
          <button v-if="UImode === 'move'" @click="moveButtonResolve('move')">Move</button>
          <button v-if="UImode === 'move'" @click="moveButtonResolve('done')">Done Moving</button>
        </div>
        <div style="width: 20%"></div>
      </div>
      <br>
      <br>
    </div>
  </div>
</template>

<style scoped>
canvas {
  display: block;
  margin: auto;
  border: 1px solid black;
}

.log {
  height: 80vh;
  overflow-y: scroll;
  margin: .5rem;
  text-align: left;
  border: black thin solid;
  padding: .5rem;
}
</style>

<script>
import { AI } from "@/scripts/AI.js";
import {
  territories,
  territoryPolygons,
  continents
} from "@/scripts/territories.js"

const AI_personalities = {
  "Red": { "aggressive": normalRandom(1, 0.15), "cling": normalRandom(0.0, 0.0) },
  "Light Red": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Red-Orange": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Orange": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Orange": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Amber": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Gold": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Lime Green": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Green": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Forest Green": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Forest Green": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Spring Green": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Medium Aquamarine": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Cyan": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Cyan": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Classic Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Deep Sky Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Indigo": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Medium Slate Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Blue Violet": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Purple": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Orchid": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Plum": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Violet": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Hot Pink": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Light Pink": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Pink": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Salmon": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Lavender Blush": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Misty Rose": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Powder Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Orange (again)": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Silver": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Dark Gray": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Charcoal": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Deep Pink": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Steel Blue": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Turquoise": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Peach": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Honeydew": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) },
  "Coral": { "aggressive": normalRandom(0.5, 0.2), "cling": normalRandom(0.15, 0.1) }

}
console.log( AI_personalities );


export default {
  name: "RISK",
  props: {},
  data() {
    return {
      territories,
      possibleTeams: [
  { name: "Red", color: "rgba(255, 0, 0, 0.6)", enabled: true, player: false },
  { name: "Light Red", color: "rgba(255, 64, 64, 0.6)", enabled: false, player: false },
  { name: "Red-Orange", color: "rgba(255, 69, 0, 0.6)", enabled: false, player: false },
  { name: "Orange", color: "rgba(255, 128, 0, 0.6)", enabled: true, player: false },
  { name: "Dark Orange", color: "rgba(255, 140, 0, 0.6)", enabled: false, player: false },
  { name: "Amber", color: "rgba(255, 191, 0, 0.6)", enabled: false, player: false },
  { name: "Gold", color: "rgba(255, 215, 0, 0.6)", enabled: true, player: false },
  { name: "Lime Green", color: "rgba(0, 255, 0, 0.6)", enabled: false, player: false },
  { name: "Dark Green", color: "rgba(0, 204, 0, 0.6)", enabled: false, player: false },
  { name: "Forest Green", color: "rgba(0, 128, 0, 0.6)", enabled: true, player: false },
  { name: "Dark Forest Green", color: "rgba(34, 139, 34, 0.6)", enabled: false, player: false },
  { name: "Spring Green", color: "rgba(0, 255, 127, 0.6)", enabled: false, player: false },
  { name: "Medium Aquamarine", color: "rgba(102, 205, 170, 0.6)", enabled: false, player: false },
  { name: "Cyan", color: "rgba(0, 255, 255, 0.6)", enabled: false, player: false },
  { name: "Dark Cyan", color: "rgba(0, 204, 204, 0.6)", enabled: false, player: false },
  { name: "Blue", color: "rgba(0, 102, 204, 0.6)", enabled: true, player: false },
  { name: "Classic Blue", color: "rgba(0, 0, 255, 0.6)", enabled: false, player: false },
  { name: "Deep Sky Blue", color: "rgba(0, 191, 255, 0.6)", enabled: false, player: false },
  { name: "Indigo", color: "rgba(75, 0, 130, 0.6)", enabled: false, player: false },
  { name: "Medium Slate Blue", color: "rgba(123, 104, 238, 0.6)", enabled: false, player: false },
  { name: "Blue Violet", color: "rgba(138, 43, 226, 0.6)", enabled: false, player: false },
  { name: "Purple", color: "rgba(128, 0, 128, 0.6)", enabled: true, player: false },
  { name: "Dark Orchid", color: "rgba(153, 50, 204, 0.6)", enabled: false, player: false },
  { name: "Plum", color: "rgba(221, 160, 221, 0.6)", enabled: false, player: false },
  { name: "Violet", color: "rgba(238, 130, 238, 0.6)", enabled: false, player: false },
  { name: "Hot Pink", color: "rgba(255, 105, 180, 0.6)", enabled: false, player: false },
  { name: "Light Pink", color: "rgba(255, 182, 193, 0.6)", enabled: false, player: false },
  { name: "Pink", color: "rgba(255, 192, 203, 0.6)", enabled: false, player: false },
  { name: "Salmon", color: "rgba(250, 128, 114, 0.6)", enabled: false, player: false },
  { name: "Lavender Blush", color: "rgba(255, 240, 245, 0.6)", enabled: false, player: false },
  { name: "Misty Rose", color: "rgba(255, 228, 225, 0.6)", enabled: false, player: false },
  { name: "Powder Blue", color: "rgba(176, 224, 230, 0.6)", enabled: false, player: false },
  { name: "Orange (again)", color: "rgba(255, 165, 0, 0.6)", enabled: false, player: false },
  { name: "Silver", color: "rgba(192, 192, 192, 0.6)", enabled: false, player: false },
  { name: "Dark Gray", color: "rgba(169, 169, 169, 0.6)", enabled: false, player: false },
  { name: "Charcoal", color: "rgba(64, 64, 64, 0.6)", enabled: false, player: false },
  { name: "Deep Pink", color: "rgba(255, 20, 147, 0.6)", enabled: false, player: false },
  { name: "Steel Blue", color: "rgba(70, 130, 180, 0.6)", enabled: false, player: false },
  { name: "Turquoise", color: "rgba(64, 224, 208, 0.6)", enabled: false, player: false },
  { name: "Peach", color: "rgba(255, 218, 185, 0.6)", enabled: false, player: false },
  { name: "Honeydew", color: "rgba(240, 255, 240, 0.6)", enabled: false, player: false },
  { name: "Coral", color: "rgba(255, 127, 80, 0.6)", enabled: false, player: false }

      ],
      canvas: undefined,
      ctx: {},
      gameState: 'initial',
      teams: [],
      gameLog: [],
      gameData: {
        territories: territories.map( t => ( { id: t.id, owner: null, troops: 0 } ) )
      },
      currentTeam: 0,
      UImode: undefined,
      playerAttack: {
        from: null,
        to: null
      },
      attackButtonResolve: () => {
      },
      moveButtonResolve: () => {
      }
    }
  },
  computed: {
    buttonText() {
      switch ( this.gameState ) {
        case 'initial':
          return "Start Game";
        case 'place':
          return "Place Troops";
        case 'play':
          return "Next Turn";
      }
    }
  },
  methods: {
    async nextTurn() {
      let team = this.teams[this.currentTeam];
      switch ( this.gameState ) {
        case 'initial':
          this.beginGame();
          this.gameState = 'place';
          break;
        case 'place':
          if ( this.freeTroopsLeft() ) {
            if ( !team.player ) {
              if ( team.freeTroops > 0 ) {
                AI.placeTroop( this.gameData.territories, territories, team.id, AI_personalities[team.name] );
                team.freeTroops--;
              }
              this.drawMap();
              this.incrementTurn();
              this.nextTurn(); // if not a player, go ahead and continue the AI until the game state changes, or the player goes
            } else {
              this.UImode = 'place';
              //player team
              let tID;
              do {
                tID = await getClickedPolygonIndex( this.canvas, territoryPolygons );
              } while ( this.gameData.territories[tID].owner !== this.currentTeam );
              this.gameData.territories[tID].troops++;
              team.freeTroops--;
              this.UImode = undefined;
              this.drawMap();
              this.incrementTurn();
              this.nextTurn();
            }
          } else {
            this.gameState = 'play';
          }
          break;
        case 'play':
          if ( !this.numberOfTerritories( this.currentTeam ) ) {
            this.incrementTurn();
            this.nextTurn();
          } else if ( this.numberOfTerritories( this.currentTeam ) === territories.length ) {
            this.addToGameLog( this.currentTeam, 'won!' );
          } else {
            team.freeTroops = this.numberOfTroopsToPLace( this.currentTeam );
            this.addToGameLog( this.currentTeam, `starts their turn by placing ${ team.freeTroops } troops` );
            if ( !team.player ) {
              //place phase
              while ( team.freeTroops > 0 ) {
                AI.placeTroop( this.gameData.territories, territories, team.id, AI_personalities[team.name] );
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
                let attack = AI.attack( this.gameData.territories, territories, team.id, AI_personalities[team.name], turnStats );
                if ( attack.willAttack ) {
                  this.addToGameLog( this.currentTeam, `will attack ${ territories[attack.attackTo].name } from ${ territories[attack.attackFrom].name } with ${ attack.troops } troops` );
                  let results = executeAttack( this.gameData.territories, attack );
                  turnStats.troopsLost += results.attackerLosses;
                  turnStats.troopsKilled += results.defenderLosses;
                  if ( results.attackerWon ) {
                    this.addToGameLog( this.currentTeam, `has conquered ${ territories[attack.attackFrom].name }` );
                    turnStats.territoriesWon++;
                  }
                } else {
                  attackAgain = false;
                }
                this.drawMap();
              } while ( attackAgain )
              this.addToGameLog( this.currentTeam, `will end their turn conquering ${ turnStats.territoriesWon } territories, killing ${ turnStats.troopsKilled } troops, and loosing ${ turnStats.troopsLost } troops` );
              //move phase
              AI.moveTroops( this.gameData.territories, territories, team.id, AI_personalities[team.name] );
              this.drawMap();
              this.incrementTurn();
              setTimeout( this.nextTurn, 250 );
            } else {
              //place
              this.UImode = 'place';
              while ( team.freeTroops > 0 ) {
                let tID;
                do {
                  tID = await getClickedPolygonIndex( this.canvas, territoryPolygons );
                } while ( this.gameData.territories[tID].owner !== this.currentTeam );
                this.gameData.territories[tID].troops++;
                team.freeTroops--;
                this.drawMap();
              }
              //attack
              let turnStats = {
                territoriesWon: 0,
                troopsLost: 0,
                troopsKilled: 0
              };
              this.UImode = 'attack';
              this.playerAttack = {
                from: null,
                to: null,
                rounds: undefined,
                done: false,
                troops: 0
              };
              do {
                do {
                  let tID = await Promise.race( [
                    getClickedPolygonIndex( this.canvas, territoryPolygons ),
                    new Promise( res => this.attackButtonResolve = res )
                  ] );
                  if ( typeof tID === "string" ) {
                    if ( tID === 'done' ) {
                      this.playerAttack.done = true;
                    } else if ( this.playerAttack.from !== null  && this.playerAttack.to !== null ) {
                      this.playerAttack.rounds = tID === 'attackInf' ? -1 : 1;
                    }
                  } else if ( tID === null ) {
                    //clicked nowhere, clear
                    this.playerAttack.from = null;
                    this.playerAttack.to = null;
                  } else if ( this.gameData.territories.filter( t => t.owner === this.currentTeam ).map( t => t.id ).includes( tID ) ) {
                    //own territory, set from
                    this.playerAttack.from = tID;
                  } else {
                    //enemy territory, set to
                    this.playerAttack.to = tID;
                  }
                } while ( !this.playerAttack.rounds && !this.playerAttack.done )
                if (
                    !this.playerAttack.done &&
                    territories[this.playerAttack.from].connections.includes( this.playerAttack.to ) &&
                    this.gameData.territories[this.playerAttack.from].troops > 2
                ) {
                  //attack is valid
                  const troopsToUse = Math.min( this.gameData.territories[this.playerAttack.from].troops - 1, this.playerAttack.troops );
                  const attack = {
                    attackFrom: this.playerAttack.from,
                    attackTo: this.playerAttack.to,
                    troops: troopsToUse,
                    attempts: this.playerAttack.rounds
                  };
                  this.addToGameLog( this.currentTeam, `will attack ${ territories[attack.attackTo].name } from ${ territories[attack.attackFrom].name } with ${ attack.troops } troops` );
                  let results = executeAttack( this.gameData.territories, attack );
                  turnStats.troopsLost += results.attackerLosses;
                  turnStats.troopsKilled += results.defenderLosses;
                  if ( results.attackerWon ) {
                    this.addToGameLog( this.currentTeam, `has conquered ${ territories[attack.attackFrom].name }` );
                    turnStats.territoriesWon++;
                    this.playerAttack.to = null;
                  }
                }
                this.playerAttack.rounds = null;
                this.drawMap();
              } while ( !this.playerAttack.done )
              this.addToGameLog( this.currentTeam, `will end their turn conquering ${ turnStats.territoriesWon } territories, killing ${ turnStats.troopsKilled } troops, and loosing ${ turnStats.troopsLost } troops` );
              //move
              this.UImode = 'move';
              this.playerAttack = {
                from: null,
                to: null,
                done: false,
                troops: 0
              };
              do {
                let tID = await Promise.race( [
                  getClickedPolygonIndex( this.canvas, territoryPolygons ),
                  new Promise( res => this.moveButtonResolve = res )
                ] );
                if ( typeof tID === "string" ) {
                  if ( tID === 'done' ) {
                    this.playerAttack.done = true;
                  }
                  if ( this.playerAttack.from !== null &&
                      this.playerAttack.to !== null &&
                      hasPath( this.gameData.territories, this.currentTeam, this.playerAttack.from, this.playerAttack.to ) ) {
                    const troopsToMove = Math.min( this.gameData.territories[this.playerAttack.from].troops - 1, this.playerAttack.troops );
                    this.gameData.territories[this.playerAttack.from].troops -= troopsToMove;
                    this.gameData.territories[this.playerAttack.to].troops += troopsToMove;
                    this.drawMap();
                  }
                } else if ( Number( tID ) === tID && this.gameData.territories.filter( t => t.owner === this.currentTeam ).map( t => t.id ).includes( tID ) ) {
                  if ( !this.playerAttack.from ) {
                    this.playerAttack.from = tID;
                  } else if ( !this.playerAttack.to ) {
                    this.playerAttack.to = tID;
                  } else {
                    this.playerAttack.from = tID;
                    this.playerAttack.to = null;
                  }
                }
              } while ( !this.playerAttack.done )
              this.UImode = undefined;
              this.drawMap();
              this.incrementTurn();
              this.nextTurn();
            }
          }
          break;
      }
    },
    addToGameLog( teamID, msg ) {
      this.gameLog.push( { teamID, text: msg } );
      this.$nextTick( () => {
        const gameLog = document.getElementById( 'gameLog' );
        gameLog.parentElement.scrollTop = gameLog.scrollHeight;
      } );
    },
    freeTroopsLeft() {
      return this.teams.map( t => t.freeTroops ).some( f => f > 0 );
    },
    numberOfTerritories( teamID ) {
      return this.gameData.territories.filter( t => t.owner === teamID ).length;
    },
    numberOfTroopsToPLace( teamID ) {
      // Base troops calculation
      const numTerritories = this.numberOfTerritories( teamID );
      const baseTroops = Math.max( 3, Math.floor( numTerritories / 3 ) ); // Minimum of 3 troops

      // Calculate continent bonuses
      const continentBonuses = continents.reduce( ( totalBonus, continent ) => {
        const ownsAllTerritories = continent.territories.every(
            territoryID => this.gameData.territories.find( t => t.id === territoryID )?.owner === teamID
        );
        return totalBonus + ( ownsAllTerritories ? continent.bonus : 0 );
      }, 0 );

      // Total troops
      return baseTroops + continentBonuses;
    },
    incrementTurn() {
      this.currentTeam = ( this.currentTeam + 1 ) % this.teams.length;
    },
    drawMap() {
      const ctx = this.ctx;
      const canvas = this.canvas;
      ctx.clearRect( 0, 0, canvas.width, canvas.height );

      // Draw background (placeholder for a map image)
      ctx.fillStyle = "#D3E6F3"; // Ocean blue
      ctx.fillRect( 0, 0, canvas.width, canvas.height );

      // Draw territories
      this.gameData.territories.forEach( t => {
        const territory = territories[t.id];
        const points = territoryPolygons[t.id];
        // Draw territory polygon
        ctx.beginPath();
        ctx.moveTo( points[0][0], points[0][1] );
        for ( let i = 1; i < points.length; i++ ) {
          ctx.lineTo( points[i][0], points[i][1] );
        }
        ctx.closePath();
        ctx.fillStyle = this.teams[t.owner]?.color || "white";
        ctx.fill();
        if(territory.continent == "North America"){
        ctx.strokeStyle = "yellow";
        }else if(territory.continent == "South America"){
              ctx.strokeStyle = "orange";    
        }else if(territory.continent == "Europe"){
              ctx.strokeStyle = "blue";    
        }else if(territory.continent == "Africa"){
              ctx.strokeStyle = "red";    
        }else if(territory.continent == "Asia"){
              ctx.strokeStyle = "green";    
        }else if(territory.continent == "Australia"){
              ctx.strokeStyle = "purple";    
        }else{
          ctx.strokeStyle = "black";    
        }
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
    },
    beginGame() {
      this.teams = this.possibleTeams
          .filter( t => t.enabled )
          .sort( () => Math.random() - 0.5 )
          .map( ( t, i ) => ( { ...t, id: i, freeTroops: 0 } ) );
      randomizeTerritories( this.teams, this.gameData.territories );
      this.drawMap();
      this.teams.forEach( team => {
        team.freeTroops = 40 - this.gameData.territories
            .reduce( ( sum, t ) => sum + ( t.owner === team.id ? t.troops : 0 ), 0 )
      } );
    }
  },
  mounted() {
    this.canvas = document.getElementById( 'gameCanvas' );
    this.ctx = this.canvas.getContext( '2d' );
  }
}

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

async function getClickedPolygonIndex( canvas, polygons ) {
  return new Promise( ( resolve ) => {
    function isPointInPolygon( point, polygon ) {
      let [ x, y ] = point;
      let inside = false;

      for ( let i = 0, j = polygon.length - 1; i < polygon.length; j = i++ ) {
        let [ xi, yi ] = polygon[i];
        let [ xj, yj ] = polygon[j];
        let intersect = yi > y !== yj > y && x < ( ( xj - xi ) * ( y - yi ) ) / ( yj - yi ) + xi;

        if ( intersect ) inside = !inside;
      }
      return inside;
    }

    function handleClick( event ) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for ( let i = 0; i < polygons.length; i++ ) {
        if ( isPointInPolygon( [ clickX, clickY ], polygons[i] ) ) {
          canvas.removeEventListener( "click", handleClick );
          resolve( i );
          return;
        }
      }

      return null;
    }

    canvas.addEventListener( "click", handleClick );
  } );
}

function hasPath( gameStateTerritories, teamId, sourceId, targetId, visited = new Set() ) {
  if ( sourceId === targetId ) return true;
  visited.add( sourceId );
  const sourceTerritory = territories[sourceId];
  const neighbors = sourceTerritory.connections.filter( connId => {
    const neighbor = gameStateTerritories.find( t => t.id === connId );
    return neighbor.owner === teamId && !visited.has( connId );
  } );

  return neighbors.some( neighborId => hasPath( gameStateTerritories, teamId, neighborId, targetId, visited ) );
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
</script>
