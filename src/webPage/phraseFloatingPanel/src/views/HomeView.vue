<template>
  <div
    v-if="isPhraseFloatingIconVisible"
    class="bg-pink-400 w-[40px] h-[40px] rounded-full cursor-pointer flex justify-center items-center font-bold font-mono select-none"
  >
    <span>12</span>
  </div>
  <div v-else class="select-none">
    <div
      class="h-[45px] px-2 py-1 cursor-pointer flex justify-start items-center"
      @click.stop="goBackHandler"
    >
      <span>🔙 Go Back</span>
    </div>
    <div class="max-h-[380px] h-[380px] overflow-y-scroll p-2 scrollbar">
      <div v-for="i in 30" :key="i" class="mb-1 border-2 border-slate-200 rounded py-1 px-1">
        <div class="grid grid-rows-1 grid-cols-[1fr_30px]">
          <div>{{ i }}. Get off</div>
          <div class="cursor-pointer flex justify-center items-start">
            <span v-if="isLiked">❤️</span> <span v-else>🤍</span>
          </div>
        </div>
        <div>下班下班下班下班下班下班下班下班下班下班</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

// interface CustomEvent extends Event {
//   detail: string;
// }

const isPhraseFloatingIconVisible = ref(true);

const isLiked = ref(false);

onMounted(() => {
  console.log("home view mounted.");
  listenEventFromGeneralScript();
});

function goBackHandler() {
  isPhraseFloatingIconVisible.value = true;
  sendMessageToGeneralScript({ type: "phrase-floating-panel-show-icon" });
}

function listenEventFromGeneralScript() {
  document.addEventListener("phraseFloatingPanelEvent", (e: Event) => {
    const data = JSON.parse((e as CustomEvent).detail);
    switch (data.type) {
      case "token":
        console.log(data.message);
        localStorage.setItem("phraseFloatingPanelToken", data.message);
        break;
      case "show-or-hide-phrase-icon":
        if (isPhraseFloatingIconVisible.value) {
          isPhraseFloatingIconVisible.value = false;
        }
        break;
      default:
        break;
    }
  });
}

function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent("eventSendFromPhraseFloatingPanel", {
    detail: JSON.stringify(message),
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
}
</script>

<style scoped>
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f1f1;
}
</style>
