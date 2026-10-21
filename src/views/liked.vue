<script setup>
import { computed, ref } from 'vue'
import ImagePreview from '@/components/ImagePreview.vue'
import LikeButton from '@/components/LikeButton.vue'
import { likedWorks, canLike, likesLoading, likesError, loadLikes } from '@/stores/likes.js'
const keyword = ref('')
const sort = ref('newest')
const visibleCount = ref(24)
const previewVisible = ref(false)
const previewImage = ref(null)
const filtered = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  const matches = likedWorks.value.filter(({ image }) => `${image.title || ''} ${image.author || ''}`.toLocaleLowerCase().includes(query))
  return sort.value === 'oldest' ? [...matches].reverse() : matches
})
function preview(image) { previewImage.value = image; previewVisible.value = true }
</script>

<template>
  <section class="liked-page">
    <header class="heading"><div><span class="eyebrow">HX · 心动留存</span><h1>点赞的作品 <span>{{ likedWorks.length }}</span></h1><p>每一次心动，都值得再次遇见。</p></div><el-button round @click="$router.push('/find')">发现更多作品 ↗</el-button></header>
    <div v-if="!canLike" class="state"><span class="state-icon">♡</span><h2>登录，留住喜欢的作品</h2><p>点亮作品旁的爱心，在这里重温每一次心动。</p><el-button type="primary" round @click="$router.push({ path: '/login', query: { redirect: '/likes' } })">前往登录</el-button></div>
    <template v-else>
      <div class="toolbar"><el-input v-model="keyword" placeholder="搜索作品名称或作者" clearable aria-label="搜索点赞的作品" @input="visibleCount = 24" /><el-select v-model="sort" aria-label="点赞顺序" @change="visibleCount = 24"><el-option label="最近点赞" value="newest" /><el-option label="最早点赞" value="oldest" /></el-select><small>点赞记录已同步至账号</small></div>
      <div v-if="likesLoading" class="state">正在加载点赞作品…</div>
      <div v-else-if="likesError" class="state"><p>{{ likesError }}</p><el-button @click="loadLikes">重试</el-button></div>
      <div v-else-if="!likedWorks.length" class="state"><span class="state-icon">♡</span><h2>还没有点赞的作品</h2><p>在发现页、搜索页或图片详情中，点亮喜欢作品的爱心。</p><el-button type="primary" round @click="$router.push('/find')">去发现喜欢的作品</el-button></div>
      <div v-else-if="!filtered.length" class="state"><h2>没有找到相关作品</h2><p>换个关键词试试，或清空搜索。</p><el-button @click="keyword = ''">清空搜索</el-button></div>
      <div v-else class="gallery">
        <article v-for="entry in filtered.slice(0, visibleCount)" :key="entry.key" class="card">
          <button type="button" class="cover" :aria-label="`查看作品：${entry.image.title}`" @click="preview(entry.image)"><el-image :src="entry.image.url || entry.image.originalUrl" fit="cover" loading="lazy"><template #error><span class="image-error">图片暂时无法加载<br /><small>点击仍可查看详情</small></span></template></el-image><span class="preview-tip">查看详情 ↗</span></button>
          <div class="card-body"><h2>{{ entry.image.title || '未命名作品' }}</h2><div class="meta"><span class="author">{{ entry.image.author || '未知作者' }}</span><LikeButton :image="entry.image" compact /></div></div>
        </article>
      </div>
      <div v-if="filtered.length > visibleCount" class="more"><el-button round @click="visibleCount += 24">加载更多作品</el-button></div>
    </template>
    <ImagePreview v-model="previewVisible" :image="previewImage" />
  </section>
</template>

<style scoped>
.liked-page { max-width: 1440px; margin: 0 auto; padding: 18px 10px 40px; color: #354158; }
.heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 30px; } .eyebrow { color: #409eff; font-size: 12px; letter-spacing: 3px; }
h1 { font-size: clamp(26px, 2.6vw, 38px); margin: 14px 0 12px; } h1 span { font-size: 16px; font-weight: 400; color: #8290a5; } .heading p, .state p { font-size: 14px; line-height: 1.8; color: #8290a5; }
.toolbar { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; padding: 20px 0; border-top: 1px solid #edf2f8; margin-bottom: 10px; } .toolbar .el-input { width: min(280px, 100%); } .toolbar .el-select { width: 130px; } .toolbar small { color: #8290a5; margin-left: auto; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 22px; } .card { border: 1px solid #edf2f8; border-radius: 15px; background: #fff; overflow: hidden; }
.cover { display: block; position: relative; width: 100%; aspect-ratio: 4/3; padding: 0; border: 0; background: #edf3fa; cursor: pointer; } .cover .el-image { display: block; width: 100%; height: 100%; }
.image-error { display: grid; place-content: center; height: 100%; gap: 8px; color: #8290a5; font-size: 13px; } .image-error small { font-size: 11px; }
.preview-tip { position: absolute; bottom: 10px; right: 10px; background: #ffffffeb; border-radius: 20px; color: #617790; padding: 6px 10px; font-size: 11px; }
.card-body { padding: 14px 16px; } h2 { font-size: 14px; margin: 0 0 8px; color: #354158; } .card-body h2 { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; } .author { font-size: 12px; color: #8290a5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.state { text-align: center; padding: 70px 18px; background: #f8fbff; border-radius: 18px; } .state h2 { font-size: 21px; margin-top: 18px; } .state p { margin-bottom: 24px; } .state-icon { color: #ed8aa0; font-size: 46px; } .more { text-align: center; margin: 30px 0; }
@media (max-width: 600px) { .heading { flex-direction: column; align-items: flex-start; } .toolbar small { margin-left: 0; width: 100%; } .liked-page { padding: 10px 0 24px; } .gallery { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; } }
</style>
