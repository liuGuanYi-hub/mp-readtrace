<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <!-- 顶部策展人档案面板（对齐 App fragment_profile.xml） -->
    <view class="header-panel">
      <view class="title-row">
        <text class="page-title">👤 精神档案与通行证</text>
        <view class="btn-auth" @tap="onEditCurator">✦ 策展人入驻</view>
      </view>
      <text class="profile-summary">记录认知心智演化轨迹 · 沉淀灵魂深处的回忆与勋章</text>

      <!-- 全息策展人通行卡 (CuratorPassCardView 复刻) -->
      <view class="curator-pass-card">
        <view class="pass-hologram-shine"></view>
        <view class="pass-head">
          <view class="pass-brand">
            <text class="pass-brand-text">READTRACE CURATOR PASS</text>
            <text class="pass-vol">VOL. I · 2026</text>
          </view>
          <text class="pass-chip">🎴</text>
        </view>

        <view class="pass-body">
          <view class="pass-avatar">ZZD</view>
          <view class="pass-user">
            <text class="pass-name">首席独立策展人</text>
            <text class="pass-id">ID: RT-2026-88019 · 殿堂级</text>
          </view>
        </view>

        <view class="pass-foot">
          <text class="pass-meta">已入库 {{ totalWorks }} 部跨界藏品 · 解锁 12 枚心智徽章</text>
          <text class="pass-sign">AUTHENTIC ARCHIVE</text>
        </view>
      </view>

      <!-- 云端保险库增量同步操作条 -->
      <view class="vault-sync-bar" @tap="showSyncModal = true">
        <text class="vault-status-text">☁️ 云端保险库 · {{ syncStatusText }}</text>
        <view class="btn-sync-now" :class="{ syncing }" @tap.stop="triggerSync">
          {{ syncing ? '🔄 同步中…' : '🔄 立即同步' }}
        </view>
      </view>
    </view>

    <!-- 🧠 年度认知心智画像面板 (MindprintRadar) -->
    <view class="annual-persona-panel">
      <view class="persona-head">
        <text class="persona-title">🧠 年度认知心智画像</text>
        <view class="persona-badge">深邃博学者</view>
      </view>
      <text class="persona-desc">
        对宏大哲学叙事、意识流机战、宇宙社会学与纯真诗意展现出极高心智共鸣与深度洞察
      </text>

      <!-- 原生六维心智雷达图 -->
      <view class="radar-box">
        <MindprintRadar
          :depth="avgMindprint.depth"
          :artistry="avgMindprint.artistry"
          :emotion="avgMindprint.emotion"
          :logic="avgMindprint.logic"
          :difficulty="avgMindprint.difficulty"
          :healing="avgMindprint.healing"
          :size="260"
        />
      </view>
    </view>

    <!-- 🏛️ 虚拟空间与展览广场 -->
    <view class="section-label">🏛️ 虚拟空间与展览广场</view>

    <view class="action-card" @tap="onAction('favorites')">
      <view class="card-head">
        <text class="card-title">❤️ 我的最爱 · 跨媒介心选</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        书籍、番剧、电影、游戏、音乐五大分类心选收藏，支持金标排位与一键导出长图
      </text>
    </view>

    <view class="action-card" @tap="onAction('chronicle')">
      <view class="card-head">
        <text class="card-title">🏆 策展人年度精神年鉴</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        美术馆级年度精神画册：宏观足迹、巅峰海拔雷达与灵魂金句，一键导出印刷级长图
      </text>
    </view>

    <view class="action-card" @tap="onAction('community')">
      <view class="card-head">
        <text class="card-title">🌐 阅痕云端展览广场</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        漫游探访同频策展人的 3D 虚拟展厅与灵魂长评共鸣
      </text>
    </view>

    <view class="action-card" @tap="onAction('badges')">
      <view class="card-head">
        <text class="card-title">🏅 精神阅痕成就勋章</text>
        <view class="card-badge">已解锁 12/18</view>
      </view>
      <text class="card-desc">
        收集深邃探索者、时间旅人、黄金精神等 18 枚策展人专属荣誉勋章
      </text>
    </view>

    <!-- ⚙️ 系统管理与备份恢复 -->
    <view class="section-label">⚙️ 系统管理与备份恢复</view>

    <view class="action-card" @tap="onAction('migration')">
      <view class="card-head">
        <text class="card-title">🚚 多源资产搬家中心</text>
        <view class="card-pill">豆瓣 · B站 · Steam</view>
      </view>
      <text class="card-desc">
        0 门槛一键导入豆瓣书影音、Bangumi 番剧与 Steam 游戏库
      </text>
    </view>

    <view class="action-card" @tap="onAction('backup')">
      <view class="card-head">
        <text class="card-title">📦 数据备份与多格式导出</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        支持 JSON 完整备份、Obsidian Markdown 文集与 CSV 数据表格导出
      </text>
    </view>

    <view class="action-card" @tap="onAction('trash')">
      <view class="card-head">
        <text class="card-title">🗑️ 回收站与归档恢复</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        查看已软删除的作品，支持一键还原或彻底清空
      </text>
    </view>

    <view class="action-card" @tap="onAction('changelog')">
      <view class="card-head">
        <text class="card-title">📜 版本演进纪要</text>
        <view class="card-pill accent">v4.3.0</view>
      </view>
      <text class="card-desc">
        查看历史版本迭代、双端漫游协议与最新更新日志
      </text>
    </view>

    <view class="action-card" @tap="onAction('about')">
      <view class="card-head">
        <text class="card-title">🏷️ 关于阅痕 ReadTrace</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        跨媒介文化印记策展空间 · 记录看过的作品，也记录当时的自己
      </text>
    </view>

    <!-- WebDAV 配置弹窗 -->
    <view class="sync-modal-mask" v-if="showSyncModal" @tap.self="showSyncModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">☁️ WebDAV 云端保险库配置</text>
          <view class="modal-close" @tap="showSyncModal = false">✕</view>
        </view>
        <text class="modal-sub">与坚果云、NAS 或 Nextcloud 同步，数据主权 100% 归你所有</text>

        <view class="form-item">
          <text class="form-label">服务器地址</text>
          <input class="form-input" v-model="webdavServer" placeholder="https://dav.jianguoyun.com/dav/" />
        </view>

        <view class="form-item">
          <text class="form-label">账号 / 用户名</text>
          <input class="form-input" v-model="webdavUser" placeholder="your_email@example.com" />
        </view>

        <view class="form-item">
          <text class="form-label">应用密码</text>
          <input class="form-input" type="password" v-model="webdavPass" placeholder="坚果云应用密码" />
        </view>

        <view class="modal-btn-row">
          <view class="modal-btn-save" @tap="saveWebDavSettings">保存并立即同步</view>
        </view>
      </view>
    </view>

    <TabBar :active="4" />
  </scroll-view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import TabBar from '../../components/TabBar.vue';
import MindprintRadar from '../../components/MindprintRadar.vue';
import { loadLocalWorks, loadLocalMindprints, performSync, loadConfig, saveConfig } from '../../utils/sync';
import { performDualChannelSync, getCloudStats } from '../../utils/cloud-sync';
import type { Mindprint } from '../../utils/models';

const totalWorks = ref(0);
const syncing = ref(false);
const syncStatusText = ref('免密漫游就绪');
const mindprints = ref<Mindprint[]>([]);

const showSyncModal = ref(false);
const webdavServer = ref('');
const webdavUser = ref('');
const webdavPass = ref('');

onShow(() => {
  const works = loadLocalWorks();
  totalWorks.value = works.length;
  mindprints.value = loadLocalMindprints();

  const cloudStats = getCloudStats();
  if (cloudStats.lastSyncTime) {
    syncStatusText.value = `已漫游 (${cloudStats.lastSyncTime.slice(5, 16)})`;
  }

  const cfg = loadConfig();
  if (cfg) {
    webdavServer.value = cfg.serverUrl;
    webdavUser.value = cfg.username;
    webdavPass.value = cfg.password;
    if (!cloudStats.lastSyncTime) {
      syncStatusText.value = '已配置 WebDAV';
    }
  }
});

// 计算库藏平均六维心智
const avgMindprint = computed(() => {
  const list = mindprints.value;
  if (!list.length) {
    return { depth: 9.6, artistry: 9.8, emotion: 9.2, logic: 9.5, difficulty: 7.2, healing: 8.8 };
  }
  const avg = (key: keyof Mindprint) => {
    const nums = list.map((m) => Number(m[key]) || 0);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };
  return {
    depth: avg('depthScore'),
    artistry: avg('artistryScore'),
    emotion: avg('emotionScore'),
    logic: avg('logicScore'),
    difficulty: avg('difficultyScore'),
    healing: avg('healingScore'),
  };
});

async function triggerSync() {
  if (syncing.value) return;
  syncing.value = true;
  syncStatusText.value = '正在双端免密漫游…';
  try {
    const res = await performDualChannelSync();
    syncStatusText.value = res.cloudResult.message;
    uni.showToast({
      title: '✅ 漫游同步完成',
      icon: 'none',
    });
    const works = loadLocalWorks();
    totalWorks.value = works.length;
    mindprints.value = loadLocalMindprints();
  } catch (err: any) {
    syncStatusText.value = '漫游异常';
    uni.showToast({ title: err?.message || '漫游失败', icon: 'none' });
  } finally {
    syncing.value = false;
  }
}

function saveWebDavSettings() {
  if (!webdavServer.value || !webdavUser.value || !webdavPass.value) {
    uni.showToast({ title: '请完整填写 WebDAV 配置', icon: 'none' });
    return;
  }
  saveConfig({
    serverUrl: webdavServer.value.trim(),
    username: webdavUser.value.trim(),
    password: webdavPass.value.trim(),
  });
  showSyncModal.value = false;
  uni.showToast({ title: '配置已保存', icon: 'none' });
  triggerSync();
}

function onEditCurator() {
  uni.showToast({ title: '已认证为核心策展人 ZZD', icon: 'none' });
}

function onAction(type: string) {
  switch (type) {
    case 'favorites':
      uni.navigateTo({ url: '/pages/favorites/index' });
      break;
    case 'chronicle':
      uni.redirectTo({ url: '/pages/memoir/index' });
      break;
    case 'community':
      uni.showToast({ title: '已连接本地局域展厅，可与 App 端 3D 展厅联动', icon: 'none' });
      break;
    case 'badges':
      uni.showToast({ title: '已点亮 12 枚专属精神勋章（包含深邃探索者、星海漫步者）', icon: 'none' });
      break;
    case 'migration':
      uni.navigateTo({ url: '/pages/backup/index' });
      break;
    case 'backup':
      uni.navigateTo({ url: '/pages/backup/index' });
      break;
    case 'trash':
      uni.navigateTo({ url: '/pages/trash/index' });
      break;
    case 'changelog':
      uni.showToast({ title: 'v4.3.0: 全面像素级复刻 Android App 策展设计语言', icon: 'none' });
      break;
    case 'about':
      uni.showToast({ title: '阅痕 ReadTrace · 美术馆级跨媒介文化印记空间', icon: 'none' });
      break;
  }
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

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  color: var(--rt-ink);
  font-size: 44rpx;
  font-weight: bold;
  font-family: serif;
}

.btn-auth {
  padding: 8rpx 24rpx;
  border-radius: 26rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 14rpx rgba(58, 99, 72, 0.3);
}

.profile-summary {
  display: block;
  color: var(--rt-muted);
  font-size: 24rpx;
  line-height: 1.5;
  margin-top: 10rpx;
}

/* ── 全息策展人通行卡 ── */
.curator-pass-card {
  margin-top: 24rpx;
  background: linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%);
  border: 2rpx solid rgba(255, 215, 0, 0.3);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(13, 27, 42, 0.35);
  position: relative;
  overflow: hidden;
}

.pass-hologram-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
  pointer-events: none;
}

.pass-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pass-brand-text {
  color: var(--rt-gold-bright);
  font-size: 22rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.pass-vol {
  color: #a0aec0;
  font-size: 19rpx;
  margin-left: 12rpx;
}

.pass-chip {
  font-size: 32rpx;
}

.pass-body {
  display: flex;
  align-items: center;
  margin-top: 26rpx;
}

.pass-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: var(--rt-accent);
  border: 2rpx solid #ffd700;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 22rpx;
}

.pass-name {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  font-family: serif;
}

.pass-id {
  color: #cbd5e0;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.pass-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding-top: 18rpx;
  border-top: 1.5rpx solid rgba(255, 255, 255, 0.1);
}

.pass-meta {
  color: #a0aec0;
  font-size: 20rpx;
}

.pass-sign {
  color: var(--rt-gold-bright);
  font-size: 18rpx;
  letter-spacing: 2rpx;
  font-weight: bold;
}

/* ── 同步条 ── */
.vault-sync-bar {
  margin-top: 22rpx;
  height: 76rpx;
  background: var(--rt-chip);
  border-radius: 24rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vault-status-text {
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
}

.btn-sync-now {
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

.btn-sync-now.syncing {
  opacity: 0.5;
}

/* ── 年度认知心智画像面板 ── */
.annual-persona-panel {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 40rpx;
  padding: 34rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.persona-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.persona-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.persona-badge {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(58, 99, 72, 0.1);
  border: 1.5rpx solid rgba(58, 99, 72, 0.3);
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

.persona-desc {
  display: block;
  color: var(--rt-muted);
  font-size: 23rpx;
  line-height: 1.5;
  margin-top: 12rpx;
}

.radar-box {
  margin-top: 20rpx;
}

/* ── 列表标签 ── */
.section-label {
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 32rpx;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

/* ── 操作卡片 ── */
.action-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}

.action-card:active {
  transform: scale(0.99);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
}

.card-arrow {
  color: #9e9c94;
  font-size: 24rpx;
}

.card-badge {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  background: var(--rt-chip);
  color: var(--rt-accent);
  font-size: 21rpx;
  font-weight: bold;
}

.card-pill {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  background: var(--rt-chip);
  color: var(--rt-muted);
  font-size: 21rpx;
  font-weight: bold;
}

.card-pill.accent {
  background: rgba(58, 99, 72, 0.1);
  color: var(--rt-accent);
}

.card-desc {
  display: block;
  color: var(--rt-muted);
  font-size: 22rpx;
  line-height: 1.5;
  margin-top: 10rpx;
}

/* ── WebDAV 同步配置弹窗 ── */
.sync-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  box-sizing: border-box;
}

.sync-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.modal-close {
  color: var(--rt-muted);
  font-size: 32rpx;
  padding: 8rpx;
}

.modal-sub {
  display: block;
  color: var(--rt-muted);
  font-size: 22rpx;
  margin-top: 6rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 18rpx;
}

.form-label {
  display: block;
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.form-input {
  height: 76rpx;
  background: var(--rt-bg);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 20rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: var(--rt-ink);
}

.modal-btn-row {
  margin-top: 30rpx;
}

.modal-btn-save {
  height: 84rpx;
  background: var(--rt-accent);
  color: #ffffff;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 20rpx rgba(58, 99, 72, 0.3);
}
</style>
