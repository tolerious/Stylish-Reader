<template>
  <div class="container mx-auto px-1 py-1">
    <div class="flex columns-2 flex-row">
      <div class="basis-11/12 flex-col text-xl">{{ currentWord }}</div>
      <div
        class="flex w-9 basis-9 cursor-pointer select-none flex-row justify-around"
        @click="markWord"
      >
        <span v-if="isLiked">❤️</span>
        <span v-else>🤍</span>
      </div>
    </div>
    <div class="my-2 flex cursor-pointer flex-row space-x-2">
      <div>
        <span>{{ phonetic }}</span>
      </div>
      <div v-if="isPlayAudioIconVisible" @click="handleClick">🔊</div>
    </div>
    <div class="flex flex-row flex-nowrap" v-for="item in dic" :key="item.pos">
      <div>{{ item.pos }}</div>
      <div>{{ item.zh }}</div>
    </div>
    <audio autoplay ref="audioPlayer" :src="audioUrl"></audio>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { DELETE_WORD, GET_WORD_ID, SAVE_WORD, SEARCH_WORD } from './constants';
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

async function markWord() {
  if (isLiked.value) {
    const t = await customPost(GET_WORD_ID, { en: currentWord.value.trim().toLocaleLowerCase() });
    customPost(DELETE_WORD, { id: t.data.data._id });
    isLiked.value = false;
    sendMessageToGeneralScript({ type: 'remove-word', message: currentWord.value.trim() });
  } else {
    await customPost(SAVE_WORD, { en: currentWord.value.trim() });
    isLiked.value = true;
  }
}

watch(currentWord, async (newVal) => {
  if (newVal.trim().split(' ').length > 1) {
    return;
  }
  const t = await customPost(SEARCH_WORD, { en: newVal.trim().toLowerCase() });
  isLiked.value = t.data.data.isLiked;
});

function handleClick() {
  audioUrl.value = `https://dict.youdao.com/dictvoice?type=1&audio=${currentWord.value}`;
  audioPlayer.value?.play();
}

function listenEventFromGeneralScript() {
  document.addEventListener('generalScriptEvent', (e: Event) => {
    const ee = e as CustomEvent;
    const data = JSON.parse(ee.detail);
    switch (data.type) {
      case 'search-word':
        currentWord.value = data.word;
        if (data.word.trim().split(' ').length > 1) {
          isPlayAudioIconVisible.value = false;
        } else {
          isPlayAudioIconVisible.value = true;
        }
        getTranslationFromYouDao(data.word);
        break;
      case 'play':
        if (isPlayAudioIconVisible.value) {
          handleClick();
        }
        break;
      case 'token':
        localStorage.setItem('token', data.message);
        break;
      default:
        break;
    }
  });
}

function getTranslationFromYouDao(textToBeTranslated: string) {
  fetch(`https://dict.youdao.com/result?word=${textToBeTranslated}&lang=en`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then((html) => {
      phonetic.value = '';
      dic.value = [];
      const parse = new DOMParser();
      const doc = parse.parseFromString(html, 'text/html');
      const dictBook = doc.querySelectorAll('.basic .word-exp');
      const phoneticResult = doc.querySelector('.phonetic');
      phonetic.value = phoneticResult?.textContent ?? '';
      dictBook.forEach((book) => {
        const pos = book.querySelector('.pos');
        const translation = book.querySelector('.trans');
        dic.value.push({
          pos: pos?.textContent ?? '',
          zh: translation?.textContent ?? ''
        });
      });
      // 选中的不是单词，是句子或者是其他
      if (dictBook.length === 0) {
        const backupDicBook = doc.querySelectorAll('.dict-book .trans-content');
        backupDicBook.forEach((book) => {
          const pos = '';
          const translation = book.textContent;
          dic.value.push({
            pos,
            zh: translation?.trim() ?? ''
          });
        });
      }
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

onMounted(() => {
  listenEventFromGeneralScript();
});

function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent('floatingPanelEvent', {
    detail: JSON.stringify(message)
  });
  document.dispatchEvent(event);
}
</script>

<style scoped>
.floating-panel-container {
  height: 100%;
  width: 100%;
}
</style>
