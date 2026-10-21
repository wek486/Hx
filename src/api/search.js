import request from '@/utils/axios/axios.js'

// 如果文件里已经导入 request，就不要重复导入。
export function searchImages(params) {
  return request({
    url: '/images/search',
    method: 'get',
    params,
  })
}