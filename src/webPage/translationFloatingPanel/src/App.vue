<template>
  <div class="container mx-auto px-1 py-1">
    <div class="columns-2">
      <div class="text-xl font-medium">{{ currentWord }}</div>
      <div>*</div>
    </div>
    <div class="my-2 flex cursor-pointer flex-row space-x-2">
      <div>{{ phonetic }}</div>
      <div class="" @click="handleClick">🔊</div>
    </div>
    <div class="flex flex-row" v-for="item in dic" :key="item.pos">
      <div>{{ item.pos }}</div>
      <div>{{ item.zh }}</div>
    </div>
    <audio autoplay ref="audioPlayer" :src="audioUrl"></audio>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

interface CustomEvent extends Event {
  detail: string
}

interface Translation {
  pos: string
  zh: string
}

const dic: Ref<Translation[]> = ref([])

const currentWord = ref('')

const phonetic = ref('')

const audioUrl = ref('')

const audioPlayer: Ref<HTMLAudioElement | null> = ref(null)

function handleClick() {
  audioUrl.value = `https://dict.youdao.com/dictvoice?type=1&audio=${currentWord.value}`
  audioPlayer.value?.play()
}

function listenEventFromGeneralScript() {
  document.addEventListener('generalScriptEvent', (e: Event) => {
    const ee = e as CustomEvent
    const data = JSON.parse(ee.detail)
    phonetic.value = ''
    dic.value = []
    switch (data.type) {
      case 'search-word':
        currentWord.value = data.word
        getTranslationFromYouDao(data.word)
        break
      default:
        break
    }
  })
}

function getTranslationFromYouDao(textToBeTranslated: string) {
  fetch(`https://dict.youdao.com/result?word=${textToBeTranslated}&lang=en`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }
      return response.text()
    })
    .then((html) => {
      // 输出获取到的 HTML 内容
      const parse = new DOMParser()
      const doc = parse.parseFromString(html, 'text/html')
      const dictBook = doc.querySelectorAll('.basic .word-exp')
      const phoneticResult = doc.querySelector('.phonetic')
      phonetic.value = phoneticResult?.textContent ?? ''
      dictBook.forEach((book) => {
        const pos = book.querySelector('.pos')
        const translation = book.querySelector('.trans')
        dic.value.push({
          pos: pos?.textContent ?? '',
          zh: translation?.textContent ?? ''
        })
      })
      sendMessageToGeneralScript({ type: 'get-translation-done' })
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error)
    })
}

onMounted(() => {
  listenEventFromGeneralScript()
})

function sendMessageToGeneralScript(message: any) {
  const event = new CustomEvent('floatingPanelEvent', {
    detail: JSON.stringify(message)
  })
  document.dispatchEvent(event)
}
</script>

<style scoped>
.floating-panel-container {
  height: 100%;
  width: 100%;
}
</style>
