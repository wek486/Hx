<script setup>
import Menu from '@/layout/menu.vue'
import Header from '@/layout/header.vue'
</script>

<template>
  <div class="common-layout">
    <el-container class="app-shell">
      <el-aside class="app-sidebar" width="200px">
        <Menu />
      </el-aside>
      <el-container class="app-content">
        <el-header class="app-header" height="64px">
          <Header />
        </el-header>
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.common-layout {
  height: 100vh;  /* 兼容旧浏览器 */
  height: 100dvh;
  overflow: hidden;
}
.app-shell {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.app-sidebar {
  
     flex-shrink: 0; /* 左侧宽度不被压缩，比如position:fixed时可能会被压缩和重叠 */
  height: 100%;     /* 占满父容器高度 */
  overflow-y: auto; /* 菜单太长时，允许上下滚动 */
  background: #fff;
}
.app-content {
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  
  overflow: hidden;
}

.app-header {
   top: 0;       /* 贴住窗口顶部 */
  left: 200px; /* 留出左侧菜单宽度 */
  right: 0;    /* 延伸到窗口右边 */
  flex-shrink: 0;
 
  z-index: 10;
  background: #fff;
}

/* 例如父容器高 500px，里面上下排列两个区域：
顶部栏想要： 64px
内容区想要：500px
合计：      564px，放不下
如果顶部栏允许收缩，它可能被压得低于 64px。设置： */
/* Only the page content scrolls; the menu and header stay in view. */
.app-main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
</style>
