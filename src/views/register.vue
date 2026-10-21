<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerRequest } from '@/api/signin.js'

const router = useRouter()
const formRef = ref(null)
const form = reactive({ username: '', password: '', confirmPassword: '' })
const submitting = ref(false)
const errorMessage = ref('')
let disposed = false
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]{3,32}$/, message: '用户名需为3～32位字母、数字或下划线', trigger: 'blur' },
  ],
  password: [{ validator(rule, value, callback) {
    if (!value || value.length < 8 || value.length > 64 || !value.trim()) return callback(new Error('密码需为8～64位，且不能全为空格'))
    if (new TextEncoder().encode(value).length > 72) return callback(new Error('密码过长，请缩短后重试'))
    callback()
  }, trigger: 'blur' }],
  confirmPassword: [{ validator(rule, value, callback) {
    if (!value) return callback(new Error('请再次输入密码'))
    if (value !== form.password) return callback(new Error('两次输入的密码不一致'))
    callback()
  }, trigger: 'blur' }],
}

async function submit() {
  if (submitting.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid || disposed) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await registerRequest({ username: form.username.trim(), password: form.password })
    if (disposed) return
    form.password = ''
    form.confirmPassword = ''
    ElMessage.success('注册成功，请登录')
    await router.replace('/login')
  } catch (error) {
    if (!disposed) errorMessage.value = error.response?.data?.msg || error.message || '注册失败，请稍后重试'
  } finally {
    if (!disposed) submitting.value = false
  }
}
onBeforeUnmount(() => { disposed = true })
</script>

<template>
  <main class="register-page">
    <header class="register-header"><router-link to="/find" class="brand">Hx 图片飞机场</router-link><router-link to="/find">返回发现 →</router-link></header>
    <section class="register-card" aria-label="注册账号">
      <span class="eyebrow">HX · 灵感随行</span>
      <h1>创建你的账号</h1><p class="description">收藏喜欢的图片，记录每一份灵感。</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" placeholder="3～32位字母、数字或下划线" autocomplete="username" :maxlength="32" /></el-form-item>
        <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="请输入8～64位密码" autocomplete="new-password" :maxlength="64" /></el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword"><el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码" autocomplete="new-password" :maxlength="64" /></el-form-item>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
        <el-button class="register-button" type="primary" native-type="submit" :loading="submitting">{{ submitting ? '正在注册…' : '注册账号' }}</el-button>
      </el-form>
      <p class="login-link">已有账号？ <router-link to="/login">立即登录</router-link></p>
    </section>
    <footer>Hx 图片飞机场 · 收藏灵感，分享热爱</footer>
  </main>
</template>

<style scoped>
.register-page { min-height: 100vh; min-height: 100dvh; box-sizing: border-box; display: flex; flex-direction: column; padding: 28px clamp(20px, 5vw, 80px); color: #17243b; background: linear-gradient(135deg, #edf6ff, #fff 70%); }
.register-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
a { color: #409eff; text-decoration: none; }
.brand { font-size: 23px; font-weight: 700; }
.register-card { box-sizing: border-box; width: min(460px, 100%); margin: 48px auto; padding: 36px; border: 1px solid #edf2f8; border-radius: 18px; background: #fff; box-shadow: 0 18px 60px #2674b812; }
.eyebrow { color: #409eff; font-size: 12px; letter-spacing: 2px; }
h1 { margin: 18px 0 12px; font-size: 28px; }
.description { margin-bottom: 28px; color: #8290a5; font-size: 14px; line-height: 1.8; }
.register-button { width: 100%; height: 44px; margin-top: 8px; }
.error { color: #d74242; font-size: 13px; }
.login-link { margin: 26px 0 0; text-align: center; color: #8290a5; font-size: 14px; }
footer { margin-top: auto; text-align: center; color: #9ba7b8; font-size: 12px; }
@media(max-width:480px) { .register-card { padding: 26px 22px; margin: 32px auto; } .brand { font-size: 18px; } }
</style>
