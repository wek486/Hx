<script setup>
import LikeButton from '@/components/LikeButton.vue'
import { useRoute } from 'vue-router'
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { searchImages } from '@/api/search.js'
// defineProps：接收父组件传来的关键词//路由里面告诉来自哪个父组件里面的
// defineProps 是 Vue 的编译宏

//props.keyword获取值
const emit = defineEmits(['search'])

const categories = [
  { label: '全部', value: '' },
  { label: '二次元', value: '二次元' },
  { label: 'cosplay', value: 'cosplay' },
 
]

const sorts = [
  { label: '综合', value: 'relevance' },
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'popular' },
]
let router=useRoute();//useRoute()import { useRoute } from 'vue-router'需要导入
const keyword = computed(()=>router.query.keyword)
// computed 不是必须的。 你也可以直接监听 props.keyword，请求时再 .trim()。这里使用它，是把“处理后的关键词”统一保存为一个响应式计算结果，后面判断、显示和请求都可以复用。
const category = ref('')
const sort = ref('relevance')

const images = ref([])
const relatedKeywords = ref([])
const total = ref(0)
const page = ref(0)
const pageSize = 20

const loading = ref(false)
const errorMessage = ref('')
const failedImages = ref(new Set())
const failedAvatars = ref(new Set())

const previewVisible = ref(false)
const previewImage = ref(null)

const hasMore = computed(
  () => images.value.length < total.value,
)

const hasFilters = computed(
  () => category.value !== '' || sort.value !== 'relevance',
)
//<button v-if="hasFilters">清除筛选</button>
//你现在没有这个按钮，可以删除 hasFilters。删除它不会影响分类和排序按钮本身。

// 只采用最新请求的结果。
let requestId = 0

function clearResults() {
  images.value = []
  relatedKeywords.value = []
  total.value = 0
  page.value = 0
  errorMessage.value = ''
  failedImages.value = new Set()
  failedAvatars.value = new Set()
  previewVisible.value = false
}

async function loadResults(reset = true) {
  if (!reset && (loading.value || !hasMore.value)) return

  const currentRequestId = ++requestId

  if (reset) {
    clearResults()
  }

  // 没输入关键词时，不请求后端。
  if (!keyword.value) {
    loading.value = false
    return
  }

  const nextPage = reset ? 1 : page.value + 1

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await searchImages({
       content: keyword.value,
       category: category.value,
       sort: sort.value,
    })
    // content: keyword.value 的意思是：把你输入的关键词，放到名叫 content 的请求参数里

    if (currentRequestId !== requestId) return

    /*
     * 假设 request 返回：
     * { code: 200, data: { records, total, relatedKeywords } }
     * 根据你的实际接口修改这里。
     */
    if (result.code !== 1) {
      throw new Error(result.message || '搜索失败')
    }

    const data = result.data

    // if (
    //   !Array.isArray(data) ||
    //   typeof data.total !== 'number' ||
    //   !Number.isFinite(104) //data.total的
    //   data.total < 0
    // ) {
    //   throw new Error('搜索接口返回格式不正确')
    // }
//对返回的data对象列表map操作
    const records = data.map((item) => ({
      id: item.id,
      title: item.title || '未命名作品',
      author: item.author || '未知作者',
      authorId: item.authorId ?? null,
      authorUserId: item.authorUserId ?? null,
      avatarUrl: item.avatarUrl || '',
      url: item.url,
      originalUrl: item.originalUrl || item.url,
      likes: Number(item.likes) || 0,
    }))

    if (reset) {
      images.value = records
    } else {
      const existingIds = new Set(
        images.value.map((image) => image.id),
      )

      images.value = [
        ...images.value,
        ...records.filter((image) => !existingIds.has(image.id)),
      ]
    }

    total.value = data.length
    page.value = nextPage

    // 没有后续数据时，避免不断请求空页。
    if (records.length === 0) {
      total.value = images.value.length
    }

    if (reset) {
      relatedKeywords.value = Array.isArray(data.relatedKeywords)
        ? [...new Set(
            data.relatedKeywords.filter(
              (item) => typeof item === 'string' && item.trim(),
            ),
          )].slice(0, 6)
        : []
    }
  } catch (error) {
    if (currentRequestId !== requestId) return

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      '搜索失败，请稍后重试'
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

function clearFilters() {
  category.value = ''
  sort.value = 'relevance'
}

function retry() {
  loadResults(page.value === 0)
}

function openPreview(image) {
  previewImage.value = image
  previewVisible.value = true
}

function markImageFailed(id) {
  failedImages.value = new Set([...failedImages.value, id])
}

function markAvatarFailed(id) {
  failedAvatars.value = new Set([...failedAvatars.value, id])
}

function formatLikes(value) {
  return value >= 1000
    ? `${(value / 1000).toFixed(1)}k`
    : String(value)
}

// 首次进入、关键词变化或筛选变化时请求。
// 不再添加 onMounted，避免首屏重复请求。
watch(
  [keyword, category, sort],
  () => loadResults(),
  { immediate: true },
)

onBeforeUnmount(() => {
  requestId += 1
})
</script>

<template>
  <section class="search-results">
    <header class="results-heading">
      <div>
        <p class="eyebrow">搜索结果</p>

        <h1>
          {{ keyword ? `关于「${keyword}」的灵感` : '寻找你的下一份灵感' }}
        </h1>

        <p class="description" aria-live="polite">
          <template v-if="!keyword">
            在顶部搜索框输入关键词，发现喜欢的图片。
          </template>
          <template v-else-if="loading && !images.length">
            正在搜索相关图片……
          </template>
          <template v-else-if="errorMessage && !images.length">
            搜索暂时未完成，请重试。
          </template>
          <template v-else>
            找到 {{ total }} 张相关图片
          </template>
        </p>
      </div>

      <button
        v-if="hasFilters"
        type="button"
        class="clear-button"
        @click="clearFilters"
      >
        清除筛选
      </button>
    </header>

    <template v-if="keyword">
      <div class="results-toolbar">
        <nav class="category-list" aria-label="图片分类">
          <button
            v-for="item in categories"
            :key="item.value"
            type="button"
            :class="{ active: category === item.value }"
            :aria-pressed="category === item.value"
            @click="category = item.value"
          >
            {{ item.label }}
          </button>
        </nav>

        <nav class="sort-list" aria-label="搜索排序">
          <button
            v-for="item in sorts"
            :key="item.value"
            type="button"
            :class="{ active: sort === item.value }"
            :aria-pressed="sort === item.value"
            @click="sort = item.value"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div v-if="relatedKeywords.length" class="related-searches">
        <span>相关搜索：</span>

        <button
          v-for="item in relatedKeywords"
          :key="item"
          type="button"
          @click="emit('search', item)"
        >
          {{ item }}
        </button>
      </div>
    </template>

    <div v-if="!keyword" class="state-box">
      <span class="state-icon" aria-hidden="true">⌕</span>
      <h2>从一个关键词开始</h2>
      <p>试试作品名称、主题或你喜欢的作者。</p>
    </div>

    <div
      v-else-if="loading && !images.length"
      class="state-box"
      role="status"
    >
      <span class="state-icon" aria-hidden="true">⌕</span>
      <p>正在寻找与你有关的灵感……</p>
    </div>

    <template v-else>
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
              decoding="async"
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
              <img
                v-if="image.avatarUrl && !failedAvatars.has(image.id)"
                class="avatar"
                :src="image.avatarUrl"
                alt=""
                loading="lazy"
                @error="markAvatarFailed(image.id)"
              />
              <span v-else class="avatar avatar-text">
                {{ image.author.slice(0, 1) }}
              </span>

              <span class="author-name">{{ image.author }}</span>
            </div>

            <LikeButton :image="image" compact />
          </div>
        </article>
      </div>

      <div v-if="errorMessage" class="state-box" role="alert">
        <h2>搜索加载失败</h2>
        <p>{{ errorMessage }}</p>
        <button type="button" class="primary-button" @click="retry">
          重新加载
        </button>
      </div>

      <div v-else-if="!images.length" class="state-box">
        <span class="state-icon" aria-hidden="true">⌕</span>
        <h2>没有找到相关图片</h2>
        <p>试试更简短的关键词，或者取消分类限制。</p>

        <button
          v-if="hasFilters"
          type="button"
          class="primary-button"
          @click="clearFilters"
        >
          清除筛选
        </button>
      </div>

      <footer v-else class="results-footer">
        <button
          v-if="hasMore"
          type="button"
          class="load-button"
          :disabled="loading"
          @click="loadResults(false)"
        >
          {{ loading ? '正在加载……' : '加载更多图片' }}
        </button>

        <p v-else>已经看完全部搜索结果</p>
        <span>已展示 {{ images.length }} / {{ total }} 张图片</span>
      </footer>
    </template>

    <ImagePreview v-model="previewVisible" :image="previewImage" />
  </section>
</template>

<style scoped>
.search-results {
  width: 100%;
  min-width: 0;
  padding: 24px;
  color: #17243b;
  box-sizing: border-box;
}

.search-results *,
.search-results *::before,
.search-results *::after {
  box-sizing: border-box;
}

.search-results button {
  font: inherit;
  cursor: pointer;
}

.results-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
}

.results-heading h1 {
  margin: 0 0 10px;
  font-size: clamp(24px, 2.5vw, 34px);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.description {
  margin: 0;
  color: #8290a5;
  font-size: 13px;
  line-height: 1.8;
}

.clear-button {
  flex-shrink: 0;
  padding: 8px 0;
  border: 0;
  color: #409eff;
  background: transparent;
  font-size: 12px !important;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-list button {
  padding: 9px 22px;
  border: 0;
  border-radius: 24px;
  background: #f2f5f9;
  color: #526078;
  font-size: 13px;
}

.category-list button.active {
  background: #409eff;
  color: white;
}

.sort-list {
  display: flex;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #dce3ee;
  border-radius: 8px;
}

.sort-list button {
  padding: 9px 20px;
  border: 0;
  border-right: 1px solid #dce3ee;
  background: white;
  color: #526078;
  font-size: 12px;
}

.sort-list button:last-child {
  border-right: 0;
}

.sort-list button.active {
  background: #409eff;
  color: white;
}

.related-searches {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.related-searches > span {
  color: #8290a5;
  font-size: 12px;
}

.related-searches button {
  padding: 5px 13px;
  border: 0;
  border-radius: 16px;
  background: #eaf4ff;
  color: #409eff;
  font-size: 12px;
}

.waterfall {
  column-count: 5;
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
  margin: 10px 0 9px;
  overflow: hidden;
  color: #354158;
  font-size: 13px;
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
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-text {
  display: grid;
  place-items: center;
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

.state-icon {
  color: #409eff;
  font-size: 48px;
}

.state-box h2 {
  font-size: 18px;
}

.state-box p {
  color: #8290a5;
  font-size: 13px;
  line-height: 1.8;
}

.primary-button {
  padding: 10px 22px;
  border: 0;
  border-radius: 22px;
  background: #409eff;
  color: white;
  font-size: 13px !important;
}

.results-footer {
  padding: 20px 0;
  text-align: center;
}

.load-button {
  min-width: 180px;
  padding: 10px 24px;
  border: 1px solid #409eff;
  border-radius: 24px;
  background: white;
  color: #409eff;
  font-size: 13px !important;
}

.load-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.results-footer > span {
  display: block;
  margin-top: 12px;
}

.results-footer p,
.results-footer > span {
  color: #8290a5;
  font-size: 12px;
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 72vh;
  margin: auto;
  object-fit: contain;
}

.search-results button:focus-visible {
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

  .results-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 760px) {
  .search-results {
    padding: 16px 8px;
  }

  .waterfall {
    column-count: 2;
    column-gap: 12px;
  }

  .category-list button {
    padding: 8px 15px;
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .waterfall {
    column-count: 1;
  }

  .results-heading {
    flex-direction: column;
    gap: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-cover img,
  .preview-tip {
    transition: none;
  }
}
</style>