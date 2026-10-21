import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server:{
  proxy:{
    '/api':{
      target:'http://localhost:8080',
      changeOrigin:true,//是否开启代理正确ip和端口
      //ws:true,//是否开启websocket通信协议
      secure:false,//是否开启验证后端tssl证书
      rewrite:(path)=>path.replace(/^\/api/,'')
//       部分	含义
// 最外面的 /…/	JavaScript 正则表达式的写法
// ^	字符串开头
// \/	匹配字符 /，反斜杠用于转义
// api	匹配文本 api
    }
  }
}
 
})
