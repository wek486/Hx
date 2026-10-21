<script setup>
import LikeButton from '@/components/LikeButton.vue'
import { computed, ref, watch } from 'vue'
import CommentPanel from '@/components/CommentPanel.vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authSession } from '@/api/signin.js'
import { authorFromImage, canFollow, followLoading, followError, isFollowing, followAuthor, unfollowAuthor } from '@/stores/follow.js'

const props = defineProps({ modelValue: Boolean, image: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const route = useRoute()
const expanded = ref(false)
watch(() => props.modelValue, () => { expanded.value = false })
const failedImage = ref(false)
const author = computed(() => authorFromImage(props.image))
const followed = computed(() => isFollowing(author.value))
const ownAuthor = computed(() => author.value.userId != null && String(author.value.userId) === String(authSession.value?.user?.id))
const missingAuthor = computed(() => !author.value.name || author.value.name === '未知作者')
watch(() => props.image, () => { failedImage.value = false })
function goLogin() {
  emit('update:modelValue', false)
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}
async function toggleFollow() {
  if (!canFollow.value) {
    emit('update:modelValue', false)
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    if (followed.value) {
      await unfollowAuthor(author.value)
      ElMessage.success('已取消关注')
    } else {
      await followAuthor(author.value)
      ElMessage.success('已关注作者')
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败，请重试')
  }
}
</script>

<template>
  <el-dialog class="hx-image-detail" :model-value="modelValue" :title="image?.title || '图片预览'" width="min(1380px, 96vw)" :fullscreen="expanded" append-to-body align-center destroy-on-close @update:model-value="emit('update:modelValue', $event)">
    <template #header><div class="detail-header"><div><span class="eyebrow">HX · 作品详情</span><h2>{{ image?.title || '图片预览' }}</h2></div><el-button class="expand-button" text @click="expanded = !expanded">{{ expanded ? '退出全屏 ↙' : '全屏查看 ↗' }}</el-button></div></template>
    <div v-if="image" class="detail" :class="{ expanded }">
      <div class="artwork">
        <img v-if="!failedImage" :src="image.originalUrl || image.url" :alt="image.title" @error="failedImage = true" />
        <div v-else class="unavailable"><span aria-hidden="true">▧</span><p>图片暂时无法加载</p><small>仍可查看作者信息和参与评论</small></div>
      </div>
      <aside class="discussion-panel">
        <div class="author-panel"><div class="author-profile"><el-avatar :key="author.key + author.avatarUrl" :size="46" :src="author.avatarUrl">{{ author.name.slice(0, 1) || '作' }}</el-avatar><div class="author-name"><span>作品作者</span><h3>{{ author.name || '未知作者' }}</h3></div></div><el-button :type="followed || ownAuthor || missingAuthor ? 'default' : 'primary'" :disabled="ownAuthor || missingAuthor || followLoading || !!followError" round size="small" @click="toggleFollow">{{ ownAuthor ? '我自己' : missingAuthor ? '暂无作者' : followed ? '已关注 · 取消' : canFollow ? '＋ 关注' : '登录关注' }}</el-button></div>
        <router-link class="following-link" to="/stars" @click="emit('update:modelValue', false)">查看我的关注 →</router-link>
        <div class="work-actions"><LikeButton :image="image" @login="emit('update:modelValue', false)" /><router-link to="/likes" @click="emit('update:modelValue', false)">点赞的作品 →</router-link></div>
        <CommentPanel :image="image" @login="goLogin" />
      </aside>
    </div>
  </el-dialog>
</template>

<style scoped>
.work-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 0 16px; flex-shrink: 0; }
.work-actions a { color: #8290a5; font-size: 12px; text-decoration: none; }
:global(.hx-image-detail) { max-height: 96dvh; overflow-y: auto; border-radius: 18px; padding: 24px; }
:global(.hx-image-detail.is-fullscreen) { max-height: 100dvh; border-radius: 0; }
.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-right: 28px; }
.detail-header h2 { font-size: 19px; line-height: 1.5; margin: 6px 0 0; color: #354158; overflow-wrap: anywhere; }
.eyebrow { color: #8ca1b9; font-size: 10px; letter-spacing: 2px; }
.expand-button { color: #8290a5; flex-shrink: 0; }
.detail { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 26px; height: min(76dvh, 820px); }
.detail.expanded { height: calc(100dvh - 130px); }
.artwork { display: grid; place-items: center; min-height: 0; min-width: 0; height: 100%; background: #f3f7fc; border-radius: 14px; overflow: hidden; }
.artwork img { display: block; width: 100%; height: 100%; min-height: 0; object-fit: contain; }
.unavailable { padding: 32px; text-align: center; color: #8290a5; } .unavailable > span { font-size: 40px; color: #b6cce4; } .unavailable p { margin: 14px 0 8px; } .unavailable small { font-size: 12px; }
.discussion-panel { display: flex; flex-direction: column; min-height: 0; padding: 4px 4px 4px 0; }
.author-panel { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
.author-profile { display: flex; gap: 12px; align-items: center; min-width: 0; }
.el-avatar { background: #e7f2ff; color: #488bc8; flex-shrink: 0; }
.author-name { min-width: 0; } .author-name span { font-size: 11px; color: #9aaabd; } .author-name h3 { font-size: 15px; color: #354158; margin: 5px 0 0; overflow-wrap: anywhere; }
.following-link { display: block; width: fit-content; margin: 14px 0 0; padding-bottom: 18px; font-size: 12px; color: #409eff; text-decoration: none; }
.discussion-panel > :last-child { border-top: 1px solid #edf2f8; }
@media (max-width: 1050px) { .detail { grid-template-columns: minmax(0, 1fr) 330px; gap: 18px; } }
@media (max-width: 800px) { :global(.hx-image-detail) { padding: 18px; } .detail, .detail.expanded { grid-template-columns: 1fr; height: auto; gap: 20px; } .artwork { height: min(52dvh, 520px); min-height: 200px; } .discussion-panel { min-height: 420px; padding: 0; } .detail-header { gap: 8px; } .detail-header h2 { font-size: 16px; } .expand-button { font-size: 12px; padding: 6px; } }
</style>
