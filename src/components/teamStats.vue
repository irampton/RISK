<template>
  <div class="teamContainer">
    <div class="block" style="background-color: #fff; color: #000; text-shadow: none;">
      <div style="width: 60%">
        Team
      </div>
      <div style="width: 20%; padding-left: 1rem; padding-right: 1rem;">
        Troops
      </div>
      <div style="width: 20%">
        Territories
      </div>
    </div>
    <template v-for="team in teamsList">
      <div class="block"
           :style="`background-color: ${team.color}; border: ${currentTeam === team.id ? '#000' : '#fff'} 4px solid;`">
        <div style="width: 60%">
          {{ team.name }}
        </div>
        <div style="width: 20%; padding-left: 1rem; padding-right: 1rem;">
          {{ team.troopCount }}
        </div>
        <div style="width: 20%">
          {{ team.territories.length }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.teamContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: "Segoe UI";
  font-size: 12px;
  text-shadow: black .15rem .15rem .3rem;
  color: #fff;
}

.block {
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  padding: 5px;
}
</style>

<script>
export default {
  name: "teamStats",
  props: {
    currentTeam: {
      type: Number, String,
      required: true
    },
    gameData: {
      type: Object,
      required: true
    },
    teams: {
      type: Object,
      required: true
    },
  },
  computed: {
    teamsList() {
      return this.teams.map( c => {
        let territories = this.gameData.territories.filter( t => t.owner === c.id )
        return {
          ...c,
          territories,
          troopCount: territories.reduce( ( sum, t ) => sum + t.troops, 0 )
        }
      } )
    }
  }
}
</script>