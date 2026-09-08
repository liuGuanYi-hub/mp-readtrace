<template>
  <scroll-view
    scroll-y
    class="page"
    :scroll-top="scrollTopSet"
    :scroll-with-animation="true"
    :show-scrollbar="false"
    @scroll="onScroll"
  >
    <!-- 顶部一体化 Header & 多维过滤面板（bg_glass_panel） -->
    <view class="header-panel">
      <!-- 标题与新增操作栏 -->
      <view class="title-row">
        <text class="panel-title">📚 精神藏库</text>
        <view class="header-actions">
          <view class="btn-discover" @tap="goDiscover">🔍 搜源建库</view>
          <view class="btn-add" @tap="goQuickLog">+ 记录</view>
        </view>
      </view>

      <!-- 一级：媒介类型切换胶囊栏 -->
      <scroll-view scroll-x class="chip-scroller" enhanced :show-scrollbar="false">
        <view
          class="media-chip"
          :class="{ selected: mediaFilter === '' }"
          @tap="onMediaChange('')"
        >
          全部 🌌
        </view>
        <view
          v-for="(m, key) in MEDIA_LABEL"
          :key="key"
          class="media-chip"
          :class="{ selected: mediaFilter === key }"
          @tap="onMediaChange(key as MediaType)"
        >
          {{ m.name }} {{ m.emoji }}
        </view>
      </scroll-view>

      <!-- 搜索框（bg_input_glass） -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索藏库作品名、创作者、分类、标签..."
          placeholder-class="ph"
          confirm-type="search"
        />
        <view v-if="keyword" class="search-clear" @tap="keyword = ''">✕</view>
        <view class="search-discover-tag" @tap="goDiscover">
          <text class="sdt-text">全网搜源 ➔</text>
        </view>
      </view>

      <!-- 二级：iOS 风格轻量状态分段条 -->
      <view class="segmented">
        <view
          v-for="opt in statusOpts"
          :key="opt.key"
          class="seg-item"
          :class="{ selected: statusFilter === opt.key }"
          @tap="onStatusChange(opt.key as BookStatus | '')"
        >
          {{ opt.label }}
        </view>
      </view>

      <!-- 三级：评分区间筛选条 -->
      <view class="segmented rating-bar">
        <view
          v-for="opt in RATING_RANGES"
          :key="opt.key"
          class="seg-item"
          :class="{ selected: ratingRange === opt.key }"
          @tap="ratingRange = opt.key"
        >
          {{ opt.label }}
        </view>
      </view>

      <!-- 四级：动态标签流（带计数） -->
      <scroll-view v-if="tagOpts.length" scroll-x class="tag-scroller" enhanced :show-scrollbar="false">
        <view
          v-for="t in tagOpts"
          :key="t.name"
          class="tag-chip"
          :class="{ selected: selectedTag === t.name }"
          @tap="toggleTag(t.name)"
        >
          {{ t.name }} ({{ t.count }})
        </view>
      </scroll-view>
    </view>

    <!-- 统计与视图切换条 -->
    <view class="stats-row">
      <text class="count-text">共 {{ filtered.length }} 部藏品</text>
      <view class="stats-btn-group">
        <!-- 真正支持单列/双列无缝切换，完全对齐 App -->
        <view class="stats-btn" @tap="isGridView = !isGridView">
          {{ isGridView ? '📄 单列视图' : '🎴 双列网格' }}
        </view>
        <view class="stats-btn stats-btn-gap" @tap="exportView">📜 导出长卷</view>
      </view>
    </view>

    <!-- ═══ 藏品单列列表（item_book_card 风格） ═══ -->
    <view v-if="!isGridView" class="list-container">
      <view
        v-for="book in filtered"
        :key="book.id"
        class="book-card"
        @tap="openDetail(book)"
      >
        <view class="cover-box">
          <image v-if="book.coverUrl" class="cover" :src="book.coverUrl" mode="aspectFill" />
          <view v-else class="cover cover-ph">
            <text class="ph-emoji">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
          </view>
        </view>

        <view class="card-body">
          <view class="line1">
            <text class="media-badge">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
            <text class="card-title">{{ book.title }}</text>
            <view class="status-pill">
              {{ MEDIA_STATUS[book.mediaType]?.[book.status] || book.status }}
            </view>
          </view>

          <text class="author">{{ book.author || '未知作者' }}</text>

          <view class="summary-row">
            <text class="rating" v-if="book.rating">★ {{ book.rating.toFixed(1).replace(/\.0$/, '') }}</text>
            <view v-if="book.category" class="category-chip">{{ book.category }}</view>
            <text v-if="book.tags && book.tags.length" class="tags">{{ book.tags.slice(0, 3).join(' · ') }}</text>
          </view>

          <view v-if="book.shortComment" class="comment-strip">
            “{{ book.shortComment }}”
          </view>
        </view>
      </view>
    </view>

    <!-- ═══ 藏品双列网格（item_book_grid_card 风格） ═══ -->
    <view v-else class="grid-container">
      <view
        v-for="book in filtered"
        :key="`grid-${book.id}`"
        class="grid-card"
        @tap="openDetail(book)"
      >
        <view class="grid-cover-wrap">
          <image v-if="book.coverUrl" class="grid-cover" :src="book.coverUrl" mode="aspectFill" />
          <view v-else class="grid-cover grid-cover-ph">
            <text class="grid-ph-emoji">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
          </view>
          <!-- 悬浮角标 -->
          <view class="grid-media-tag">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</view>
          <view class="grid-rating-tag" v-if="book.rating">★ {{ book.rating }}</view>
        </view>

        <view class="grid-info">
          <text class="grid-title">{{ book.title }}</text>
          <text class="grid-author">{{ book.author || '未知作者' }}</text>
          <view class="grid-meta-row">
            <text class="grid-status-pill">{{ MEDIA_STATUS[book.mediaType]?.[book.status] }}</text>
            <text class="grid-category" v-if="book.category">{{ book.category }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态面板（bg_glass_panel） -->
    <view v-if="filtered.length === 0" class="empty-panel">
      <view class="empty-icon">🏛️</view>
      <text class="empty-title">暂无匹配藏品</text>
      <text class="empty-body">换个筛选条件看看，或点击上方「+ 记录」添加新作品</text>
      <view class="btn-empty-add" @tap="goQuickLog">＋ 记录新作品</view>
    </view>

    <!-- 悬浮回到顶部胶囊 -->
    <view v-if="showBackTop" class="back-top" @tap="backToTop">
      <text class="back-top-arrow">▲</text>
      <text class="back-top-text">顶部</text>
    </view>

    <TabBar :active="1" />
  </scroll-view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import type { Book, BookStatus, MediaType } from '../../utils/models';
import { MEDIA_LABEL, MEDIA_STATUS } from '../../utils/models';
import { loadLocalWorks } from '../../utils/sync';
import TabBar from '../../components/TabBar.vue';

const RATING_RANGES = [
  { key: '', label: '全部评分' },
  { key: '7075', label: '7.0~7.5' },
  { key: '7580', label: '7.5~8.0' },
  { key: '80plus', label: '8.0 以上' },
];

const books = ref<Book[]>([]);
const mediaFilter = ref<'' | MediaType>('');
const statusFilter = ref<'' | BookStatus>('');
const ratingRange = ref('');
const selectedTag = ref('');
const keyword = ref('');
const isGridView = ref(false); // 单双列切换

const scrollTopSet = ref(0);
const showBackTop = ref(false);

onLoad((options: any) => {
  if (options?.media) {
    mediaFilter.value = options.media as MediaType;
  }
  if (options?.status) {
    statusFilter.value = options.status as BookStatus;
  }
});

onShow(() => {
  books.value = loadLocalWorks();
});

const statusOpts = computed(() => {
  const mf = mediaFilter.value;
  if (!mf) {
    return [
      { key: '', label: '全部' },
      { key: 'reading', label: '进行中' },
      { key: 'finished', label: '已完成' },
      { key: 'wishlist', label: '想看' },
    ];
  }
  const map = MEDIA_STATUS[mf];
  return [
    { key: '', label: '全部' },
    { key: 'reading', label: map.reading },
    { key: 'finished', label: map.finished },
    { key: 'wishlist', label: map.wishlist },
  ];
});

// 动态提取热门标签
const tagOpts = computed(() => {
  const map: Record<string, number> = {};
  const currentMediaWorks = mediaFilter.value
    ? books.value.filter((b) => b.mediaType === mediaFilter.value)
    : books.value;

  currentMediaWorks.forEach((b) => {
    (b.tags || []).forEach((t) => {
      const trimmed = t.trim();
      if (trimmed) map[trimmed] = (map[trimmed] || 0) + 1;
    });
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }));
});

function onMediaChange(m: '' | MediaType) {
  mediaFilter.value = m;
  selectedTag.value = '';
}

function onStatusChange(s: '' | BookStatus) {
  statusFilter.value = s;
}

function toggleTag(t: string) {
  selectedTag.value = selectedTag.value === t ? '' : t;
}

const filtered = computed(() => {
  return books.value.filter((b) => {
    if (mediaFilter.value && b.mediaType !== mediaFilter.value) return false;
    if (statusFilter.value && b.status !== statusFilter.value) return false;
    if (selectedTag.value && !(b.tags || []).includes(selectedTag.value)) return false;

    if (ratingRange.value) {
      const r = b.rating ?? 0;
      if (ratingRange.value === '7075' && (r < 7.0 || r > 7.5)) return false;
      if (ratingRange.value === '7580' && (r < 7.5 || r > 8.0)) return false;
      if (ratingRange.value === '80plus' && r < 8.0) return false;
    }

    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase();
      const inTitle = b.title.toLowerCase().includes(kw);
      const inAuthor = (b.author || '').toLowerCase().includes(kw);
      const inCategory = (b.category || '').toLowerCase().includes(kw);
      const inTags = (b.tags || []).some((t) => t.toLowerCase().includes(kw));
      if (!inTitle && !inAuthor && !inCategory && !inTags) return false;
    }

    return true;
  });
});

function onScroll(e: any) {
  showBackTop.value = e.detail.scrollTop > 360;
}

function backToTop() {
  scrollTopSet.value = 0;
  setTimeout(() => {
    scrollTopSet.value = -1;
  }, 100);
}

function goDiscover() {
  uni.navigateTo({ url: '/pages/discover/index' });
}

function goQuickLog() {
  uni.navigateTo({ url: '/pages/quick-log/index' });
}

function openDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?id=${book.id}` });
}

function exportView() {
  uni.showToast({ title: `已生成 ${filtered.value.length} 部藏品长卷预览`, icon: 'none' });
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 260rpx;
  box-sizing: border-box;
  background: #f8f7f4;
}

/* ── 顶部多维过滤面板 ── */
.header-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.btn-discover {
  padding: 10rpx 20rpx;
  border-radius: 28rpx;
  background: #ECEAE4;
  color: #3A6348;
  font-size: 22rpx;
  font-weight: bold;
  border: 1rpx solid rgba(58, 99, 72, 0.25);
}

.panel-title {
  color: #1a1c19;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.btn-add {
  padding: 10rpx 24rpx;
  border-radius: 28rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 14rpx rgba(58, 99, 72, 0.3);
}

/* 一级媒介胶囊 */
.chip-scroller {
  white-space: nowrap;
  margin-top: 20rpx;
}

.media-chip {
  display: inline-block;
  padding: 10rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 28rpx;
  background: #ece7de;
  color: #1a1c19;
  font-size: 23rpx;
  font-weight: bold;
  border: 1.5rpx solid rgba(0, 0, 0, 0.05);
}

.media-chip.selected {
  background: #3a6348;
  color: #ffffff;
  border-color: #3a6348;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  height: 76rpx;
  background: #f4f1ea;
  border-radius: 24rpx;
  padding: 0 20rpx;
  margin-top: 20rpx;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 26rpx;
  margin-right: 12rpx;
  color: #686e64;
}

.search-input {
  flex: 1;
  font-size: 24rpx;
  color: #1a1c19;
}

.ph {
  color: #9c9a92;
}

.search-clear {
  color: #686e64;
  font-size: 28rpx;
  padding: 8rpx;
}

.search-discover-tag {
  background: #3A6348;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-left: 10rpx;
}

.sdt-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 二级/三级分段条 */
.segmented {
  display: flex;
  height: 64rpx;
  background: #ece7de;
  border-radius: 20rpx;
  padding: 4rpx;
  margin-top: 18rpx;
}

.seg-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #686e64;
  font-weight: bold;
}

.seg-item.selected {
  background: #ffffff;
  color: #1a1c19;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.rating-bar {
  margin-top: 14rpx;
  height: 58rpx;
}

/* 动态标签流 */
.tag-scroller {
  white-space: nowrap;
  margin-top: 16rpx;
}

.tag-chip {
  display: inline-block;
  padding: 8rpx 20rpx;
  margin-right: 12rpx;
  border-radius: 20rpx;
  background: rgba(58, 99, 72, 0.08);
  color: #3a6348;
  font-size: 21rpx;
  font-weight: bold;
}

.tag-chip.selected {
  background: #3a6348;
  color: #ffffff;
}

/* ── 统计与视图切换 ── */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 0 8rpx;
}

.count-text {
  color: #686e64;
  font-size: 24rpx;
  font-weight: bold;
}

.stats-btn-group {
  display: flex;
  align-items: center;
}

.stats-btn {
  padding: 8rpx 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  color: #1a1c19;
  font-size: 22rpx;
  font-weight: bold;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.stats-btn-gap {
  margin-left: 14rpx;
}

/* ── 单列卡片列表 ── */
.list-container {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.book-card {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 26rpx;
  display: flex;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}

.book-card:active {
  transform: scale(0.99);
}

.cover-box {
  margin-right: 24rpx;
  flex-shrink: 0;
}

.cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: #eae2d5;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cover-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ph-emoji {
  font-size: 52rpx;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.line1 {
  display: flex;
  align-items: center;
}

.media-badge {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.card-title {
  flex: 1;
  color: #1a1c19;
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-pill {
  padding: 4rpx 14rpx;
  border-radius: 16rpx;
  background: #ece7de;
  color: #3a6348;
  font-size: 20rpx;
  font-weight: bold;
}

.author {
  color: #686e64;
  font-size: 23rpx;
  margin-top: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-row {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  gap: 12rpx;
  flex-wrap: wrap;
}

.rating {
  color: #9e7638;
  font-size: 22rpx;
  font-weight: bold;
}

.category-chip {
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.05);
  color: #444840;
  font-size: 19rpx;
}

.tags {
  color: #686e64;
  font-size: 20rpx;
}

.comment-strip {
  margin-top: 12rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background: #f8f7f4;
  color: #3a6348;
  font-size: 21rpx;
  font-style: italic;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

/* ── 双列网格 ── */
.grid-container {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.grid-card {
  background: #ffffff;
  border-radius: 30rpx;
  overflow: hidden;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
}

.grid-cover-wrap {
  position: relative;
  width: 100%;
  height: 380rpx;
  background: #eae2d5;
}

.grid-cover {
  width: 100%;
  height: 100%;
}

.grid-cover-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-ph-emoji {
  font-size: 80rpx;
}

.grid-media-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 16rpx;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
}

.grid-rating-tag {
  position: absolute;
  bottom: 12rpx;
  left: 12rpx;
  background: rgba(158, 118, 56, 0.92);
  color: #ffffff;
  border-radius: 14rpx;
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.grid-info {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
}

.grid-title {
  color: #1a1c19;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-author {
  color: #686e64;
  font-size: 21rpx;
  margin-top: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.grid-status-pill {
  color: #3a6348;
  font-size: 20rpx;
  font-weight: bold;
}

.grid-category {
  color: #686e64;
  font-size: 20rpx;
}

/* ── 空状态 ── */
.empty-panel {
  margin-top: 60rpx;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-title {
  color: #1a1c19;
  font-size: 32rpx;
  font-weight: bold;
}

.empty-body {
  color: #686e64;
  font-size: 24rpx;
  text-align: center;
  margin-top: 10rpx;
  line-height: 1.5;
}

.btn-empty-add {
  margin-top: 30rpx;
  padding: 14rpx 36rpx;
  border-radius: 28rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}

/* ── 悬浮置顶 ── */
.back-top {
  position: fixed;
  right: 36rpx;
  bottom: 200rpx;
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.back-top-arrow {
  color: #3a6348;
  font-size: 20rpx;
}

.back-top-text {
  color: #3a6348;
  font-size: 18rpx;
  font-weight: bold;
}
</style>
