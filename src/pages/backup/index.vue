<template>
  <view class="backup-page">
    <!-- 顶部状态栏与导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title-wrap">
        <text class="page-title">数据主权与备份</text>
        <text class="page-subtitle">Sovereign Data Archive & Migration</text>
      </view>
    </view>

    <!-- 数据资产面板 -->
    <view class="stat-card">
      <text class="gem-icon">💎</text>
      <view class="stat-info">
        <text class="stat-main">当前共存储 {{ worksCount }} 部作品 · {{ notesCount }} 条随想痕迹</text>
        <text class="stat-sub">Schema v5 同构 · 离线私密存储于当前设备</text>
      </view>
    </view>

    <!-- ═══ ☁️ 微信云端免登录静默漫游 ═══ -->
    <view class="section-title">☁️ 微信云端免登录漫游</view>
    <view class="cloud-roaming-card">
      <view class="cr-top">
        <view class="cr-status-indicator" :class="{ online: cloudStats.mode !== 'uninitialized' }">
          <text class="cr-dot"></text>
          <text class="cr-status-name">
            {{ cloudStats.mode === 'wx_cloud' ? '微信云数据库已连接' : '本地快照模式（未连接云端）' }}
          </text>
        </view>
        <view class="cr-env-btn" @tap="showCloudEnvModal = true">
          {{ cloudEnvId ? '环境: ' + cloudEnvId : '⚙️ 云环境' }}
        </view>
      </view>

      <view class="cr-stats-row">
        <view class="cr-stat-col">
          <text class="cr-val">{{ cloudStats.cloudWorksCount }}</text>
          <text class="cr-lbl">云端藏品</text>
        </view>
        <view class="cr-stat-col">
          <text class="cr-val">{{ cloudStats.cloudNotesCount }}</text>
          <text class="cr-lbl">心流笔记</text>
        </view>
        <view class="cr-stat-col">
          <text class="cr-val">{{ cloudStats.cloudMindprintsCount }}</text>
          <text class="cr-lbl">心智印记</text>
        </view>
      </view>

      <view class="cr-openid-bar">
        <text class="cr-openid-text">当前设备身份：{{ cloudStats.openId }}</text>
      </view>

      <view class="cr-actions">
        <button class="btn-cloud-sync" :class="{ syncing: isCloudSyncing }" @tap="handleCloudSync">
          {{ isCloudSyncing ? '🔄 正在双端增量漫游…' : '☁️ 立即一键免密漫游同步' }}
        </button>
        <button class="btn-dual-sync" @tap="handleDualSync">
          🛡️ 双通道协同漫游 (微信+WebDAV)
        </button>
      </view>

      <text class="cr-sync-time" v-if="cloudStats.lastSyncTime">
        上次漫游时间：{{ cloudStats.lastSyncTime }}
      </text>
    </view>

    <!-- 操作卡片组 -->
    <view class="section-title">全量数据资产流转</view>

    <view class="action-grid">
      <!-- 导入 JSON -->
      <view class="action-card primary" @tap="openImportModal">
        <view class="card-icon-wrap">
          <text class="card-icon">📥</text>
        </view>
        <view class="card-body">
          <text class="card-title">导入全量 JSON 备份</text>
          <text class="card-desc">兼容 Android Sovereign Backup、微信聊天文件或粘贴导入</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <!-- 导出 JSON -->
      <view class="action-card" @tap="handleExportJson">
        <view class="card-icon-wrap">
          <text class="card-icon">📤</text>
        </view>
        <view class="card-body">
          <text class="card-title">导出 JSON 备份 (Sovereign Backup)</text>
          <text class="card-desc">含 6 大高阶维度资产，可无缝恢复到 Android 原生 App</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <!-- 导出 Markdown -->
      <view class="action-card" @tap="handleExportMarkdown">
        <view class="card-icon-wrap">
          <text class="card-icon">📑</text>
        </view>
        <view class="card-body">
          <text class="card-title">导出 Markdown 笔记文集</text>
          <text class="card-desc">排版优雅的纯文本笔记，方便导入 Obsidian 或 Logseq</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <!-- 导出 CSV -->
      <view class="action-card" @tap="handleExportCsv">
        <view class="card-icon-wrap">
          <text class="card-icon">📊</text>
        </view>
        <view class="card-body">
          <text class="card-title">导出 CSV 典藏表格</text>
          <text class="card-desc">标准表格格式，可在 Excel / Numbers 中检索与数据分析</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 危险操作区 -->
    <view class="section-title danger-title">危险操作</view>
    <view class="danger-card" @tap="showWipeModal = true">
      <view class="card-icon-wrap danger-icon">
        <text class="card-icon">🗑️</text>
      </view>
      <view class="card-body">
        <text class="card-title danger-text">清空账号全部数据</text>
        <text class="card-desc">彻底物理删除所有典藏、笔记、心智与关联曲目，无法撤回</text>
      </view>
      <text class="danger-tag">危险</text>
    </view>

    <!-- 导入弹窗 -->
    <view v-if="showImportModal" class="modal-mask" @tap.self="showImportModal = false">
      <view class="modal-box">
        <view class="modal-header">
          <text class="modal-title">📥 导入 JSON 备份</text>
          <text class="close-btn" @tap="showImportModal = false">✕</text>
        </view>

        <view class="import-options">
          <button class="file-picker-btn" @tap="chooseWechatFile">
            📁 从微信聊天记录中选择 JSON 文件
          </button>
        </view>

        <view class="or-divider">
          <view class="line" />
          <text class="divider-text">或直接粘贴 JSON 文本</text>
          <view class="line" />
        </view>

        <textarea
          v-model="importJsonText"
          class="json-textarea"
          placeholder="在此粘贴来自 Android App 或小程序的 readtrace_backup_*.json 文本内容..."
          maxlength="-1"
        />

        <view class="mode-selector">
          <text class="mode-label">合并方式：</text>
          <view class="mode-chips">
            <view
              class="mode-chip"
              :class="{ active: importMode === 'merge' }"
              @tap="importMode = 'merge'"
            >
              增量合并（推荐）
            </view>
            <view
              class="mode-chip"
              :class="{ active: importMode === 'replace' }"
              @tap="importMode = 'replace'"
            >
              全量覆盖（清空现有）
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <button class="btn-cancel" @tap="showImportModal = false">取消</button>
          <button class="btn-confirm" :disabled="!importJsonText.trim()" @tap="executeImport">
            确认导入
          </button>
        </view>
      </view>
    </view>

    <!-- 预览与复制弹窗 (Markdown / CSV / JSON) -->
    <view v-if="previewModal.visible" class="modal-mask" @tap.self="previewModal.visible = false">
      <view class="modal-box preview-box">
        <view class="modal-header">
          <text class="modal-title">{{ previewModal.title }}</text>
          <text class="close-btn" @tap="previewModal.visible = false">✕</text>
        </view>

        <scroll-view scroll-y class="preview-scroll">
          <text class="preview-code">{{ previewModal.content }}</text>
        </scroll-view>

        <view class="modal-actions">
          <button class="btn-cancel" @tap="previewModal.visible = false">关闭</button>
          <button class="btn-confirm" @tap="copyPreviewContent">复制到剪贴板</button>
        </view>
      </view>
    </view>

    <!-- 清空数据防误触验证弹窗 -->
    <view v-if="showWipeModal" class="modal-mask" @tap.self="showWipeModal = false">
      <view class="modal-box wipe-box">
        <view class="modal-header">
          <text class="modal-title danger-title">🗑️ 清空账号数据</text>
          <text class="close-btn" @tap="showWipeModal = false">✕</text>
        </view>
        <view class="wipe-notice">
          即将物理删除全部作品、笔记、角色谱、大纲与心智模型，操作不可撤回！
        </view>
        <view class="wipe-prompt">
          如确定继续，请在下方准确输入：<text class="keyword">我确定删除账号数据</text>
        </view>
        <input
          v-model="wipeConfirmInput"
          class="wipe-input"
          placeholder="在此输入验证文字"
        />
        <view class="modal-actions">
          <button class="btn-cancel" @tap="showWipeModal = false">取消</button>
          <button
            class="btn-wipe"
            :disabled="wipeConfirmInput.trim() !== '我确定删除账号数据'"
            @tap="executeWipeData"
          >
            确认清空（不可恢复）
          </button>
        </view>
      </view>
    </view>

    <!-- ☁️ 微信云开发环境配置弹窗 -->
    <view v-if="showCloudEnvModal" class="modal-mask" @tap.self="showCloudEnvModal = false">
      <view class="modal-box">
        <view class="modal-header">
          <text class="modal-title">⚙️ 微信云开发环境配置</text>
          <text class="close-btn" @tap="showCloudEnvModal = false">✕</text>
        </view>
        <view class="wipe-warning" style="color: var(--rt-muted); font-size: 22rpx; line-height: 1.6;">
          若您在微信小程序后台开通了云开发，可在此填写环境 ID（如 readtrace-prod-xxx），填写后同步走真实云数据库；留空则仅在本机做快照整理（不产生网络同步）。
        </view>
        <input
          v-model="inputEnvId"
          class="wipe-input"
          placeholder="请输入云开发环境 ID（留空为自动模式）"
        />
        <view class="modal-actions">
          <button class="btn-cancel" @tap="showCloudEnvModal = false">取消</button>
          <button class="btn-primary-act" @tap="saveCloudEnv">保存配置</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  exportJsonBackup,
  exportMarkdownNotes,
  exportCsvWorks,
  parseAndImportBackup,
  wipeAllAccountData,
} from '@/utils/backup';
import { loadLocalWorks, loadLocalNotes } from '@/utils/sync';
import {
  syncWithWeChatCloud,
  performDualChannelSync,
  getCloudStats,
  getCloudEnvId,
  setCloudEnvId,
  type CloudStats,
} from '@/utils/cloud-sync';

const worksCount = ref(0);
const notesCount = ref(0);

const isCloudSyncing = ref(false);
const cloudStats = ref<CloudStats>({
  lastSyncTime: null,
  mode: 'uninitialized',
  openId: '',
  cloudWorksCount: 0,
  cloudNotesCount: 0,
  cloudMindprintsCount: 0,
});
const cloudEnvId = ref('');
const showCloudEnvModal = ref(false);
const inputEnvId = ref('');

const showImportModal = ref(false);
const importJsonText = ref('');
const importMode = ref<'merge' | 'replace'>('merge');

const previewModal = ref({
  visible: false,
  title: '',
  content: '',
});

const showWipeModal = ref(false);
const wipeConfirmInput = ref('');

function refreshStats() {
  const works = loadLocalWorks().filter((w) => !w.isDeleted);
  const notes = loadLocalNotes().filter((n) => !n.isDeleted);
  worksCount.value = works.length;
  notesCount.value = notes.length;

  cloudStats.value = getCloudStats();
  cloudEnvId.value = getCloudEnvId();
  inputEnvId.value = cloudEnvId.value;
}

onMounted(() => {
  refreshStats();
});

async function handleCloudSync() {
  if (isCloudSyncing.value) return;
  isCloudSyncing.value = true;
  uni.showLoading({ title: '正在云端免密漫游…' });
  try {
    const res = await syncWithWeChatCloud();
    uni.hideLoading();
    refreshStats();
    uni.showToast({
      title: res.message,
      icon: 'none',
      duration: 3000,
    });
  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: err?.message || '漫游失败', icon: 'none' });
  } finally {
    isCloudSyncing.value = false;
  }
}

async function handleDualSync() {
  if (isCloudSyncing.value) return;
  isCloudSyncing.value = true;
  uni.showLoading({ title: '双通道协同漫游中…' });
  try {
    const res = await performDualChannelSync();
    uni.hideLoading();
    refreshStats();
    uni.showModal({
      title: '☁️ 双通道漫游报告',
      content: res.summary,
      showCancel: false,
    });
  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: '协同漫游异常', icon: 'none' });
  } finally {
    isCloudSyncing.value = false;
  }
}

function saveCloudEnv() {
  setCloudEnvId(inputEnvId.value.trim());
  cloudEnvId.value = inputEnvId.value.trim();
  showCloudEnvModal.value = false;
  refreshStats();
  uni.showToast({ title: '环境配置已更新', icon: 'none' });
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/profile/index' });
    },
  });
}

function openImportModal() {
  importJsonText.value = '';
  showImportModal.value = true;
}

/** 从微信会话中选择文件 */
function chooseWechatFile() {
  // @ts-ignore
  if (typeof wx !== 'undefined' && wx.chooseMessageFile) {
    // @ts-ignore
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json', 'txt'],
      success: (res: any) => {
        const file = res.tempFiles?.[0];
        if (file && file.path) {
          // @ts-ignore
          const fs = wx.getFileSystemManager();
          fs.readFile({
            filePath: file.path,
            encoding: 'utf8',
            success: (readRes: any) => {
              importJsonText.value = readRes.data;
              uni.showToast({ title: '已读取文件内容', icon: 'success' });
            },
            fail: () => {
              uni.showToast({ title: '读取文件失败', icon: 'none' });
            },
          });
        }
      },
      fail: () => {
        uni.showToast({ title: '已取消文件选择', icon: 'none' });
      },
    });
  } else {
    uni.showToast({ title: '当前环境请直接粘贴文本', icon: 'none' });
  }
}

function executeImport() {
  if (!importJsonText.value.trim()) return;
  uni.showLoading({ title: '正在解析导入...' });
  setTimeout(() => {
    const res = parseAndImportBackup(importJsonText.value, importMode.value);
    uni.hideLoading();
    if (res.success) {
      uni.showModal({
        title: '导入成功',
        content: res.message,
        showCancel: false,
        success: () => {
          showImportModal.value = false;
          refreshStats();
        },
      });
    } else {
      uni.showModal({
        title: '导入失败',
        content: res.message,
        showCancel: false,
      });
    }
  }, 100);
}

function handleExportJson() {
  const json = exportJsonBackup();
  previewModal.value = {
    visible: true,
    title: '📤 Sovereign Backup JSON',
    content: json,
  };
}

function handleExportMarkdown() {
  const md = exportMarkdownNotes();
  previewModal.value = {
    visible: true,
    title: '📑 Markdown 笔记文集',
    content: md,
  };
}

function handleExportCsv() {
  const csv = exportCsvWorks();
  previewModal.value = {
    visible: true,
    title: '📊 CSV 典藏表格',
    content: csv,
  };
}

function copyPreviewContent() {
  uni.setClipboardData({
    data: previewModal.value.content,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' });
      previewModal.value.visible = false;
    },
  });
}

function executeWipeData() {
  if (wipeConfirmInput.value.trim() !== '我确定删除账号数据') return;
  wipeAllAccountData();
  showWipeModal.value = false;
  wipeConfirmInput.value = '';
  refreshStats();
  uni.showModal({
    title: '数据已清空',
    content: '所有本地数据已彻底物理抹除。',
    showCancel: false,
  });
}
</script>

<style scoped>
.backup-page {
  min-height: 100vh;
  background-color: var(--rt-bg);
  padding: 40rpx 32rpx 80rpx;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 36rpx;
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
  letter-spacing: 0.5rpx;
}

.page-subtitle {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 4rpx;
  font-family: Georgia, serif;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(44, 42, 38, 0.05);
  border: 1rpx solid var(--rt-chip);
  margin-bottom: 40rpx;
}

.gem-icon {
  font-size: 44rpx;
  margin-right: 24rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-main {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.stat-sub {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 6rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #5C584E;
  margin-bottom: 20rpx;
  letter-spacing: 1rpx;
}

.danger-title {
  color: var(--rt-danger);
  margin-top: 36rpx;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-card {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  border: 1rpx solid var(--rt-chip);
  box-shadow: 0 4rpx 16rpx rgba(44, 42, 38, 0.04);
}

.action-card.primary {
  background: linear-gradient(135deg, #FFFFFF 0%, #F3F7F4 100%);
  border-color: var(--rt-accent);
}

.card-icon-wrap {
  width: 76rpx;
  height: 76rpx;
  border-radius: 16rpx;
  background: #F4F2EE;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.card-icon {
  font-size: 36rpx;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--rt-ink);
}

.card-desc {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 6rpx;
}

.arrow {
  font-size: 36rpx;
  color: #B4B0A5;
}

.danger-card {
  display: flex;
  align-items: center;
  background: #FFF5F5;
  border-radius: 20rpx;
  padding: 28rpx;
  border: 1rpx solid #FFCDD2;
}

.danger-icon {
  background: #FFEBEE;
}

.danger-text {
  color: var(--rt-danger);
}

.danger-tag {
  font-size: 20rpx;
  color: var(--rt-danger);
  background: #FFCDD2;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 600;
}

/* 模态弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 16, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-box {
  width: 100%;
  max-width: 640rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

.preview-box {
  max-width: 680rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.close-btn {
  font-size: 36rpx;
  color: var(--rt-faint);
  padding: 10rpx;
}

.file-picker-btn {
  background: var(--rt-chip);
  color: var(--rt-ink);
  font-size: 26rpx;
  border-radius: 16rpx;
  padding: 18rpx;
  font-weight: 600;
}

.or-divider {
  display: flex;
  align-items: center;
  margin: 24rpx 0;
}

.line {
  flex: 1;
  height: 1rpx;
  background: var(--rt-chip);
}

.divider-text {
  font-size: 22rpx;
  color: var(--rt-faint);
  padding: 0 16rpx;
}

.json-textarea {
  width: 100%;
  height: 240rpx;
  background: var(--rt-bg);
  border: 1rpx solid var(--rt-chip);
  border-radius: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  font-family: monospace;
}

.mode-selector {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
}

.mode-label {
  font-size: 24rpx;
  color: #5C584E;
}

.mode-chips {
  display: flex;
  gap: 16rpx;
}

.mode-chip {
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background: var(--rt-chip);
  color: #5C584E;
}

.mode-chip.active {
  background: var(--rt-accent);
  color: #FFFFFF;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn-cancel, .btn-confirm, .btn-wipe {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.btn-cancel {
  background: var(--rt-chip);
  color: #5C584E;
}

.btn-confirm {
  background: var(--rt-accent);
  color: #FFFFFF;
}

.btn-wipe {
  background: var(--rt-danger);
  color: #FFFFFF;
}

.btn-confirm:disabled, .btn-wipe:disabled {
  opacity: 0.4;
}

.preview-scroll {
  max-height: 480rpx;
  background: var(--rt-bg);
  border-radius: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.preview-code {
  font-size: 22rpx;
  font-family: monospace;
  color: var(--rt-ink);
  white-space: pre-wrap;
  word-break: break-all;
}

.wipe-notice {
  font-size: 26rpx;
  color: var(--rt-danger);
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.wipe-prompt {
  font-size: 24rpx;
  color: #5C584E;
  margin-bottom: 16rpx;
}

.keyword {
  color: var(--rt-danger);
  font-weight: 700;
}

.wipe-input {
  background: var(--rt-bg);
  border: 2rpx solid #FFCDD2;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  color: var(--rt-ink);
}

/* ═══ 微信云端漫游卡片 ═══ */
.cloud-roaming-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 30rpx 28rpx;
  border: 1.5rpx solid rgba(58, 99, 72, 0.2);
  margin-bottom: 36rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.cr-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.cr-status-indicator {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.cr-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: var(--rt-danger);
}

.cr-status-indicator.online .cr-dot {
  background: #4ADE80;
  box-shadow: 0 0 10rpx rgba(74, 222, 128, 0.6);
}

.cr-status-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--rt-ink);
}

.cr-env-btn {
  font-size: 20rpx;
  color: var(--rt-accent);
  background: rgba(58, 99, 72, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 600;
}

.cr-stats-row {
  display: flex;
  background: var(--rt-bg);
  border-radius: 20rpx;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.cr-stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1rpx solid rgba(0, 0, 0, 0.06);
}

.cr-stat-col:last-child {
  border-right: none;
}

.cr-val {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--rt-accent);
  font-family: Georgia, serif;
}

.cr-lbl {
  font-size: 20rpx;
  color: #8C9487;
  margin-top: 4rpx;
}

.cr-openid-bar {
  background: #F3F1EC;
  border-radius: 12rpx;
  padding: 10rpx 16rpx;
  margin-bottom: 24rpx;
}

.cr-openid-text {
  font-size: 19rpx;
  color: var(--rt-muted);
  font-family: monospace;
}

.cr-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn-cloud-sync {
  height: 80rpx;
  line-height: 80rpx;
  background: var(--rt-accent);
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 20rpx rgba(58, 99, 72, 0.25);
}

.btn-cloud-sync.syncing {
  background: var(--rt-gold);
}

.btn-dual-sync {
  height: 72rpx;
  line-height: 72rpx;
  background: var(--rt-chip);
  color: var(--rt-accent);
  border-radius: 36rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.cr-sync-time {
  display: block;
  text-align: center;
  font-size: 19rpx;
  color: #8C9487;
  margin-top: 16rpx;
}

.btn-primary-act {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
  font-weight: 600;
  background: var(--rt-accent);
  color: #FFFFFF;
}
</style>
