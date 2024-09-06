<template>
  <div
    v-if="isPhraseFloatingIconVisible"
    class="bg-pink-400 w-[40px] h-[40px] rounded-full cursor-pointer flex justify-center items-center font-bold font-mono select-none"
  >
    <span>12</span>
  </div>
  <div v-else class="max-h-[380px] h-[380px] overflow-y-scroll p-2 scrollbar select-none">
    <div v-for="i in 30" :key="i" class="mb-1 border px-2 first-letter:py-1">
      <div class="grid grid-rows-1 grid-cols-[1fr_30px]">
        <div>{{ i }}. Get off</div>
        <div class="cursor-pointer flex justify-center items-start">
          <span v-if="isLiked">❤️</span> <span v-else>🤍</span>
        </div>
      </div>
      <div>下班下班下班下班下班下班下班下班下班下班</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const isPhraseFloatingIconVisible = ref(true);

const isLiked = ref(false);

onMounted(() => {
  console.log("home view mounted.");
  listenEventFromGeneralScript();
});

function listenEventFromGeneralScript() {
  document.addEventListener("phraseFloatingPanelEvent", (e: Event) => {
    const data = JSON.parse((e as CustomEvent).detail);
    console.log(data);
    if (isPhraseFloatingIconVisible.value) {
      isPhraseFloatingIconVisible.value = false;
    }
  });
}
</script>

<style scoped>
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f1f1;
}
</style>
