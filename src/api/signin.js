import { ref } from 'vue'

import request from '@/utils/axios/axios'
export function SignIn({ username, password }) {//params是一个提供的配置可以解析对象成属性键值样加在访问的路径里面，里面包含了请求的参数
    //这里存的东西长，我存储在请求体里面
    return request({
        url:'/login',
        method:'post',
        data: {username,password},
    })
    // request({...}) 的配置对象中，不能直接放 {username,password}，需要指定属性名，例如 data。
}
export function registerRequest({ username, password }){
     return request({
        url:'/register',
        method:'post',
        data: {username,password},
    })
}

// Shared reactive login state, restored when the page is refreshed.
function readSession() {
    const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage
    const token = storage.getItem('token')
    //从sessionStorage和localStorage里面取存储的东西
    if (!token) return null
    let user = null
    try {
        // JSON.parse() 的作用是：把 JSON 格式的字符串转换成 JavaScript 数据。注意要写成大写的 JSON。
        // localStorage 保存的是字符串，所以需要转换回对象。
        // 它和 JSON.stringify() 方向相反：
        user = JSON.parse(storage.getItem('user') || 'null')
    } catch {
        // Invalid old user data must not prevent the page from loading.
    }
    return { token, user }
}

export const authSession = ref(readSession())

export function refreshAuthSession() {
    authSession.value = readSession()
}

export function signOut() {
    for (const storage of [sessionStorage, localStorage]) {
        storage.removeItem('token')
        storage.removeItem('user')
    }
    authSession.value = null
}
window.addEventListener('hx:session-expired', signOut)
