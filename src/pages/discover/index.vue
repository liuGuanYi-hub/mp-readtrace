<template>
  <view class="discover-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title-wrap">
        <text class="page-title">探索与外部建库</text>
        <text class="page-subtitle">Discover & Auto-Cataloging</text>
      </view>
    </view>

    <!-- 搜索输入框与扫码 -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input
        v-model="keyword"
        class="search-input"
        placeholder="搜索作品名 / 导演 / ISBN 条形码..."
        confirm-type="search"
        @confirm="doSearch"
      />
      <text v-if="keyword" class="clear-icon" @tap="clearKeyword">✕</text>
      <view class="scan-btn" @tap="handleScanCode">
        <text class="scan-icon">📷</text>
        <text class="scan-text">扫码</text>
      </view>
    </view>

    <!-- 分类筛选胶囊 -->
    <scroll-view scroll-x class="media-tabs" :show-scrollbar="false">
      <view class="tabs-inner">
        <view
          class="tab-chip"
          :class="{ active: currentMedia === '' }"
          @tap="switchMedia('')"
        >
          全部媒介
        </view>
        <view
          v-for="(meta, key) in MEDIA_LABEL"
          :key="key"
          class="tab-chip"
          :class="{ active: currentMedia === key }"
          @tap="switchMedia(key)"
        >
          {{ meta.emoji }} {{ meta.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 结果栏模式标题 -->
    <view class="section-head">
      <text class="section-title">
        {{ keyword ? `🔍 检索结果 (${searchList.length})` : '🏆 殿堂级推荐榜单 (免打字录入)' }}
      </text>
      <text class="section-hint">点击条目即可预览角色谱与分幕大纲</text>
    </view>

    <!-- 作品结果流 -->
    <scroll-view scroll-y class="results-scroller" :show-scrollbar="false">
      <view v-if="searchList.length === 0" class="empty-state">
        <text class="empty-emoji">🍃</text>
        <text class="empty-text">未找到匹配的外部作品</text>
        <text class="empty-sub">可尝试缩短书名或切换全部分类</text>
      </view>

      <view
        v-for="item in searchList"
        :key="item.sourceId"
        class="result-card"
        @tap="openPreviewSheet(item)"
      >
        <image
          v-if="item.coverUrl"
          class="card-cover"
          :src="item.coverUrl"
          mode="aspectFill"
        />
        <view v-else class="card-cover-ph">
          <text>{{ MEDIA_LABEL[item.mediaType]?.emoji || '📖' }}</text>
        </view>

        <view class="card-content">
          <view class="card-title-row">
            <text class="card-title">{{ item.title }}</text>
            <view class="remote-badge">
              ★ {{ item.remoteRating ? item.remoteRating.toFixed(1) : '9.0' }}
            </view>
          </view>

          <text class="card-author">{{ item.author }} · {{ item.category }}</text>

          <view class="meta-pills">
            <view v-if="item.characters && item.characters.length" class="meta-pill">
              👥 {{ item.characters.length }}位核心角色
            </view>
            <view v-if="item.outlines && item.outlines.length" class="meta-pill">
              📜 {{ item.outlines.length }}阶段大纲
            </view>
          </view>

          <view class="card-footer">
            <view class="tags-wrap">
              <text v-for="t in item.tags.slice(0, 2)" :key="t" class="tag-chip">#{{ t }}</text>
            </view>

            <view
              v-if="isAlreadyInLibrary(item.title)"
              class="btn-in-library"
              @tap.stop="showAlreadyToast"
            >
              ✓ 已在馆藏
            </view>
            <view
              v-else
              class="btn-add-lib"
              @tap.stop="openPreviewSheet(item)"
            >
              ＋ 收入典藏
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- ═══ 入库检视与定制 Bottom Sheet ═══ -->
    <view v-if="activeSheetItem" class="modal-mask" @tap.self="activeSheetItem = null">
      <view class="sheet-container">
        <view class="sheet-header">
          <text class="sheet-title">入库定制 · 《{{ activeSheetItem.title }}》</text>
          <text class="sheet-close" @tap="activeSheetItem = null">✕</text>
        </view>

        <scroll-view scroll-y class="sheet-scroll">
          <!-- 简介 -->
          <view class="sheet-section">
            <text class="sheet-sec-title">📖 剧情与思想梗概</text>
            <text class="sheet-desc">{{ activeSheetItem.description }}</text>
          </view>

          <!-- 登场人物谱 -->
          <view v-if="activeSheetItem.characters && activeSheetItem.characters.length" class="sheet-section">
            <text class="sheet-sec-title">👥 登场角色图谱 ({{ activeSheetItem.characters.length }})</text>
            <view class="char-roster">
              <view v-for="c in activeSheetItem.characters" :key="c.name" class="char-bubble">
                <text class="char-emoji">{{ c.avatarEmoji || '👤' }}</text>
                <view class="char-texts">
                  <text class="char-name">{{ c.name }}</text>
                  <text class="char-role">{{ c.roleTitle }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 分幕大纲 -->
          <view v-if="activeSheetItem.outlines && activeSheetItem.outlines.length" class="sheet-section">
            <text class="sheet-sec-title">📜 章节与分幕大纲</text>
            <view class="outline-list">
              <view v-for="o in activeSheetItem.outlines" :key="o.chapterOrder" class="outline-row">
                <text class="outline-order">{{ o.chapterOrder }}.</text>
                <view class="outline-body">
                  <text class="outline-name">{{ o.title }}</text>
                  <text class="outline-summary">{{ o.summary }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 入库状态与评分 -->
          <view class="sheet-section">
            <text class="sheet-sec-title">🏷️ 初始体验状态与评分</text>
            <view class="status-chips">
              <view
                v-for="st in statusOptions"
                :key="st.key"
                class="status-chip"
                :class="{ active: inputStatus === st.key }"
                @tap="inputStatus = st.key"
              >
                {{ st.label }}
              </view>
            </view>

            <view class="rating-row">
              <text class="rating-label">个人初评：★ {{ inputRating.toFixed(1) }} 分</text>
              <slider
                :value="inputRating"
                :min="1"
                :max="10"
                :step="0.5"
                active-color="#9E7638"
                block-size="20"
                @change="onRatingChange"
              />
            </view>
          </view>
        </scroll-view>

        <view class="sheet-actions">
          <button class="btn-cancel" @tap="activeSheetItem = null">取消</button>
          <button class="btn-confirm-import" @tap="executeImport">
            📥 确认收入馆藏并生成心印
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MediaType, BookStatus } from '@/utils/models';
import { MEDIA_LABEL } from '@/utils/models';
import {
  searchCatalog,
  scanIsbnCode,
  checkWorkExistsInLibrary,
  importSearchResultToLibrary,
  type SearchCatalogItem,
} from '@/utils/search-catalog';

const keyword = ref('');
const currentMedia = ref<'' | MediaType>('');
const searchList = ref<SearchCatalogItem[]>([]);

const activeSheetItem = ref<SearchCatalogItem | null>(null);
const inputStatus = ref<BookStatus>('reading');
const inputRating = ref(9.0);

const statusOptions = [
  { key: 'reading' as BookStatus, label: '在看 / 体验中' },
  { key: 'wishlist' as BookStatus, label: '想看 / 种草' },
  { key: 'finished' as BookStatus, label: '已看完 / 通关' },
];

async function doSearch() {
  uni.showLoading({ title: '检索中...' });
  try {
    searchList.value = await searchCatalog(
      keyword.value,
      currentMedia.value || undefined,
    );
  } finally {
    uni.hideLoading();
  }
}

function clearKeyword() {
  keyword.value = '';
  doSearch();
}

function switchMedia(m: '' | MediaType) {
  currentMedia.value = m;
  doSearch();
}

onMounted(() => {
  doSearch();
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/hub/index' });
    },
  });
}

function isAlreadyInLibrary(title: string) {
  return checkWorkExistsInLibrary(title);
}

function showAlreadyToast() {
  uni.showToast({ title: '该作品已在您的藏库中', icon: 'none' });
}

async function handleScanCode() {
  try {
    const item = await scanIsbnCode();
    if (item) {
      openPreviewSheet(item);
    }
  } catch {
    // 用户取消或扫码失败
  }
}

function openPreviewSheet(item: SearchCatalogItem) {
  activeSheetItem.value = item;
  inputRating.value = item.remoteRating || 9.0;
  inputStatus.value = 'reading';
}

function onRatingChange(e: any) {
  inputRating.value = Number(e.detail.value);
}

function executeImport() {
  if (!activeSheetItem.value) return;
  const newBook = importSearchResultToLibrary(
    activeSheetItem.value,
    inputStatus.value,
    inputRating.value,
  );
  activeSheetItem.value = null;

  uni.showModal({
    title: '已成功入库',
    content: `《${newBook.title}》已收录至您的典藏馆，并派生了六维心智模型！`,
    confirmText: '去检视',
    cancelText: '继续探索',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: `/pages/book-detail/index?id=${newBook.id}` });
      } else {
        doSearch(); // 刷新“已在馆藏”状态
      }
    },
  });
}
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  background-color: var(--rt-bg);
  padding: 40rpx 32rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
  padding-top: 20rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: var(--rt-chip);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.back-icon {
  font-size: 38rpx;
  color: var(--rt-ink);
  line-height: 1;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.page-subtitle {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 4rpx;
  font-family: Georgia, serif;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1rpx solid #DCD8CD;
  border-radius: 40rpx;
  padding: 10rpx 20rpx 10rpx 28rpx;
  box-shadow: 0 6rpx 20rpx rgba(44, 42, 38, 0.05);
  margin-bottom: 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: var(--rt-faint);
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--rt-ink);
}

.clear-icon {
  font-size: 28rpx;
  color: #B4B0A5;
  padding: 8rpx 16rpx;
}

.scan-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: var(--rt-chip);
  padding: 10rpx 20rpx;
  border-radius: 28rpx;
}

.scan-icon {
  font-size: 26rpx;
}

.scan-text {
  font-size: 22rpx;
  color: #5C584E;
  font-weight: 600;
}

/* 分类标签 */
.media-tabs {
  white-space: nowrap;
  margin-bottom: 28rpx;
}

.tabs-inner {
  display: flex;
  gap: 16rpx;
}

.tab-chip {
  padding: 12rpx 24rpx;
  background: var(--rt-chip);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #5C584E;
  font-weight: 600;
  transition: all 0.2s ease;
}

.tab-chip.active {
  background: var(--rt-accent);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(58, 99, 72, 0.3);
}

.section-head {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.section-hint {
  font-size: 20rpx;
  color: var(--rt-faint);
  margin-top: 4rpx;
}

/* 列表流 */
.results-scroller {
  flex: 1;
  height: 60vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--rt-ink);
  font-weight: 600;
}

.empty-sub {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 8rpx;
}

.result-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid var(--rt-chip);
  box-shadow: 0 6rpx 20rpx rgba(44, 42, 38, 0.04);
}

.card-cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.card-cover-ph {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: var(--rt-chip);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--rt-ink);
  line-height: 1.3;
  flex: 1;
  margin-right: 12rpx;
}

.remote-badge {
  background: #FFF8E1;
  color: var(--rt-gold);
  font-size: 22rpx;
  font-weight: 700;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  border: 1rpx solid #FFE082;
}

.card-author {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 6rpx;
}

.meta-pills {
  display: flex;
  gap: 12rpx;
  margin: 10rpx 0;
}

.meta-pill {
  font-size: 20rpx;
  color: #5C584E;
  background: #F4F2EE;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-wrap {
  display: flex;
  gap: 8rpx;
}

.tag-chip {
  font-size: 20rpx;
  color: var(--rt-faint);
}

.btn-add-lib {
  padding: 10rpx 24rpx;
  background: var(--rt-accent);
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 700;
  border-radius: 24rpx;
}

.btn-in-library {
  padding: 10rpx 24rpx;
  background: var(--rt-chip);
  color: var(--rt-faint);
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 24rpx;
}

/* 检视弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 16, 0.65);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.sheet-container {
  width: 100%;
  background: #FFFFFF;
  border-radius: 36rpx 36rpx 0 0;
  padding: 36rpx 32rpx env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.sheet-close {
  font-size: 36rpx;
  color: var(--rt-faint);
  padding: 8rpx;
}

.sheet-scroll {
  max-height: 580rpx;
}

.sheet-section {
  margin-bottom: 28rpx;
}

.sheet-sec-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #5C584E;
  margin-bottom: 12rpx;
  display: block;
}

.sheet-desc {
  font-size: 24rpx;
  color: #4A4843;
  line-height: 1.6;
}

.char-roster {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.char-bubble {
  display: flex;
  align-items: center;
  background: var(--rt-bg);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  gap: 14rpx;
}

.char-emoji {
  font-size: 36rpx;
}

.char-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--rt-ink);
  margin-right: 12rpx;
}

.char-role {
  font-size: 20rpx;
  color: var(--rt-faint);
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.outline-row {
  display: flex;
  background: var(--rt-bg);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  gap: 10rpx;
}

.outline-order {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--rt-gold);
}

.outline-body {
  flex: 1;
}

.outline-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--rt-ink);
  display: block;
}

.outline-summary {
  font-size: 20rpx;
  color: #5C584E;
  margin-top: 4rpx;
  display: block;
}

.status-chips {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.status-chip {
  flex: 1;
  text-align: center;
  padding: 14rpx 0;
  background: #F4F2EE;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #5C584E;
  font-weight: 600;
}

.status-chip.active {
  background: var(--rt-accent);
  color: #FFFFFF;
}

.rating-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.rating-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--rt-gold);
}

.sheet-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.btn-cancel {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: var(--rt-chip);
  color: #5C584E;
  font-size: 26rpx;
  border-radius: 40rpx;
  font-weight: 600;
}

.btn-confirm-import {
  flex: 2;
  height: 80rpx;
  line-height: 80rpx;
  background: var(--rt-accent);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 40rpx;
  font-weight: 700;
  box-shadow: 0 6rpx 20rpx rgba(58, 99, 72, 0.35);
}
</style>
