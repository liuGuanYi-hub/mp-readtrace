<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <!-- 顶部 Header 面板（对齐 App fragment_memoir.xml） -->
    <view class="header-panel">
      <text class="page-title">🎟️ 纪念创享工坊</text>
      <text class="page-subtitle">
        将每一次阅读、追番、观影与通关化为可触摸的实体感纪念卡片、藏书票与护照印章
      </text>
      <view class="section-divider"></view>
      <view class="section-head">
        <text class="section-head-title">🛂 典藏护照与实体工坊</text>
        <text class="section-head-tag">8 大工坊模式就绪</text>
      </view>
    </view>

    <!-- 8 大实体工坊卡片墙 -->
    <view class="cards-list">
      <view
        v-for="card in memoirCards"
        :key="card.key"
        class="memoir-card"
        @tap="openWorkshop(card)"
      >
        <view class="mc-head">
          <view class="mc-title-left">
            <text class="mc-emoji">{{ card.emoji }}</text>
            <text class="mc-title">{{ card.title }}</text>
          </view>
          <view class="mc-badge" :class="{ green: card.green }">{{ card.badge }}</view>
        </view>

        <text class="mc-desc">{{ card.desc }}</text>

        <view class="mc-tags">
          <view v-for="t in card.tags" :key="t" class="mc-tag">{{ t }}</view>
        </view>
      </view>
    </view>

    <!-- ═══ 实体拟物工坊交互弹窗（直接在小程序体验 App 级拟物感） ═══ -->
    <view class="workshop-modal-mask" v-if="activeModal" @tap.self="activeModal = null">
      <!-- 1. 透光票根弹窗 -->
      <view v-if="activeModal === 'ticket'" class="ticket-container">
        <view class="ticket-card">
          <view class="ticket-header">
            <text class="th-cinema">READTRACE CINEMA 🏛️</text>
            <text class="th-seat">SEAT 07排08座</text>
          </view>
          <view class="ticket-body">
            <image class="ticket-poster" :src="sampleMovie.coverUrl" mode="aspectFill" />
            <view class="ticket-details">
              <text class="t-movie-title">{{ sampleMovie.title }}</text>
              <text class="t-movie-director">导演: {{ sampleMovie.author }}</text>
              <text class="t-movie-rating">★ {{ sampleMovie.rating }} 影史殿堂</text>
              <text class="t-movie-date">观影记录: 2026.06.15 20:30</text>
            </view>
          </view>
          <view class="ticket-tear-line">
            <view class="tear-notch left"></view>
            <view class="tear-dashed"></view>
            <view class="tear-notch right"></view>
          </view>
          <view class="ticket-footer">
            <text class="t-quote">“{{ sampleMovie.shortComment }}”</text>
            <text class="t-barcode">||| | ||||| || |||| |||| ||| ||||</text>
          </view>
        </view>
        <view class="modal-btn-close" @tap="activeModal = null">收起票根</view>
      </view>

      <!-- 2. 火漆藏书票工坊弹窗 -->
      <view v-else-if="activeModal === 'exlibris'" class="exlibris-container">
        <view class="exlibris-card">
          <view class="el-border">
            <text class="el-top-label">EX LIBRIS · 阅痕典藏</text>
            <text class="el-serial">NO. 2026-001</text>
            <view class="el-wax-stamp">
              <text class="el-wax-text">阅</text>
            </view>
            <text class="el-title">《{{ sampleBook.title }}》</text>
            <text class="el-author">作者：{{ sampleBook.author }}</text>
            <text class="el-motto">“正因为你为你的玫瑰花费了时间，这才使你的玫瑰变得如此重要。”</text>
            <text class="el-foot">SWISS TYPOGRAPHIC SPECIMEN</text>
          </view>
        </view>
        <view class="modal-btn-close" @tap="activeModal = null">盖印完成</view>
      </view>

      <!-- 3. Hi-Res 拟真黑胶唱机弹窗 -->
      <view v-else-if="activeModal === 'vinyl'" class="vinyl-container">
        <view class="vinyl-shell">
          <view class="vinyl-disc rotating">
            <view class="vinyl-groove g1"></view>
            <view class="vinyl-groove g2"></view>
            <view class="vinyl-label-center">
              <image class="vinyl-art" :src="sampleMusic.coverUrl" mode="aspectFill" />
            </view>
          </view>
          <view class="vinyl-tonearm"></view>
          <view class="vinyl-meta">
            <text class="vm-title">{{ sampleMusic.title }}</text>
            <text class="vm-artist">{{ sampleMusic.author }} · 33 1/3 RPM</text>
            <text class="vm-status">● 正在沉浸播放 528Hz 治愈声场</text>
          </view>
        </view>
        <view class="modal-btn-close" @tap="activeModal = null">停止播放</view>
      </view>

      <!-- 4. 精神巡礼护照盖章簿弹窗 -->
      <view v-else-if="activeModal === 'passport'" class="passport-container">
        <view class="passport-book">
          <view class="passport-page-left">
            <text class="pp-country">READTRACE PASSPORT</text>
            <view class="pp-emblem">🛂</view>
            <text class="pp-name">持照策展人：ZZD</text>
            <text class="pp-meta">签发地：海拉鲁 / 马孔多 / 第三村</text>
          </view>
          <view class="passport-page-right">
            <view class="visa-stamp s1">
              <text class="vs-title">🌸 追番入境签证</text>
              <text class="vs-meta">新世纪福音战士：终</text>
              <text class="vs-date">2026.05.02 PASSED</text>
            </view>
            <view class="visa-stamp s2">
              <text class="vs-title">🎮 白金通关戳印</text>
              <text class="vs-meta">塞尔达传说：王国之泪</text>
              <text class="vs-date">2026.03.28 PLATINUM</text>
            </view>
          </view>
        </view>
        <view class="modal-btn-close" @tap="activeModal = null">合上护照</view>
      </view>
    </view>

    <!-- 底部导航 -->
    <TabBar :active="3" />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabBar from '../../components/TabBar.vue';

const memoirCards = [
  {
    key: 'passport',
    emoji: '🛂',
    title: '精神巡礼护照盖章簿',
    badge: '打开护照 →',
    green: true,
    desc: '深蓝烫金首页 · 72 部番剧入境签证 · 69 款游戏白金戳印',
    tags: ['🌸 追番入境签证', '🎮 白金通关戳印'],
  },
  {
    key: 'exlibris',
    emoji: '📜',
    title: '典藏藏书票工坊',
    badge: '印章工坊 →',
    green: true,
    desc: '瑞士网格版式 · 生成式火漆藏书票 · 经典版画与藏书印鉴',
    tags: ['✒️ EX-LIBRIS #001', '🏛️ 瑞士网格排版'],
  },
  {
    key: 'ticket',
    emoji: '🎫',
    title: '复古电影透光票根',
    badge: '一键生成',
    green: false,
    desc: '16:9 双联撕票打孔票根 · 影史评分 · 经典名台词合璧海报',
    tags: ['🎞️ SEAT: 07排08座', '🎬 光影放映厅'],
  },
  {
    key: 'vinyl',
    emoji: '💿',
    title: 'Hi-Res 拟真黑胶唱机',
    badge: '黑胶唱机',
    green: false,
    desc: '拟真黑胶唱臂与律动音频粒子 · 模拟黑胶唱针微光 · 治愈沉浸',
    tags: ['🎵 33 1/3 RPM 声场', '✨ 律动粒子'],
  },
  {
    key: 'cartridge',
    emoji: '🕹️',
    title: '游戏白金全息卡带',
    badge: '典藏卡带',
    green: false,
    desc: '3:4 实体卡带盒 · 赛博光泽与白金印记 · 4 款典藏材质',
    tags: ['🏆 白金神作', '📀 全息印记'],
  },
  {
    key: 'resonance',
    emoji: '🌌',
    title: '跨界媒介共鸣记忆锁',
    badge: '1:1 合璧',
    green: false,
    desc: '《百年孤独》⇋《EVA》等同屏双星六维心智雷达与名台词合璧微卡',
    tags: ['✨ 96% 思想共鸣', '🧭 灵魂双生'],
  },
  {
    key: 'chronicle',
    emoji: '📜',
    title: '番剧编年全景长卷',
    badge: '⏳ 编年时光',
    green: false,
    desc: '纵览全景追番史 · 和纸材质 · 1080P 超清全景长图导出',
    tags: ['📺 全景追番史', '👘 和纸工艺'],
  },
  {
    key: 'gallery',
    emoji: '🖼️',
    title: '全屏纯净封面画廊',
    badge: '壁纸流',
    green: false,
    desc: '磁吸滑动封面流 · 动态环境光晕 · 沉浸纯净视觉',
    tags: ['🎨 封面艺术墙', '🌟 4K 原生画质'],
  },
];

const activeModal = ref<string | null>(null);

const sampleMovie = {
  title: '奥本海默',
  author: '克里斯托弗·诺兰',
  rating: 9.5,
  coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
  shortComment: '我现在成了死神，世界的毁灭者。链式反应从未停止。',
};

const sampleBook = {
  title: '小王子',
  author: '圣埃克苏佩里',
};

const sampleMusic = {
  title: 'One Last Kiss',
  author: '宇多田光',
  coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
};

function openWorkshop(card: any) {
  if (['ticket', 'exlibris', 'vinyl', 'passport'].includes(card.key)) {
    activeModal.value = card.key;
  } else {
    uni.showToast({
      title: `${card.title} 模组已就绪，将在下一版本完整开放长图渲染`,
      icon: 'none',
    });
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f8f7f4;
  padding: 24rpx 28rpx 260rpx;
  box-sizing: border-box;
}

/* ── 顶部 Header ── */
.header-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 40rpx;
  padding: 34rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.page-title {
  display: block;
  color: #1a1c19;
  font-size: 46rpx;
  font-weight: bold;
  font-family: serif;
}

.page-subtitle {
  display: block;
  color: #686e64;
  font-size: 24rpx;
  line-height: 1.6;
  margin-top: 12rpx;
}

.section-divider {
  height: 1.5rpx;
  background: rgba(0, 0, 0, 0.06);
  margin-top: 24rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}

.section-head-title {
  color: #1a1c19;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}

.section-head-tag {
  color: #9e7638;
  font-size: 21rpx;
  font-weight: bold;
}

/* ── 工坊卡片列表 ── */
.cards-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.memoir-card {
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 36rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}

.memoir-card:active {
  transform: scale(0.99);
}

.mc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mc-title-left {
  display: flex;
  align-items: center;
}

.mc-emoji {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.mc-title {
  color: #1a1c19;
  font-size: 30rpx;
  font-weight: bold;
}

.mc-badge {
  padding: 8rpx 22rpx;
  border-radius: 26rpx;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.09);
  color: #1a1c19;
  font-size: 22rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.mc-badge.green {
  background: #3a6348;
  border-color: #3a6348;
  color: #ffffff;
}

.mc-desc {
  display: block;
  color: #686e64;
  font-size: 23rpx;
  line-height: 1.6;
  margin-top: 14rpx;
}

.mc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.mc-tag {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background: #ece7de;
  color: #4c4a45;
  font-size: 20rpx;
}

/* ── 拟物工坊弹窗通用容器 ── */
.workshop-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 12, 16, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-btn-close {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 1.5rpx solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}

/* 1. 复古透光票根 */
.ticket-card {
  width: 100%;
  max-width: 620rpx;
  background: #fdfbf7;
  border-radius: 28rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 2rpx solid #e0d8c8;
}

.ticket-header {
  background: #1a1c19;
  padding: 20rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.th-cinema {
  color: #d4af37;
  font-size: 22rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.th-seat {
  color: #ffffff;
  font-size: 20rpx;
}

.ticket-body {
  padding: 28rpx;
  display: flex;
  align-items: center;
}

.ticket-poster {
  width: 140rpx;
  height: 200rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.ticket-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.t-movie-title {
  color: #1a1c19;
  font-size: 36rpx;
  font-weight: bold;
  font-family: serif;
}

.t-movie-director {
  color: #686e64;
  font-size: 22rpx;
  margin-top: 6rpx;
}

.t-movie-rating {
  color: #9e7638;
  font-size: 24rpx;
  font-weight: bold;
  margin-top: 8rpx;
}

.t-movie-date {
  color: #8c887e;
  font-size: 20rpx;
  margin-top: 6rpx;
}

.ticket-tear-line {
  position: relative;
  height: 28rpx;
  display: flex;
  align-items: center;
}

.tear-notch {
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(10, 12, 16, 0.75);
}

.tear-notch.left { left: -16rpx; }
.tear-notch.right { right: -16rpx; }

.tear-dashed {
  flex: 1;
  height: 2rpx;
  border-bottom: 2rpx dashed #d5ccbe;
  margin: 0 24rpx;
}

.ticket-footer {
  padding: 24rpx 28rpx 28rpx;
  display: flex;
  flex-direction: column;
}

.t-quote {
  color: #4a463e;
  font-size: 22rpx;
  font-style: italic;
  line-height: 1.5;
}

.t-barcode {
  color: #1a1c19;
  font-size: 24rpx;
  letter-spacing: 6rpx;
  text-align: center;
  margin-top: 16rpx;
}

/* 2. 火漆藏书票 */
.exlibris-card {
  width: 100%;
  max-width: 580rpx;
  background: #fcf8f0;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
}

.el-border {
  border: 2.5rpx solid #8c6e4a;
  border-radius: 12rpx;
  padding: 36rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.el-top-label {
  color: #8c6e4a;
  font-size: 22rpx;
  letter-spacing: 6rpx;
  font-weight: bold;
}

.el-serial {
  color: #a8957c;
  font-size: 18rpx;
  margin-top: 4rpx;
}

.el-wax-stamp {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #9e2a2b;
  border: 4rpx solid #bd3a3c;
  box-shadow: 0 6rpx 16rpx rgba(158, 42, 43, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24rpx 0;
}

.el-wax-text {
  color: #fff;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
}

.el-title {
  color: #1a1c19;
  font-size: 38rpx;
  font-weight: bold;
  font-family: serif;
}

.el-author {
  color: #686e64;
  font-size: 24rpx;
  margin-top: 8rpx;
}

.el-motto {
  color: #4a463e;
  font-size: 22rpx;
  font-style: italic;
  margin-top: 20rpx;
  line-height: 1.6;
}

.el-foot {
  color: #a8957c;
  font-size: 18rpx;
  letter-spacing: 4rpx;
  margin-top: 24rpx;
}

/* 3. 黑胶唱机 */
.vinyl-shell {
  width: 580rpx;
  background: #161a22;
  border-radius: 36rpx;
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5rpx solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.7);
}

.vinyl-disc {
  width: 380rpx;
  height: 380rpx;
  border-radius: 50%;
  background: #0d0f14;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.8), inset 0 0 40rpx rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rotating {
  animation: spin 16s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-groove {
  position: absolute;
  border-radius: 50%;
  border: 1.5rpx solid rgba(255, 255, 255, 0.06);
}

.vinyl-groove.g1 { width: 280rpx; height: 280rpx; }
.vinyl-groove.g2 { width: 200rpx; height: 200rpx; }

.vinyl-label-center {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #333;
}

.vinyl-art {
  width: 100%;
  height: 100%;
}

.vinyl-meta {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vm-title {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  font-family: serif;
}

.vm-artist {
  color: #a0aec0;
  font-size: 24rpx;
  margin-top: 6rpx;
}

.vm-status {
  color: #4ade80;
  font-size: 21rpx;
  margin-top: 14rpx;
}

/* 4. 护照 */
.passport-book {
  width: 620rpx;
  background: #1b263b;
  border-radius: 24rpx;
  padding: 32rpx;
  border: 2rpx solid #415a77;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.6);
  display: flex;
  gap: 20rpx;
}

.passport-page-left {
  flex: 1;
  background: #0d1b2a;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pp-country {
  color: #e0e1dd;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  font-weight: bold;
}

.pp-emblem {
  font-size: 64rpx;
  margin: 20rpx 0;
}

.pp-name {
  color: #fca311;
  font-size: 24rpx;
  font-weight: bold;
}

.pp-meta {
  color: #778da9;
  font-size: 19rpx;
  margin-top: 8rpx;
}

.passport-page-right {
  flex: 1;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.visa-stamp {
  border: 2rpx dashed;
  border-radius: 14rpx;
  padding: 12rpx;
  display: flex;
  flex-direction: column;
}

.visa-stamp.s1 {
  border-color: #e63946;
  color: #e63946;
}

.visa-stamp.s2 {
  border-color: #2a9d8f;
  color: #2a9d8f;
}

.vs-title {
  font-size: 21rpx;
  font-weight: bold;
}

.vs-meta {
  font-size: 20rpx;
  margin-top: 2rpx;
}

.vs-date {
  font-size: 18rpx;
  letter-spacing: 1rpx;
  margin-top: 4rpx;
}
</style>
