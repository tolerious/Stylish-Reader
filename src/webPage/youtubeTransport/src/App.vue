<script setup lang="ts">
import axios from 'axios'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
function registerEventListenerFromContentScript() {
  document.addEventListener('fromYoutubeVideoContentScript', async (event: any) => {
    const detail = JSON.parse(event.detail)
    console.log(detail.data)
    const d = detail.data
    if (await checkIfVideoExist(d.videoId, d.token)) {
      console.log('video exist')
      alert('视频已经添加过')
      return
    }
    console.log(d)
    const a = await saveArticle(d)
    if (a.data.code === 200) {
      alert('视频添加成功')
    }
  })
}

// TODO: 使用环境变量来判断服务器地址
async function saveArticle(o: any) {
  return await axios.post(
    `http://localhost:3000/article`,
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
  const url = `http://localhost:3000/article/youtube`
  const r = await axios.post(
    url,
    { videoId },
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  )
  console.log(r.data)
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
