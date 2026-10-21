<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { socialRequest as request } from '@/api/social.js'
const records = ref([]), page = ref(1), loading = ref(false), error = ref(''), busy = ref(null)
async function load(target = page.value) {
  if (loading.value) return
  loading.value = true; error.value = ''
  try { const result = await request.get('/social/admin/comments', { params: { page: target, size: 20 } }); records.value = result.data; page.value = target }
  catch (e) { error.value = e.response?.data?.msg || e.message || '审核列表加载失败' }
  finally { loading.value = false }
}
async function review(item, status) {
  if (busy.value != null) return
  busy.value = item.id
  try { await request.patch(`/social/admin/comments/${item.id}`, { status }); ElMessage.success(status === 'APPROVED' ? '已通过，评论现已公开' : '已拒绝'); await load() }
  catch (e) { ElMessage.error(e.response?.data?.msg || '审核失败，请重试') }
  finally { busy.value = null }
}
load()
</script>
<template>
  <section class="review-page"><header><div><span>HX · 社区管理</span><h1>评论审核</h1><p>审核通过后公开展示；词库命中仅供判断，请结合上下文审核。</p></div><el-button :loading="loading" @click="load()">刷新列表</el-button></header>
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <div v-if="loading" class="state">正在加载…</div>
    <div v-else-if="!records.length && !error" class="state">当前页没有待审核评论</div>
    <article v-for="item in records" v-else :key="item.id"><div class="meta"><strong>{{ item.username }}</strong><span>作品 #{{ item.imageId }}</span><el-tag size="small" type="warning">{{ item.flag }}</el-tag></div><p class="content">{{ item.content }}</p><div class="actions"><el-button type="success" plain :disabled="busy != null" @click="review(item, 'APPROVED')">通过</el-button><el-button type="danger" plain :disabled="busy != null" @click="review(item, 'REJECTED')">拒绝</el-button></div></article>
    <footer><el-button :disabled="page <= 1 || loading" @click="load(page - 1)">上一页</el-button><span>第 {{ page }} 页</span><el-button :disabled="records.length < 20 || loading" @click="load(page + 1)">下一页</el-button></footer>
  </section>
</template>
<style scoped>
.review-page { max-width: 1080px; margin: auto; padding: 20px 10px; color: #354158; } header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; } header span { color: #409eff; font-size: 12px; letter-spacing: 2px; } h1 { font-size: 30px; } header p { color: #8290a5; line-height: 1.8; font-size: 13px; } article { border: 1px solid #edf2f8; border-radius: 14px; padding: 22px; margin: 16px 0; } .meta { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; } .meta > span { color: #8290a5; } .content { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; } .actions { display: flex; justify-content: flex-end; } .state { text-align: center; padding: 60px; background: #f8fbff; border-radius: 14px; color: #8290a5; } footer { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 30px 0; font-size: 13px; }
</style>
