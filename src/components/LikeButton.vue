<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { canLike, isLiked, likeCount, toggleLike, imageKey } from '@/stores/likes.js'
const props = defineProps({ image: { type: Object, required: true }, compact: Boolean })
const emit = defineEmits(['login'])
const router = useRouter()
const route = useRoute()
const active = computed(() => isLiked(props.image))
const count = computed(() => likeCount(props.image))
const formatted = computed(() => count.value >= 10000 ? `${(count.value / 10000).toFixed(1)}万` : count.value.toLocaleString('zh-CN'))
async function click() {
  if (!canLike.value) {
    emit('login')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try { await toggleLike(props.image) }
  catch (error) { ElMessage.error(error.response?.data?.msg || error.message || '点赞失败，请重试') }
}
</script>

<template>
  <button type="button" class="like-button" :class="{ active, compact }" :disabled="!imageKey(image)" :aria-pressed="active" :aria-label="`${active ? '取消点赞' : '点赞'}：${image.title || '作品'}，${count} 次点赞`" @click.stop="click">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
    <span v-if="!compact">{{ active ? '已点赞' : '点赞作品' }}</span><span>{{ formatted }}</span>
  </button>
</template>

<style scoped>
.like-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #e5edf6; border-radius: 22px; padding: 9px 15px; background: #fff; color: #8290a5; cursor: pointer; font: inherit; font-size: 13px; transition: background .2s, color .2s; white-space: nowrap; }
.like-button svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.6; }
.like-button:hover { color: #ed718b; background: #fff5f7; border-color: #f6ced8; }
.like-button.active { color: #e66a87; background: #fff1f5; border-color: #f5cdd8; } .active svg { fill: currentColor; }
.like-button.compact { padding: 5px 7px; gap: 5px; font-size: 12px; border-color: transparent; background: transparent; }
.like-button:focus-visible { outline: 2px solid #409eff; outline-offset: 3px; } .like-button:disabled { cursor: not-allowed; opacity: .5; }
</style>
