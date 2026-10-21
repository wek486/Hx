<script setup>
import { SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { signOut } from '@/api/signin.js'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'cancel', 'confirmed'])

function cancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  signOut()
  emit('update:modelValue', false)
  ElMessage.success('已退出登录')
  emit('confirmed')
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="退出登录"
    width="min(440px, 92vw)"
    align-center
    append-to-body
    :before-close="cancel"
    class="hx-logout-dialog"
  >
    <div class="logout-content">
      <span class="logout-icon"><el-icon :size="30"><SwitchButton /></el-icon></span>
      <h2>确定退出当前账号吗？</h2>
      <p>退出后仍可浏览图片，收藏等操作需重新登录。</p>
      <div class="logout-actions">
        <el-button size="large" @click="cancel">取消</el-button>
        <el-button size="large" type="primary" @click="confirm">确认退出</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.logout-content { padding: 4px 12px 14px; text-align: center; }
.logout-icon { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background: #edf5ff; color: #409eff; }
h2 { margin: 20px 0 10px; color: #17243b; font-size: 20px; }
p { color: #8290a5; line-height: 1.8; font-size: 14px; }
.logout-actions { display: flex; gap: 14px; margin-top: 30px; }
.logout-actions .el-button { flex: 1; margin: 0; }
</style>
