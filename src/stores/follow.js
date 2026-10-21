import { computed, ref, watch } from 'vue'
import { authSession } from '@/api/signin.js'
import { allPages, socialRequest as request } from '@/api/social.js'
const records = ref([])
export const followLoading = ref(false)
export const followError = ref('')
const userId = computed(() => authSession.value?.user?.id ?? null)
export const canFollow = computed(() => userId.value != null)
export const following = computed(() => records.value)
let generation = 0
export async function loadFollowing() {
  const current = ++generation
  records.value = []; followError.value = ''; followLoading.value = false
  if (!canFollow.value) return
  followLoading.value = true
  try { const data = await allPages('/social/me/follows'); if (current === generation) records.value = data }
  catch (error) { if (current === generation) followError.value = error.response?.data?.msg || error.message || '关注列表加载失败' }
  finally { if (current === generation) followLoading.value = false }
}
watch(userId, loadFollowing, { immediate: true, flush: 'sync' })
export function authorFromImage(image) {
  const id = image?.authorId ?? null
  return { key: `id:${id}`, id, userId: image?.authorUserId ?? null, name: String(image?.author || '').trim(), avatarUrl: image?.avatarUrl || '', coverUrl: image?.url || '', image: image ? { ...image } : null }
}
export function isFollowing(author) { return records.value.some(item => String(item.id) === String(author.id)) }
// 实现首先的关注和取消关注功能，
export async function followAuthor(author) {
  const uid = userId.value
  if (uid == null) throw new Error('请先登录')
  if (author.id == null) throw new Error('作者信息尚未加载，请刷新作品列表')
  await request.put(`/social/authors/${author.id}/follow`)
  if (uid === userId.value && !isFollowing(author)) records.value = [{ ...author }, ...records.value]
}
export async function unfollowAuthor(author) {
  const uid = userId.value
  if (uid == null) throw new Error('请先登录')
  await request.delete(`/social/authors/${author.id}/follow`)
  if (uid === userId.value) records.value = records.value.filter(item => String(item.id) !== String(author.id))
}
