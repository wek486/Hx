import request from '@/utils/axios/axios'
export function getImageList(params) {//params是一个对象，里面包含了请求的参数
    return request({
        params,
        url:'/get_image_list',
        method:'get'
    })
}
// 默认界面的查找图片列表，request