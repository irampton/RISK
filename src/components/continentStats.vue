<template>
  <div class="blockContainer">
    <template v-for="(continent, index) in continents">
      <div class="block"
           :style="`background-color: ${continentColors[continent.name]}; border: ${ capturedList[index] || 'white'} thick solid`">
        <div style="color: #fff; text-shadow: black .15rem .15rem .3rem; padding-right: 1.5rem">
          {{ continent.name }}
        </div>
        <div style="color: #fff; text-shadow: black .15rem .15rem .3rem">
          {{ continent.bonus }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.blockContainer {
  display: flex;
  flex-flow: wrap;
  width: 95%;
  justify-content: center;
  margin-left: 1.5rem;
  font-family: "Segoe UI";
  font-size: 12px;
}

.block {
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px;
  margin: 10px;
}
</style>

<script>
export default {
  name: "continentStats",
  props: {
    continents: {
      type: Object,
      default: () => []
    },
    continentColors: {
      type: Object,
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
    capturedList() {
      return this.continents.map( c => {
        let arr = c.territories.map( id => this.gameData.territories[id].owner );
        return arr.every( t => t === arr[0] ) ? this.teams[arr[0]].color : false;
      } )
    }
  }
}
</script>