<template>
  <div class="reward-me">
    <img
      @click="handClick"
      class="cancel"
      src="https://stylishreader.oss-cn-beijing.aliyuncs.com/cancel.png"
      alt=""
    />
    <img
      src="https://stylishreader.oss-cn-beijing.aliyuncs.com/contact-me.jpg"
      alt=""
    />
  </div>
</template>

<script setup>
const emit = defineEmits(["contact"]);

function handClick() {
  emit("contact");
}
</script>

<style scoped>
.reward-me {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 300px;
  height: 300px;
  img {
    width: 100%;
  }
  .cancel {
    left: 0;
    top: 0;
    cursor: pointer;
    height: 20px;
    width: 20px;
    position: absolute;
  }
}
</style>
