<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImagePreview from '@/components/ImagePreview.vue'
import { canFollow, following, followLoading, followError, loadFollowing, unfollowAuthor } from '@/stores/follow.js'

const keyword = ref('')
const previewVisible = ref(false)
const previewImage = ref(null)
const filtered = computed(() => following.value.filter(author => author.name.toLocaleLowerCase().includes(keyword.value.trim().toLocaleLowerCase())))
async function remove(author) {
  try { await ElMessageBox.confirm(`确定取消关注「${author.name}」吗？`, '取消关注', { confirmButtonText: '取消关注', cancelButtonText: '继续关注', type: 'warning' }) }
  catch { return }
  try { await unfollowAuthor(author); ElMessage.success('已取消关注') }
  catch { ElMessage.error('保存失败，请重试') }
}
function preview(author) {
  previewImage.value = author.image
  previewVisible.value = true
}
</script>

<template>
  <section class="following-page">
    <header class="heading">
      <div><span class="eyebrow">HX · 灵感同行</span><h1>我的关注 <span>{{ canFollow ? following.length : 0 }}</span></h1><p>把喜欢的创作者留在身边，让灵感继续发生。</p></div>
      <el-button round @click="$router.push('/find')">发现更多作者 ↗</el-button>
    </header>
    <div v-if="!canFollow" class="state"><span class="state-icon">♡</span><h2>登录，遇见你的灵感同伴</h2><p>关注喜欢的作者，在这里找到他们。</p><el-button type="primary" round @click="$router.push({ path: '/login', query: { redirect: '/stars' } })">前往登录</el-button></div>
    <template v-else>
      <div class="toolbar"><span>已关注的作者</span><el-input v-model="keyword" placeholder="搜索关注的作者" clearable aria-label="搜索关注的作者" /><small>关注记录已同步至账号</small></div>
      <div v-if="followLoading" class="state">正在加载关注列表…</div>
      <div v-else-if="followError" class="state"><p>{{ followError }}</p><el-button @click="loadFollowing">重试</el-button></div>
      <div v-else-if="!following.length" class="state"><span class="state-icon">＋</span><h2>还没有关注的作者</h2><p>打开作品预览，点击“关注作者”，就能在这里找到对方。</p><el-button type="primary" round @click="$router.push('/find')">去发现喜欢的作品</el-button></div>
      <div v-else-if="!filtered.length" class="state"><h2>没有找到这位作者</h2><p>试试其他名字，或清空搜索。</p><el-button @click="keyword = ''">清空搜索</el-button></div>
      <div v-else class="authors">
        <article v-for="author in filtered" :key="author.key" class="author-card">
          <div class="cover"><el-image v-if="author.coverUrl" :src="author.coverUrl" fit="cover" loading="lazy"><template #error><span class="cover-empty">每一份热爱，都值得被发现</span></template></el-image><span v-else class="cover-empty">灵感，正在发生</span></div>
          <div class="author-body"><el-avatar :size="54" :src="author.avatarUrl">{{ author.name.slice(0, 1) }}</el-avatar><h2>{{ author.name }}</h2><p>已加入你的关注</p><div class="actions"><el-button type="primary" plain round :disabled="!author.image" @click="preview(author)">查看作品</el-button><el-button round @click="remove(author)">取消关注</el-button></div></div>
        </article>
      </div>
    </template>
    <ImagePreview v-model="previewVisible" :image="previewImage" />
  </section>
</template>

<style scoped>
.following-page { max-width: 1440px; margin: 0 auto; padding: 18px 10px 40px; color: #354158; }
.heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 32px; }
.eyebrow { color: #409eff; letter-spacing: 3px; font-size: 12px; }
h1 { font-size: clamp(26px, 2.6vw, 38px); margin: 14px 0 12px; } h1 span { font-size: 16px; font-weight: 400; color: #8290a5; }
.heading p, .state p { color: #8290a5; font-size: 14px; line-height: 1.8; }
.toolbar { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; padding: 18px 0; border-top: 1px solid #edf2f8; margin-bottom: 16px; }
.toolbar .el-input { width: min(260px, 100%); } .toolbar small { color: #8290a5; margin-left: auto; }
.authors { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 22px; }
.author-card { border: 1px solid #edf2f8; border-radius: 16px; overflow: hidden; background: #fff; }
.cover { height: 145px; background: linear-gradient(135deg, #e7f2ff, #f3f8ff); } .cover .el-image { width: 100%; height: 100%; }
.cover-empty { display: grid; place-items: center; height: 100%; padding: 0 16px; color: #8290a5; font-size: 12px; }
.author-body { padding: 0 20px 24px; } .author-body .el-avatar { position: relative; margin-top: -27px; border: 3px solid white; background: #e7f2ff; color: #488bc8; }
.author-body h2 { font-size: 18px; overflow-wrap: anywhere; margin: 12px 0 8px; } .author-body p { color: #8290a5; font-size: 12px; margin-bottom: 20px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; } .actions .el-button { margin-left: 0; }
.state { text-align: center; padding: 70px 18px; background: #f8fbff; border-radius: 18px; } .state h2 { font-size: 21px; } .state p { margin-bottom: 24px; } .state-icon { font-size: 42px; color: #409eff; }
@media (max-width: 600px) { .heading { align-items: flex-start; flex-direction: column; } .toolbar small { margin-left: 0; width: 100%; } .following-page { padding: 10px 0 24px; } }
</style>
