<script setup>
import LikeButton from '@/components/LikeButton.vue'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { getImageList } from '@/api/image_find.js'

// 如果后端使用分类 ID，这里将 value 改为对应的 ID。
// 之所以把 label 和 value 分开，是因为后端未必接受中文。
const categories = [
  { label: '全部', value: '' },
  { label: '二次元', value: '二次元' },
  { label: 'cosplay', value: 'cosplay' },
]

// value 要与后端支持的排序参数一致。
const sorts = [
  { label: '推荐', value: 'recommended' },
  { label: '最新', value: 'news' },
  { label: '热门', value: 'popular' },
]

const currentCategory = ref('')
const currentSort = ref('recommended')

const images = ref([])
const loading = ref(false)
// loading：目前是否正在请求列表 注释 2
const errorMessage = ref('')
const failedImages = ref(new Set())

const previewVisible = ref(false)
const previewImage = ref(null)
// previewVisible：弹窗是否打开。如果是那种跳转进入详细页面的也可以用priviewvisible

// previewImage：列表使用分页，点击“加载更多”获取下一页。
const page = ref(0)
const pageSize = 100
const hasMore = ref(true)

// 防止旧请求覆盖切换分类后的新结果。
let requestId = 0

async function loadImages(reset = true) {
    // reset：是否重新加载整份列表。
  if (!reset && (loading.value || !hasMore.value)) return

  const currentRequestId = ++requestId
  const nextPage = reset ? 0:page.value+1
  //这里的巧妙设计reset可以实现加载更多图片和控制只是刷新当前的图片列表，默认为true，后面给按钮绑定一个false就行
  loading.value = true
  errorMessage.value = ''
//  reset：重新加载整份列表，清空 images、page、hasMore、failedImages、previewVisible。
  if (reset) {
    images.value = []
    
    hasMore.value = true
    failedImages.value = new Set()
    previewVisible.value = false
  }
// watch()：分类或排序改变时重新请求用[]承载监听的变量，watch()的第二个参数是回调函数，回调函数里面调用loadImages()重新加载图片列表。
// watch 是监听器：

  try {
    const result = await getImageList({
      category: currentCategory.value || undefined,
      sort: currentSort.value,
      page: nextPage*60,
      
    })//这里参数是对象,当参数多时,就升级为对象,方便后续扩展,例如增加搜索关键字等
    //后端记得定义实现类,才能实现参数不同的查找效果
    //awit产生时间差，如果当前请求不是最新的请求，忽略结果。   
    if (currentRequestId !== requestId) return

    /*
     * 当前假设 request 返回后端 JSON：
     * { code: 200, data: { records: [], total: 100 } }
     *用户最后选的是动漫，因此即使摄影请求后来才返回，也不应该覆盖动漫列表。
请求 1 返回时：
currentRequestId === 1
requestId === 2,currentRequestId !== requestId
编号不相等，忽略结果。
     * 如果 request 返回完整 Axios response，
     * 应先取 result.data，再读取 code 和 data.records。
     */
    if (result.code !== 1) {
      throw new Error(result.message || '图片列表加载失败')
    }

    const records = result.data

    if (!Array.isArray(records)) {
      throw new Error('图片列表格式不正确，请检查接口返回结构')
    }

    // 后端字段不同，只需要修改这里的映射。
    // map() 会遍历数组，为每条数据创建一个新的对象。
    const list = records.map((item) => ({
      id: item.id,
      title: item.title || '未命名作品',
      author: item.author || '未知作者',
      authorId: item.authorId ?? null,
      authorUserId: item.authorUserId ?? null,
      avatarUrl: item.avatarUrl || '',
      originalUrl: item.originalUrl || item.url,
      url: item.url,
      date: item.date || '',
      height: item.height || 0,
      likes: Number(item.likes) || 0,
    }))
//     模板仍然使用 image.id、image.title，不用到处修改。
// Number(item.likes) || 0
// 会将数字字符串转换成数字，例如：
    if (reset) {
      images.value = list
    } else {
      // 避免重复的图片 ID 生成重复卡片。
      const existingIds = new Set(images.value.map((item) => item.id))

      images.value = [
        ...images.value,
        ...list.filter((item) => !existingIds.has(item.id))
      ]
    }

    page.value = nextPage
// 变量	含义
// nextPage	本次准备请求的页码
// page.value	已经成功加载的页码
    // 有 total 时按总数判断；没有时按本页数量判断。
   
  } catch (error) {
    // ④ catch 中的编号判断：旧请求的错误也要忽略

    if (currentRequestId !== requestId) return

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      '图片加载失败，请稍后重试'
  } finally {
    // finally：请求处理结束后关闭加载提示
    // 对进行的请求进行的编号判断，避免旧请求覆盖新请求的状态。
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

function retry() {
  // 首屏失败重新加载第一页，加载更多失败重试下一页。
  loadImages(images.value.length === 0)
//   更具false和true的不同，重新加载整份列表，或者加载下一页。
}

function markImageFailed(id) {
  failedImages.value = new Set([...failedImages.value, id])
}

function openPreview(image) {
  previewImage.value = image
  previewVisible.value = true
}

function formatLikes(value) {
  return value >= 1000
    ? `${(value / 1000).toFixed(1)}k`
    : String(value)
}

onMounted(() => {
  loadImages()
})

watch([currentCategory, currentSort], () => {
  loadImages()
})

onBeforeUnmount(() => {
  requestId += 1
})
</script>

<template>
  <!-- 这里只包含发现内容，不包含菜单和网站顶部栏。 -->
  <section class="find-page">
    <header class="find-heading">
      <h1>发现你的下一份灵感</h1>
      <p>探索来自世界的精彩图片，发现更大的世界。</p>
    </header>

    <div class="find-toolbar">
      <nav class="filter-group" aria-label="图片分类">
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          :class="{ active: currentCategory === category.value }"
          :aria-pressed="currentCategory === category.value"
          @click="currentCategory = category.value"
        >
          {{ category.label }}
        </button>
      </nav>

      <nav class="filter-group" aria-label="图片排序">
        <button
          v-for="sort in sorts"
          :key="sort.value"
          type="button"

          :class="{ active: currentSort === sort.value }"
          :aria-pressed="currentSort === sort.value"
          @click="currentSort = sort.value"
        >
        <!-- :class：选中时给按钮加样式
:class="{ active: currentCategory === category.value }"
可以读成：
如果当前分类等于这个按钮的分类值，就给按钮添加 active 类。 -->
<!-- :class	让用户从颜色看出哪个按钮被选中
:aria-pressed	让辅助工具知道哪个按钮被选中 -->
          {{ sort.label }}
        </button>
      </nav>
    </div>
    <!-- 首次加载 -->
<div
  v-if="loading && !images.length"
  class="state-box"
  role="status"
>
  <p>正在加载图片……</p>
</div>

<template v-else>
  <!-- 图片列表 -->
  <div v-if="images.length" class="waterfall">
    <article
      v-for="image in images"
      :key="image.id"
      class="image-card"
    >
      <button
        type="button"
        class="image-cover"
        :disabled="failedImages.has(image.id)"
        :aria-label="`预览：${image.title}`"
        @click="openPreview(image)"
      >
        <img
          v-if="!failedImages.has(image.id)"
          :src="image.url"
          :alt="image.title"
          loading="lazy"
          @error="markImageFailed(image.id)"
        />

        <span v-else class="image-fallback">
          图片暂时无法加载
        </span>

        <span
          v-if="!failedImages.has(image.id)"
          class="preview-tip"
        >
          查看图片 ↗
        </span>
      </button>

      <h2>{{ image.title }}</h2>

      <div class="image-meta">
        <div class="author">
          <span class="avatar">
            {{ image.author.slice(0, 1) }}
          </span>
          <span class="author-name">{{ image.author }}</span>
        </div>

        <LikeButton :image="image" compact />
      </div>
    </article>
  </div>

  <!-- 请求失败，首屏和加载更多都能重试 -->
  <div v-if="errorMessage" class="state-box" role="alert">
    <p>{{ errorMessage }}</p>
    <button type="button" @click="retry">
      重试
    </button>
  </div>

  <!-- 请求成功，但列表为空 -->
  <div v-else-if="!images.length" class="state-box">
    <h2>暂时没有相关图片</h2>
    <p>试试其他分类。</p>
  </div>

  <!-- 分页 -->
  <div v-else class="feed-end">
    <button
      v-if="hasMore"
      type="button"
      :disabled="loading"
      @click="loadImages(false)"
    >
      {{ loading ? '正在加载……' : '加载更多图片 ↓' }}
    </button>

    <p v-else>已经没有更多图片了。</p>
  </div>
</template>
<!-- 这里的v-model就是实现动态的渲染true和false -->
     <ImagePreview v-model="previewVisible" :image="previewImage" />
  </section>
</template>
<!-- 组件	主要用途	你网站里的例子
ElDialog	展示可以自定义的内容	图片预览、编辑资料表单
ElMessageBox	提示、确认或简单输入	“确定删除这张图片吗？”
ElMessage	短暂的操作提示	“收藏成功”“加载失败” -->
<style scoped>
.find-page {
  width: 100%;
  min-width: 0;
  padding: 24px;
  box-sizing: border-box;
  color: #17243b;
}

.find-page *,
.find-page *::before,
.find-page *::after {
  box-sizing: border-box;
}

.find-page button {
  font: inherit;
  cursor: pointer;
}

.find-heading {
  margin-bottom: 24px;
}

.find-heading h1 {
  margin: 0 0 12px;
  font-size: clamp(26px, 2.6vw, 38px);
  line-height: 1.4;
}

.find-heading p {
  margin: 0;
  color: #8290a5;
  font-size: 14px;
  line-height: 1.8;
}

.find-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-group button {
  padding: 9px 20px;
  border: 0;
  border-radius: 24px;
  background: #f2f5f9;
  color: #526078;
  font-size: 13px;
  transition: background 0.2s, color 0.2s;
}

.filter-group button:hover {
  background: #e8f3ff;
  color: #409eff;
}

.filter-group button.active {
  background: #409eff;
  color: white;
}

.waterfall {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  
  column-gap: 18px;
}

.image-card {
  display: inline-block;
  width: 100%;
  margin-bottom: 24px;
  break-inside: avoid;
  vertical-align: top;
}

.image-cover {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: #edf3fa;
}

/* 根据图片原始比例显示，不裁剪图片。 */
.image-cover img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.35s;
}

.image-cover:hover img {
  transform: scale(1.025);
}

.image-cover:disabled {
  cursor: default;
}

.image-fallback {
  display: grid;
  min-height: 220px;
  place-items: center;
  color: #8290a5;
  font-size: 12px;
}

.preview-tip {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 7px 12px;
  border-radius: 20px;
  color: #354158;
  background: rgb(255 255 255 / 92%);
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-cover:hover .preview-tip,
.image-cover:focus-visible .preview-tip {
  opacity: 1;
}

.image-card h2 {
  margin: 11px 0 9px;
  overflow: hidden;
  color: #354158;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta,
.author {
  display: flex;
  align-items: center;
  gap: 7px;
}

.image-meta {
  justify-content: space-between;
}

.author {
  min-width: 0;
}

.avatar {
  display: grid;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  background: #e7f2ff;
  color: #488bc8;
  font-size: 11px;
}

.author-name {
  overflow: hidden;
  color: #8290a5;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.likes {
  flex-shrink: 0;
  color: #8290a5;
  font-size: 12px;
}

.state-box {
  margin-top: 20px;
  padding: 60px 20px;
  border-radius: 16px;
  background: #f7faff;
  text-align: center;
}

.state-box h2 {
  font-size: 18px;
}

.state-box p,
.feed-end p {
  color: #8290a5;
  font-size: 13px;
}

.state-box button,
.feed-end button {
  padding: 10px 22px;
  border: 0;
  border-radius: 22px;
  background: #409eff;
  color: white;
  font-size: 13px;
}

.feed-end {
  padding: 30px 0 15px;
  text-align: center;
}

.feed-end button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 72vh;
  margin: auto;
  object-fit: contain;
}

.find-page button:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 3px;
}

@media (max-width: 1400px) {
  .waterfall {
    column-count: 4;
  }
}

@media (max-width: 1100px) {
  .waterfall {
    column-count: 3;
  }

  .find-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .find-page {
    padding: 16px 8px;
  }

  .waterfall {
    column-count: 2;
    column-gap: 12px;
  }

  .filter-group button {
    padding: 8px 15px;
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .waterfall {
    column-count: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-cover img,
  .preview-tip {
    transition: none;
  }
}
</style>