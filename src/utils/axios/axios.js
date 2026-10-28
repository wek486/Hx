import axios from 'axios';
//记得不是自己定义的内容一般都要安装对应的包，npm install axios
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 50000
})
// 登录后，后续 API 请求自动携带 JWT。
request.interceptors.request.use((config) => {
    //config这次请求的配置都在里面
    const loginUrl = '/login'
    if (config.url === loginUrl || config.url === '/register') return config
    const token = sessionStorage.getItem('token') || localStorage.getItem('token')
//     对比	sessionStorage	localStorage
// 刷新页面	保留	保留
// 关闭标签页后	通常清除	保留
// 同源的不同标签页	通常各自独立	共享
// 常见用途	本次登录	“记住我”
    // 
    if (token) {
//         如果 config.headers 已经存在，就保留原来的请求头；否则创建一个空对象。
// 在现代 Axios 中，正常请求配置通常已经有 headers，所以这句更多是防御性写法。
        config.headers = config.headers || {}
        config.headers.Authorization = 'Bearer ' + token
        //Authorization HTTP 标准认证请求头
        //Bearer 认证方案
    }
    return config
})
// axios.post('/api/user', {
//     username: 'xiaoming'
// }, {
//     headers: {
//         Authorization: 'Bearer ' + token
//     }
// })


// 为什么这里 axios.post() 的第二个参数是 Body，而第三个参数才是 Headers？
// 因为这是 Axios post(url, data, config) 的方法参数约定。理解这一点，你就不会把请求体和请求头混淆了。
// 响应拦截器，这里有回调函数的处理
request.interceptors.response.use(
    (response)=>{
        if(response.data.code==1) {
            return response.data
         }
        else{
            return Promise.reject(new Error(response.data.msg || response.data.message || '请求失败'))
        }
    },
    (err)=>
    {
        return Promise.reject(err)
    }
)
export default request