<template>
  <div class="h-full p-2">
    <!-- <div
      @click="handleGenerateQuestions"
      class="px-2 py-1 text-center shadow-sm shadow-slate-200 cursor-pointer active:shadow-pink-700 active:translate-x-1 active:translate-y-1 active:bg-pink-400 rounded-sm active:text-white"
    >
      Generate Questions
    </div> -->
    <div
      @click="handleTranslateParagraph"
      class="px-2 py-1 text-center shadow-sm shadow-slate-200 cursor-pointer active:shadow-pink-700 active:translate-x-1 active:translate-y-1 active:bg-pink-400 rounded-sm active:text-white"
    >
      Translate Tech Paragraph
    </div>
  </div>
</template>

<script setup lang="ts">
import { sendMessageFromPopupToBackgroundScript } from '@/utils'

// function handleGenerateQuestions() {
//   sendMessageFromPopupToBackgroundScript('generate-questions', { content: '' })
// }

function handleTranslateParagraph() {
  sendMessageFromPopupToBackgroundScript('translate-paragraph', { content: '' })
}
</script>
