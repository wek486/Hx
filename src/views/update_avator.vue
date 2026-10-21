<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AccountShell from '@/components/AccountShell.vue'
import { useAccount, syncProfile, accountRequest as request } from '@/api/account.js'
const { profile, loading, error, load } = useAccount()
const input = ref(null), selected = ref(null), preview = ref(''), saving = ref(false), uploadError = ref('')
function clear() { if(preview.value) URL.revokeObjectURL(preview.value); preview.value=''; selected.value=null; if(input.value) input.value.value='' }
onBeforeUnmount(clear)
function select(event) {
  uploadError.value=''
  const file=event.target.files?.[0]
  if(!file) return
  if(!['image/png','image/jpeg'].includes(file.type) || file.size>2*1024*1024) { uploadError.value='请选择不超过2MB的PNG或JPEG图片'; event.target.value=''; return }
  clear(); selected.value=file; preview.value=URL.createObjectURL(file)
}
async function save() {
  if(!selected.value || saving.value) return
  saving.value=true; uploadError.value=''
  try { const data=new FormData();data.append('file',selected.value);const result=await request.post('/account/avatar',data);syncProfile(result.data);clear();ElMessage.success('头像已更新') }
  catch(e) { uploadError.value=e.response?.data?.msg || e.message || '上传失败，请重试' }
  finally { saving.value=false }
}
</script>
<template>
  <AccountShell title="更换头像" subtitle="用一张喜欢的图片，打造你的个人名片。" :loading="loading" :error="error" @retry="load"><div class="avatar-panel"><div class="upload-box"><div class="avatar-preview"><el-avatar :size="180" :src="preview || profile?.avatarUrl" shape="circle">{{ (profile?.nickname || profile?.username || '我').slice(0,1) }}</el-avatar></div><h2>{{ selected ? '新头像预览' : '当前头像' }}</h2><p>选用PNG或JPEG，大小不超过2MB。<br />图片将居中裁成正方形，最长边不超过4096像素。</p><input ref="input" class="file-input" type="file" accept="image/png,image/jpeg" aria-label="选择头像图片" :disabled="saving" @change="select" /><el-button round :disabled="saving" @click="input.click()">{{ selected ? '重新选择' : '选择图片' }}</el-button><p v-if="selected" class="filename">{{ selected.name }}</p></div><div class="preview-sizes"><h3>显示效果</h3><div class="sizes"><div v-for="size in [72,48,32]" :key="size"><el-avatar :size="size" :src="preview || profile?.avatarUrl">{{ (profile?.nickname || profile?.username || '我').slice(0,1) }}</el-avatar><span>{{ size }}px</span></div></div><p>保存后，顶部栏、个人主页与评论中的头像都会更新。</p><p v-if="uploadError" class="error" role="alert">{{ uploadError }}</p><div class="buttons"><el-button type="primary" round :disabled="!selected" :loading="saving" @click="save">保存头像</el-button><el-button round :disabled="!selected || saving" @click="clear">取消选择</el-button></div></div></div></AccountShell>
</template>
<style scoped>
.avatar-panel { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #edf2f8; border-radius: 18px; overflow: hidden; background: white; } .upload-box { text-align: center; padding: 42px 24px; background: #f8fbff; } .el-avatar { background: #e7f2ff; color: #488bc8; } h2 { font-size: 18px; margin-top: 24px; } p { font-size: 13px; line-height: 1.9; color: #8290a5; } .file-input { display: none; } .filename { overflow-wrap: anywhere; font-size: 12px; } .preview-sizes { padding: 40px 32px; } h3 { font-size: 17px; margin: 0 0 28px; } .sizes { display: flex; align-items: flex-end; gap: 28px; margin-bottom: 26px; } .sizes > div { display: flex; flex-direction: column; align-items: center; gap: 14px; } .sizes span { font-size: 11px; color: #8290a5; } .buttons { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; } .buttons .el-button { margin-left: 0; } .error { color: #e45665; } @media(max-width:700px) { .avatar-panel { grid-template-columns: 1fr; } .preview-sizes { padding: 28px; } }
</style>
