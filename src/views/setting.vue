<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AccountShell from '@/components/AccountShell.vue'
import { useAccount, syncProfile, accountRequest as request } from '@/api/account.js'
import { signOut } from '@/api/signin.js'
const { profile, loading, error, load } = useAccount()
const router = useRouter()
const form = reactive({ nickname:'', bio:'' }), password = reactive({ old:'', next:'', repeat:'' })
const saving = ref(false), passwordSaving = ref(false), saveError = ref(''), passwordError = ref('')
watch(() => [profile.value?.nickname, profile.value?.bio], () => { form.nickname = profile.value?.nickname || profile.value?.username || ''; form.bio = profile.value?.bio || '' }, { immediate:true })
async function save() {
  if(saving.value) return
  saveError.value = ''; saving.value = true
  try { const result = await request.put('/account/me', form); syncProfile(result.data); ElMessage.success('个人资料已保存') }
  catch(e) { saveError.value = e.response?.data?.msg || e.message || '保存失败' }
  finally { saving.value = false }
}
async function changePassword() {
  passwordError.value = ''
  if(password.next !== password.repeat) { passwordError.value = '两次输入的新密码不一致'; return }
  if(passwordSaving.value) return
  passwordSaving.value = true
  try { await request.put('/account/password', { oldPassword:password.old, newPassword:password.next }); password.old=''; password.next=''; password.repeat=''; signOut(); ElMessage.success('密码已修改，请重新登录'); await router.replace('/login') }
  catch(e) { passwordError.value = e.response?.data?.msg || e.message || '修改失败' }
  finally { passwordSaving.value = false }
}
</script>
<template>
  <AccountShell title="账号设置" subtitle="整理你的个人名片，安心管理账号。" :loading="loading" :error="error" @retry="load">
    <div class="settings-grid"><section class="panel"><h2>个人资料</h2><div class="avatar-line"><el-avatar :size="58" :src="profile?.avatarUrl">{{ (profile?.nickname || profile?.username || '我').slice(0,1) }}</el-avatar><el-button plain round @click="$router.push('/update_avator')">更换头像</el-button></div><el-form label-position="top" @submit.prevent="save"><el-form-item label="登录账号"><el-input :model-value="profile?.username" disabled /></el-form-item><el-form-item label="昵称"><el-input v-model="form.nickname" maxlength="32" show-word-limit placeholder="怎么称呼你" /></el-form-item><el-form-item label="个人简介"><el-input v-model="form.bio" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="分享你的兴趣、喜欢的风格…" resize="none" /></el-form-item><p v-if="saveError" class="error" role="alert">{{ saveError }}</p><el-button type="primary" round native-type="submit" :disabled="!form.nickname.trim()" :loading="saving">保存资料</el-button></el-form></section>
    <section class="panel"><h2>修改密码</h2><p class="hint">修改成功后，已有登录凭据将失效，需要重新登录。</p><el-form label-position="top" @submit.prevent="changePassword"><el-form-item label="当前密码"><el-input v-model="password.old" type="password" show-password autocomplete="current-password" maxlength="64" /></el-form-item><el-form-item label="新密码"><el-input v-model="password.next" type="password" show-password autocomplete="new-password" placeholder="8～64位，建议混合字母和数字" maxlength="64" /></el-form-item><el-form-item label="确认新密码"><el-input v-model="password.repeat" type="password" show-password autocomplete="new-password" maxlength="64" /></el-form-item><p v-if="passwordError" class="error" role="alert">{{ passwordError }}</p><el-button type="primary" plain round native-type="submit" :loading="passwordSaving" :disabled="!password.old || password.next.length < 8 || !password.repeat">更新密码</el-button></el-form></section></div>
  </AccountShell>
</template>
<style scoped>
.settings-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start; } .panel { padding: 28px; border: 1px solid #edf2f8; border-radius: 18px; background: white; } h2 { font-size: 19px; margin: 0 0 24px; } .avatar-line { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; } .el-avatar { background: #e7f2ff; color: #488bc8; } .hint { color: #8290a5; font-size: 13px; line-height: 1.8; margin-bottom: 26px; } .error { color: #e45665; line-height: 1.8; font-size: 13px; } @media(max-width:800px) { .settings-grid { grid-template-columns: 1fr; } .panel { padding: 22px; } }
</style>
