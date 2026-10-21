<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoutDialog from '@/components/LogoutDialog.vue'

const visible = ref(true)
const router = useRouter()
function cancel() { router.replace('/find') }
function confirmed() { router.replace('/find') }
// 记得无论如何都要跳转界面
//这里用了嵌套了，还有一个子组件和登出有关，子组件通知父主键用defineEmit
</script>

<template>
  <main class="logout-page">
    <router-link to="/find">Hx 图片飞机场 · 返回发现</router-link>
    <LogoutDialog v-model="visible" @cancel="cancel" @confirmed="confirmed" />
    <!-- 这里调转组件要父亲组件，单独子组件不行， -->
    <!-- v-model子组件想修改就用definedEmit函数['update:modelvalue','其他事件与父组件函数事件名一样']
     父组件值的更新可以用 @update:modelValue="value => logoutVisible = value"或  @update:modelValue="logoutVisible = $event"一般用箭头函数简化-->
  </main>
</template>

<style scoped>
.logout-page { min-height: 100vh; min-height: 100dvh; box-sizing: border-box; padding: 36px; background: linear-gradient(135deg, #eef6ff, #fff); }
a { color: #409eff; font-size: 20px; font-weight: 700; text-decoration: none; }
</style>
