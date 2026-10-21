<script setup>
import { computed, ref } from 'vue'
import LogoutDialog from '@/components/LogoutDialog.vue'
import { authSession } from '@/api/signin.js'
import { useAccount } from '@/api/account.js'
useAccount()
const logoutVisible = ref(false)
const avatarUrl = computed(() => authSession.value?.user?.avatarUrl || '')
const displayName = computed(() => authSession.value?.user?.nickname || authSession.value?.user?.username || '我的')
import {
  Search,
  Setting,
  Upload,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import router from '@/utils/router/index.js'//可以导入也可以用他的useRouter()函数实现获得
const searchText=ref('')
const handleSearch=()=>{
    const keyword=searchText.value.trim()
    console.log("搜索内容:",searchText.value)
    // useRouter() 用来控制跳转，useRoute() 用来读取当前网址的信息。
    router.push({ name: 'searchPage', query: {keyword} })
    // query: { q: searchText.value } 的作用是：把搜索框里的文字利用router跳转网站放进网址，传给搜索页。
    //常用的是替换成keyword,props的对象实现设置type和default
}
const Command=(command)=>{
  switch(command){
    case 'settings':
      router.push('/setting')
      // console.log('账号设置')
      break
    case 'avatar':
      router.push('/update_avator')
      // console.log('更换头像')
      break
    case 'logout':
      logoutVisible.value = true
      // console.log('退出登录')
      break
  }
}

</script>
<template>
<div class="top-nav">

    <!-- 左侧 Logo -->
  <div class="logo">Welcome Hx 图片飞机场</div>
    <!-- 中间搜索框 -->
    <div class="search-box">
      <el-input
        v-model="searchText"
        placeholder="请输入搜索内容..."
        size="large"
        :clearable="true"
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      >
       <!-- v-model="searchText"d 为搜索框动态绑定内容-->
      <!-- clearable增加了清空搜索框的功能,另外注释不能写在标签内部 -->
       <!-- keyup.enter是多增加绑定回车键 -->
        <template #append>
          <el-button
            :icon="Search"
            @click="handleSearch"
          />
        </template>
      </el-input>
    </div>
    <!--el-dropdown里面 @commandVue 会自动把事件传递的值交给 handleCommand。 -->
      <el-dropdown v-if="authSession"
      trigger="hover"
      placement="bottom-end"
      @command="Command"
    >
    
    <!-- trigger="hover"：鼠标悬停时显示下拉菜单。
placement="bottom-end"：将菜单显示在触发元素下方，并向其末端对齐（一般从左到右布局中是右侧）。 -->
      <div class="avatar-box">
        <el-avatar :size="40" :src="avatarUrl">
          用户
        </el-avatar>

        <span>{{ displayName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </div>

      <!-- 悬停展开的菜单 -->
      <template #dropdown>
        <el-dropdown-menu>

          <el-dropdown-item
            command="settings"
            :icon="Setting"
          >
            账号设置
          </el-dropdown-item>

          <el-dropdown-item
            command="avatar"
            :icon="Upload"
          >
            更换头像
          </el-dropdown-item>

          <el-dropdown-item
            command="logout"
            :icon="SwitchButton"
            divided
          >
            退出登录
          </el-dropdown-item>

        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button v-else type="primary" @click="router.push('/login')">登录</el-button>
    <LogoutDialog v-model="logoutVisible" @confirmed="router.push('/find')" />
    <!-- Element Plus 已经帮你写好了 el-dropdown 组件的内部逻辑，但是它不知道你想显示什么菜单。 -->
<!-- 因此它预留了一个叫 dropdown 的位置，让你放自己的内容。 -->
</div>

</template>
<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-sizing: border-box;
  gap: 20px;
}
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  flex-shrink: 0;
}
.search-box {
  width: 400px;
  max-width: 50%;
}
.avatar-box {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar-box:hover {
  color: #409eff;
}
</style>