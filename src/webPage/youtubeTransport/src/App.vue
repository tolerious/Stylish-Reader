<script setup lang="ts">
import axios from 'axios'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

const serverUrl = import.meta.env.VITE_SERVER

function registerEventListenerFromContentScript() {
  document.addEventListener('fromYoutubeVideoContentScript', async (event: any) => {
    const detail = JSON.parse(event.detail)
    const d = detail.data
    if (await checkIfVideoExist(d.videoId, d.token)) {
      alert('视频已经添加过')
      return
    }
    const a = await saveArticle(d)
    if (a.data.code === 200) {
      alert('视频添加成功')
    }
  })
}

// TODO: 使用环境变量来判断服务器地址
async function saveArticle(o: any) {
  return await axios.post(
    `${serverUrl}/article`,
    {
      ...o,
      enTranscriptData: JSON.stringify(o.enData),
      cnTranscriptData: JSON.stringify(o.zhData),
      youtubeVideoId: o.videoId,
      tags: ['youtube']
    },
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${o.token}` } }
  )
}

async function checkIfVideoExist(videoId: string, token: string) {
  // TODO: 使用环境变量来判断服务器地址
  const url = `${serverUrl}/article/youtube`
  const r = await axios.post(
    url,
    { videoId },
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  )
  if (r.data.code === 200 && r.data.data.length === 0) {
    return false
  }
  return true
}

onMounted(() => {
  registerEventListenerFromContentScript()
})
</script>

<template>
  <header>youtube transport</header>

  <RouterView />
</template>

<style scoped></style>
