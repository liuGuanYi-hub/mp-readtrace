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
        <text class="section-head-tag">8 大工坊模式就绪 · 支持 2K 导出</text>
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

    <!-- ═══ 实体拟物工坊交互弹窗 ═══ -->
    <view class="workshop-modal-mask" v-if="activeModal" @tap.self="activeModal = null">
      <!-- 1. 透光票根弹窗 -->
      <view v-if="activeModal === 'ticket'" class="ticket-container">
        <!-- 切换作品栏 -->
        <view class="switch-work-bar" @tap="openWorkPicker('movie')">
          <text class="sw-label">当前定制影片：</text>
          <text class="sw-title">《{{ currentSelectedWork.title }}》▾</text>
        </view>

        <view class="ticket-card">
          <view class="ticket-header">
            <text class="th-cinema">READTRACE CINEMA 🏛️</text>
            <text class="th-seat">SEAT 07排08座</text>
          </view>
          <view class="ticket-body">
            <image class="ticket-poster" :src="currentSelectedWork.coverUrl || defaultCover" mode="aspectFill" />
            <view class="ticket-details">
              <text class="t-movie-title">{{ currentSelectedWork.title }}</text>
              <text class="t-movie-director">导演: {{ currentSelectedWork.author || '未知' }}</text>
              <text class="t-movie-rating">★ {{ currentSelectedWork.rating ? currentSelectedWork.rating.toFixed(1) : '9.8' }} 影史殿堂</text>
              <text class="t-movie-date">观影记录: 2026.06.15 20:30</text>
            </view>
          </view>
          <view class="ticket-tear-line">
            <view class="tear-notch left"></view>
            <view class="tear-dashed"></view>
            <view class="tear-notch right"></view>
          </view>
          <view class="ticket-footer">
            <text class="t-quote">“{{ currentSelectedWork.shortComment || '链式反应从未停止，爱与引力超越时空。' }}”</text>
            <text class="t-barcode">||| | ||||| || |||| |||| ||| ||||</text>
          </view>
        </view>

        <view class="modal-btn-row">
          <view class="modal-btn-export" @tap="handleGeneratePoster('ticket')">🎨 生成 2K 透光票根</view>
          <view class="modal-btn-close" @tap="activeModal = null">关闭</view>
        </view>
      </view>

      <!-- 2. 火漆藏书票工坊弹窗 -->
      <view v-else-if="activeModal === 'exlibris'" class="exlibris-container">
        <!-- 切换作品栏 -->
        <view class="switch-work-bar" @tap="openWorkPicker('book')">
          <text class="sw-label">当前典藏书籍：</text>
          <text class="sw-title">《{{ currentSelectedWork.title }}》▾</text>
        </view>

        <view class="exlibris-card">
          <view class="el-border">
            <text class="el-top-label">EX LIBRIS · 阅痕典藏</text>
            <text class="el-serial">NO. 2026-042 // CERTIFIED</text>
            <view class="el-wax-stamp">
              <text class="el-wax-text">阅</text>
            </view>
            <text class="el-title">《{{ currentSelectedWork.title }}》</text>
            <text class="el-author">著者：{{ currentSelectedWork.author || '圣埃克苏佩里' }}</text>
            <text class="el-motto">“{{ currentSelectedWork.shortComment || '正因为你为你的玫瑰花费了时间，这才使你的玫瑰变得如此重要。' }}”</text>
            <text class="el-foot">SWISS TYPOGRAPHIC SPECIMEN</text>
          </view>
        </view>

        <view class="modal-btn-row">
          <view class="modal-btn-export" @tap="handleGeneratePoster('exlibris')">🎨 生成 2K 火漆藏书票</view>
          <view class="modal-btn-close" @tap="activeModal = null">关闭</view>
        </view>
      </view>

      <!-- 3. Hi-Res 拟真黑胶唱机弹窗 -->
      <view v-else-if="activeModal === 'vinyl'" class="vinyl-container">
        <view class="switch-work-bar" @tap="openWorkPicker('music')">
          <text class="sw-label">当前播放唱片：</text>
          <text class="sw-title">《{{ currentSelectedWork.title }}》▾</text>
        </view>

        <view class="vinyl-shell">
          <view class="vinyl-disc" :class="{ rotating: isVinylPlaying }">
            <view class="vinyl-groove g1"></view>
            <view class="vinyl-groove g2"></view>
            <view class="vinyl-label-center">
              <image class="vinyl-art" :src="vinylDisplay.coverUrl || defaultCover" mode="aspectFill" />
            </view>
          </view>
          <!-- 机械唱臂微动效 -->
          <view class="vinyl-tonearm" :class="{ dropped: isVinylPlaying }">
            <view class="tonearm-pivot"></view>
            <view class="tonearm-stick"></view>
            <view class="tonearm-head"></view>
          </view>
          <view class="vinyl-meta">
            <text class="vm-title">{{ vinylDisplay.title }}</text>
            <text class="vm-artist">{{ vinylDisplay.artist }} · 33 1/3 RPM</text>
            <text class="vm-status">
              {{ isVinylPlaying ? '● 正在沉浸播放 · 机械落针运转中' : '○ 唱臂抬起待命 · 点击落针播放' }}
            </text>
          </view>
          <!-- 控制按键 -->
          <view class="vinyl-ctrl-bar">
            <view class="v-btn-round" @tap="prevVinylTrack">⏮</view>
            <view class="v-btn-play" @tap="toggleVinylPlay">
              {{ isVinylPlaying ? '❚❚' : '▶' }}
            </view>
            <view class="v-btn-round" @tap="nextVinylTrack">⏭</view>
          </view>
        </view>

        <view class="modal-btn-row">
          <view class="modal-btn-export" @tap="goToStandby">⏳ 桌面禅意伴读钟 →</view>
          <view class="modal-btn-export" @tap="handleGeneratePoster('quote')">🎨 导出随想卡</view>
          <view class="modal-btn-close" @tap="activeModal = null">收起</view>
        </view>
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

        <view class="modal-btn-row">
          <view class="modal-btn-export" @tap="handleGeneratePoster('quote')">🎨 导出巡礼便笺卡</view>
          <view class="modal-btn-close" @tap="activeModal = null">合上护照</view>
        </view>
      </view>
    </view>

    <!-- ═══ 候选作品选择弹窗 ═══ -->
    <view v-if="showWorkPicker" class="workshop-modal-mask" @tap.self="showWorkPicker = false">
      <view class="picker-dialog">
        <view class="picker-header">
          <text class="picker-title">选择要定制的海报作品</text>
          <text class="picker-close" @tap="showWorkPicker = false">✕</text>
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="item in pickerList"
            :key="item.id"
            class="picker-item"
            @tap="selectWork(item)"
          >
            <image
              v-if="item.coverUrl"
              class="picker-cover"
              :src="item.coverUrl"
              mode="aspectFill"
            />
            <view v-else class="picker-cover-ph">
              <text>{{ MEDIA_LABEL[item.mediaType]?.emoji || '📖' }}</text>
            </view>
            <view class="picker-info">
              <text class="picker-item-title">{{ item.title }}</text>
              <text class="picker-item-meta">{{ item.author || '未知创作者' }} · {{ MEDIA_LABEL[item.mediaType]?.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- ═══ 2K 海报生成预览与保存弹窗 ═══ -->
    <view v-if="posterResultModal.visible" class="workshop-modal-mask" @tap.self="posterResultModal.visible = false">
      <view class="poster-preview-dialog">
        <view class="preview-header">
          <text class="preview-title">✨ 2K 典藏实体海报已就绪</text>
          <text class="preview-close" @tap="posterResultModal.visible = false">✕</text>
        </view>

        <image
          class="poster-preview-img"
          :src="posterResultModal.imageUrl"
          mode="aspectFit"
          @tap="previewFullPoster"
        />

        <view class="preview-tips">提示：可直接保存至手机相册，或长按全屏分享给好友</view>

        <view class="preview-actions">
          <button class="btn-save-album" @tap="handleSaveToAlbum">💾 保存至手机相册</button>
          <button class="btn-full-preview" @tap="previewFullPoster">🔍 全屏预览 / 发送</button>
        </view>
      </view>
    </view>

    <!-- 离屏 Canvas (高精 750px) -->
    <canvas
      canvas-id="posterCanvas"
      id="posterCanvas"
      style="position: fixed; left: -9999px; top: -9999px; width: 750px; height: 1334px;"
    />

    <!-- 底部导航 -->
    <TabBar :active="3" />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import TabBar from '../../components/TabBar.vue';
import type { Book, MediaType } from '../../utils/models';
import { MEDIA_LABEL } from '../../utils/models';
import { loadLocalWorks } from '../../utils/sync';
import { generatePosterImage, savePosterToAlbum, type PosterType } from '../../utils/poster-engine';
import { audioEngine, SOUND_TRACKS, type AudioTrack } from '../../utils/audio-engine';

const instance = getCurrentInstance();

const memoirCards = [
  {
    key: 'ticket',
    emoji: '🎫',
    title: '复古电影透光票根',
    badge: '2K 导出 →',
    green: true,
    desc: '16:9 双联撕票打孔票根 · 影史评分 · 经典名台词合璧海报',
    tags: ['🎞️ SEAT: 07排08座', '🎬 光影放映厅'],
  },
  {
    key: 'exlibris',
    emoji: '📜',
    title: '典藏藏书票工坊',
    badge: '火漆印鉴 →',
    green: true,
    desc: '瑞士网格版式 · 生成式火漆藏书票 · 经典版画与藏书印鉴',
    tags: ['✒️ EX-LIBRIS #042', '🏛️ 瑞士网格排版'],
  },
  {
    key: 'passport',
    emoji: '🛂',
    title: '精神巡礼护照盖章簿',
    badge: '打开护照 →',
    green: false,
    desc: '深蓝烫金首页 · 72 部番剧入境签证 · 69 款游戏白金戳印',
    tags: ['🌸 追番入境签证', '🎮 白金通关戳印'],
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
const allWorks = ref<Book[]>([]);

const defaultCover = 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg';

const currentSelectedWork = ref<Book>({
  id: 1,
  title: '星际穿越',
  author: '克里斯托弗·诺兰',
  coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
  category: '科幻 / 史诗',
  status: 'finished',
  mediaType: 'movie',
  rating: 9.8,
  tags: ['硬科幻', '爱与引力'],
  shortComment: '爱是唯一可以超越时间与空间维度的事物。',
  review: null,
  startDate: null,
  finishDate: '2026-06-15',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sourceType: null,
  sourceId: null,
  remoteRating: null,
  description: null,
});

const syncAudioTick = ref(0);
let unsubAudio: any = null;

onMounted(() => {
  allWorks.value = loadLocalWorks();
  if (allWorks.value.length > 0) {
    // 默认选用评分最高的一部
    const sorted = [...allWorks.value].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    currentSelectedWork.value = sorted[0];
  }

  unsubAudio = audioEngine.subscribe(() => {
    syncAudioTick.value++;
  });
});

onShow(() => {
  allWorks.value = loadLocalWorks();
  if (allWorks.value.length > 0) {
    const found = allWorks.value.find((b) => b.id === currentSelectedWork.value.id);
    if (found) {
      currentSelectedWork.value = found;
    }
  }
  consumePendingWorkshop();
});

/** 消费带参直达请求：选中作品并打开对应工坊 */
function consumePendingWorkshop() {
  if (!pendingWorkshop.value) return;
  const ws = pendingWorkshop.value;
  const bookId = pendingBookId.value;
  pendingWorkshop.value = '';
  pendingBookId.value = 0;

  if (bookId) {
    const found = allWorks.value.find((b) => b.id === bookId);
    if (found) currentSelectedWork.value = found;
  }
  if (ws === 'exlibris') {
    activeModal.value = 'exlibris';
  } else if (ws === 'quote') {
    handleGeneratePoster('quote');
  }
}

// ── 带参直达：book-detail 海报/藏书票按钮 → ?workshop=quote|exlibris&bookId=N ──
const pendingWorkshop = ref('');
const pendingBookId = ref(0);

onLoad((options: any) => {
  const ws = options?.workshop;
  const bookId = Number(options?.bookId);
  if (!ws) return;
  pendingWorkshop.value = ws;
  if (bookId) pendingBookId.value = bookId;
});

onUnmounted(() => {
  if (unsubAudio) unsubAudio();
});

// 作品切换
const showWorkPicker = ref(false);
const pickerList = ref<Book[]>([]);

function openWorkPicker(targetMedia?: MediaType) {
  if (targetMedia) {
    const filtered = allWorks.value.filter((b) => b.mediaType === targetMedia);
    pickerList.value = filtered.length > 0 ? filtered : allWorks.value;
  } else {
    pickerList.value = allWorks.value;
  }
  showWorkPicker.value = true;
}

function selectWork(book: Book) {
  currentSelectedWork.value = book;
  showWorkPicker.value = false;
  if (activeModal.value === 'vinyl') syncVinylDisplayFromWork();
  uni.showToast({ title: `已定制《${book.title}》`, icon: 'none' });
}

function openWorkshop(card: any) {
  if (['ticket', 'exlibris', 'vinyl', 'passport'].includes(card.key)) {
    // 自动适配作品媒介
    if (card.key === 'ticket') {
      const movies = allWorks.value.filter((b) => b.mediaType === 'movie');
      if (movies.length) currentSelectedWork.value = movies[0];
    } else if (card.key === 'exlibris') {
      const books = allWorks.value.filter((b) => b.mediaType === 'book');
      if (books.length) currentSelectedWork.value = books[0];
    } else if (card.key === 'vinyl') {
      const musics = allWorks.value.filter((b) => b.mediaType === 'music');
      if (musics.length) currentSelectedWork.value = musics[0];
      syncVinylDisplayFromWork();
    }
    activeModal.value = card.key;
  } else {
    uni.showToast({
      title: `${card.title} 模组已就绪，将在下一版本开放长图导出`,
      icon: 'none',
    });
  }
}

// 海报生成
const posterResultModal = ref({
  visible: false,
  imageUrl: '',
});

async function handleGeneratePoster(type: PosterType) {
  uni.showLoading({ title: '正在渲染 2K 海报...', mask: true });
  try {
    const tempPath = await generatePosterImage('posterCanvas', instance, {
      type,
      book: currentSelectedWork.value,
    });
    uni.hideLoading();
    posterResultModal.value = {
      visible: true,
      imageUrl: tempPath,
    };
  } catch (err: any) {
    uni.hideLoading();
    uni.showModal({
      title: '生成海报失败',
      content: err?.message || '画布绘制超时，请重试',
      showCancel: false,
    });
  }
}

async function handleSaveToAlbum() {
  if (!posterResultModal.value.imageUrl) return;
  await savePosterToAlbum(posterResultModal.value.imageUrl);
}

function previewFullPoster() {
  if (!posterResultModal.value.imageUrl) return;
  uni.previewImage({
    urls: [posterResultModal.value.imageUrl],
    current: posterResultModal.value.imageUrl,
  });
}

// ── 💿 黑胶唱机与音频控制 ──
// 唱机独立展示态：切歌只改唱机显示，绝不写回 Book 数据（避免污染藏品标题/作者/封面）
const vinylDisplay = ref({ title: '', artist: '', coverUrl: '' });

function syncVinylDisplayFromWork() {
  vinylDisplay.value = {
    title: currentSelectedWork.value.title,
    artist: currentSelectedWork.value.author || '未知艺术家',
    coverUrl: currentSelectedWork.value.coverUrl || '',
  };
}

function syncVinylDisplayFromTrack() {
  const t = audioEngine.currentTrack;
  if (t && t.type === 'vinyl') {
    vinylDisplay.value = {
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl || '',
    };
  }
}

const isVinylPlaying = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  syncAudioTick.value;
  return audioEngine.isPlaying;
});

function toggleVinylPlay() {
  if (!audioEngine.isPlaying && audioEngine.currentTrack.type !== 'vinyl') {
    const vinyls = SOUND_TRACKS.filter((t) => t.type === 'vinyl');
    if (vinyls.length) {
      audioEngine.playTrack(vinyls[0]);
      syncVinylDisplayFromTrack();
    }
  } else {
    audioEngine.togglePlay();
  }
}

function prevVinylTrack() {
  audioEngine.prevTrack();
  syncVinylDisplayFromTrack();
}

function nextVinylTrack() {
  audioEngine.nextTrack();
  syncVinylDisplayFromTrack();
}

function goToStandby() {
  activeModal.value = null;
  uni.navigateTo({
    url: '/pages/standby/index',
  });
}
</script>

<style>
.page {
  min-height: 100vh;
  background: var(--rt-bg);
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
  color: var(--rt-ink);
  font-size: 46rpx;
  font-weight: bold;
  font-family: serif;
}

.page-subtitle {
  display: block;
  color: var(--rt-muted);
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
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}

.section-head-tag {
  color: var(--rt-gold);
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
  color: var(--rt-ink);
  font-size: 30rpx;
  font-weight: bold;
  font-family: serif;
}

.mc-badge {
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.05);
  color: var(--rt-muted);
  font-weight: bold;
}

.mc-badge.green {
  background: rgba(58, 99, 72, 0.12);
  color: var(--rt-accent);
}

.mc-desc {
  display: block;
  color: #5c6258;
  font-size: 23rpx;
  line-height: 1.5;
  margin: 16rpx 0 20rpx;
}

.mc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mc-tag {
  background: #f4f2ee;
  color: #6e6b63;
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

/* ── 拟物交互弹窗 ── */
.workshop-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(16px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.switch-work-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  margin-bottom: 20rpx;
}

.sw-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.sw-title {
  font-size: 24rpx;
  color: #FFD700;
  font-weight: 700;
}

.modal-btn-row {
  display: flex;
  gap: 20rpx;
  width: 100%;
  max-width: 600rpx;
  margin-top: 30rpx;
}

.modal-btn-export {
  flex: 2;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  background: linear-gradient(135deg, var(--rt-gold) 0%, #C8A265 100%);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 42rpx;
  box-shadow: 0 8rpx 24rpx rgba(158, 118, 56, 0.4);
}

.modal-btn-close {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 42rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 1. 票根 */
.ticket-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ticket-card {
  width: 600rpx;
  background: #211f24;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.6);
  border: 1.5rpx solid rgba(212, 175, 55, 0.4);
}

.ticket-header {
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx dashed rgba(255, 255, 255, 0.12);
}

.th-cinema {
  color: var(--rt-gold-bright);
  font-size: 22rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.th-seat {
  color: #a89f91;
  font-size: 20rpx;
}

.ticket-body {
  padding: 28rpx 32rpx;
  display: flex;
  gap: 24rpx;
}

.ticket-poster {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.4);
}

.ticket-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.t-movie-title {
  color: #f5efe6;
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.t-movie-director {
  color: #a89f91;
  font-size: 22rpx;
}

.t-movie-rating {
  color: var(--rt-gold-bright);
  font-size: 22rpx;
  font-weight: bold;
}

.t-movie-date {
  color: #70685f;
  font-size: 20rpx;
}

.ticket-tear-line {
  height: 32rpx;
  position: relative;
  display: flex;
  align-items: center;
}

.tear-notch {
  width: 32rpx;
  height: 32rpx;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  position: absolute;
  top: 0;
}

.tear-notch.left { left: -16rpx; }
.tear-notch.right { right: -16rpx; }

.tear-dashed {
  flex: 1;
  height: 2rpx;
  border-top: 2rpx dashed rgba(255, 255, 255, 0.2);
  margin: 0 24rpx;
}

.ticket-footer {
  padding: 20rpx 32rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.t-quote {
  color: #dcd3c7;
  font-size: 21rpx;
  font-style: italic;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.t-barcode {
  color: var(--rt-gold-bright);
  font-family: monospace;
  font-size: 28rpx;
  letter-spacing: 4rpx;
  opacity: 0.75;
}

/* 2. 藏书票 */
.exlibris-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exlibris-card {
  width: 580rpx;
  background: #fbf7ee;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
}

.el-border {
  border: 2rpx solid #7a5835;
  border-radius: 12rpx;
  padding: 30rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.el-top-label {
  color: #7a5835;
  font-size: 24rpx;
  letter-spacing: 4rpx;
  font-weight: bold;
}

.el-serial {
  color: #bfa588;
  font-size: 19rpx;
  margin-top: 4rpx;
}

.el-wax-stamp {
  width: 100rpx;
  height: 100rpx;
  background: radial-gradient(circle, #b91c1c 0%, #7f1d1d 100%);
  border-radius: 50%;
  margin: 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(185, 28, 28, 0.4);
}

.el-wax-text {
  color: #fef08a;
  font-size: 38rpx;
  font-weight: bold;
  font-family: serif;
}

.el-title {
  color: #3d2b1f;
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.el-author {
  color: #7a5835;
  font-size: 22rpx;
  margin-top: 6rpx;
}

.el-motto {
  color: #8c6d46;
  font-size: 20rpx;
  line-height: 1.5;
  margin: 16rpx 0;
  font-style: italic;
}

.el-foot {
  color: #d1bda2;
  font-size: 17rpx;
  letter-spacing: 2rpx;
}

/* 3. 黑胶 */
.vinyl-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vinyl-shell {
  width: 580rpx;
  height: 580rpx;
  background: #11141a;
  border-radius: 40rpx;
  border: 1.5rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vinyl-disc {
  width: 380rpx;
  height: 380rpx;
  background: radial-gradient(circle, #1a1a1a 0%, #0d0d0d 70%, #050505 100%);
  border-radius: 50%;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.9);
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

/* 机械唱臂 */
.vinyl-tonearm {
  position: absolute;
  top: 20rpx;
  right: 40rpx;
  width: 80rpx;
  height: 200rpx;
  transform-origin: 60rpx 20rpx;
  transform: rotate(-24deg);
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
  z-index: 5;
}

.vinyl-tonearm.dropped {
  transform: rotate(6deg);
}

.tonearm-pivot {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: var(--rt-gold-bright);
  box-shadow: 0 0 12rpx rgba(212, 175, 55, 0.5);
}

.tonearm-stick {
  position: absolute;
  top: 22rpx;
  right: 20rpx;
  width: 6rpx;
  height: 150rpx;
  background: linear-gradient(180deg, var(--rt-gold-bright) 0%, #a89f91 100%);
  border-radius: 3rpx;
}

.tonearm-head {
  position: absolute;
  bottom: 16rpx;
  right: 14rpx;
  width: 18rpx;
  height: 30rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
}

/* 控制按键条 */
.vinyl-ctrl-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36rpx;
  margin-top: 20rpx;
  z-index: 6;
}

.v-btn-round {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #ffffff;
}

.v-btn-play {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: var(--rt-gold-bright);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--rt-deep);
  font-weight: 900;
  box-shadow: 0 8rpx 20rpx rgba(212, 175, 55, 0.4);
}

/* 4. 护照 */
.passport-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

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

/* 作品选择器弹窗 */
.picker-dialog {
  width: 100%;
  max-width: 620rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-sizing: border-box;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.picker-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.picker-close {
  font-size: 36rpx;
  color: var(--rt-faint);
}

.picker-list {
  max-height: 540rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F4F2EE;
}

.picker-cover {
  width: 80rpx;
  height: 112rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.picker-cover-ph {
  width: 80rpx;
  height: 112rpx;
  border-radius: 8rpx;
  background: var(--rt-chip);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.picker-info {
  flex: 1;
}

.picker-item-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--rt-ink);
}

.picker-item-meta {
  font-size: 20rpx;
  color: var(--rt-faint);
  margin-top: 4rpx;
}

/* 2K 海报预览弹窗 */
.poster-preview-dialog {
  width: 100%;
  max-width: 640rpx;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.preview-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--rt-accent);
}

.preview-close {
  font-size: 36rpx;
  color: var(--rt-faint);
}

.poster-preview-img {
  width: 480rpx;
  height: 680rpx;
  border-radius: 16rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.25);
  margin-bottom: 16rpx;
}

.preview-tips {
  font-size: 20rpx;
  color: var(--rt-faint);
  margin-bottom: 24rpx;
}

.preview-actions {
  display: flex;
  gap: 16rpx;
  width: 100%;
}

.btn-save-album {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: var(--rt-accent);
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 700;
  border-radius: 40rpx;
}

.btn-full-preview {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: var(--rt-chip);
  color: var(--rt-ink);
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 40rpx;
}
</style>
