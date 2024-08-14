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
import {
  ADD_PHRASE,
  CREATE_GROUP,
  DELETE_WORD,
  GET_WORD_ID,
  SAVE_WORD,
  SEARCH_WORD,
  USER_SETTING
} from './constants';
import { customGet, customPost } from './utils/customRequest';

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

function shouldAddToDefaultGroup() {
  const url = window.location.href;
  if (url.includes('youtuber')) {
    return false;
  }
  return true;
}

function getYoutubeId() {
  const urlArray = window.location.href.split('/');
  return urlArray[urlArray.length - 1];
}

async function addWord() {
  let group;
  if (!shouldAddToDefaultGroup()) {
    group = await createGroup();
  }
  if (isLiked.value) {
    const t = await customPost(GET_WORD_ID, {
      en: currentWord.value
        .trim()
        .toLocaleLowerCase()
        .replace(',', '')
        .replace('.', '')
        .replace('"', '')
        .replace('(', '')
        .replace(')', '')
    });
    const r = await customPost(DELETE_WORD, { id: t.data.data._id });
    if (r.data.code === 200) {
      isLiked.value = false;
      sendMessageToGeneralScript({ type: 'remove-word', message: currentWord.value.trim() });
    }
  } else {
    let t;
    if (group) {
      t = await customPost(SAVE_WORD, {
        en: currentWord.value.trim(),
        groupId: group.data.data._id
      });
    } else {
      t = await customPost(SAVE_WORD, { en: currentWord.value.trim() });
    }
    if (t.data.code === 200) {
      isLiked.value = true;
      sendMessageToGeneralScript({ type: 'save-word' });
    }
  }
}

async function addPhrase() {
  if (shouldAddToDefaultGroup()) {
    const userSetting = await customGet(USER_SETTING);
    const s = userSetting.data.data.defaultGroupID;
    if (!s) {
      alert('请在个人中心设置默认词组');
      return;
    }
    const phrase = await customPost(ADD_PHRASE, { en: currentWord.value, groupId: s });
    console.log(phrase);
  } else {
    const group = await createGroup();
    if(isLiked.value){}else{}
  }
}

async function markWord() {
  const text = currentWord.value.trim();
  const textArray = text.split(' ');
  if (textArray.length > 1) {
    addPhrase();
  } else {
    addWord();
  }
}

watch(currentWord, async (newVal) => {
  if (newVal.trim().split(' ').length > 1) {
    return;
  }
  const t = await customPost(SEARCH_WORD, {
    en: newVal
      .trim()
      .toLowerCase()
      .replace(',', '')
      .replace('.', '')
      .replace('"', '')
      .replace('(', '')
      .replace(')', '')
  });
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
          isLiked.value = false;
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

async function createGroup() {
  const g = await customPost(CREATE_GROUP, {
    youtubeId: getYoutubeId(),
    name: document.title,
    links: [window.location.href]
  });
  return g;
}

onMounted(async () => {
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
