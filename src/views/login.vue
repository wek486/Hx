<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Lock, Promotion, Refresh, User } from '@element-plus/icons-vue'
import { getImageList } from '@/api/image_find.js'
import { SignIn, refreshAuthSession } from '@/api/signin.js'
const route = useRoute()
const router = useRouter()
const formRef = ref(null)
// 告诉 Vue，把这个表单组件放进上面的变量。
{/* <el-form ref="formRef"> */}
{/* 页面挂载后，Vue 会自动让： */}
{/* formRef.value */}
{/* 指向这个 Element Plus 表单组件。于是你就可以调用表单的方法： */}
const form = reactive({ username: '', password: '' })
// form 是一个响应式对象，专门保存表单内容。reactive
const remember = ref(false)
const submitting = ref(false)
const loginError = ref('')
const pictures = ref([])
const pictureIndex = ref(0)
const pictureLoading = ref(true)
// computed 用来根据已有的响应式数据，计算出一个会自动更新的值。
const picture = computed(() => pictures.value[pictureIndex.value])
let disposed = false
const rules = {
  username: [{ required: true, whitespace: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
//   rules 是告诉表单“按什么规则检查”；validate() 是让表单“现在开始检查”。
// 配置	作用
// username	这条规则用于检查账号
// required: true	必须填写，不能为空
// whitespace: true	不能只输入空格
// message	不合格时显示的提示
// trigger: 'blur'	输入框失去焦点时触发检查
//里面根据form表单里面的每个框的prop设置[{required是否必需填，message错误是的提示，trigger: 'blur'	输入框失去焦点时触发检查，检查的就是目前定义的方法}]
}

async function loadPictures() {
  try {
    const result = await getImageList({ sort: 'recommended', page: 1, pageSize: 40 })
    if (disposed) return
    const records = Array.isArray(result.data) ? result.data : result.data?.records
    pictures.value = (Array.isArray(records) ? records : []).filter((item) => {
      try { return ['http:', 'https:'].includes(new URL(item.url).protocol) } catch { return false }
    })
    pictureIndex.value = Math.floor(Math.random() * pictures.value.length) || 0
  } catch {
    // The gradient remains usable when the image service is unavailable.
  } finally {
    if (!disposed) pictureLoading.value = false
  }
}
//按了按钮之后，实现的换图片函数，index++取模
function nextPicture() {
  if (pictures.value.length > 1) pictureIndex.value = (pictureIndex.value + 1) % pictures.value.length
}

function imageFailed() {
  pictures.value = pictures.value.filter((_, index) => index !== pictureIndex.value)
  pictureIndex.value = 0
}

async function submit() {
  if (submitting.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  loginError.value = ''
  try {
   const result=await SignIn({ username: form.username.trim(), password: form.password })
    const {token,user}=result.data;//这里利用变量名要与对象的属性名对应，这里就是 token 和 user，顺序无所谓。js里面的对象解构赋值，结构一般就解构一层的对象
    // 可以嵌套解构，但你写的：
// const { token, { name, password } } = result.data
// 语法不对，内层对象前面需要写对应的属性名。
// const {token,user: { id, username }} = result.data

    if(!token){
      throw new Error("登录接口没有返回token")
    }
    const storage = remember.value ? localStorage : sessionStorage
    const otherstorage=remember.value?sessionStorage:localStorage
    otherstorage.removeItem('token')
    otherstorage.removeItem('user')
    storage.setItem('user',JSON.stringify(user))//session和localStorage存的是字符类型，是对象的话用JSON.stringify(()方法处理)
//     写法	得到的字符串
// JSON.stringify(user)	'{"id":1,"username":"张三"}'
// String(user)	'[object Object]'
// user.toString()	'[object Object]'
// '' + user	'[object Object]'
// 对于这种普通对象，后三种默认结果看不出里面的属性，无法据此还原原来的数所以用json.stringify（）更好能看到属性值
    storage.setItem('token',token)
    refreshAuthSession()
    if (!disposed) {
      const redirect = route.query.redirect
      const target = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\') && !/^\/(login|register)(?:[/?#]|$)/.test(redirect) ? redirect : '/find'
      await router.replace(target)
    }
    //这里就看出了是否记住我的这个属性的作用了
//    例如，你上次勾选了“记住我”，账号 A 的 token 存在 localStorage。这次用账号 B 登录，没有勾选，就会把 B 的 token 存在 sessionStorage。
// 如果不清掉 localStorage 里 A 的 token，关闭标签页、再次打开后，程序就可能读到 A 的旧 token。
// 因此这里的逻辑是：一处保存本次登录信息，另一处清除旧登录信息。因为读取toekn是用的sessionStorage和localStorage两个的用了，所以要删除其中没有选择为这次存储token的一个
   
  } catch (error) {
    if (!disposed) loginError.value = error.response?.data?.msg || error.message || '暂时无法登录，请稍后再试'
  } finally {
    form.password = ''
    if (!disposed) submitting.value = false
  }
}

onMounted(loadPictures)
onBeforeUnmount(() => { disposed = true })
</script>

<template>
  <main class="login-page">
    <header class="login-header">
      <router-link to="/find" class="brand"><el-icon><Promotion /></el-icon><span>Hx <b>图片飞机场</b></span></router-link>
      <router-link to="/find" class="back"><el-icon><ArrowLeft /></el-icon>返回发现</router-link>
    </header>
    <section class="login-card" aria-label="账号登录">
      <div class="login-art" :aria-busy="pictureLoading">
        <!--:src:是v-bind的缩写  -->
        <img v-if="picture" :key="picture.url" :src="picture.url" alt="社区精选作品" @error="imageFailed" />
        <div class="art-shade"></div>
        <div class="art-copy"><span class="art-label">HX · 灵感随行</span><h1>发现你的<br />下一份灵感</h1><p>用好看的图片，遇见更大的世界。</p></div>
        <div class="art-footer"><span>{{ picture ? (picture.author || '社区精选') : '每一份热爱，都值得被发现' }}</span><button v-if="pictures.length > 1" type="button" @click="nextPicture"><el-icon><Refresh /></el-icon>换一张</button></div>
      </div>
      <div class="login-form-panel">
        <div class="form-heading"><h2>欢迎回来</h2><p>登录，收藏你喜欢的每一份灵感</p></div>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
          <el-form-item label="账号" prop="username"><el-input v-model="form.username" :prefix-icon="User" placeholder="请输入用户名或邮箱" autocomplete="username" :maxlength="128" /></el-form-item>
          <el-form-item label="密码" prop="password"><el-input v-model="form.password" :prefix-icon="Lock" placeholder="请输入密码" type="password" show-password autocomplete="current-password" /></el-form-item>
          <div class="form-options"><el-checkbox v-model="remember">记住我</el-checkbox><span>欢迎回到你的灵感空间</span></div>
          <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
          <el-button class="login-button" type="primary" native-type="submit" :loading="submitting">{{ submitting ? '正在登录…' : '登录' }}</el-button>
        </el-form>
        <div class="register-link"><span>还没有账号？</span><el-button type="primary" link @click="router.push('/register')">立即注册</el-button></div>
        <div class="guest-link"><span>先随便逛逛？</span><router-link to="/find">以访客身份浏览 →</router-link></div>
      </div>
    </section>
    <footer class="login-footer">Hx 图片飞机场 · 收藏灵感，分享热爱</footer>
  </main>
</template>

<style scoped>
.login-page { min-height: 100vh; min-height: 100dvh; box-sizing: border-box; padding: 32px clamp(20px, 5vw, 80px); background: radial-gradient(ellipse at 8% 85%, #dceeff, transparent 55%), linear-gradient(135deg, #f1f8ff, #fff 65%, #eef6ff); color: #17243b; display: flex; flex-direction: column; }
.login-page * { box-sizing: border-box; }
.login-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
a { text-decoration: none; color: #409eff; }
.brand { display: flex; align-items: center; gap: 10px; font-size: 23px; font-weight: 700; }
.brand .el-icon { font-size: 34px; }
.brand b { color: #17243b; }
.back { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
.login-card { display: grid; grid-template-columns: 1.06fr 1fr; width: min(1080px, 100%); min-height: 570px; margin: 64px auto 36px; border-radius: 18px; overflow: hidden; background: white; box-shadow: 0 18px 70px #2674b815; }
.login-art { position: relative; min-height: 570px; overflow: hidden; background: linear-gradient(145deg, #76c4ff, #409eff 50%, #265fc7); color: white; }
.login-art > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.art-shade { position: absolute; inset: 0; background: linear-gradient(180deg, #102b535c, transparent 70%, #102b538c); }
.art-copy { position: relative; padding: 46px 38px; text-shadow: 0 2px 18px #102b5360; }
.art-label { font-size: 12px; letter-spacing: 3px; }
.art-copy h1 { margin: 28px 0 18px; font-size: clamp(30px, 3.2vw, 46px); line-height: 1.45; }
.art-copy p { font-size: 14px; line-height: 1.8; }
.art-footer { position: absolute; bottom: 24px; left: 30px; right: 30px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; }
.art-footer button { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; color: white; background: #17385650; border: 1px solid #ffffff70; border-radius: 20px; cursor: pointer; white-space: nowrap; }
.login-form-panel { align-self: center; padding: 50px clamp(24px, 4vw, 62px); }
.form-heading { margin-bottom: 32px; }
.form-heading h2 { margin: 0 0 12px; font-size: 30px; }
.form-heading p { color: #8290a5; font-size: 14px; line-height: 1.8; }
.form-options { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 4px 0 22px; }
.form-options > span { color: #9ba7b8; font-size: 12px; }
.login-button { width: 100%; height: 44px; }
.login-error { color: #d74242; font-size: 13px; line-height: 1.6; }
.register-link { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 22px; font-size: 14px; color: #8290a5; }
.guest-link { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 30px; padding-top: 26px; border-top: 1px solid #eef1f5; font-size: 13px; color: #8290a5; }
.login-footer { margin-top: auto; text-align: center; font-size: 12px; color: #9ba7b8; padding: 12px 0; }
@media (max-width: 760px) { .login-page { padding: 22px 16px; } .brand { font-size: 18px; } .brand .el-icon { font-size: 26px; } .login-card { grid-template-columns: 1fr; margin-top: 30px; min-height: auto; } .login-art { min-height: 220px; } .art-copy { padding: 26px; } .art-copy h1 { font-size: 28px; margin: 14px 0; } .art-copy h1 br { display: none; } .art-copy p { margin: 0; } .art-footer { bottom: 14px; left: 26px; right: 26px; } .login-form-panel { padding: 32px 26px; } }
</style>
