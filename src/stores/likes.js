import { computed, reactive, ref, watch } from 'vue'
import { authSession } from '@/api/signin.js'
import { allPages, socialRequest as request } from '@/api/social.js'
const records = ref([])
const counts = reactive(new Map())
const busy = new Set()
const userId = computed(() => authSession.value?.user?.id ?? null)
export const likedWorks = computed(() => records.value)
export const canLike = computed(() => userId.value != null)
export const likesLoading = ref(false)
export const likesError = ref('')
export function imageKey(image) { return image?.id == null ? null : `id:${image.id}` }
export function isLiked(image) { return records.value.some(item => item.key === imageKey(image)) }
export function likeCount(image) { return counts.get(imageKey(image)) ?? Math.max(0, Number(image?.likes) || 0) }
let generation = 0
export async function loadLikes() {
  const current = ++generation
  records.value = []; counts.clear(); likesError.value = ''; likesLoading.value = false
  if (!canLike.value) return
  likesLoading.value = true
  try {
    const data = await allPages('/social/me/likes')
    if (current !== generation) return
    records.value = data
    data.forEach(item => counts.set(item.key, Number(item.image.likes) || 0))
  } catch (error) { if (current === generation) likesError.value = error.response?.data?.msg || error.message || '点赞列表加载失败' }
  finally { if (current === generation) likesLoading.value = false }
}
watch(userId, loadLikes, { immediate: true, flush: 'sync' })
export async function toggleLike(image) {
  const uid = userId.value, key = imageKey(image)
  if (uid == null) throw new Error('请先登录')
  if (!key) throw new Error('作品信息尚未加载，请刷新列表')
  const lock = `${uid}:${key}`
  if (busy.has(lock)) return
  if (likesLoading.value || likesError.value) throw new Error('请等待点赞记录加载完成，或在点赞页重试')
  busy.add(lock)
  try {
    const on = !isLiked(image)
    const result = on ? await request.put(`/social/images/${image.id}/like`) : await request.delete(`/social/images/${image.id}/like`)
    if (uid !== userId.value) return
    counts.set(key, Number(result.data.likes))
    records.value = on ? [{ key, image: { ...image, likes: result.data.likes }, likedAt: new Date().toISOString() }, ...records.value.filter(item => item.key !== key)] : records.value.filter(item => item.key !== key)
    return on
  } finally { busy.delete(lock) }
}
