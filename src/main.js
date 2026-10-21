import { createApp } from 'vue'
import App from './App.vue'
import router from '@/utils/router/index.js'
// import router from './utils/router/index.js'用的是我们自己定义的router/index.js文件，而不是默认的router/index.js文件。因为我们在src/utils/router/index.js中定义了路由配置，并导出了router实例，所以我们需要从这个路径导入router。
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app=createApp(App)
app.use(ElementPlus)
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')

