<template>
  <div class="container mx-auto px-1 py-1">
    <div class="columns-2">
      <div class="text-xl font-medium">content</div>
      <div>*</div>
    </div>
    <div class="my-2 flex cursor-pointer flex-row space-x-2">
      <div>/ˈkɒntent /</div>
      <div class="" @click="handleClick">🔊</div>
    </div>
    <div class="flex flex-row" v-for="item in dic" :key="item.pos">
      <div>{{ item.pos }}</div>
      <div>{{ item.zh }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const dic = [
  {
    pos: 'n.',
    zh: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
  },
  {
    pos: 'v.',
    zh: '指向'
  }
]

function handleClick() {
  console.log('clicked...')
}
</script>

<style scoped>
.floating-panel-container {
  height: 100%;
  width: 100%;
}
</style>
