<template>
  <scroll-view
    scroll-y
    class="page"
    :scroll-top="scrollTopSet"
    :scroll-with-animation="true"
    :show-scrollbar="false"
    @scroll="onScroll"
  >
    <!-- 顶部一体化 Header & 多维过滤面板（对齐 App 玻璃拟态面板） -->
    <view class="header-panel">
      <!-- 标题与单一新增操作栏 -->
      <view class="title-row">
        <text class="panel-title">📚 精神藏库</text>
        <view class="header-actions">
          <view class="btn-add rt-spring" hover-class="rt-press" hover-stay-time="120" @tap="goQuickLog">+ 记录</view>
        </view>
      </view>

      <!-- 搜索框（纯净玻璃拟态，对齐截图无冗余标签） -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索书名、影名、游戏、番剧、作者、标签..."
          placeholder-class="ph"
          confirm-type="search"
          @input="onKeywordInput"
        />
        <view v-if="keyword" class="search-clear" @tap="clearKeyword">✕</view>
      </view>

      <!-- 一级：媒介类型切换胶囊栏（全部 🌌 / 书籍 📖 / 番剧 🌸 / 影视 🎬 / 游戏 🎮） -->
      <scroll-view scroll-x class="chip-scroller" enhanced :show-scrollbar="false">
        <view
          class="media-chip rt-spring"
          :class="{ selected: mediaFilter === '' }"
          hover-class="rt-press"
          @tap="onMediaChange('')"
        >
          全部 🌌
        </view>
        <view
          v-for="m in MEDIA_ORDER"
          :key="m.key"
          class="media-chip rt-spring"
          :class="{ selected: mediaFilter === m.key }"
          hover-class="rt-press"
          @tap="onMediaChange(m.key)"
        >
          {{ m.name }} {{ m.emoji }}
        </view>
      </scroll-view>

      <!-- 二级：iOS 风格轻量状态分段条（全部 / 进行中 / 已完成 / 愿望单） -->
      <view class="segmented">
        <view
          v-for="opt in statusOpts"
          :key="opt.key"
          class="seg-item rt-spring"
          :class="{ selected: statusFilter === opt.key }"
          hover-class="rt-press"
          @tap="onStatusChange(opt.key as BookStatus | '')"
        >
          {{ opt.label }}
        </view>
      </view>

      <!-- 三级：评分区间筛选条（全部 / 7.0~7.5 / 7.5~8.0 / 8.0~9.0 / 9.0以上） -->
      <view class="segmented rating-bar">
        <view
          v-for="opt in RATING_RANGES"
          :key="opt.key"
          class="seg-item rt-spring"
          :class="{ selected: ratingRange === opt.key }"
          hover-class="rt-press"
          @tap="onRatingChange(opt.key)"
        >
          {{ opt.label }}
        </view>
      </view>

      <!-- 四级：动态标签流（带计数胶囊，对齐截图标签样式） -->
      <scroll-view v-if="tagOpts.length" scroll-x class="tag-scroller" enhanced :show-scrollbar="false">
        <view
          v-for="t in tagOpts"
          :key="t.name"
          class="tag-chip rt-spring"
          :class="{ selected: selectedTag === t.name }"
          hover-class="rt-press"
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
        <view class="stats-btn rt-spring" hover-class="rt-press" @tap="isGridView = !isGridView">
          {{ isGridView ? '📋 列表' : '🎴 网格' }}
        </view>
        <view class="stats-btn stats-btn-gap rt-spring" hover-class="rt-press" @tap="exportView">📜 导出长卷</view>
      </view>
    </view>

    <!-- ═══ 藏品双列网格（item_book_grid_card 风格，对齐 library_top.png & library_scrolled.png） ═══ -->
    <view v-if="isGridView" class="grid-container">
      <view
        v-for="book in pagedList"
        :key="`grid-${book.id}`"
        class="grid-card rt-spring"
        hover-class="rt-press"
        hover-stay-time="120"
        @tap="openDetail(book)"
      >
        <view class="grid-cover-wrap">
          <image v-if="book.coverUrl" class="grid-cover" :src="book.coverUrl" mode="aspectFill" />
          <view v-else class="grid-cover grid-cover-ph">
            <text class="grid-ph-emoji">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
          </view>
          <!-- 悬浮左上媒介标 -->
          <view class="grid-media-badge">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</view>
          <!-- 悬浮右上状态标（游戏通关显示「通关」） -->
          <view class="grid-status-badge">
            {{ MEDIA_STATUS[book.mediaType]?.[book.status] || '已完成' }}
          </view>
        </view>

        <view class="grid-info">
          <text class="grid-title">{{ book.title }}</text>
          <text class="grid-author">{{ book.author || '未知作者' }}</text>
          <view class="grid-meta-row">
            <view class="grid-score-wrap">
              <text class="grid-score-num">{{ formatRatingNum(book.rating) }}</text>
              <text class="grid-score-unit"> 分</text>
            </view>
            <text class="grid-category" v-if="book.category">{{ book.category }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ═══ 藏品单列列表（item_book_card 风格） ═══ -->
    <view v-else class="list-container">
      <view
        v-for="book in pagedList"
        :key="book.id"
        class="book-card rt-spring"
        hover-class="rt-press"
        hover-stay-time="120"
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

    <!-- 空状态面板（bg_glass_panel） -->
    <view v-if="filtered.length === 0" class="empty-panel">
      <view class="empty-icon">🏛️</view>
      <text class="empty-title">暂无匹配藏品</text>
      <text class="empty-body">换个筛选条件看看，或点击上方「+ 记录」添加新作品</text>
      <view class="btn-empty-add" @tap="goQuickLog">＋ 记录新作品</view>
    </view>

    <!-- 📄 底部悬浮毛玻璃胶囊翻页条 (对齐 App 悬浮翻页条) -->
    <view class="floating-pagination" v-if="totalPages > 1">
      <view
        class="fp-btn rt-spring"
        :class="{ disabled: currentPage <= 1 }"
        hover-class="rt-press"
        @tap="prevPage"
      >
        ‹ 上一页
      </view>
      <text class="fp-indicator">{{ currentPage }} / {{ totalPages }}</text>
      <view
        class="fp-btn rt-spring"
        :class="{ disabled: currentPage >= totalPages }"
        hover-class="rt-press"
        @tap="nextPage"
      >
        下一页 ›
      </view>
    </view>

    <!-- 悬浮回到顶部胶囊 -->
    <view v-if="showBackTop" class="back-top" @tap="backToTop">
      <text class="back-top-arrow">▲</text>
      <text class="back-top-text">顶部</text>
    </view>

    <!-- 📜 长卷预览弹窗 -->
    <view class="scroll-preview-mask" v-if="scrollPreview.visible" @tap.self="scrollPreview.visible = false">
      <view class="scroll-preview-dialog">
        <view class="sp-head">
          <text class="sp-title">📜 藏库宣纸长卷已生成</text>
          <view class="sp-close" @tap="scrollPreview.visible = false">✕</view>
        </view>
        <image
          v-if="scrollPreview.imageUrl"
          class="sp-image"
          :src="scrollPreview.imageUrl"
          mode="aspectFit"
          @tap="previewScroll"
        />
        <view class="sp-btn-row">
          <view class="sp-btn sp-btn-ghost" @tap="previewScroll">🔍 全屏预览</view>
          <view class="sp-btn sp-btn-primary" @tap="saveScroll">💾 保存到相册</view>
        </view>
      </view>
    </view>

    <!-- 离屏长卷画布（尺寸随藏品数量动态计算） -->
    <canvas
      canvas-id="scrollCanvas"
      id="scrollCanvas"
      :style="'position: fixed; left: -9999px; top: -9999px; width: 750px; height: ' + scrollCanvasHeight + 'px;'"
    />

    <TabBar :active="1" />
  </scroll-view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, ref, getCurrentInstance } from 'vue';
import type { Book, BookStatus, MediaType } from '../../utils/models';
import { MEDIA_LABEL, MEDIA_STATUS } from '../../utils/models';
import { loadLocalWorks } from '../../utils/sync';
import { generateLibraryScroll, computeScrollHeight, savePosterToAlbum } from '../../utils/poster-engine';
import TabBar from '../../components/TabBar.vue';

// 严格对齐 App 媒介栏顺序：全部、书籍、番剧、影视、游戏
const MEDIA_ORDER: { key: MediaType; name: string; emoji: string }[] = [
  { key: 'book', name: '书籍', emoji: '📖' },
  { key: 'anime', name: '番剧', emoji: '🌸' },
  { key: 'movie', name: '影视', emoji: '🎬' },
  { key: 'game', name: '游戏', emoji: '🎮' },
];

// 严格对齐 App 五档评分分段器
const RATING_RANGES = [
  { key: '', label: '全部' },
  { key: '7075', label: '7.0~7.5' },
  { key: '7580', label: '7.5~8.0' },
  { key: '8090', label: '8.0~9.0' },
  { key: '90plus', label: '9.0以上' },
];

const books = ref<Book[]>([]);
const mediaFilter = ref<'' | MediaType>('');
const statusFilter = ref<'' | BookStatus>('');
const ratingRange = ref('');
const selectedTag = ref('');
const keyword = ref('');
const isGridView = ref(true); // 默认开启双列网格视图（完全对齐 App 实机截图）

const currentPage = ref(1);
const pageSize = 20;

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
      { key: 'wishlist', label: '愿望单' },
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

// 动态提取热门高频标签
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
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));
});

function onMediaChange(m: '' | MediaType) {
  mediaFilter.value = m;
  selectedTag.value = '';
  currentPage.value = 1;
}

function onStatusChange(s: '' | BookStatus) {
  statusFilter.value = s;
  currentPage.value = 1;
}

function onRatingChange(r: string) {
  ratingRange.value = r;
  currentPage.value = 1;
}

function toggleTag(t: string) {
  selectedTag.value = selectedTag.value === t ? '' : t;
  currentPage.value = 1;
}

function onKeywordInput() {
  currentPage.value = 1;
}

function clearKeyword() {
  keyword.value = '';
  currentPage.value = 1;
}

function formatRatingNum(r: number | null): string {
  if (r == null) return '8';
  return r.toFixed(1).replace(/\.0$/, '');
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
      if (ratingRange.value === '8090' && (r < 8.0 || r > 9.0)) return false;
      if (ratingRange.value === '90plus' && r < 9.0) return false;
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

// 分页列表计算
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    backToTop();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    backToTop();
  }
}

function onScroll(e: any) {
  showBackTop.value = e.detail.scrollTop > 360;
}

function backToTop() {
  scrollTopSet.value = 0;
  setTimeout(() => {
    scrollTopSet.value = -1;
  }, 100);
}

function goQuickLog() {
  uni.navigateTo({ url: '/pages/quick-log/index' });
}

function openDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?id=${book.id}` });
}

// ── 📜 导出宣纸长卷（真实渲染 → 预览 → 存相册）──
const instance = getCurrentInstance();
const scrollCanvasHeight = ref(computeScrollHeight(1));
const scrollPreview = ref({ visible: false, imageUrl: '' });

function exportView() {
  const works = filtered.value;
  if (!works.length) {
    uni.showToast({ title: '藏库为空，先去记录几部作品吧', icon: 'none' });
    return;
  }
  if (works.length > 16) {
    uni.showToast({ title: '长卷单幅收录前 16 部 · 可用筛选聚焦', icon: 'none', duration: 2000 });
  }
  scrollCanvasHeight.value = computeScrollHeight(works.length);
  uni.showLoading({ title: '正在铺陈宣纸长卷...', mask: true });
  setTimeout(async () => {
    try {
      const tempPath = await generateLibraryScroll('scrollCanvas', instance, works);
      uni.hideLoading();
      scrollPreview.value = { visible: true, imageUrl: tempPath };
    } catch (err: any) {
      uni.hideLoading();
      uni.showModal({
        title: '生成失败',
        content: err?.errMsg || err?.message || '画布绘制超时，请重试',
        showCancel: false,
      });
    }
  }, 120);
}

function previewScroll() {
  if (!scrollPreview.value.imageUrl) return;
  uni.previewImage({ urls: [scrollPreview.value.imageUrl], current: scrollPreview.value.imageUrl });
}

async function saveScroll() {
  if (!scrollPreview.value.imageUrl) return;
  try {
    await savePosterToAlbum(scrollPreview.value.imageUrl);
  } catch {
    // 提示已由内部处理
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 280rpx;
  box-sizing: border-box;
  background: var(--rt-bg);
}

/* ── 顶部多维过滤面板 ── */
.header-panel {
  background: rgba(255, 255, 255, 0.96);
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
}

.panel-title {
  color: var(--rt-ink);
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.btn-add {
  padding: 10rpx 28rpx;
  border-radius: 30rpx;
  background: #2D5A46;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 14rpx rgba(45, 90, 70, 0.3);
}

/* 一级媒介胶囊 */
.chip-scroller {
  white-space: nowrap;
  margin-top: 20rpx;
}

.media-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 12rpx;
  border-radius: 30rpx;
  background: #E8ECE9;
  color: #2A332B;
  font-size: 23rpx;
  font-weight: bold;
  border: 1.5rpx solid rgba(0, 0, 0, 0.04);
}

.media-chip.selected {
  background: #2D5A46;
  color: #ffffff;
  border-color: #2D5A46;
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
  color: var(--rt-muted);
}

.search-input {
  flex: 1;
  font-size: 24rpx;
  color: var(--rt-ink);
}

.ph {
  color: #9c9a92;
}

.search-clear {
  color: var(--rt-muted);
  font-size: 28rpx;
  padding: 8rpx;
}

/* 二级状态与三级评分分段条（对齐 iOS 经典分段器与截图深绿高亮） */
.segmented {
  display: flex;
  height: 64rpx;
  background: #EAECE9;
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
  color: #525D53;
  font-weight: bold;
  transition: all 0.2s ease;
}

.seg-item.selected {
  background: #2D5A46;
  color: #ffffff;
  box-shadow: 0 4rpx 10rpx rgba(45, 90, 70, 0.25);
}

.rating-bar {
  margin-top: 14rpx;
  height: 60rpx;
}

/* 动态标签流 */
.tag-scroller {
  white-space: nowrap;
  margin-top: 16rpx;
}

.tag-chip {
  display: inline-block;
  padding: 8rpx 22rpx;
  margin-right: 12rpx;
  border-radius: 22rpx;
  background: #EEF2EE;
  color: #374338;
  font-size: 21rpx;
  font-weight: 500;
  border: 1.5rpx solid rgba(45, 90, 70, 0.18);
}

.tag-chip.selected {
  background: #2D5A46;
  color: #ffffff;
  border-color: #2D5A46;
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
  color: var(--rt-muted);
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
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.stats-btn-gap {
  margin-left: 14rpx;
}

/* ── ═══ 双列网格（1:1 还原 library_top.png & library_scrolled.png） ═══ ── */
.grid-container {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.grid-card {
  background: #ffffff;
  border-radius: 32rpx;
  overflow: hidden;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.grid-cover-wrap {
  position: relative;
  width: 100%;
  height: 380rpx;
  background: #E5E8E5;
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

/* 左上角圆形半透明媒介徽标 */
.grid-media-badge {
  position: absolute;
  top: 14rpx;
  left: 14rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 右上角半透明胶囊状态徽标（通关/已读/在读等） */
.grid-status-badge {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 20rpx;
  font-weight: bold;
  color: #2D5A46;
  border: 1rpx solid rgba(45, 90, 70, 0.18);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.grid-info {
  padding: 16rpx 18rpx 20rpx;
  display: flex;
  flex-direction: column;
}

.grid-title {
  color: #1A1C19;
  font-size: 29rpx;
  font-weight: bold;
  font-family: serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-author {
  color: #727970;
  font-size: 22rpx;
  margin-top: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.grid-score-wrap {
  display: flex;
  align-items: baseline;
}

.grid-score-num {
  font-size: 26rpx;
  font-weight: 800;
  color: #2D5A46;
  font-family: serif;
}

.grid-score-unit {
  font-size: 20rpx;
  font-weight: bold;
  color: #2D5A46;
}

.grid-category {
  color: #727970;
  font-size: 21rpx;
  max-width: 65%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
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

.cover-box {
  margin-right: 24rpx;
  flex-shrink: 0;
}

.cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: var(--rt-cover-ph);
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
  color: var(--rt-ink);
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
  background: var(--rt-chip);
  color: var(--rt-accent);
  font-size: 20rpx;
  font-weight: bold;
}

.author {
  color: var(--rt-muted);
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
  color: var(--rt-gold);
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
  color: var(--rt-muted);
  font-size: 20rpx;
}

.comment-strip {
  margin-top: 12rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background: var(--rt-bg);
  color: var(--rt-accent);
  font-size: 21rpx;
  font-style: italic;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

/* ── 📄 悬浮胶囊翻页条（完全对齐 App 底部悬浮翻页条） ── */
.floating-pagination {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(156rpx + env(safe-area-inset-bottom));
  z-index: 100;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 40rpx;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  height: 72rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.fp-btn {
  font-size: 24rpx;
  color: #1A1C19;
  font-weight: 600;
  padding: 8rpx 14rpx;
  border-radius: 16rpx;
}

.fp-btn.disabled {
  color: #A0A8A0;
  pointer-events: none;
  opacity: 0.5;
}

.fp-indicator {
  font-size: 23rpx;
  color: #1A1C19;
  font-weight: bold;
  font-family: monospace, sans-serif;
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
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
}

.empty-body {
  color: var(--rt-muted);
  font-size: 24rpx;
  text-align: center;
  margin-top: 10rpx;
  line-height: 1.5;
}

.btn-empty-add {
  margin-top: 30rpx;
  padding: 14rpx 36rpx;
  border-radius: 28rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}

/* ── 悬浮置顶 ── */
.back-top {
  position: fixed;
  right: 36rpx;
  bottom: 240rpx;
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
  color: var(--rt-accent);
  font-size: 20rpx;
}

.back-top-text {
  color: var(--rt-accent);
  font-size: 18rpx;
  font-weight: bold;
}

/* ── 长卷预览弹窗 ── */
.scroll-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 12, 16, 0.62);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.scroll-preview-dialog {
  width: 100%;
  max-height: 86vh;
  background: var(--rt-bg);
  border-radius: 28rpx;
  padding: 28rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.sp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sp-title {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.sp-close {
  font-size: 28rpx;
  color: var(--rt-muted);
  padding: 8rpx;
}

.sp-image {
  flex: 1;
  min-height: 480rpx;
  margin: 20rpx 0;
  border-radius: 16rpx;
  background: var(--rt-parchment);
}

.sp-btn-row {
  display: flex;
  gap: 18rpx;
}

.sp-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
}

.sp-btn-ghost {
  background: var(--rt-chip);
  color: var(--rt-ink);
}

.sp-btn-primary {
  background: var(--rt-accent);
  color: #ffffff;
}
</style>
