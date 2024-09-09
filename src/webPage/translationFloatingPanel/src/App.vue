<template>
  <div class="container mx-auto bg-white px-1 py-1 text-[16px]">
    <div class="flex columns-2 flex-row">
      <div class="basis-4/5 flex-col text-[18px]">{{ currentWord }}</div>
      <div class="flex grow cursor-pointer select-none flex-row justify-around" @click="markWord">
        <template v-if="isPhrase">
          <span>➕ 添加词组</span>
        </template>
        <template v-else> <span v-if="isLiked">❤️</span> <span v-else>🤍</span></template>
      </div>
    </div>
    <div class="my-2 flex cursor-pointer flex-row space-x-2">
      <div>
        <span>{{ phonetic }}</span>
      </div>
      <div v-if="isPlayAudioIconVisible" @click="handleClick">🔊</div>
    </div>
    <div class="my-2 flex justify-start gap-5 text-pink-500">
      <span class="cursor-pointer underline" @click="goToLangManWebsite">🔗朗文词典</span
      ><span class="cursor-pointer underline" @click="goToCambridgeWebsite">🔗剑桥词典</span>
    </div>
    <div class="flex flex-row flex-nowrap" v-for="item in dic" :key="item.pos">
      <div>{{ item.pos }}</div>
      <div>{{ item.zh }}</div>
    </div>
    <audio autoplay ref="audioPlayer" :src="audioUrl"></audio>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import {
  ADD_PHRASE,
  DELETE_WORD,
  GET_WORD_ID,
  SAVE_WORD,
  SEARCH_WORD,
  TRANSLATION_CONTENT,
  YOUDAO
} from './constants';
import { customPost } from './utils/customRequest';

interface CustomEvent extends Event {
  detail: string;
}

interface Translation {
  pos: string;
  zh: string;
}

const dic: Ref<Translation[]> = ref([]);

const currentWord = ref('');

const phonetic = ref('');

const audioUrl = ref('');

const isPlayAudioIconVisible = ref(true);

const audioPlayer: Ref<HTMLAudioElement | null> = ref(null);

const isLiked = ref(false);

const groupId = ref('');

async function addWord() {
  if (isLiked.value) {
    const t = await customPost(GET_WORD_ID, {
      en: convertStringToLowerCaseAndRemoveSpecialCharacter(currentWord.value.trim())
    });
    const r = await customPost(DELETE_WORD, { id: t.data.data._id, groupId: t.data.data.groupID });
    if (r.data.code === 200) {
      isLiked.value = false;
      sendMessageToGeneralScript({ type: 'remove-word', message: currentWord.value.trim() });
    }
  } else {
    let t;
    t = await customPost(SAVE_WORD, {
      en: convertStringToLowerCaseAndRemoveSpecialCharacter(currentWord.value.trim()),
      groupId: groupId.value
    });
    if (t.data.code === 200) {
      isLiked.value = true;
      sendMessageToGeneralScript({ type: 'save-word' });
    }
  }
}

async function addPhrase() {
  if (!groupId.value) {
    alert('请在网站个人中心页面设置默认单词本');
    return;
  }
  const r = await customPost(ADD_PHRASE, {
    en: currentWord.value.trim(),
    groupId: groupId.value
  });
  if (r.data.code === 200) {
    sendMessageToPhraseFloatingPanel({ type: 'phrase-added' });
    // alert('添加成功');
  } else {
    alert(r.data.msg);
  }
}

async function markWord() {
  if (isPhrase.value) {
    addPhrase();
  } else {
    addWord();
  }
}

const isPhrase = computed(() => currentWord.value.trim().split(' ').length > 1);

watch(currentWord, async (newVal) => {
  if (newVal.trim().split(' ').length > 1) {
    return;
  }
  const t = await customPost(SEARCH_WORD, {
    en: convertStringToLowerCaseAndRemoveSpecialCharacter(newVal.trim())
  });
  isLiked.value = t.data.data.isLiked;
});

function goToLangManWebsite() {
  window.open(`https://www.ldoceonline.com/dictionary/${currentWord.value}`);
}

function goToCambridgeWebsite() {
  window.open(`https://dictionary.cambridge.org/dictionary/english/${currentWord.value}`);
}

async function handleClick() {
  const response = await axios({
    url: `${import.meta.env.VITE_BACKEND_URL}${YOUDAO}`, // 后端 API
    method: 'POST',
    data: { word: currentWord.value },
    responseType: 'blob' // 获取音频为 Blob
  });
  const audioBlob = response.data;
  const u = URL.createObjectURL(audioBlob);
  audioUrl.value = u;
  audioPlayer.value?.play();
}

function listenEventFromGeneralScript() {
  document.addEventListener('generalScriptEvent', async (e: Event) => {
    const ee = e as CustomEvent;
    const data = JSON.parse(ee.detail);
    switch (data.type) {
      case 'group-id':
        groupId.value = data.groupId;
        console.log('floating panel group id:', groupId.value);
        break;
      case 'search-word':
        sendMessageToGeneralScript({ type: 'go-through-content' });

        dic.value = [];
        currentWord.value = data.word;
        if (data.word.trim().split(' ').length > 1) {
          isPlayAudioIconVisible.value = false;
          isLiked.value = false;
        } else {
          isPlayAudioIconVisible.value = true;
        }
        getTranslationFromYouDao(convertStringToLowerCaseAndRemoveSpecialCharacter(data.word));
        break;
      case 'play':
        if (isPlayAudioIconVisible.value) {
          handleClick();
        }
        break;
      case 'token':
        localStorage.setItem('floatingPanelToken', data.message);
        break;
      default:
        break;
    }
  });
}

async function getTranslationFromYouDao(textToBeTranslated: string) {
  const d = await customPost(TRANSLATION_CONTENT, { word: textToBeTranslated });
  const data = d.data.data;
  phonetic.value = data.phonetic;
  dic.value = data.dicList;
}

onMounted(async () => {
  listenEventFromGeneralScript();
});

function sendMessageToPhraseFloatingPanel(message: any) {
  const event = new CustomEvent('phraseAddedSuccessfully', {
    detail: JSON.stringify(message),
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
}

function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent('floatingPanelEvent', {
    detail: JSON.stringify(message)
  });
  document.dispatchEvent(event);
}

function convertStringToLowerCaseAndRemoveSpecialCharacter(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/"/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/:/g, '');
}
</script>

<style scoped>
.floating-panel-container {
  height: 100%;
  width: 100%;
}
</style>
