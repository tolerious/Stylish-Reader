<template>
  <div class="container" @click.stop.prevent="stopPop"><p>12331 asdf</p></div>
</template>

<script setup lang="ts">
function stopPop(e: any) {
  console.log(e)
}
</script>

<style scoped>
.container {
  height: 50px;
  width: 100px;
  background-color: blue;
}
</style>
