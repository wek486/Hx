<script setup>
import frame from'@/layout/frame.vue'
import router from './utils/router';
</script>

<template>
<router-view />
<!-- 我的组件都是已经交给router管理了，注意不能重复加载,App.vue 直接加载了一次 frame，路由又加载了一次 frame，所以菜单和顶部栏重复。 -->
</template>

<style scoped></style>
