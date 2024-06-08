<template>
  <div class="container mx-auto columns-2 px-1">
    <div>content</div>
    <div>*</div>
  </div>
  <div class="container mx-auto flex cursor-pointer flex-row space-x-2 px-1">
    <div>/ˈkɒntent /</div>
    <div class="">🔊</div>
  </div>
  <div class="flex flex-row px-1" v-for="item in dic" :key="item.pos">
    <div>{{ item.pos }}</div>
    <div>{{ item.zh }}</div>
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
</script>

<style scoped>
.floating-panel-container {
  height: 100%;
  width: 100%;
}
</style>
