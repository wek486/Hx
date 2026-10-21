<script setup lang="ts">

import router from '@/utils/router/index.js'
import { ref, watch } from 'vue'
import { authSession } from '@/api/signin.js'
import request from '@/utils/axios/axios'
const canReview = ref(false)
watch(() => authSession.value?.user?.id, async (id) => {
  canReview.value = false
  if (id == null) return
  try { const result = await request.get('/social/me/permissions'); if (id === authSession.value?.user?.id) canReview.value = result.data.admin === true } catch {}
}, { immediate: true })
import LogoutDialog from '@/components/LogoutDialog.vue'
const logoutVisible = ref(false)
function handleSelect(index: string) {
  if (index === '/logout') logoutVisible.value = true
  else router.push(index)
}
</script>

<template>
    <!-- router：让菜单点击时使用路由跳转。
index="/find"：与路由中的 path: '/find' 一致，带上 /。 -->
    <el-menu :default-active="$route.path" @select="handleSelect"><!--这里是菜单栏,可以默认打开哪一个菜单,默认选中哪一个菜单,defautl-openeds; -->
        <el-menu-item index="/find" >
        <template #title>
            <el-icon><Promotion /></el-icon>发现,探索
            <router-link to="/find" />
        </template>
        </el-menu-item>
        <el-menu-item index="/stars"><el-icon><Star /></el-icon><span>关注</span></el-menu-item>
        <el-menu-item index="/likes"><el-icon><Pointer /></el-icon><span>点赞的作品</span></el-menu-item>
        <el-menu-item v-if="canReview" index="/review"><el-icon><ChatDotRound /></el-icon><span>评论审核</span></el-menu-item>
        <el-sub-menu index="/messages">
        <template #title>
            <el-icon><Message /></el-icon>消息
        </template>
        </el-sub-menu>
        <el-sub-menu index="1">
            <template #title>
                <el-icon><User /></el-icon>我的账号
            </template>
            <!-- 这里是有template的插槽title -->
            <el-menu-item index="/account"><el-icon><Stamp /></el-icon>我的主页</el-menu-item>
            <el-menu-item index="/setting"><el-icon><ElementPlus /></el-icon>账号设置</el-menu-item>
            <el-menu-item index="/logout"><el-icon><Ship /></el-icon>退出登录</el-menu-item>
        </el-sub-menu>
    
</el-menu>
<LogoutDialog v-model="logoutVisible" @confirmed="router.push('/find')" />
</template>