<template>
  <view class="quick-log-page">
    <view class="quick-log-card">
      <!-- 顶部 Header -->
      <view class="head-row">
        <view class="head-left">
          <text class="title">⚡ 极速速记</text>
          <text class="subtitle">输入一句话结构化录入 · 点状态键 2 秒入库</text>
        </view>
        <view class="btn-close" @tap="goBack">✕</view>
      </view>

      <!-- 媒介类型切换胶囊行 -->
      <scroll-view scroll-x class="media-scroller" enhanced :show-scrollbar="false">
        <view
          class="media-chip"
          :class="{ selected: selectedMedia === '' }"
          @tap="selectedMedia = ''"
        >
          全部 🌌
        </view>
        <view
          v-for="(m, key) in MEDIA_LABEL"
          :key="key"
          class="media-chip"
          :class="{ selected: selectedMedia === key }"
          @tap="selectedMedia = key as MediaType"
        >
          {{ m.name }} {{ m.emoji }}
        </view>
      </scroll-view>

      <!-- 一句话自然语言智能分词输入框 -->
      <view class="input-wrap">
        <text class="input-icon">🔍</text>
        <input
          class="input"
          v-model="raw"
          placeholder="状态 + 书名/片名 + 评分 + #标签 (例: 读完 三体 9.5分 #硬科幻)"
          placeholder-class="ph"
        />
        <view v-if="raw" class="clear-btn" @tap="raw = ''">✕</view>
      </view>

      <!-- 实时智能结构化解析卡片 -->
      <view v-if="parsed" class="parse-card">
        <view class="pc-head">
          <text class="pc-sparkle">✦ 智能结构化推导就绪</text>
          <text class="pc-media-tag">{{ currentMediaName }}</text>
        </view>
        <text class="pc-title">《{{ parsed.title }}》</text>
        <view class="pc-meta-row">
          <text class="pc-status">【{{ currentStatusName }}】</text>
          <text class="pc-rating" v-if="effectiveRating">★ {{ effectiveRating }} 分</text>
          <text class="pc-tags" v-if="parsed.tags && parsed.tags.length">
            {{ parsed.tags.map((t) => '#' + t).join(' ') }}
          </text>
        </view>
      </view>

      <!-- 评分条选择器 (1 ~ 10 分) -->
      <view class="rating-section">
        <view class="rating-header">
          <text class="rh-label">⭐ 心智评级打分</text>
          <text class="rh-value">{{ ratingValue > 0 ? ratingValue + ' 分' : '未评定' }}</text>
        </view>
        <slider
          class="rating-slider"
          min="1"
          max="10"
          step="0.5"
          :value="ratingValue"
          activeColor="#FFE700"
          backgroundColor="rgba(255, 255, 255, 0.15)"
          block-size="18"
          block-color="#FFFFFF"
          @change="onSliderChange"
        />
      </view>

      <!-- 五态大按键（点击直接秒存入库） -->
      <view class="status-grid">
        <view
          v-for="(label, key) in currentStatusMap"
          :key="key"
          class="status-key-btn"
          :class="{ active: pickedStatus === key }"
          @tap="pickedStatus = key as BookStatus"
        >
          <text class="status-key-text">{{ label }}</text>
        </view>
      </view>

      <!-- 快捷保存入库按键 -->
      <view class="btn-save-instant" @tap="save">
        ⚡ 秒存入库并推导六维心智
      </view>

      <!-- 底部同步与返回 -->
      <view class="foot-actions">
        <text class="foot-sync" @tap="syncNow">🛡️ WebDAV 云端备份</text>
        <text class="foot-back" @tap="goBack">完成并返回 ➔</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Book, BookStatus, MediaType } from '../../utils/models';
import { MEDIA_LABEL, MEDIA_STATUS, deriveMindprint } from '../../utils/models';
import { loadLocalWorks, saveLocalWorks, loadLocalMindprints, performSync } from '../../utils/sync';

const raw = ref('');
const selectedMedia = ref<'' | MediaType>('');
const pickedStatus = ref<BookStatus>('finished');
const sliderRating = ref(0);

const currentMediaName = computed(() => {
  if (selectedMedia.value) return MEDIA_LABEL[selectedMedia.value].name;
  return '综合媒介';
});

const currentStatusMap = computed(() => {
  const m = selectedMedia.value || 'book';
  return MEDIA_STATUS[m];
});

const currentStatusName = computed(() => {
  const m = selectedMedia.value || 'book';
  return MEDIA_STATUS[m][pickedStatus.value];
});

// 自然语言智能分词推导
const parsed = computed(() => {
  const text = raw.value.trim();
  if (!text) return null;

  const tags = Array.from(text.matchAll(/#([^\s#，,。]+)/g)).map((m) => m[1]);
  let rest = text.replace(/#[^\s#，,。]+/g, ' ');

  const fen = rest.match(/(\d{1,2}(?:\.\d)?)\s*分/);
  const xing = rest.match(/(\d{1,2})\s*星/);
  let rating: number | null = fen ? Number(fen[1]) : xing ? Number(xing[1]) * 2 : null;
  if (rating != null) rating = Math.min(10, Math.max(1, rating));
  rest = rest.replace(/(\d{1,2}(?:\.\d)?)\s*分|(\d{1,2})\s*星/, ' ');

  const statusMap: Array<[RegExp, BookStatus]> = [
    [/想看|想读|想玩|想追|想听/, 'wishlist'],
    [/在看|在读|在玩|追番中|在听/, 'reading'],
    [/读完|看完|已读|已看|通关|补完|听完/, 'finished'],
    [/暂停|搁置|封盘/, 'paused'],
    [/弃读|弃坑|弃番|弃剧/, 'dropped'],
  ];

  let status: BookStatus | null = null;
  for (const [re, s] of statusMap) {
    if (re.test(rest)) {
      status = s;
      rest = rest.replace(re, ' ');
      break;
    }
  }

  const title = rest.replace(/《|》/g, ' ').split(/\s+/).find((t) => t.length > 0) || null;
  return title ? { title, status, rating, tags } : null;
});

const effectiveRating = computed(() => {
  if (sliderRating.value > 0) return sliderRating.value;
  return parsed.value?.rating || 0;
});

const ratingValue = computed(() => effectiveRating.value);

function onSliderChange(e: any) {
  sliderRating.value = Number(e.detail.value);
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/hub/index' });
    },
  });
}

function save() {
  const p = parsed.value;
  const rawTitle = raw.value.trim().replace(/《|》/g, '');
  const title = p?.title || rawTitle;

  if (!title) {
    uni.showToast({ title: '请输入作品名或一句话速记', icon: 'none' });
    return;
  }

  const now = new Date().toISOString();
  const works = loadLocalWorks();
  const mType: MediaType = selectedMedia.value || 'book';
  const score = effectiveRating.value > 0 ? effectiveRating.value : 8.0;

  const newBook: Book = {
    id: Date.now(),
    title,
    author: null,
    coverUrl: null,
    category: p?.tags[0] || '速记印记',
    status: p?.status || pickedStatus.value,
    mediaType: mType,
    rating: score,
    tags: p?.tags || [],
    shortComment: null,
    review: null,
    startDate: pickedStatus.value === 'reading' ? now.slice(0, 10) : null,
    finishDate: pickedStatus.value === 'finished' ? now.slice(0, 10) : null,
    createdAt: now,
    updatedAt: now,
    sourceType: null,
    sourceId: null,
    remoteRating: null,
    description: null,
  };

  works.unshift(newBook);
  saveLocalWorks(works);

  // 联动六维心智推导并写入
  const mps = loadLocalMindprints();
  mps.unshift(deriveMindprint(score, newBook.id));
  uni.setStorageSync('rt_local_mindprints', mps);

  raw.value = '';
  sliderRating.value = 0;
  uni.showToast({ title: `⚡ 《${title}》已入库`, icon: 'none' });

  setTimeout(() => {
    uni.redirectTo({ url: `/pages/book-detail/index?id=${newBook.id}` });
  }, 500);
}

async function syncNow() {
  uni.showLoading({ title: '同步中…' });
  const res = await performSync();
  uni.hideLoading();
  uni.showToast({ title: res.message, icon: 'none' });
}
</script>

<style>
.quick-log-page {
  min-height: 100vh;
  background: var(--rt-deep);
  padding: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quick-log-card {
  background: #161b22;
  border: 1.5rpx solid rgba(255, 255, 255, 0.12);
  border-radius: 40rpx;
  padding: 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.6);
}

.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.head-left {
  display: flex;
  flex-direction: column;
}

.title {
  color: #ffffff;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.subtitle {
  color: #8b949e;
  font-size: 22rpx;
  margin-top: 8rpx;
}

.btn-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #8b949e;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 媒介胶囊 */
.media-scroller {
  white-space: nowrap;
  margin-top: 24rpx;
}

.media-chip {
  display: inline-block;
  padding: 10rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5rpx solid rgba(255, 255, 255, 0.12);
  color: #c9d1d9;
  font-size: 23rpx;
  font-weight: bold;
}

.media-chip.selected {
  background: var(--rt-accent);
  color: #ffffff;
  border-color: #4ade80;
}

/* 输入框 */
.input-wrap {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  padding: 0 20rpx;
  margin-top: 24rpx;
}

.input-icon {
  color: #8b949e;
  font-size: 28rpx;
  margin-right: 12rpx;
}

.input {
  flex: 1;
  color: #ffffff;
  font-size: 26rpx;
}

.ph {
  color: #6e7681;
}

.clear-btn {
  color: #8b949e;
  font-size: 30rpx;
  padding: 8rpx;
}

/* 解析卡片 */
.parse-card {
  margin-top: 20rpx;
  background: rgba(58, 99, 72, 0.35);
  border: 1.5rpx solid #4ade80;
  border-radius: 24rpx;
  padding: 24rpx;
}

.pc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pc-sparkle {
  color: #4ade80;
  font-size: 20rpx;
  font-weight: bold;
}

.pc-media-tag {
  color: var(--rt-gold-bright);
  font-size: 20rpx;
  font-weight: bold;
}

.pc-title {
  display: block;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 8rpx;
}

.pc-meta-row {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  gap: 12rpx;
}

.pc-status {
  color: #a7f3d0;
  font-size: 22rpx;
  font-weight: bold;
}

.pc-rating {
  color: #fde047;
  font-size: 22rpx;
  font-weight: bold;
}

.pc-tags {
  color: #93c5fd;
  font-size: 20rpx;
}

/* 评分滑块 */
.rating-section {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20rpx;
  padding: 18rpx 20rpx;
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rh-label {
  color: #c9d1d9;
  font-size: 23rpx;
  font-weight: bold;
}

.rh-value {
  color: #fde047;
  font-size: 24rpx;
  font-weight: bold;
}

.rating-slider {
  margin: 14rpx 0 6rpx;
}

/* 五态大按键 */
.status-grid {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
}

.status-key-btn {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.status-key-btn:active {
  transform: scale(0.96);
}

.status-key-btn.active {
  background: #fde047;
  border-color: #fde047;
}

.status-key-text {
  color: #c9d1d9;
  font-size: 23rpx;
  font-weight: bold;
}

.status-key-btn.active .status-key-text {
  color: var(--rt-ink);
}

/* 保存按键 */
.btn-save-instant {
  margin-top: 28rpx;
  height: 90rpx;
  background: #fde047;
  border-radius: 30rpx;
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(253, 224, 71, 0.3);
}

.foot-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 0 8rpx;
}

.foot-sync {
  color: #8b949e;
  font-size: 22rpx;
}

.foot-back {
  color: #4ade80;
  font-size: 22rpx;
  font-weight: bold;
}
</style>
