import { computed, ref, watch } from 'vue'
import request from '@/utils/axios/axios'
import { authSession } from '@/api/signin.js'
export function syncProfile(data) {
  if (String(data.id) !== String(authSession.value?.user?.id)) return
  authSession.value = { ...authSession.value, user: data }
  const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage
  try { storage.setItem('user', JSON.stringify(data)) } catch { /* Saved profile remains available from the server. */ }
}
export function useAccount() {
  const profile = computed(() => authSession.value?.user)
  const loading = ref(false), error = ref('')
  let generation = 0
  async function load() {
    const id = profile.value?.id, current = ++generation
    error.value = ''; loading.value = false
    if (id == null) return
    loading.value = true
    try { const result = await request.get('/account/me'); if (current === generation) syncProfile(result.data) }
    catch (e) { if (current === generation) error.value = e.response?.data?.msg || e.message || '资料加载失败' }
    finally { if (current === generation) loading.value = false }
  }
  watch(() => profile.value?.id, load, { immediate: true })
  return { profile, loading, error, load }
}
export const accountRequest = request
