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
          <br>
          <div>
            Starting Troops: <input type="number" v-model="startingTroops">
          </div>
          <div>
            Map:
            <select v-model="selectedMap">
              <option v-for="map in mapList" :key="map.id" :value="map.id">
                {{ map.name }}
              </option>
            </select>
          </div>
        </div>
        <div id="gameLog" v-if="['place', 'play', 'end'].includes(gameState)">
          <p v-for="message in gameLog">
            <span :style="`color: ${teams[message.teamID].color}`">{{ teams[message.teamID].name }}</span>
            {{ message.text }}
          </p>
        </div>
      </div>
    </div>
    <div style="text-align: center; width: 66%">
      <canvas id="gameCanvas" :width="canvasSize.width" :height="canvasSize.height" style="width: 95%"></canvas>
      <ContinentStats :gameData="gameData" :continentColors="continentColors" :continents="continents" :teams="teams" />
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
          <button v-if="gameState !== 'play' && !UImode && buttonText" @click="nextTurn">{{ buttonText }}</button>
          <template v-if="UImode === 'attack'">
            <button @click="attackButtonResolve('attack')">Attack</button>
            <button @click="attackButtonResolve('attackInf')">Attack Infinite</button>
            <button @click="attackButtonResolve('done')">Done Attacking</button>
          </template>
          <template v-if="UImode === 'move'">
            <button @click="moveButtonResolve('move')">Move</button>
            <button @click="moveButtonResolve('done')">Done Moving</button>
          </template>
          <template v-if="gameState === 'end'">
            <button @click="() => playAgainButton(true)">Play again with same teams</button>
            <button @click="() => playAgainButton()">Play again with different teams</button>
          </template>
        </div>
        <div style="width: 20%"></div>
      </div>
      <br>
      AI Speed: <input type="text" v-model="AISpeed">
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
import { maps } from "@/maps/maps.js";
import { randomizeTerritories, executeAttack, hasPath } from "@/scripts/game_helper";
import { getClickedPolygonIndex, drawPathFromPoints, calculatePolygonCenter } from "@/scripts/canvas_helper";
import { defaultPersonalities, randomPersonality } from "@/scripts/AI_personalities.js";
import ContinentStats from "@/components/continentStats.vue";

let territories, territoryPolygons, continents, mapDecoration;

export default {
  name: "RISK",
  components: { ContinentStats },
  props: {},
  data() {
    return {
      territories,
      continents,
      possibleTeams: [
        { name: "Red", color: "rgba(255, 0, 0, 1)", enabled: true, player: false },
        { name: "Light Red", color: "rgba(255, 64, 64, 1)", enabled: false, player: false },
        { name: "Red-Orange", color: "rgba(255, 69, 0, 1)", enabled: false, player: false },
        { name: "Orange", color: "rgba(255, 128, 0, 1)", enabled: true, player: false },
        { name: "Dark Orange", color: "rgba(255, 140, 0, 1)", enabled: false, player: false },
        { name: "Amber", color: "rgba(255, 191, 0, 1)", enabled: false, player: false },
        { name: "Gold", color: "rgba(255, 215, 0, 1)", enabled: true, player: false },
        { name: "Lime Green", color: "rgba(0, 255, 0, 1)", enabled: false, player: false },
        { name: "Dark Green", color: "rgba(0, 204, 0, 1)", enabled: false, player: false },
        { name: "Forest Green", color: "rgba(0, 128, 0, 1)", enabled: true, player: false },
        { name: "Dark Forest Green", color: "rgba(34, 139, 34, 1)", enabled: false, player: false },
        { name: "Spring Green", color: "rgba(0, 255, 127, 1)", enabled: false, player: false },
        { name: "Medium Aquamarine", color: "rgba(102, 205, 170, 1)", enabled: false, player: false },
        { name: "Cyan", color: "rgba(0, 255, 255, 1)", enabled: false, player: false },
        { name: "Dark Cyan", color: "rgba(0, 204, 204, 1)", enabled: false, player: false },
        { name: "Blue", color: "rgba(0, 102, 204, 1)", enabled: true, player: false },
        { name: "Classic Blue", color: "rgba(0, 0, 255, 1)", enabled: false, player: false },
        { name: "Deep Sky Blue", color: "rgba(0, 191, 255, 1)", enabled: false, player: false },
        { name: "Indigo", color: "rgba(75, 0, 130, 1)", enabled: false, player: false },
        { name: "Medium Slate Blue", color: "rgba(123, 104, 238, 1)", enabled: false, player: false },
        { name: "Blue Violet", color: "rgba(138, 43, 226, 1)", enabled: false, player: false },
        { name: "Purple", color: "rgba(128, 0, 128, 1)", enabled: true, player: false },
        { name: "Dark Orchid", color: "rgba(153, 50, 204, 1)", enabled: false, player: false },
        { name: "Plum", color: "rgba(221, 160, 221, 1)", enabled: false, player: false },
        { name: "Violet", color: "rgba(238, 130, 238, 1)", enabled: false, player: false },
        { name: "Hot Pink", color: "rgba(255, 105, 180, 1)", enabled: false, player: false },
        { name: "Light Pink", color: "rgba(255, 182, 193, 1)", enabled: false, player: false },
        { name: "Pink", color: "rgba(255, 192, 203, 1)", enabled: false, player: false },
        { name: "Salmon", color: "rgba(250, 128, 114, 1)", enabled: false, player: false },
        { name: "Lavender Blush", color: "rgba(255, 240, 245, 1)", enabled: false, player: false },
        { name: "Misty Rose", color: "rgba(255, 228, 225, 1)", enabled: false, player: false },
        { name: "Powder Blue", color: "rgba(176, 224, 230, 1)", enabled: false, player: false },
        { name: "Orange (again)", color: "rgba(255, 165, 0, 1)", enabled: false, player: false },
        { name: "Silver", color: "rgba(192, 192, 192, 1)", enabled: false, player: false },
        { name: "Dark Gray", color: "rgba(169, 169, 169, 1)", enabled: false, player: false },
        { name: "Charcoal", color: "rgba(64, 64, 64, 1)", enabled: false, player: false },
        { name: "Deep Pink", color: "rgba(255, 20, 147, 1)", enabled: false, player: false },
        { name: "Steel Blue", color: "rgba(70, 130, 180, 1)", enabled: false, player: false },
        { name: "Turquoise", color: "rgba(64, 224, 208, 1)", enabled: false, player: false },
        { name: "Peach", color: "rgba(255, 218, 185, 1)", enabled: false, player: false },
        { name: "Honeydew", color: "rgba(240, 255, 240, 1)", enabled: false, player: false },
        { name: "Coral", color: "rgba(255, 127, 80, 1)", enabled: false, player: false }
      ],
      canvas: undefined,
      ctx: {},
      gameState: 'initial',
      teams: [],
      gameLog: [],
      gameData: {
        territories: []
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
      },
      AISpeed: 100,
      startingTroops: 40,
      selectedMap: Object.keys( maps )[0],
      canvasSize: {
        width: 1000,
        height: 700
      },
      continentColorOrder: ["yellow", "orange", "blue", "red", "forestgreen", "purple", "aqua", "coral", "lightgreen", "violet"]
    }
  },
  computed: {
    buttonText() {
      switch ( this.gameState ) {
        case 'initial':
          return "Start Game";
        case 'place':
          return "Place Troops";
        case 'ready':
          return "Run Game";
      }
    },
    mapList() {
      return Object.keys( maps ).map( m => ({
        name: maps[m].name,
        id: m
      }) )
    },
    continentColors() {
      return Object.fromEntries( (this.continents || []).map( ( c, i ) => [c.name, this.continentColorOrder[i % this.continentColorOrder.length]] ) );
    },
    territoryCenters(){
      return this.territories.map(t => calculatePolygonCenter(territoryPolygons[t.id]));
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
                AI.placeTroop( this.gameData.territories, territories, team.id, team.personality, true );
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
            this.gameState = 'ready';
          }
          break;
        case 'ready':
          this.gameState = 'play';
        case 'play':
          if ( !this.numberOfTerritories( this.currentTeam ) ) {
            this.incrementTurn();
            this.nextTurn();
          } else if ( this.numberOfTerritories( this.currentTeam ) === territories.length ) {
            this.addToGameLog( this.currentTeam, 'won!' );
            this.gameState = 'end';
            return;
          } else {
            team.freeTroops = this.numberOfTroopsToPLace( this.currentTeam );
            this.addToGameLog( this.currentTeam, `starts their turn by placing ${team.freeTroops} troops` );
            if ( !team.player ) {
              //place phase
              while ( team.freeTroops > 0 ) {
                AI.placeTroop( this.gameData.territories, territories, team.id, team.personality );
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
                let attack = AI.attack( this.gameData.territories, territories, team.id, team.personality, turnStats );
                if ( attack.willAttack ) {
                  this.addToGameLog( this.currentTeam, `will attack ${territories[attack.attackTo].name} from ${territories[attack.attackFrom].name} with ${attack.troops} troops` );
                  let results = executeAttack( this.gameData.territories, attack );
                  turnStats.troopsLost += results.attackerLosses;
                  turnStats.troopsKilled += results.defenderLosses;
                  if ( results.attackerWon ) {
                    this.addToGameLog( this.currentTeam, `has conquered ${territories[attack.attackFrom].name}` );
                    turnStats.territoriesWon++;
                  }
                } else {
                  attackAgain = false;
                }
                this.drawMap();
              } while ( attackAgain )
              this.addToGameLog( this.currentTeam, `will end their turn conquering ${turnStats.territoriesWon} territories, killing ${turnStats.troopsKilled} troops, and loosing ${turnStats.troopsLost} troops` );
              //move phase
              AI.moveTroops( this.gameData.territories, territories, team.id, team.personality );
              this.drawMap();
              this.incrementTurn();
              setTimeout( this.nextTurn, this.AISpeed );
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
                    } else if ( this.playerAttack.from !== null && this.playerAttack.to !== null ) {
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
                  this.addToGameLog( this.currentTeam, `will attack ${territories[attack.attackTo].name} from ${territories[attack.attackFrom].name} with ${attack.troops} troops` );
                  let results = executeAttack( this.gameData.territories, attack );
                  turnStats.troopsLost += results.attackerLosses;
                  turnStats.troopsKilled += results.defenderLosses;
                  if ( results.attackerWon ) {
                    this.addToGameLog( this.currentTeam, `has conquered ${territories[attack.attackFrom].name}` );
                    turnStats.territoriesWon++;
                    this.playerAttack.to = null;
                  }
                }
                this.playerAttack.rounds = null;
                this.drawMap();
              } while ( !this.playerAttack.done )
              this.addToGameLog( this.currentTeam, `will end their turn conquering ${turnStats.territoriesWon} territories, killing ${turnStats.troopsKilled} troops, and loosing ${turnStats.troopsLost} troops` );
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
                    this.playerAttack.to = null;
                    this.playerAttack.from = null;
                  }
                  if ( this.playerAttack.from !== null &&
                      this.playerAttack.to !== null &&
                      hasPath( this.gameData.territories, territories, this.currentTeam, this.playerAttack.from, this.playerAttack.to ) ) {
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
        return totalBonus + (ownsAllTerritories ? continent.bonus : 0);
      }, 0 );

      // Total troops
      return baseTroops + continentBonuses;
    },
    incrementTurn() {
      this.currentTeam = (this.currentTeam + 1) % this.teams.length;
    },
    drawMap() {
      const ctx = this.ctx;
      const canvas = this.canvas;
      ctx.clearRect( 0, 0, canvas.width, canvas.height )

      mapDecoration.background.forEach( a => {
        drawPathFromPoints( ctx, a.points );
        ctx.fillStyle = a.fill;
        ctx.fill();
      } );

      // Draw territories
      this.gameData.territories.forEach( t => {
        const territory = territories[t.id];
        drawPathFromPoints( ctx, territoryPolygons[t.id] );
        ctx.fillStyle = this.teams[t.owner]?.color || "white";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = this.continentColors[territory.continent] || "black";
        ctx.lineWidth = 1;
        ctx.stroke();
      } );

      this.gameData.territories.forEach( t => {
        const territory = territories[t.id];
        const [centerX, centerY] = this.territoryCenters[t.id];

        // Draw territory name
        ctx.fillStyle = this.continentColors[territory.continent] || "white";
        ctx.font = "12px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(0,0,0,.3)";
        ctx.lineWidth = 1.25;

        // Split name into words
        const words = territory.name.split(" ");
        let firstWord, remainingWords;
        if(words.length > 1) {
          firstWord = words[0];
          remainingWords = words.slice( 1 ).join( " " );
        }else{
          firstWord = false;
          remainingWords = territory.name;
        }

        // Draw first word (if applicable)
        if(firstWord) {
          ctx.strokeText( firstWord, centerX + 1, centerY - 16 );
          ctx.fillText( firstWord, centerX, centerY - 17 );
        }

        // Draw remaining words on the next line
        ctx.strokeText(remainingWords, centerX + 1, centerY - 3);
        ctx.fillText(remainingWords, centerX, centerY - 4);

        // Draw troop count
        ctx.fillStyle = "white";
        ctx.font = "14px 'Segoe UI'";
        ctx.strokeStyle = "rgba(0,0,0,.25)";
        ctx.lineWidth = 1.25;
        ctx.strokeText(t.troops, centerX + 1, centerY + 11);
        ctx.fillText(t.troops, centerX, centerY + 10);
      } );
    },
    beginGame( sameTeams = false ) {
      //teams set up
      if ( sameTeams ) {
        this.teams = this.teams
            .sort( () => Math.random() - 0.5 )
            .map( ( t, i ) => ({
              ...t,
              id: i,
              freeTroops: 0
            }) );
      } else {
        this.teams = this.possibleTeams
            .filter( t => t.enabled )
            .sort( () => Math.random() - 0.5 )
            .map( ( t, i ) => ({
              ...t,
              id: i,
              freeTroops: 0,
              personality:
                  t.player
                      ? undefined
                      : defaultPersonalities[t.name] || randomPersonality()
            }) );
      }

      //map setup
      this.territories = territories = maps[this.selectedMap].territories;
      territoryPolygons = maps[this.selectedMap].territoryPolygons;
      this.continents = continents = maps[this.selectedMap].continents;
      mapDecoration = maps[this.selectedMap].mapDecoration;
      this.canvasSize.height = mapDecoration.height;
      this.canvasSize.width = mapDecoration.width;
      this.gameData.territories = territories.map( t => ({ id: t.id, owner: null, troops: 0 }) )

      //console.log( JSON.parse( JSON.stringify( this.teams ) ) );
      randomizeTerritories( this.teams, this.gameData.territories );
      this.$nextTick( this.drawMap );
      this.teams.forEach( team => {
        team.freeTroops = this.startingTroops - this.gameData.territories
            .reduce( ( sum, t ) => sum + (t.owner === team.id ? t.troops : 0), 0 )
      } );
    },
    playAgainButton( sameTeams = false ) {
      if ( sameTeams ) {
        this.beginGame( true );
        this.gameState = 'place';
      } else {
        this.gameState = 'initial';
      }
      this.gameLog = [];
    }
  },
  mounted() {
    this.canvas = document.getElementById( 'gameCanvas' );
    this.ctx = this.canvas.getContext( '2d' );
  }
}
</script>
