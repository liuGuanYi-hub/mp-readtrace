<template>
  <view class="galaxy-page">
    <!-- 🌌 深空全屏 Canvas / SVG 星图舞台 -->
    <view class="sky-canvas-wrapper" @tap="selectedStar = null">
      <!-- 动态背景星尘 -->
      <view
        v-for="dust in stardust"
        :key="dust.id"
        class="stardust-point"
        :style="{
          left: dust.x + '%',
          top: dust.y + '%',
          opacity: dust.opacity,
          transform: `scale(${dust.scale})`
        }"
      ></view>

      <!-- 节点间星轨连线 (SVG) -->
      <svg class="constellation-svg" width="100%" height="100%">
        <line
          v-for="(line, idx) in constellationLines"
          :key="`line-${idx}`"
          :x1="line.x1 + '%'"
          :y1="line.y1 + '%'"
          :x2="line.x2 + '%'"
          :y2="line.y2 + '%'"
          :stroke="line.color"
          :stroke-width="line.width"
          stroke-dasharray="3, 3"
          opacity="0.35"
        />
      </svg>

      <!-- 恒星节点群 -->
      <view
        v-for="s in stars"
        :key="s.id"
        class="star-node"
        :class="{ active: selectedStar?.id === s.id }"
        :style="{ left: s.x + '%', top: s.y + '%' }"
        @tap.stop="selectStar(s)"
      >
        <!-- 外层光晕脉冲 -->
        <view
          class="star-halo"
          :style="{
            backgroundColor: s.glowColor,
            width: s.size * 2 + 'rpx',
            height: s.size * 2 + 'rpx'
          }"
        ></view>

        <!-- 核心星体 -->
        <view
          class="star-core"
          :style="{
            backgroundColor: s.coreColor,
            width: s.size + 'rpx',
            height: s.size + 'rpx'
          }"
        ></view>

        <!-- 悬浮星标名签 -->
        <view class="star-label" :class="{ 'star-label-active': selectedStar?.id === s.id }">
          <text class="label-emoji">{{ s.emoji }}</text>
          <text class="label-text">{{ s.shortTitle }}</text>
        </view>
      </view>
    </view>

    <!-- 顶部半透明浮动导航面板（对齐 App fragment_constellation.xml） -->
    <view class="top-nav-panel">
      <view class="nav-title-row">
        <text class="nav-title">🌌 跨媒介心智星系</text>
        <view class="nav-btn-fullscreen" @tap="toggleRoam">
          {{ isRoam ? '✦ 聚星模式' : '⛶ 全屏漫游' }}
        </view>
      </view>

      <text class="nav-subtitle">
        {{ galaxyFilter === 'resonance' ? '双星共鸣脉冲已连接 · 思想跨界交汇' : '轻触星体唤醒档案 · 极光脉冲交织 · 双生灵魂共鸣' }}
      </text>

      <!-- 星系分类过滤器 -->
      <scroll-view scroll-x class="filter-scroller" enhanced :show-scrollbar="false">
        <view
          class="filter-chip"
          :class="{ selected: galaxyFilter === '' }"
          @tap="galaxyFilter = ''"
        >
          全景星系
        </view>
        <view
          v-for="m in GALAXY_MEDIA"
          :key="m.key"
          class="filter-chip"
          :class="{ selected: galaxyFilter === m.key }"
          @tap="galaxyFilter = m.key"
        >
          {{ m.label }} {{ m.emoji }}
        </view>
        <view
          class="filter-chip"
          :class="{ selected: galaxyFilter === 'resonance' }"
          @tap="galaxyFilter = 'resonance'"
        >
          双生共鸣 ✨
        </view>
      </scroll-view>
    </view>

    <!-- 底部悬浮选中小微卡（对齐 App constellationNodeCard） -->
    <view v-if="selectedStar" class="bottom-node-card" @tap="openDetail(selectedStar.book)">
      <image
        v-if="selectedStar.book.coverUrl"
        class="node-cover"
        :src="selectedStar.book.coverUrl"
        mode="aspectFill"
      />
      <view v-else class="node-cover node-cover-ph">
        <text>{{ selectedStar.emoji }}</text>
      </view>

      <view class="node-info">
        <text class="node-title">《{{ selectedStar.book.title }}》</text>
        <text class="node-meta">
          {{ selectedStar.emoji }} {{ MEDIA_LABEL[selectedStar.book.mediaType]?.name }} ·
          {{ selectedStar.book.author || '未知作者' }}
          <template v-if="selectedStar.book.rating"> · ★ {{ selectedStar.book.rating }}</template>
        </text>
        <text class="node-quote" v-if="selectedStar.book.shortComment">
          “{{ selectedStar.book.shortComment }}”
        </text>
      </view>

      <view class="btn-node-detail" @tap.stop="openDetail(selectedStar.book)">查看</view>
    </view>

    <!-- 底部导航栏 -->
    <TabBar :active="2" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import type { Book, MediaType } from '../../utils/models';
import { MEDIA_LABEL } from '../../utils/models';
import { loadLocalWorks } from '../../utils/sync';
import TabBar from '../../components/TabBar.vue';

const GALAXY_MEDIA = [
  { key: 'book', label: '文学', emoji: '📚' },
  { key: 'anime', label: '番剧', emoji: '🌸' },
  { key: 'movie', label: '影视', emoji: '🎬' },
  { key: 'game', label: '游戏', emoji: '🎮' },
  { key: 'music', label: '音乐', emoji: '🎵' },
] as const;

const works = ref<Book[]>([]);
const galaxyFilter = ref<'' | MediaType | 'resonance'>('');
const isRoam = ref(false);

onShow(() => {
  works.value = loadLocalWorks();
});

interface StarNode {
  id: number;
  book: Book;
  mediaType: MediaType;
  emoji: string;
  shortTitle: string;
  x: number;
  y: number;
  size: number;
  coreColor: string;
  glowColor: string;
}

const COLOR_MAP: Record<MediaType, { core: string; glow: string }> = {
  book: { core: '#3A6348', glow: 'rgba(58, 99, 72, 0.45)' },
  anime: { core: '#A855F7', glow: 'rgba(168, 85, 247, 0.45)' },
  movie: { core: '#38BDF8', glow: 'rgba(56, 189, 248, 0.45)' },
  game: { core: '#14B8A6', glow: 'rgba(20, 184, 166, 0.45)' },
  music: { core: '#EAB308', glow: 'rgba(234, 179, 8, 0.45)' },
};

// 确定性随机布点
const stars = computed<StarNode[]>(() => {
  let list = works.value;
  if (galaxyFilter.value && galaxyFilter.value !== 'resonance') {
    list = list.filter((b) => b.mediaType === galaxyFilter.value);
  }

  return list.map((b) => {
    const seed = (b.id * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const rnd2 = ((b.id * 4903 + 1717) % 104729) / 104729;
    const colors = COLOR_MAP[b.mediaType] || COLOR_MAP.book;
    const r = b.rating ?? 8.0;

    return {
      id: b.id,
      book: b,
      mediaType: b.mediaType,
      emoji: MEDIA_LABEL[b.mediaType]?.emoji || '✦',
      shortTitle: b.title.length > 7 ? b.title.slice(0, 6) + '…' : b.title,
      x: 10 + rnd * 76,
      y: 20 + rnd2 * 56,
      size: Math.round(18 + r * 2.5),
      coreColor: colors.core,
      glowColor: colors.glow,
    };
  });
});

// 星际连线：相同媒介或评分高作品之间建立共鸣网
const constellationLines = computed(() => {
  const pts = stars.value;
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; width: number }> = [];

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const p1 = pts[i];
      const p2 = pts[j];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      // 双生共鸣模式下，高分不同媒介作品之间拉起金色引力连线
      if (galaxyFilter.value === 'resonance') {
        if (p1.mediaType !== p2.mediaType && dist < 42) {
          lines.push({
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            color: '#F59E0B',
            width: 1.5,
          });
        }
      } else if (dist < 32 && (p1.mediaType === p2.mediaType || dist < 20)) {
        lines.push({
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: p1.coreColor,
          width: 1,
        });
      }
    }
  }
  return lines;
});

// 背景星尘
const stardust = Array.from({ length: 36 }).map((_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 97) + 1.5,
  y: ((i * 59 + 29) % 95) + 2,
  opacity: 0.2 + ((i % 5) * 0.15),
  scale: 0.5 + ((i % 3) * 0.4),
}));

const selectedStar = ref<StarNode | null>(null);

function selectStar(s: StarNode) {
  selectedStar.value = s;
}

function toggleRoam() {
  isRoam.value = !isRoam.value;
  uni.showToast({
    title: isRoam.value ? '已开启全景漫游视角' : '已恢复标准观星视角',
    icon: 'none',
  });
}

function openDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?id=${book.id}` });
}
</script>

<style>
/* 暗色页全局底色：覆盖 App.vue 浅色 page 背景，防止回弹露白 */
page {
  background: var(--rt-deep);
}

.galaxy-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: var(--rt-deep);
  overflow: hidden;
}

/* ── 深空画布 ── */
.sky-canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* 静态星尘 */
.stardust-point {
  position: absolute;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #ffffff;
  pointer-events: none;
}

/* 连线 SVG */
.constellation-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

/* 星辰节点 */
.star-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.star-node.active {
  transform: translate(-50%, -50%) scale(1.25);
  z-index: 20;
}

/* 外围光晕 */
.star-halo {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
  opacity: 0.8;
  animation: halo-pulse 3s ease-in-out infinite;
}

@keyframes halo-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 0.95; }
}

/* 核心星点 */
.star-core {
  position: relative;
  border-radius: 50%;
  box-shadow: 0 0 16rpx rgba(255, 255, 255, 0.8);
  border: 1.5rpx solid rgba(255, 255, 255, 0.9);
}

/* 浮动名签 */
.star-label {
  margin-top: 10rpx;
  padding: 4rpx 14rpx;
  border-radius: 14rpx;
  background: rgba(18, 22, 28, 0.85);
  border: 1.5rpx solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  white-space: nowrap;
  pointer-events: none;
}

.star-label-active {
  background: rgba(58, 99, 72, 0.9);
  border-color: rgba(168, 220, 180, 0.8);
}

.label-emoji {
  font-size: 20rpx;
  margin-right: 6rpx;
}

.label-text {
  color: #f1f3f5;
  font-size: 20rpx;
  font-family: serif;
}

/* ── 顶部半透明浮动面板 ── */
.top-nav-panel {
  position: absolute;
  top: 40rpx;
  left: 28rpx;
  right: 28rpx;
  background: rgba(26, 32, 44, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5rpx solid rgba(255, 255, 255, 0.12);
  border-radius: 36rpx;
  padding: 28rpx 30rpx 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.nav-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-title {
  color: #f7fafc;
  font-size: 36rpx;
  font-weight: bold;
  font-family: serif;
}

.nav-btn-fullscreen {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5rpx solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  font-size: 22rpx;
  font-weight: bold;
}

.nav-subtitle {
  display: block;
  color: #a0aec0;
  font-size: 22rpx;
  margin-top: 8rpx;
}

.filter-scroller {
  white-space: nowrap;
  margin-top: 18rpx;
}

.filter-chip {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5rpx solid rgba(255, 255, 255, 0.1);
  color: #cbd5e0;
  font-size: 22rpx;
  font-weight: bold;
}

.filter-chip.selected {
  background: var(--rt-accent);
  color: #ffffff;
  border-color: #4ade80;
  box-shadow: 0 0 16rpx rgba(74, 222, 128, 0.3);
}

/* ── 底部悬浮选中小微卡 ── */
.bottom-node-card {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(180rpx + env(safe-area-inset-bottom));
  background: rgba(26, 32, 44, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 36rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.6);
  z-index: 50;
  animation: slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.node-cover {
  width: 90rpx;
  height: 130rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
  background: #2d3748;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.4);
}

.node-cover-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.node-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.node-title {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  font-family: serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-meta {
  color: #a0aec0;
  font-size: 22rpx;
  margin-top: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-quote {
  color: #e2e8f0;
  font-size: 21rpx;
  font-style: italic;
  margin-top: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-node-detail {
  padding: 10rpx 26rpx;
  border-radius: 24rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  margin-left: 16rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 14rpx rgba(58, 99, 72, 0.4);
}
</style>
