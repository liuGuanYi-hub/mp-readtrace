<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <!-- 🌌 动态极光渐变与微胶片颗粒质感层 -->
    <view class="film-grain-overlay"></view>

    <!-- ═══ 第一屏 · 清爽记录台（正方形悬浮记录台，对齐 App P35 设计） ═══ -->
    <view class="first-screen-stage">
      <view class="header-panel">
        <!-- ✦ 眉标行：档案馆刊号感 -->
        <view class="mast-row">
          <text class="mast-caps">PERSONAL ARCHIVE · EST. 2026</text>
          <text class="issue-tag">VOL. I</text>
        </view>
        <view class="divider mt16"></view>

        <!-- 大标题行 -->
        <view class="title-row">
          <text class="home-title">阅痕 ReadTrace</text>
          <view class="theme-btn" @tap="toggleTheme">{{ isDark ? '🌙' : '☀️' }}</view>
        </view>
        <text class="home-subtitle">{{ circadian.emoji }} {{ circadian.label }} · {{ nowTime }} 四时自然光感校准</text>

        <!-- ✦ 五媒介藏品统计网格（正方形腹地：一览精神领土） -->
        <view class="arc-row">
          <view
            class="arc-item"
            v-for="m in ARC_MEDIA"
            :key="m.key"
            @tap="goLibraryWithMedia(m.key)"
          >
            <text class="arc-count">{{ countByMedia[m.key] || 0 }}</text>
            <text class="arc-label">{{ m.label }}</text>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 快速功能操作区（主按键独占 + 副按键等分一行） -->
        <view class="btn-add" @tap="goQuickLog">＋ 添加新作</view>
        <view class="sub-btn-row">
          <view class="btn-secondary flex1" @tap="showImportModal = true">📥 导入书单</view>
          <view class="btn-secondary flex1 gap" @tap="goProfile">📦 备份</view>
          <view class="btn-secondary flex1 gap" @tap="openTrash">🗑️ 回收站</view>
        </view>

        <!-- ✦ 页脚铭文行：项目理念常驻 -->
        <text class="inscription">— 记录看过的作品，也记录当时的自己 —</text>
      </view>
    </view>

    <!-- ═══ 第二屏下沉内容 ═══ -->

    <!-- 🌊 0. 无限流光跑马灯 (60fps 动态展示藏品金句) -->
    <view class="marquee-section" v-if="marqueeList.length">
      <InfiniteMarquee :items="marqueeList" />
    </view>

    <!-- 🌟 1. 今日焦点 · 破壁策展主位 (Hero Curatorial Bento Card) -->
    <view v-if="hero" class="hero-card" @tap="openDetail(hero)">
      <view class="hero-head">
        <view class="hero-badge-left">
          <text class="hero-editorial-badge">✦</text>
          <text class="hero-badge-title">🏛️ 策展主位</text>
        </view>
        <view class="status-pill">
          {{ MEDIA_LABEL[hero.mediaType]?.emoji }} {{ hero.category || MEDIA_LABEL[hero.mediaType]?.name }}
        </view>
      </view>

      <view class="hero-body">
        <view class="hero-cover-wrapper">
          <image v-if="hero.coverUrl" class="hero-cover" :src="hero.coverUrl" mode="aspectFill" />
          <view v-else class="hero-cover hero-ph">
            <text class="hero-ph-emoji">{{ MEDIA_LABEL[hero.mediaType]?.emoji }}</text>
          </view>
        </view>

        <view class="hero-info">
          <text class="hero-title">《{{ hero.title }}》</text>
          <text class="hero-author">{{ hero.author || '未知作者' }}</text>
          <view class="gold-badge" v-if="hero.rating">
            ★ {{ hero.rating.toFixed(1).replace(/\.0$/, '') }} · 精神珍藏
          </view>
          <view class="gold-badge" v-else>
            ✦ 重点策展推荐
          </view>
          <text class="hero-quote-snippet" v-if="hero.shortComment">
            “{{ hero.shortComment }}”
          </text>
        </view>
      </view>

      <view class="hero-actions">
        <view class="btn-primary flex1" @tap.stop="openDetail(hero)">📖 沉浸检视印记</view>
        <view class="btn-secondary hero-detail-btn" @tap.stop="openDetail(hero)">✦ 详细档案</view>
      </view>
    </view>

    <!-- 💎 2. 单行 44dp 晶体工坊微胶囊 (Crystal Workshop Capsules) -->
    <scroll-view scroll-x class="capsule-scroller" enhanced :show-scrollbar="false">
      <view
        v-for="(c, i) in capsules"
        :key="c.title"
        class="capsule"
        :class="{ dark: i === 0 }"
        @tap="onCapsuleTap(c)"
      >
        <text class="capsule-emoji">{{ c.emoji }}</text>
        <text class="capsule-title">{{ c.title }}</text>
      </view>
    </scroll-view>

    <!-- 📜 3. 羊皮纸灵感便签横幅 (Parchment Quote Ribbon) -->
    <view class="parchment-ribbon">
      <view class="pr-head">
        <text class="pr-title">📜 灵感随想 · 羊皮纸笺</text>
        <view class="pr-refresh" @tap="rotateQuote">🔄 换一句</view>
      </view>
      <text class="pr-quote">“{{ currentQuote.text }}”</text>
      <text class="pr-source">—— {{ currentQuote.source }}</text>
    </view>

    <!-- 💖 4. 我的最爱 · 心选展厅横滑流 (Curator Favorites strip) -->
    <view class="fav-section" v-if="favWorks.length">
      <view class="fav-head">
        <text class="fav-title">💖 我的最爱 · 心选展厅</text>
        <view class="fav-all" @tap="goLibraryAll">全部 ➔</view>
      </view>
      <scroll-view scroll-x class="fav-scroller" enhanced :show-scrollbar="false">
        <view
          v-for="(fav, idx) in favWorks"
          :key="fav.id"
          class="fav-card"
          @tap="openDetail(fav)"
        >
          <image v-if="fav.coverUrl" class="fav-cover" :src="fav.coverUrl" mode="aspectFill" />
          <view v-else class="fav-cover fav-ph">
            <text>{{ MEDIA_LABEL[fav.mediaType]?.emoji }}</text>
          </view>
          <view class="fav-badge">#{{ idx + 1 }}</view>
          <text class="fav-book-title">{{ fav.title }}</text>
          <text class="fav-rating">★ {{ fav.rating || '-' }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 📊 5. 文化印记总览面板 (Insight Panel) -->
    <view class="insight-panel">
      <view class="insight-head">
        <text class="insight-title">✨ 文化印记总览</text>
        <text v-if="avgRating" class="insight-avg">均分 ★ {{ avgRating }}</text>
      </view>
      <view class="insight-stats">
        <view class="stat-col" @tap="goLibraryAll">
          <text class="stat-num">{{ works.length }}</text>
          <text class="stat-label">总藏品</text>
        </view>
        <view class="stat-col" @tap="goLibraryWithStatus('reading')">
          <text class="stat-num">{{ countByStatus('reading') }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-col" @tap="goLibraryWithStatus('finished')">
          <text class="stat-num">{{ countByStatus('finished') }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-col" @tap="goLibraryWithStatus('wishlist')">
          <text class="stat-num gold">{{ countByStatus('wishlist') }}</text>
          <text class="stat-label">想看</text>
        </view>
      </view>
    </view>

    <!-- 🕰️ 6. 时光深处的印记 · 那年今日 (Memory Flashback) -->
    <view v-if="memory" class="memory-panel" @tap="openDetail(memory)">
      <view class="mem-head">
        <text class="mem-title">{{ memoryTitleText }}</text>
        <view class="status-pill">
          {{ MEDIA_LABEL[memory.mediaType]?.emoji }} {{ MEDIA_LABEL[memory.mediaType]?.name }}
        </view>
        <text class="mem-arrow">➔</text>
      </view>
      <view class="mem-body">
        <image v-if="memory.coverUrl" class="mem-cover" :src="memory.coverUrl" mode="aspectFill" />
        <view v-else class="mem-cover mem-ph">
          <text class="mem-ph-emoji">{{ MEDIA_LABEL[memory.mediaType]?.emoji }}</text>
        </view>
        <view class="mem-info">
          <text class="mem-book-title">《{{ memory.title }}》</text>
          <text class="mem-book-meta">
            {{ memory.author || '未知作者' }}
            <template v-if="memory.rating"> · ★ {{ memory.rating.toFixed(1).replace(/\.0$/, '') }}</template>
          </text>
          <view v-if="memory.shortComment" class="mem-quote-strip">
            “{{ memory.shortComment }}”
          </view>
        </view>
      </view>
    </view>

    <!-- 导入预置藏品清单对话框 -->
    <view class="modal-mask" v-if="showImportModal" @tap.self="showImportModal = false">
      <view class="modal-dialog">
        <view class="modal-header">
          <text class="modal-title">📥 批量导入精神清单</text>
          <view class="modal-close" @tap="showImportModal = false">✕</view>
        </view>
        <text class="modal-subtitle">从美术馆典藏库中快速导入精选作品，开启跨媒介漫游</text>

        <view class="modal-list">
          <view class="modal-item" @tap="importPresetAll">
            <text class="item-main">🌟 一键合入典藏神作 (10 部)</text>
            <text class="item-sub">涵盖文学、机战、奇幻、硬科幻与开放世界</text>
          </view>
          <view class="modal-item" @tap="importPresetCategory('book')">
            <text class="item-main">📚 名著经典书单 (《小王子》《百年孤独》《三体》)</text>
            <text class="item-sub">深度哲学思辨与文学史诗</text>
          </view>
          <view class="modal-item" @tap="importPresetCategory('anime')">
            <text class="item-main">🌸 追番神作集 (《EVA 终》《芙莉莲》)</text>
            <text class="item-sub">意识流哲思与时光治愈</text>
          </view>
          <view class="modal-item" @tap="importPresetCategory('game')">
            <text class="item-main">🎮 殿堂级游戏 (《王国之泪》《艾尔登法环》)</text>
            <text class="item-sub">交互设计与宏大史诗神作</text>
          </view>
        </view>
      </view>
    </view>

    <TabBar :active="0" />
  </scroll-view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import type { Book, MediaType } from '../../utils/models';
import { MEDIA_LABEL } from '../../utils/models';
import { loadLocalWorks, saveLocalWorks, importPresetCatalog } from '../../utils/sync';
import { PRESET_BOOKS } from '../../utils/preset-data';
import TabBar from '../../components/TabBar.vue';
import InfiniteMarquee from '../../components/InfiniteMarquee.vue';

const ARC_MEDIA = [
  { key: 'book', label: '📚 书籍' },
  { key: 'anime', label: '🌸 动画' },
  { key: 'movie', label: '🎬 电影' },
  { key: 'game', label: '🎮 游戏' },
  { key: 'music', label: '🎵 音乐' },
] as const;

const isDark = ref(false);
function toggleTheme() {
  isDark.value = !isDark.value;
  uni.showToast({
    title: isDark.value ? '已开启暗夜星辉模式' : '已恢复白昼正午光感',
    icon: 'none',
  });
}

// 与 CircadianLightingEngine 同构：6-8 晨曦薄雾 / 9-16 白昼正午 / 17-19 落日紫霞 / 其余 子夜星河
const circadian = computed(() => {
  const h = new Date().getHours();
  if (h >= 6 && h <= 8) return { emoji: '🌅', label: '晨曦薄雾' };
  if (h >= 9 && h <= 16) return { emoji: '☀️', label: '白昼正午' };
  if (h >= 17 && h <= 19) return { emoji: '🌆', label: '落日紫霞' };
  return { emoji: '🌌', label: '子夜星河' };
});

const nowTime = computed(() => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
});

const capsules = [
  { emoji: '✨', title: '精神探索', route: '/pages/constellation/index' },
  { emoji: '⏳', title: '伴读钟', toast: '伴读钟：进入深度心流专注阅读' },
  { emoji: '📻', title: '声学磁带', route: '/pages/memoir/index' },
  { emoji: '🎴', title: '文化通行证', route: '/pages/profile/index' },
  { emoji: '📜', title: '时光画卷', route: '/pages/memoir/index' },
  { emoji: '🌌', title: '心智拓扑', route: '/pages/constellation/index' },
  { emoji: '🗂️', title: '年度编年史', route: '/pages/memoir/index' },
];

function onCapsuleTap(c: any) {
  if (c.route) {
    uni.redirectTo({ url: c.route });
  } else {
    uni.showToast({ title: c.toast || c.title, icon: 'none' });
  }
}

const QUOTES = [
  { text: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。', source: '《百年孤独》· 加西亚·马尔克斯' },
  { text: '正是你花费在玫瑰上的时间，才使得你的玫瑰变得如此重要。', source: '《小王子》· 圣埃克苏佩里' },
  { text: '给岁月以文明，而不是给文明以岁月。', source: '《三体》· 刘慈欣' },
  { text: '再见了，所有的福音战士。向着没有EVA的真实世界迈出脚步。', source: '《新世纪福音战士：终》· 庵野秀明' },
  { text: '所谓冒险，就是当你蓦然回首时，那段微不足道的旅程早已照亮了整个人生。', source: '《葬送的芙莉莲》· 山田钟人' },
  { text: '爱是一种力量，能超越时空维度。不要温和地走进那个良夜。', source: '《星际穿越》· 诺兰' },
  { text: '满地都是六便士，他却抬头看见了月亮。', source: '《月亮与六便士》· 毛姆' },
];
const quoteIndex = ref(0);
const currentQuote = computed(() => QUOTES[quoteIndex.value % QUOTES.length]);
function rotateQuote() {
  quoteIndex.value = (quoteIndex.value + 1) % QUOTES.length;
}

const works = ref<Book[]>([]);
onShow(() => {
  works.value = loadLocalWorks();
});

const countByMedia = computed(() => {
  const map: Record<string, number> = { book: 0, anime: 0, movie: 0, game: 0, music: 0 };
  works.value.forEach((b) => {
    map[b.mediaType] = (map[b.mediaType] || 0) + 1;
  });
  return map;
});

function countByStatus(status: string) {
  return works.value.filter((b) => b.status === status).length;
}

const avgRating = computed(() => {
  const rated = works.value.filter((b) => b.rating !== null);
  if (!rated.length) return '';
  return (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length).toFixed(1);
});

// 今日焦点：按评分与更新时间挑选最顶级策展作
const hero = computed(() => {
  if (!works.value.length) return null;
  return [...works.value].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
});

// 心选展厅：高分作品（≥9.5 或评分最高前 8 部）
const favWorks = computed(() => {
  return [...works.value]
    .filter((b) => b.rating !== null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);
});

// 跑马灯列表
const marqueeList = computed(() => {
  return works.value
    .filter((b) => b.shortComment || b.title)
    .map((b) => ({
      title: `《${b.title}》`,
      quote: b.shortComment || undefined,
    }));
});

// 那年今日：完结作品或首批经典
const memory = computed(() => {
  const today = new Date();
  const md = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const exact = works.value.find((b) => b.finishDate && b.finishDate.slice(5) === md);
  if (exact) return exact;
  // 若今日无完结，回退展示已完结最高分的一部作为回忆唤醒
  return works.value.find((b) => b.status === 'finished') || null;
});

const memoryTitleText = computed(() => {
  if (!memory.value) return '';
  return '🕰️ 那年今日 · 时光印记';
});

// 批量导入预设对话框
const showImportModal = ref(false);

function importPresetAll() {
  const count = importPresetCatalog();
  works.value = loadLocalWorks();
  showImportModal.value = false;
  uni.showToast({ title: `已成功合入 ${count} 部典藏`, icon: 'none' });
}

function importPresetCategory(cat: MediaType) {
  const current = loadLocalWorks();
  const existingTitles = new Set(current.map((b) => b.title.trim()));
  const matches = PRESET_BOOKS.filter((b) => b.mediaType === cat && !existingTitles.has(b.title.trim()));
  matches.forEach((b) => current.push(b));
  saveLocalWorks(current);
  works.value = current;
  showImportModal.value = false;
  uni.showToast({ title: `已添加 ${matches.length} 部${MEDIA_LABEL[cat].name}`, icon: 'none' });
}

function goQuickLog() {
  uni.navigateTo({ url: '/pages/quick-log/index' });
}

function openDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?id=${book.id}` });
}

function goProfile() {
  uni.redirectTo({ url: '/pages/profile/index' });
}

function goLibraryAll() {
  uni.redirectTo({ url: '/pages/library/index' });
}

function goLibraryWithMedia(m: string) {
  uni.redirectTo({ url: `/pages/library/index?media=${m}` });
}

function goLibraryWithStatus(s: string) {
  uni.redirectTo({ url: `/pages/library/index?status=${s}` });
}

function openTrash() {
  uni.showToast({ title: '回收站暂无归档作品', icon: 'none' });
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 260rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #E8F2EC 0%, #F8F7F4 22%, #F8F7F4 75%, #E2EEF4 100%);
  position: relative;
}

.film-grain-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, transparent 80%, rgba(0, 0, 0, 0.02) 100%);
}

.flex1 { flex: 1; }
.gap { margin-left: 16rpx; }
.mt16 { margin-top: 16rpx; }
.divider { height: 1.5rpx; background: rgba(0, 0, 0, 0.07); }

/* ── 第一屏正方形记录台（P35 艺术馆舞台居中感）── */
.first-screen-stage {
  padding-top: 20rpx;
  margin-bottom: 24rpx;
}

.header-panel {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 44rpx;
  padding: 36rpx;
  box-shadow: 0 16rpx 44rpx rgba(0, 0, 0, 0.06);
  border: 1.6rpx solid rgba(0, 0, 0, 0.06);
}

.mast-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mast-caps {
  color: #686e64;
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 3rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.issue-tag {
  color: #9e7638;
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 3rpx;
}

.title-row {
  display: flex;
  align-items: center;
  margin-top: 28rpx;
}

.home-title {
  flex: 1;
  color: #1a1c19;
  font-size: 58rpx;
  font-weight: bold;
  font-family: serif;
  letter-spacing: 2rpx;
}

.theme-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ffffff;
  font-size: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-subtitle {
  display: block;
  color: #686e64;
  font-size: 24rpx;
  line-height: 1.5;
  margin-top: 10rpx;
}

/* 五媒介网格 */
.arc-row {
  display: flex;
  margin-top: 40rpx;
  margin-bottom: 32rpx;
}

.arc-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s ease;
}

.arc-item:active {
  transform: scale(0.95);
}

.arc-count {
  color: #1a1c19;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.arc-label {
  color: #686e64;
  font-size: 21rpx;
  margin-top: 4rpx;
}

/* 操作按键 */
.btn-add {
  margin-top: 28rpx;
  height: 92rpx;
  border-radius: 32rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 28rpx rgba(58, 99, 72, 0.32);
  transition: transform 0.15s ease;
}

.btn-add:active {
  transform: scale(0.98);
}

.sub-btn-row {
  display: flex;
  margin-top: 18rpx;
}

.btn-secondary {
  height: 80rpx;
  border-radius: 28rpx;
  background: #ffffff;
  color: #1a1c19;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.05);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.btn-secondary:active {
  transform: scale(0.96);
}

.inscription {
  display: block;
  color: #686e64;
  font-size: 21rpx;
  letter-spacing: 2rpx;
  font-family: serif;
  text-align: center;
  margin-top: 26rpx;
}

/* 跑马灯 */
.marquee-section {
  margin-top: 12rpx;
  margin-bottom: 24rpx;
}

/* ── 破壁策展主位 ── */
.hero-card {
  margin-top: 16rpx;
  padding: 34rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 2rpx solid rgba(58, 99, 72, 0.16);
  border-radius: 46rpx;
  box-shadow: 0 12rpx 36rpx rgba(58, 99, 72, 0.08);
}

.hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-badge-left {
  display: flex;
  align-items: center;
}

.hero-editorial-badge {
  color: #9e7638;
  font-size: 22rpx;
  margin-right: 8rpx;
}

.hero-badge-title {
  color: #3a6348;
  font-size: 25rpx;
  font-weight: bold;
  font-family: serif;
  letter-spacing: 1rpx;
}

.status-pill {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #ece7de;
  border: 1.5rpx solid rgba(58, 99, 72, 0.2);
  color: #3a6348;
  font-size: 21rpx;
  font-weight: bold;
}

.hero-body {
  display: flex;
  align-items: flex-start;
  margin-top: 24rpx;
}

.hero-cover-wrapper {
  margin-top: -12rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.hero-cover {
  width: 156rpx;
  height: 232rpx;
  border-radius: 26rpx;
  box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.16);
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  background: #eae2d5;
}

.hero-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-ph-emoji {
  font-size: 56rpx;
}

.hero-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.hero-title {
  color: #1a1c19;
  font-size: 38rpx;
  font-weight: bold;
  font-family: serif;
  line-height: 1.3;
}

.hero-author {
  color: #686e64;
  font-size: 24rpx;
  font-family: serif;
  margin-top: 8rpx;
}

.gold-badge {
  align-self: flex-start;
  margin-top: 12rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(158, 118, 56, 0.1);
  border: 1.5rpx solid rgba(158, 118, 56, 0.35);
  color: #9e7638;
  font-size: 21rpx;
  font-weight: bold;
}

.hero-quote-snippet {
  margin-top: 14rpx;
  color: #444840;
  font-size: 22rpx;
  line-height: 1.5;
  font-style: italic;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.hero-actions {
  display: flex;
  margin-top: 26rpx;
}

.btn-primary {
  height: 76rpx;
  border-radius: 32rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 25rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(58, 99, 72, 0.25);
}

.hero-detail-btn {
  flex-shrink: 0;
  margin-left: 16rpx;
  padding: 0 28rpx;
  height: 76rpx;
}

/* ── 晶体工坊微胶囊 ── */
.capsule-scroller {
  white-space: nowrap;
  margin-top: 24rpx;
}

.capsule {
  display: inline-flex;
  align-items: center;
  height: 80rpx;
  padding: 0 26rpx;
  margin-right: 16rpx;
  background: #ece7de;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
  transition: transform 0.15s ease;
}

.capsule:active {
  transform: scale(0.95);
}

.capsule.dark {
  background: #3a6348;
  border-color: rgba(58, 99, 72, 0.6);
}

.capsule-emoji {
  font-size: 28rpx;
}

.capsule-title {
  color: #1a1c19;
  font-size: 24rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.capsule.dark .capsule-title {
  color: #ffffff;
}

/* ── 羊皮纸便签 ── */
.parchment-ribbon {
  margin-top: 24rpx;
  padding: 30rpx;
  background: #f6f1e8;
  border: 2rpx solid rgba(140, 110, 74, 0.18);
  border-radius: 36rpx;
  box-shadow: 0 8rpx 24rpx rgba(140, 110, 74, 0.06);
}

.pr-head {
  display: flex;
  align-items: center;
}

.pr-title {
  flex: 1;
  color: #1a1c19;
  font-size: 25rpx;
  font-weight: bold;
  font-family: serif;
  letter-spacing: 1rpx;
}

.pr-refresh {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  color: #1a1c19;
  font-size: 21rpx;
  font-weight: bold;
}

.pr-quote {
  display: block;
  color: #1a1c19;
  font-size: 27rpx;
  line-height: 1.65;
  margin-top: 14rpx;
}

.pr-source {
  display: block;
  color: #686e64;
  font-size: 22rpx;
  font-style: italic;
  font-family: serif;
  text-align: right;
  margin-top: 10rpx;
}

/* ── 心选展厅横滑带 ── */
.fav-section {
  margin-top: 24rpx;
}

.fav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 4rpx;
}

.fav-title {
  color: #1a1c19;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}

.fav-all {
  color: #3a6348;
  font-size: 22rpx;
  font-weight: bold;
}

.fav-scroller {
  white-space: nowrap;
  margin-top: 14rpx;
}

.fav-card {
  display: inline-flex;
  flex-direction: column;
  width: 170rpx;
  margin-right: 18rpx;
  position: relative;
  vertical-align: top;
}

.fav-cover {
  width: 170rpx;
  height: 240rpx;
  border-radius: 22rpx;
  background: #eae2d5;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.fav-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.fav-badge {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  background: rgba(158, 118, 56, 0.9);
  color: #ffffff;
  font-size: 18rpx;
  font-weight: bold;
  padding: 2rpx 10rpx;
  border-radius: 12rpx;
}

.fav-book-title {
  color: #1a1c19;
  font-size: 23rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fav-rating {
  color: #9e7638;
  font-size: 20rpx;
  font-weight: bold;
}

/* ── 文化印记总览 ── */
.insight-panel {
  margin-top: 24rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.88);
  border: 1.6rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 36rpx;
}

.insight-head {
  display: flex;
  align-items: center;
}

.insight-title {
  flex: 1;
  color: #1a1c19;
  font-size: 28rpx;
  font-weight: bold;
}

.insight-avg {
  color: #3a6348;
  font-size: 24rpx;
  font-weight: bold;
}

.insight-stats {
  display: flex;
  margin-top: 22rpx;
}

.stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  color: #1a1c19;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.stat-num.gold {
  color: #9e7638;
}

.stat-label {
  color: #686e64;
  font-size: 22rpx;
  margin-top: 4rpx;
}

/* ── 那年今日 ── */
.memory-panel {
  margin-top: 24rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1.6rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
}

.mem-head {
  display: flex;
  align-items: center;
}

.mem-title {
  flex: 1;
  color: #3a6348;
  font-size: 24rpx;
  font-weight: bold;
  font-family: serif;
  letter-spacing: 1rpx;
}

.mem-arrow {
  color: #686e64;
  font-size: 22rpx;
  margin-left: 10rpx;
}

.mem-body {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.mem-cover {
  width: 110rpx;
  height: 160rpx;
  border-radius: 22rpx;
  flex-shrink: 0;
  margin-right: 24rpx;
  background: #eae2d5;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
}

.mem-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mem-ph-emoji {
  font-size: 40rpx;
}

.mem-info {
  flex: 1;
  min-width: 0;
}

.mem-book-title {
  color: #1a1c19;
  font-size: 29rpx;
  font-weight: bold;
  font-family: serif;
}

.mem-book-meta {
  display: block;
  color: #686e64;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.mem-quote-strip {
  margin-top: 10rpx;
  padding: 10rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(248, 247, 244, 0.85);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  color: #1a1c19;
  font-size: 22rpx;
  line-height: 1.5;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── 导入预置弹窗 ── */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: #1a1c19;
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.modal-close {
  color: #686e64;
  font-size: 32rpx;
  padding: 8rpx;
}

.modal-subtitle {
  display: block;
  color: #686e64;
  font-size: 22rpx;
  margin-top: 8rpx;
  margin-bottom: 24rpx;
}

.modal-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.modal-item {
  padding: 22rpx;
  background: #f8f7f4;
  border-radius: 24rpx;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease;
}

.modal-item:active {
  transform: scale(0.98);
  background: #ede9e1;
}

.item-main {
  color: #1a1c19;
  font-size: 26rpx;
  font-weight: bold;
}

.item-sub {
  color: #686e64;
  font-size: 21rpx;
  margin-top: 4rpx;
}
</style>
