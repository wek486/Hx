<script setup>
import { ref, watch } from 'vue'
import AccountShell from '@/components/AccountShell.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { useAccount, accountRequest as request } from '@/api/account.js'
const { profile, loading, error, load } = useAccount()
const activity = ref({ likes: [], comments: [] }), activityError = ref(''), activityLoading = ref(false)
const previewImage = ref(null), previewVisible = ref(false)
let generation = 0
async function loadActivity() {
  const current = ++generation
  activity.value = { likes: [], comments: [] }; activityError.value = ''; activityLoading.value = false
  if (profile.value?.id == null) return
  activityLoading.value = true
  try { const result = await request.get('/account/activity'); if (current === generation) activity.value = result.data }
  catch (e) { if (current === generation) activityError.value = e.message || '动态加载失败' }
  finally { if (current === generation) activityLoading.value = false }
}
watch(() => profile.value?.id, loadActivity, { immediate: true })
watch(previewVisible, (open, previous) => { if (!open && previous) { load(); loadActivity() } })
function preview(image) { previewImage.value = image; previewVisible.value = true }
</script>
<template>
  <AccountShell title="我的主页" subtitle="关于你，以及每一份被珍藏的灵感。" :loading="loading" :error="error" @retry="load">
    <div class="profile-card"><div class="banner"></div><div class="profile-body"><div class="identity"><el-avatar :size="88" :src="profile?.avatarUrl">{{ (profile?.nickname || profile?.username || '我').slice(0,1) }}</el-avatar><div><h2>{{ profile?.nickname || profile?.username }}</h2><span>@{{ profile?.username }}</span></div><el-button round @click="$router.push('/setting')">编辑资料</el-button></div><p class="bio">{{ profile?.bio || '还没有填写简介，写下你的兴趣，让灵感找到同伴。' }}</p><div class="stats"><router-link to="/stars"><strong>{{ profile?.followingCount || 0 }}</strong><span>关注的作者</span></router-link><router-link to="/likes"><strong>{{ profile?.likesCount || 0 }}</strong><span>点赞的作品</span></router-link><div><strong>{{ profile?.commentsCount || 0 }}</strong><span>发布的评论</span></div></div></div></div>
    <div v-if="activityError" class="state"><p>{{ activityError }}</p><el-button @click="loadActivity">重试</el-button></div>
    <div v-else-if="activityLoading" class="state">正在加载最近动态…</div>
    <template v-else><header class="section-title"><h2>最近点赞</h2><router-link to="/likes">查看全部 →</router-link></header><div v-if="activity.likes.length" class="works"><button v-for="item in activity.likes" :key="item.key" type="button" @click="preview(item.image)"><el-image :src="item.image.url" fit="cover" loading="lazy"><template #error><span class="image-error">图片暂时无法加载</span></template></el-image><strong>{{ item.image.title || '未命名作品' }}</strong><span>{{ item.image.author }}</span></button></div><div v-else class="state">还没有点赞的作品，<router-link to="/find">去发现灵感 →</router-link></div><header class="section-title"><h2>最近评论</h2></header><div v-if="activity.comments.length" class="comments"><article v-for="item in activity.comments" :key="item.id"><div><strong>{{ item.title || '未命名作品' }}</strong><el-tag size="small" :type="item.status==='APPROVED'?'success':item.status==='PENDING'?'warning':'info'">{{ {APPROVED:'已公开',PENDING:'待审核',REJECTED:'未通过'}[item.status] }}</el-tag></div><p>{{ item.content }}</p></article></div><div v-else class="state">还没有发布评论，遇到喜欢的作品，聊聊你的想法吧。</div></template>
    <ImagePreview v-model="previewVisible" :image="previewImage" />
  </AccountShell>
</template>
<style scoped>
.profile-card { border: 1px solid #edf2f8; border-radius: 18px; overflow: hidden; background: white; } .banner { height: 115px; background: radial-gradient(ellipse at 85% 10%,#b5dfff,transparent 65%),linear-gradient(115deg,#edf6ff,#ddebff); } .profile-body { padding: 0 28px 26px; } .identity { display: flex; align-items: center; gap: 18px; margin-top: -28px; } .identity .el-avatar { flex-shrink: 0; border: 4px solid white; background: #e7f2ff; color: #488bc8; } .identity h2 { margin: 36px 0 5px; font-size: 24px; overflow-wrap: anywhere; } .identity span { color: #8290a5; font-size: 12px; } .identity .el-button { margin-left: auto; margin-top: 28px; } .bio { color: #8290a5; font-size: 14px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; margin: 24px 0; }
.stats { display: flex; flex-wrap: wrap; gap: 40px; } .stats > * { display: flex; flex-direction: column; gap: 7px; text-decoration: none; } .stats strong { font-size: 25px; color: #354158; } .stats span { font-size: 12px; color: #8290a5; } .section-title { display: flex; justify-content: space-between; align-items: center; margin: 30px 0 16px; } .section-title h2 { font-size: 19px; margin: 0; } a { color: #409eff; text-decoration: none; font-size: 13px; }
.works { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 18px; } .works button { border: 1px solid #edf2f8; background: white; border-radius: 14px; padding: 0 0 16px; overflow: hidden; text-align: left; cursor: pointer; min-width: 0; } .works .el-image { width: 100%; height: 150px; display: block; background: #edf3fa; } .works strong,.works button > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 12px 14px 0; color: #354158; font-size: 13px; } .works button > span { color: #8290a5; font-size: 12px; margin-top: 6px; } .image-error { display: grid; height: 100%; place-items: center; color: #8290a5; font-size: 12px; }
.state { text-align: center; background: #f8fbff; border-radius: 14px; padding: 32px 15px; color: #8290a5; font-size: 13px; } .comments { border: 1px solid #edf2f8; border-radius: 14px; padding: 0 22px; } article { padding: 18px 0; border-bottom: 1px solid #edf2f8; } article:last-child { border-bottom: 0; } article > div { display: flex; gap: 12px; align-items: center; } article strong { font-size: 13px; } article p { color: #8290a5; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; }
@media(max-width:600px) { .profile-body { padding: 0 18px 22px; } .identity { flex-wrap: wrap; } .identity .el-button { margin-top: 0; } .stats { gap: 26px; } }
</style>
