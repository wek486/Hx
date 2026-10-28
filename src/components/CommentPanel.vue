<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authSession } from '@/api/signin.js'
import { socialRequest as request } from '@/api/social.js'
const props = defineProps({ image: { type: Object, required: true } })
const emit = defineEmits(['login'])
const user = computed(() => authSession.value?.user)
const comments = ref([]), draft = ref(''), sort = ref('newest'), error = ref('')
const saving = ref(false), loading = ref(false), page = ref(0), total = ref(0)
const canPost = computed(() => user.value?.id != null && props.image?.id != null)
let generation = 0
async function load(reset = true) {
  if (!reset && loading.value) return
  const current = ++generation, imageId = props.image?.id
  if (reset) { comments.value = []; page.value = 0; total.value = 0 }
  error.value = ''; loading.value = true
  if (imageId == null) { loading.value = false; error.value = '作品信息尚未加载，请刷新列表'; return }
  const next = reset ? 1 : page.value + 1
  try {
    const result = await request.get(`/social/images/${imageId}/comments`, { params: { page: next, size: 20, sort: sort.value } })
    if (current !== generation) return
    comments.value = reset ? result.data.records : [...comments.value, ...result.data.records]
    total.value = result.data.total; page.value = next
  } catch (e) { if (current === generation) error.value = e.response?.data?.msg || e.message || '评论加载失败' }
  finally { if (current === generation) loading.value = false }
}
watch(() => [props.image?.id, user.value?.id, sort.value], () => { draft.value = ''; load() }, { immediate: true })
async function submit() {
  const content = draft.value.trim(), imageId = props.image?.id, uid = user.value?.id
  if (!canPost.value || saving.value || !content || content.length > 500) return
  saving.value = true
  try {
    await request.post(`/social/images/${imageId}/comments`, { content })
    if (imageId !== props.image?.id || uid !== user.value?.id) return
    draft.value = ''; ElMessage.success('已提交，审核通过后公开'); await load()
  } catch (e) { ElMessage.error(e.response?.data?.msg || e.message || '提交失败，内容已保留') }
  finally { saving.value = false }
}
// // 监听一个 ref
// watch(count, (newValue, oldValue) => {
//   console.log(newValue, oldValue)
// })

// // 监听对象中的某个属性，要用 getter
// watch(() => user.value.name, (name) => {
//   console.log(name)
// })

// // 同时监听多个数据
// watch([count, keyword], ([newCount, newKeyword]) => {
//   console.log(newCount, newKeyword)
// })
async function remove(item) {
  const imageId = props.image?.id, uid = user.value?.id
  try { await ElMessageBox.confirm('确定删除这条评论吗？', '删除评论', { confirmButtonText: '删除', cancelButtonText: '保留', type: 'warning' }) } catch { return }
  if (uid !== user.value?.id) return
  try { await request.delete(`/social/comments/${item.id}`); if (imageId === props.image?.id) await load() }
  catch (e) { ElMessage.error(e.response?.data?.msg || '删除失败，请重试') }
}
function time(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
</script>

<template>
  <section class="comments" aria-label="作品评论">
    <header class="comments-heading"><h3>评论 <span>{{ total }}</span></h3><el-select v-model="sort" size="small" aria-label="评论排序"><el-option label="最新优先" value="newest" /><el-option label="最早优先" value="oldest" /></el-select></header>
    <div class="local-note">友善交流 · 评论审核通过后公开，待审核和未通过内容仅自己可见。</div>
    <div class="comment-list" aria-live="polite">
      <div v-if="error" class="empty"><p>{{ error }}</p><el-button size="small" @click="load(page === 0)">重试</el-button></div>
      <article v-for="item in comments" :key="item.id" class="comment-item"><el-avatar :size="32" :src="item.avatarUrl">{{ item.username?.slice(0, 1) || '用' }}</el-avatar><div class="comment-body"><div class="comment-meta"><strong>{{ item.username }}</strong><span v-if="String(item.userId) === String(user?.id)" class="me">我</span><span v-if="item.status !== 'APPROVED'" class="me">{{ item.status === 'PENDING' ? '待审核' : '未通过' }}</span><button v-if="String(item.userId) === String(user?.id)" class="delete" type="button" @click="remove(item)">删除</button></div><p class="content">{{ item.content }}</p><time>{{ time(item.createdAt) }}</time></div></article>
      <div v-if="loading" class="empty">正在加载评论…</div>
      <div v-else-if="!comments.length && !error" class="empty"><span class="bubble">“</span><h4>留下你的第一份感受</h4><p>聊聊色彩、构图，或让你心动的细节。</p></div>
      <el-button v-if="comments.length < total && !error" text class="more" :loading="loading" @click="load(false)">加载更多评论</el-button>
    </div>
    <form v-if="canPost" class="composer" @submit.prevent="submit"><label class="compose-title" for="hx-comment-input">说说你的想法</label><el-input id="hx-comment-input" v-model="draft" type="textarea" :rows="3" :maxlength="500" show-word-limit resize="none" placeholder="友善交流，让每一份创作都被温柔以待…" /><div class="compose-footer"><span>审核通过后公开</span><el-button type="primary" round native-type="submit" :loading="saving" :disabled="!draft.trim() || draft.trim().length > 500">发表评论</el-button></div></form>
    <div v-else class="login-prompt"><p>登录后，留下你的想法</p><el-button type="primary" round @click="emit('login')">登录参与评论</el-button></div>
  </section>
</template>

<style scoped>
.comments { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.comments-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 20px; }
h3 { margin: 0; font-size: 17px; color: #354158; } h3 span { margin-left: 7px; font-size: 13px; font-weight: 400; color: #8290a5; }
.comments-heading .el-select { width: 110px; } .conversation { font-size: 12px; color: #8290a5; }
.local-note { font-size: 11px; line-height: 1.7; padding: 10px 0; color: #8799ae; }
.comment-list { flex: 1; min-height: 180px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.comment-item { display: flex; align-items: flex-start; gap: 10px; padding: 18px 2px; border-bottom: 1px solid #f0f4f9; }
.el-avatar { flex-shrink: 0; background: #e7f2ff; color: #488bc8; }
.comment-body { flex: 1; min-width: 0; } .comment-meta { display: flex; align-items: center; gap: 8px; }
strong { font-size: 13px; color: #354158; overflow-wrap: anywhere; } .me { flex-shrink: 0; font-size: 10px; padding: 1px 5px; border-radius: 4px; background: #edf6ff; color: #409eff; }
.delete { margin-left: auto; border: 0; background: none; color: #8290a5; cursor: pointer; font-size: 11px; padding: 4px; flex-shrink: 0; } .delete:hover { color: #e45656; }
.content { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; font-size: 13px; color: #53657c; margin: 8px 0; }
time { font-size: 11px; color: #9aaabd; } .more { display: block; margin: 8px auto; }
.empty { padding: 28px 12px; text-align: center; color: #8290a5; } .empty h4 { font-size: 14px; font-weight: 500; color: #617790; margin: 8px 0; } .empty p { font-size: 12px; line-height: 1.8; margin: 8px 0; }
.bubble { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 14px; color: #79baff; background: #eef6ff; font: 44px Georgia, serif; }
.composer { border-top: 1px solid #edf2f8; padding-top: 16px; margin-top: 10px; } .compose-title { display: block; font-size: 12px; color: #617790; margin-bottom: 10px; }
.compose-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 12px; } .compose-footer span { font-size: 11px; color: #9aaabd; }
.login-prompt { text-align: center; background: #f5f9ff; padding: 18px; border-radius: 12px; } .login-prompt p { color: #8290a5; font-size: 12px; margin: 0 0 12px; }
@media (max-width: 800px) { .comment-list { max-height: 360px; } }
</style>
