// The backend currently returns avatars under /api for the local Vite proxy.
// A separately hosted frontend must instead use the configured public API base.
export function resolveApiMedia(data, apiBase) {
  if (!data || typeof data !== 'object') return
  if (Array.isArray(data)) { data.forEach(item => resolveApiMedia(item, apiBase)); return }
  for (const [key, value] of Object.entries(data)) {
    if (key === 'avatarUrl' && typeof value === 'string' && value.startsWith('/api/')) {
      data[key] = apiBase.replace(/\/$/, '') + value.slice(4)
    } else if (value && typeof value === 'object') resolveApiMedia(value, apiBase)
  }
}
