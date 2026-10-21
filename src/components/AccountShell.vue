<script setup>
import { authSession } from '@/api/signin.js'
defineProps({ title: String, subtitle: String, loading: Boolean, error: String })
defineEmits(['retry'])
</script>
<template>
  <section class="account-page"><header class="page-heading"><span>HX · 我的空间</span><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>
    <div v-if="!authSession" class="state"><h2>登录，开启你的个人空间</h2><p>管理资料，记录喜欢的作品。</p><el-button type="primary" round @click="$router.push({path:'/login', query:{redirect:$route.fullPath}})">前往登录</el-button></div>
    <div v-else-if="loading" class="state" role="status">正在加载个人资料…</div>
    <div v-else-if="error" class="state" role="alert"><p>{{ error }}</p><el-button @click="$emit('retry')">重新加载</el-button></div>
    <slot v-else />
  </section>
</template>
<style scoped>
.account-page { max-width: 1180px; margin: auto; padding: 18px 10px 44px; color: #354158; } .page-heading { margin-bottom: 28px; } .page-heading > span { font-size: 12px; letter-spacing: 3px; color: #409eff; } h1 { font-size: clamp(26px, 2.6vw, 36px); margin: 14px 0 10px; } .page-heading p,.state p { color: #8290a5; font-size: 14px; line-height: 1.8; } .state { text-align: center; padding: 60px 20px; border-radius: 18px; background: #f8fbff; } .state h2 { font-size: 21px; } .state p { margin-bottom: 24px; }
</style>
