<template>
  <div
    v-if="isPhraseFloatingIconVisible"
    class="bg-pink-400 w-[40px] h-[40px] rounded-full cursor-pointer flex justify-center items-center font-bold font-mono select-none"
  >
    <span>{{ phraseCount }}</span>
  </div>
  <div v-else class="select-none">
    <div
      class="h-[45px] px-2 py-1 cursor-pointer flex justify-start items-center"
      @click.stop="goBackHandler"
    >
      <span>🔙 点击返回</span>
    </div>
    <div class="max-h-[380px] h-[380px] overflow-y-scroll p-2 scrollbar">
      <div
        v-for="(i, index) in phraseList"
        :key="index"
        class="mb-1 border-2 border-slate-200 rounded py-1 px-1"
      >
        <div class="grid grid-rows-1 grid-cols-[1fr_30px]">
          <div>{{ index + 1 }}. {{ i.en }}</div>
          <div class="cursor-pointer flex justify-center items-start">
            <span>❤️</span>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customPost } from "@/utils/customRequest";
import { onMounted, ref, type Ref } from "vue";

// interface CustomEvent extends Event {
//   detail: string;
// }

interface Phrase {
  en: string;
}

const isPhraseFloatingIconVisible = ref(true);

const groupId = ref("");

const phraseCount = ref(0);

const phraseList: Ref<Phrase[]> = ref([]);

onMounted(() => {
  listenEventFromGeneralScript();
  listenEventFromFloatingPanel();
});

function goBackHandler() {
  isPhraseFloatingIconVisible.value = true;
  sendMessageToGeneralScript({ type: "phrase-floating-panel-show-icon" });
}

async function getPhraseList() {
  const phrases = await customPost("/phrase/list", { groupId: groupId.value });
  phraseList.value = phrases.data;
  phraseCount.value = phrases.data.length;
}

// 监听来自floatingPanel的消息，发送过来的是添加词组成功的消息，然后在这里调接口，展示有多少个phrase
function listenEventFromFloatingPanel() {
  document.addEventListener("phraseAddedSuccessfully", (e: Event) => {
    // 目前只有一个event，所以没有进行处理
    // const data = JSON.parse((e as CustomEvent).detail);
    getPhraseList();
  });
}

function listenEventFromGeneralScript() {
  document.addEventListener("phraseFloatingPanelEvent", (e: Event) => {
    const data = JSON.parse((e as CustomEvent).detail);
    switch (data.type) {
      case "token":
        localStorage.setItem("phraseFloatingPanelToken", data.message);
        break;
      case "show-or-hide-phrase-icon":
        if (isPhraseFloatingIconVisible.value) {
          isPhraseFloatingIconVisible.value = false;
        }
        break;
      case "group-id": {
        groupId.value = data.groupId;
        getPhraseList();
        break;
      }
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
