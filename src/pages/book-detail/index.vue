<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <template v-if="book">
      <!-- 顶部自定义导航栏 -->
      <view class="nav-bar">
        <view class="nav-back" @tap="goBack">←</view>
        <text class="nav-title">印记检视</text>
        <view class="nav-fav" @tap="toggleFav">{{ isFav ? '❤️' : '🤍' }}</view>
      </view>

      <!-- ═══ 破壁 Hero 卡（对齐 App BorderBeamFrameLayout） ═══ -->
      <view class="hero-card">
        <view class="cover-wrapper">
          <image v-if="book.coverUrl" class="cover" :src="book.coverUrl" mode="aspectFill" />
          <view v-else class="cover cover-ph">
            <text class="ph-emoji">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
          </view>
        </view>

        <view class="badge-row">
          <text class="editorial-sparkle">✦</text>
          <view class="media-badge">
            {{ MEDIA_LABEL[book.mediaType]?.emoji }} {{ MEDIA_LABEL[book.mediaType]?.name }}
          </view>
        </view>

        <text class="book-title">《{{ book.title }}》</text>
        <text class="book-author">{{ book.author || '未知作者' }}</text>

        <!-- 全息星级打分条 -->
        <view class="star-rating-bar" v-if="book.rating">
          <view class="stars-display">
            <text v-for="n in 5" :key="n" class="star-icon">
              {{ n <= Math.round(book.rating / 2) ? '★' : '☆' }}
            </text>
          </view>
          <text class="rating-num">★ {{ book.rating.toFixed(1).replace(/\.0$/, '') }} / 10</text>
        </view>

        <!-- 状态元数据胶囊条 -->
        <view class="status-meta-pill">
          <text class="smp-text">
            {{ MEDIA_STATUS[book.mediaType]?.[book.status] }} ▾
            <template v-if="book.rating"> · ★ {{ book.rating }}</template>
            <template v-if="book.category"> · {{ book.category }}</template>
          </text>
        </view>

        <!-- 操作按键组 -->
        <view class="btn-primary" @tap="onAction('3d')">📖 3D 沉浸翻阅</view>
        <view class="btn-row">
          <view class="btn-secondary flex1" @tap="onAction('edit')">编辑印记</view>
          <view class="btn-danger flex1 gap" @tap="onAction('archive')">归档到回收站</view>
        </view>
        <view class="btn-row">
          <view class="btn-pill-green flex1" @tap="onAction('poster')">🎨 金句印记海报</view>
          <view class="btn-secondary flex1 gap" @tap="onAction('exlibris')">📜 刻印专属藏书票</view>
        </view>
      </view>

      <!-- ═══ 五大快捷 Tab 横滑栏 ═══ -->
      <scroll-view scroll-x class="tab-scroller" enhanced :show-scrollbar="false">
        <view
          v-for="t in DETAIL_TABS"
          :key="t.key"
          class="detail-tab-chip"
          :class="{ selected: currentTab === t.key }"
          @tap="currentTab = t.key"
        >
          {{ t.label }}
        </view>
      </scroll-view>

      <!-- ── Tab 1: ✨ 概览与雷达 ── -->
      <view v-if="currentTab === 'overview'" class="tab-content">
        <!-- 六维心智雷达图 -->
        <view class="section-card">
          <text class="sec-title">🧠 六维心智印记雷达</text>
          <view class="radar-wrapper">
            <MindprintRadar
              :depth="mindprint.depthScore"
              :artistry="mindprint.artistryScore"
              :emotion="mindprint.emotionScore"
              :logic="mindprint.logicScore"
              :difficulty="mindprint.difficultyScore"
              :healing="mindprint.healingScore"
              :size="240"
            />
          </view>
        </view>

        <!-- 作品简介 -->
        <view class="section-card" v-if="book.description">
          <text class="sec-title">📖 作品简介</text>
          <text class="desc-text">{{ book.description }}</text>
        </view>

        <!-- 灵感短评金句 -->
        <view class="section-card" v-if="book.shortComment">
          <text class="sec-title">📜 灵感随想 · 短评金句</text>
          <view class="quote-box">
            <text class="quote-text">“{{ book.shortComment }}”</text>
          </view>
        </view>

        <!-- 详细元数据档案 -->
        <view class="section-card">
          <text class="sec-title">📋 档案元数据</text>
          <view class="meta-row">
            <text class="mr-label">当前状态</text>
            <text class="mr-val accent">{{ MEDIA_STATUS[book.mediaType]?.[book.status] }}</text>
          </view>
          <view class="meta-row" v-if="book.category">
            <text class="mr-label">分类体系</text>
            <text class="mr-val">{{ book.category }}</text>
          </view>
          <view class="meta-row" v-if="book.startDate">
            <text class="mr-label">启读日期</text>
            <text class="mr-val">{{ book.startDate }}</text>
          </view>
          <view class="meta-row" v-if="book.finishDate">
            <text class="mr-label">完结日期</text>
            <text class="mr-val">{{ book.finishDate }}</text>
          </view>
          <view class="meta-row" v-if="book.remoteRating">
            <text class="mr-label">外界评分</text>
            <text class="mr-val">★ {{ book.remoteRating }} ({{ book.sourceType || '豆瓣' }})</text>
          </view>
          <view class="meta-row" v-if="book.tags && book.tags.length">
            <text class="mr-label">心智标签</text>
            <view class="tags-wrap">
              <view v-for="tag in book.tags" :key="tag" class="detail-tag">#{{ tag }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- ── Tab 2: ⏳ 心路时间轴 ── -->
      <view v-else-if="currentTab === 'timeline'" class="tab-content">
        <view class="section-card">
          <view class="timeline-header">
            <text class="sec-title">⏳ 读书笔记与心流痕迹 ({{ notes.length }})</text>
            <view class="btn-add-note" @tap="showAddNoteModal = true">＋ 记笔记</view>
          </view>

          <view v-if="notes.length === 0" class="timeline-empty">
            <text class="empty-hint">暂无心流笔记，点击右上角记录此时此刻的感悟</text>
          </view>

          <view v-else class="timeline-list">
            <view v-for="n in notes" :key="n.id" class="timeline-item">
              <view class="timeline-dot"></view>
              <view class="timeline-card">
                <view class="tc-meta">
                  <text class="tc-chapter" v-if="n.chapter">{{ n.chapter }}</text>
                  <text class="tc-page" v-if="n.page"> · {{ n.page }}</text>
                  <text class="tc-time">{{ n.createdAt }}</text>
                </view>
                <text class="tc-content">“{{ n.content }}”</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- ── Tab 3: 👥 角色与大纲 ── -->
      <view v-else-if="currentTab === 'characters'" class="tab-content">
        <!-- 角色卡片 -->
        <view class="section-card">
          <text class="sec-title">🧙 主要角色谱系</text>
          <view class="characters-list" v-if="characters.length">
            <view v-for="c in characters" :key="c.id" class="character-card">
              <view class="c-avatar">{{ c.avatarEmoji || '👤' }}</view>
              <view class="c-info">
                <view class="c-name-row">
                  <text class="c-name">{{ c.name }}</text>
                  <text class="c-role">{{ c.role }}</text>
                </view>
                <text class="c-desc">{{ c.description }}</text>
              </view>
            </view>
          </view>
          <view v-else class="timeline-empty">
            <text class="empty-hint">在 App 端可自动解析或编辑角色谱系与人物关系图</text>
          </view>
        </view>

        <!-- 篇章大纲 -->
        <view class="section-card">
          <text class="sec-title">📜 篇章推进大纲</text>
          <view class="outline-list" v-if="outlines.length">
            <view v-for="o in outlines" :key="o.id" class="outline-item">
              <text class="o-num">0{{ o.orderIndex }}</text>
              <view class="o-body">
                <text class="o-title">{{ o.title }}</text>
                <text class="o-summary">{{ o.summary }}</text>
              </view>
            </view>
          </view>
          <view v-else class="timeline-empty">
            <text class="empty-hint">大纲档案正在同步中</text>
          </view>
        </view>
      </view>

      <!-- ── Tab 4: 🎵 伴读原声 ── -->
      <view v-else-if="currentTab === 'soundtrack'" class="tab-content">
        <view class="section-card">
          <text class="sec-title">🎵 伴读原声与配乐磁带</text>
          <view class="tracks-list" v-if="tracks.length">
            <view v-for="tr in tracks" :key="tr.id" class="track-item" @tap="playTrack(tr)">
              <view class="track-icon">▶</view>
              <view class="track-info">
                <text class="track-title">{{ tr.title }}</text>
                <text class="track-artist">{{ tr.artist }}</text>
              </view>
              <text class="track-tag">{{ tr.tag }}</text>
            </view>
          </view>
          <view v-else class="timeline-empty">
            <text class="empty-hint">暂无绑定的伴读曲目，可在 App 端连接网易云/QQ音乐</text>
          </view>
        </view>
      </view>

      <!-- ── Tab 5: 🏷️ 心智标签与推导 ── -->
      <view v-else-if="currentTab === 'mindprint'" class="tab-content">
        <view class="section-card">
          <text class="sec-title">🏷️ 深度心智特征解析</text>
          <view class="analysis-box">
            <view class="an-row">
              <text class="an-label">认知负荷深度</text>
              <view class="an-bar-wrap">
                <view class="an-bar" :style="{ width: mindprint.depthScore * 10 + '%' }"></view>
              </view>
              <text class="an-score">{{ mindprint.depthScore }}</text>
            </view>
            <view class="an-row">
              <text class="an-label">艺术美学风格</text>
              <view class="an-bar-wrap">
                <view class="an-bar gold" :style="{ width: mindprint.artistryScore * 10 + '%' }"></view>
              </view>
              <text class="an-score">{{ mindprint.artistryScore }}</text>
            </view>
            <view class="an-row">
              <text class="an-label">情感共鸣沉浸</text>
              <view class="an-bar-wrap">
                <view class="an-bar red" :style="{ width: mindprint.emotionScore * 10 + '%' }"></view>
              </view>
              <text class="an-score">{{ mindprint.emotionScore }}</text>
            </view>
            <view class="an-row">
              <text class="an-label">哲思逻辑严密</text>
              <view class="an-bar-wrap">
                <view class="an-bar blue" :style="{ width: mindprint.logicScore * 10 + '%' }"></view>
              </view>
              <text class="an-score">{{ mindprint.logicScore }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ── 新增心流笔记弹窗 ── -->
      <view class="note-modal-mask" v-if="showAddNoteModal" @tap.self="showAddNoteModal = false">
        <view class="note-dialog">
          <view class="nd-head">
            <text class="nd-title">✍️ 记录心流随想</text>
            <view class="nd-close" @tap="showAddNoteModal = false">✕</view>
          </view>
          <textarea
            class="nd-textarea"
            v-model="newNoteContent"
            placeholder="写下你在此刻的触动、名台词或灵感…"
            placeholder-class="ph"
          ></textarea>
          <view class="nd-inputs">
            <input class="nd-input" v-model="newNoteChapter" placeholder="章节（如：第21章）" />
            <input class="nd-input" v-model="newNotePage" placeholder="页码/时间点" />
          </view>
          <view class="btn-save-note" @tap="saveNewNote">秒存笔记</view>
        </view>
      </view>
    </template>

    <view v-else class="missing-panel">
      <text class="missing-text">未找到这部藏品 · 请先在首页导入书单</text>
      <view class="btn-back-hub" @tap="goBack">返回展馆</view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import type { Book, Note, Mindprint } from '../../utils/models';
import { MEDIA_LABEL, MEDIA_STATUS, deriveMindprint } from '../../utils/models';
import { loadLocalWorks, loadLocalNotes, loadLocalMindprints } from '../../utils/sync';
import {
  PRESET_CHARACTERS,
  PRESET_OUTLINES,
  PRESET_TRACKS,
  type CharacterItem,
  type OutlineItem,
  type AudioTrackItem,
} from '../../utils/preset-data';
import MindprintRadar from '../../components/MindprintRadar.vue';

const DETAIL_TABS = [
  { key: 'overview', label: '✨ 概览与雷达' },
  { key: 'timeline', label: '⏳ 心路时间轴' },
  { key: 'characters', label: '👥 角色与大纲' },
  { key: 'soundtrack', label: '🎵 伴读原声' },
  { key: 'mindprint', label: '🏷️ 心智推导' },
];

const currentTab = ref('overview');
const book = ref<Book | null>(null);
const isFav = ref(false);

const notes = ref<Note[]>([]);
const characters = ref<CharacterItem[]>([]);
const outlines = ref<OutlineItem[]>([]);
const tracks = ref<AudioTrackItem[]>([]);
const mindprint = ref<Mindprint>({
  bookId: 0,
  depthScore: 8.5,
  artistryScore: 8.8,
  emotionScore: 8.2,
  logicScore: 9.0,
  difficultyScore: 6.5,
  healingScore: 8.6,
  updatedAt: '',
});

// 新增笔记
const showAddNoteModal = ref(false);
const newNoteContent = ref('');
const newNoteChapter = ref('');
const newNotePage = ref('');

onLoad((options: any) => {
  const id = Number(options?.id);
  const found = loadLocalWorks().find((b) => b.id === id);
  if (found) {
    book.value = found;
    // 加载笔记
    notes.value = loadLocalNotes().filter((n) => n.bookId === id);

    // 加载心智雷达
    const mp = loadLocalMindprints().find((m) => m.bookId === id);
    if (mp) {
      mindprint.value = mp;
    } else {
      mindprint.value = deriveMindprint(found.rating || 8.0, id);
    }

    // 加载配套大纲、角色谱和曲目
    characters.value = PRESET_CHARACTERS[id] || [];
    outlines.value = PRESET_OUTLINES[id] || [];
    tracks.value = PRESET_TRACKS[id] || [];
  }
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/hub/index' });
    },
  });
}

function toggleFav() {
  isFav.value = !isFav.value;
  uni.showToast({
    title: isFav.value ? '已加入心选展厅' : '已移出心选展厅',
    icon: 'none',
  });
}

function saveNewNote() {
  if (!newNoteContent.value.trim()) {
    uni.showToast({ title: '请输入笔记内容', icon: 'none' });
    return;
  }
  const allNotes = loadLocalNotes();
  const newNote: Note = {
    id: Date.now(),
    bookId: book.value?.id || 0,
    content: newNoteContent.value.trim(),
    noteType: 'note',
    chapter: newNoteChapter.value.trim() || null,
    page: newNotePage.value.trim() || null,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    updatedAt: new Date().toISOString(),
  };
  allNotes.unshift(newNote);
  uni.setStorageSync('rt_local_notes', allNotes);
  notes.value.unshift(newNote);

  newNoteContent.value = '';
  newNoteChapter.value = '';
  newNotePage.value = '';
  showAddNoteModal.value = false;
  uni.showToast({ title: '心流笔记已秒存', icon: 'none' });
}

function playTrack(tr: AudioTrackItem) {
  uni.showToast({
    title: `正在播放: ${tr.title} - ${tr.artist}`,
    icon: 'none',
  });
}

function onAction(type: string) {
  switch (type) {
    case '3d':
      uni.showToast({ title: '3D 翻阅需 GPU 加速，建议在 App 端体验', icon: 'none' });
      break;
    case 'edit':
      uni.showToast({ title: '已进入检视编辑状态', icon: 'none' });
      break;
    case 'archive':
      uni.showModal({
        title: '归档确认',
        content: `确定将《${book.value?.title}》移入回收站吗？`,
        success: (res) => {
          if (res.confirm) {
            const all = loadLocalWorks().filter((b) => b.id !== book.value?.id);
            uni.setStorageSync('rt_local_works', all);
            uni.showToast({ title: '已归档', icon: 'none' });
            setTimeout(() => goBack(), 600);
          }
        },
      });
      break;
    case 'poster':
      uni.showToast({ title: '已根据短评生成金句艺术海报', icon: 'none' });
      break;
    case 'exlibris':
      uni.showToast({ title: '已生成瑞士网格火漆印鉴藏书票', icon: 'none' });
      break;
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f8f7f4;
  padding: 20rpx 28rpx 120rpx;
  box-sizing: border-box;
}

/* 顶部导航条 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  margin-bottom: 16rpx;
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #1a1c19;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.nav-title {
  color: #1a1c19;
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.nav-fav {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* ── 破壁 Hero 卡 ── */
.hero-card {
  padding: 40rpx 32rpx 36rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 44rpx;
  box-shadow: 0 16rpx 44rpx rgba(0, 0, 0, 0.06);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-wrapper {
  margin-top: -16rpx;
}

.cover {
  width: 200rpx;
  height: 290rpx;
  border-radius: 26rpx;
  background: #eae2d5;
  box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.14);
}

.cover-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ph-emoji {
  font-size: 72rpx;
}

.badge-row {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
}

.editorial-sparkle {
  color: #9e7638;
  font-size: 24rpx;
  margin-right: 8rpx;
}

.media-badge {
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
  background: #ece7de;
  color: #1a1c19;
  font-size: 22rpx;
  font-weight: bold;
}

.book-title {
  color: #1a1c19;
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 14rpx;
  text-align: center;
}

.book-author {
  color: #686e64;
  font-size: 25rpx;
  font-family: serif;
  margin-top: 8rpx;
}

/* 星级 */
.star-rating-bar {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
  gap: 12rpx;
}

.stars-display {
  color: #eab308;
  font-size: 28rpx;
}

.rating-num {
  color: #9e7638;
  font-size: 24rpx;
  font-weight: bold;
}

.status-meta-pill {
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(58, 99, 72, 0.08);
  border: 1.5rpx solid rgba(58, 99, 72, 0.2);
}

.smp-text {
  color: #3a6348;
  font-size: 23rpx;
  font-weight: bold;
}

/* 按键组 */
.flex1 { flex: 1; }
.gap { margin-left: 14rpx; }

.btn-primary {
  margin-top: 28rpx;
  width: 100%;
  height: 84rpx;
  border-radius: 28rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(58, 99, 72, 0.25);
}

.btn-row {
  display: flex;
  width: 100%;
  margin-top: 14rpx;
}

.btn-secondary {
  height: 76rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.09);
  color: #1a1c19;
  font-size: 23rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.03);
}

.btn-danger {
  height: 76rpx;
  border-radius: 24rpx;
  background: #9e4545;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pill-green {
  height: 76rpx;
  border-radius: 24rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 五大 Tab 横滑栏 ── */
.tab-scroller {
  white-space: nowrap;
  margin-top: 24rpx;
}

.detail-tab-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 14rpx;
  border-radius: 30rpx;
  background: #ece7de;
  color: #686e64;
  font-size: 23rpx;
  font-weight: bold;
}

.detail-tab-chip.selected {
  background: #3a6348;
  color: #ffffff;
}

/* ── 各 Tab 内容区 ── */
.tab-content {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 36rpx;
  padding: 30rpx;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.sec-title {
  color: #1a1c19;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}

.radar-wrapper {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
}

.desc-text {
  display: block;
  color: #4a463e;
  font-size: 24rpx;
  line-height: 1.6;
  margin-top: 14rpx;
}

.quote-box {
  margin-top: 14rpx;
  padding: 20rpx;
  background: #f8f7f4;
  border-left: 6rpx solid #3a6348;
  border-radius: 16rpx;
}

.quote-text {
  color: #1a1c19;
  font-size: 24rpx;
  font-style: italic;
  line-height: 1.6;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.mr-label {
  color: #686e64;
  font-size: 22rpx;
}

.mr-val {
  color: #1a1c19;
  font-size: 22rpx;
  font-weight: bold;
}

.mr-val.accent {
  color: #3a6348;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.detail-tag {
  padding: 4rpx 14rpx;
  border-radius: 14rpx;
  background: #ece7de;
  color: #3a6348;
  font-size: 20rpx;
}

/* 时间轴 */
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-add-note {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 21rpx;
  font-weight: bold;
}

.timeline-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
}

.timeline-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #3a6348;
  margin-top: 12rpx;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.timeline-card {
  flex: 1;
  background: #f8f7f4;
  border-radius: 20rpx;
  padding: 18rpx 22rpx;
}

.tc-meta {
  color: #686e64;
  font-size: 20rpx;
}

.tc-content {
  display: block;
  color: #1a1c19;
  font-size: 24rpx;
  line-height: 1.5;
  margin-top: 8rpx;
}

.timeline-empty {
  padding: 30rpx 0;
  text-align: center;
}

.empty-hint {
  color: #8c887e;
  font-size: 22rpx;
}

/* 角色谱系 */
.characters-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.character-card {
  display: flex;
  align-items: center;
  background: #f8f7f4;
  border-radius: 22rpx;
  padding: 18rpx;
}

.c-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #ece7de;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.c-info {
  flex: 1;
  min-width: 0;
}

.c-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.c-name {
  color: #1a1c19;
  font-size: 26rpx;
  font-weight: bold;
}

.c-role {
  color: #9e7638;
  font-size: 20rpx;
}

.c-desc {
  display: block;
  color: #686e64;
  font-size: 21rpx;
  line-height: 1.4;
  margin-top: 6rpx;
}

/* 篇章大纲 */
.outline-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.outline-item {
  display: flex;
  align-items: flex-start;
  background: #f8f7f4;
  border-radius: 20rpx;
  padding: 18rpx;
}

.o-num {
  color: #9e7638;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
  margin-right: 18rpx;
}

.o-body {
  flex: 1;
}

.o-title {
  display: block;
  color: #1a1c19;
  font-size: 25rpx;
  font-weight: bold;
}

.o-summary {
  display: block;
  color: #686e64;
  font-size: 21rpx;
  line-height: 1.4;
  margin-top: 4rpx;
}

/* 伴读原声 */
.tracks-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.track-item {
  display: flex;
  align-items: center;
  background: #f8f7f4;
  border-radius: 22rpx;
  padding: 20rpx;
}

.track-icon {
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #3a6348;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  margin-right: 18rpx;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  color: #1a1c19;
  font-size: 26rpx;
  font-weight: bold;
}

.track-artist {
  display: block;
  color: #686e64;
  font-size: 20rpx;
  margin-top: 2rpx;
}

.track-tag {
  color: #9e7638;
  font-size: 20rpx;
}

/* 心智推导解析 */
.analysis-box {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.an-row {
  display: flex;
  align-items: center;
}

.an-label {
  width: 160rpx;
  color: #686e64;
  font-size: 22rpx;
}

.an-bar-wrap {
  flex: 1;
  height: 14rpx;
  background: #ece7de;
  border-radius: 8rpx;
  margin: 0 16rpx;
  overflow: hidden;
}

.an-bar {
  height: 100%;
  background: #3a6348;
  border-radius: 8rpx;
}

.an-bar.gold { background: #9e7638; }
.an-bar.red { background: #e63946; }
.an-bar.blue { background: #38bdf8; }

.an-score {
  width: 50rpx;
  text-align: right;
  color: #1a1c19;
  font-size: 22rpx;
  font-weight: bold;
}

/* ── 新增笔记弹窗 ── */
.note-modal-mask {
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

.note-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.nd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nd-title {
  color: #1a1c19;
  font-size: 30rpx;
  font-weight: bold;
  font-family: serif;
}

.nd-close {
  color: #686e64;
  font-size: 30rpx;
  padding: 8rpx;
}

.nd-textarea {
  width: 100%;
  height: 180rpx;
  background: #f8f7f4;
  border-radius: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: #1a1c19;
  margin-top: 20rpx;
}

.nd-inputs {
  display: flex;
  gap: 14rpx;
  margin-top: 16rpx;
}

.nd-input {
  flex: 1;
  height: 68rpx;
  background: #f8f7f4;
  border-radius: 18rpx;
  padding: 0 16rpx;
  font-size: 22rpx;
}

.btn-save-note {
  margin-top: 24rpx;
  height: 80rpx;
  background: #3a6348;
  color: #ffffff;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
}

/* 缺失提示 */
.missing-panel {
  padding: 100rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.missing-text {
  color: #686e64;
  font-size: 26rpx;
}

.btn-back-hub {
  margin-top: 30rpx;
  padding: 14rpx 36rpx;
  border-radius: 28rpx;
  background: #3a6348;
  color: #ffffff;
  font-size: 24rpx;
}
</style>
