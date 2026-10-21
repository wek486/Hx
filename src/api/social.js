import request from '@/utils/axios/axios'
export const socialRequest = request
export async function allPages(url) {
  const all = []
  for (let page = 1; page <= 10000; page++) {
    const result = await request.get(url, { params: { page, size: 100 } })
    if (!Array.isArray(result.data)) throw new Error('接口数据格式不正确')
    all.push(...result.data)
    if (result.data.length < 100) return all
  }
  throw new Error('数据过多，请联系管理员')
}
