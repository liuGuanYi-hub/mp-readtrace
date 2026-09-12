<template>
  <view class="trash-page">
    <!-- 顶部状态栏与导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title-wrap">
        <text class="page-title">回收站</text>
        <text class="page-subtitle">Archived Works & Notes</text>
      </view>
      <view v-if="archivedWorks.length > 0 || archivedNotes.length > 0" class="clear-btn" @tap="confirmClearAll">
        <text class="clear-text">清空全部</text>
      </view>
    </view>

    <!-- 分段标签 (Tab) -->
    <view class="tab-chips">
      <view
        class="chip-item"
        :class="{ active: currentTab === 'books' }"
        @tap="currentTab = 'books'"
      >
        已归档作品 ({{ archivedWorks.length }})
      </view>
      <view
        class="chip-item"
        :class="{ active: currentTab === 'notes' }"
        @tap="currentTab = 'notes'"
      >
        已归档随感 ({{ archivedNotes.length }})
      </view>
    </view>

    <!-- 作品列表 -->
    <view v-if="currentTab === 'books'" class="list-container">
      <view v-if="archivedWorks.length === 0" class="empty-state">
        <text class="empty-icon">🍃</text>
        <text class="empty-text">回收站空空如也，暂无已归档作品</text>
      </view>

      <view v-for="item in archivedWorks" :key="item.id" class="trash-item-card">
        <image
          v-if="item.coverUrl"
          class="item-cover"
          :src="item.coverUrl"
          mode="aspectFill"
        />
        <view v-else class="item-cover-placeholder">
          <text>{{ MEDIA_LABEL[item.mediaType]?.emoji || '📖' }}</text>
        </view>

        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-meta">{{ item.author || '未知创作者' }} · {{ MEDIA_LABEL[item.mediaType]?.name }}</text>
          <text class="item-time">归档于 {{ formatTime(item.deletedAt) }}</text>
        </view>

        <view class="item-actions">
          <button class="btn-restore" @tap="handleRestoreWork(item.id)">恢复</button>
          <button class="btn-purge" @tap="handlePurgeWork(item.id, item.title)">彻底删除</button>
        </view>
      </view>
    </view>

    <!-- 随感列表 -->
    <view v-else class="list-container">
      <view v-if="archivedNotes.length === 0" class="empty-state">
        <text class="empty-icon">🍃</text>
        <text class="empty-text">暂无已归档随感笔记</text>
      </view>

      <view v-for="note in archivedNotes" :key="note.id" class="trash-note-card">
        <view class="note-header">
          <text class="note-type-badge">{{ note.noteType === 'quote' ? '摘录' : '随感' }}</text>
          <text class="note-book-title">《{{ note.bookTitle }}》</text>
        </view>
        <text class="note-content">{{ note.content }}</text>
        <view class="note-footer">
          <text class="item-time">归档于 {{ formatTime(note.deletedAt) }}</text>
          <view class="item-actions">
            <button class="btn-restore" @tap="handleRestoreNote(note.id)">恢复</button>
            <button class="btn-purge" @tap="handlePurgeNote(note.id)">彻底删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Book, Note } from '@/utils/models';
import { MEDIA_LABEL } from '@/utils/models';
import {
  getArchivedWorks,
  getArchivedNotes,
  restoreWork,
  purgeWork,
  restoreNote,
  purgeNote,
  purgeAllTrash,
} from '@/utils/backup';

const currentTab = ref<'books' | 'notes'>('books');
const archivedWorks = ref<Book[]>([]);
const archivedNotes = ref<(Note & { bookTitle?: string })[]>([]);

function refreshData() {
  archivedWorks.value = getArchivedWorks();
  archivedNotes.value = getArchivedNotes();
}

onMounted(() => {
  refreshData();
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/profile/index' });
    },
  });
}

function formatTime(isoStr?: string | null) {
  if (!isoStr) return '刚刚';
  return isoStr.slice(0, 16).replace('T', ' ');
}

function handleRestoreWork(id: number) {
  restoreWork(id);
  uni.showToast({ title: '已恢复典藏', icon: 'success' });
  refreshData();
}

function handlePurgeWork(id: number, title: string) {
  uni.showModal({
    title: '彻底删除作品',
    content: `确定永久抹除《${title}》及其所有笔记与大纲？操作无法撤回！`,
    confirmText: '永久删除',
    confirmColor: '#9E4545',
    success: (res) => {
      if (res.confirm) {
        purgeWork(id);
        uni.showToast({ title: '已永久粉碎', icon: 'none' });
        refreshData();
      }
    },
  });
}

function handleRestoreNote(id: number) {
  restoreNote(id);
  uni.showToast({ title: '已恢复笔记', icon: 'success' });
  refreshData();
}

function handlePurgeNote(id: number) {
  uni.showModal({
    title: '彻底删除笔记',
    content: '确定永久抹除该条笔记？操作无法撤回！',
    confirmText: '永久删除',
    confirmColor: '#9E4545',
    success: (res) => {
      if (res.confirm) {
        purgeNote(id);
        uni.showToast({ title: '已永久删除', icon: 'none' });
        refreshData();
      }
    },
  });
}

function confirmClearAll() {
  uni.showModal({
    title: '清空回收站',
    content: '确定永久清除回收站中的所有作品与随感吗？此操作不可逆！',
    confirmText: '全部清空',
    confirmColor: '#9E4545',
    success: (res) => {
      if (res.confirm) {
        purgeAllTrash();
        uni.showToast({ title: '回收站已清空', icon: 'success' });
        refreshData();
      }
    },
  });
}
</script>

<style scoped>
.trash-page {
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
  flex: 1;
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

.clear-btn {
  padding: 10rpx 20rpx;
  background: #FFEBEE;
  border-radius: 12rpx;
}

.clear-text {
  font-size: 24rpx;
  color: var(--rt-danger);
  font-weight: 600;
}

.tab-chips {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.chip-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  background: var(--rt-chip);
  color: #5C584E;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.chip-item.active {
  background: var(--rt-accent);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(58, 99, 72, 0.25);
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--rt-faint);
}

.trash-item-card {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  border: 1rpx solid var(--rt-chip);
  box-shadow: 0 4rpx 16rpx rgba(44, 42, 38, 0.04);
}

.item-cover {
  width: 96rpx;
  height: 136rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.item-cover-placeholder {
  width: 96rpx;
  height: 136rpx;
  border-radius: 12rpx;
  background: var(--rt-chip);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--rt-ink);
}

.item-meta {
  font-size: 22rpx;
  color: var(--rt-faint);
  margin-top: 6rpx;
}

.item-time {
  font-size: 20rpx;
  color: #B4B0A5;
  margin-top: 8rpx;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-left: 16rpx;
}

.btn-restore, .btn-purge {
  margin: 0;
  padding: 0 18rpx;
  height: 52rpx;
  line-height: 52rpx;
  font-size: 22rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.btn-restore {
  background: #E8F5E9;
  color: #2E7D32;
}

.btn-purge {
  background: #FFEBEE;
  color: var(--rt-danger);
}

.trash-note-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  border: 1rpx solid var(--rt-chip);
  box-shadow: 0 4rpx 16rpx rgba(44, 42, 38, 0.04);
}

.note-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.note-type-badge {
  font-size: 20rpx;
  background: var(--rt-chip);
  color: #5C584E;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.note-book-title {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--rt-ink);
}

.note-content {
  font-size: 26rpx;
  color: #3C3A36;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #F4F2EE;
  padding-top: 14rpx;
}
</style>
