<template>
  <view class="favorites-page">
    <!-- 顶部状态栏与导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title-wrap">
        <text class="page-title">我的最爱</text>
        <text class="page-subtitle">Curator's Masterpiece Collection</text>
      </view>
    </view>

    <!-- 5 大媒介切换栏 -->
    <scroll-view scroll-x class="media-tabs" :show-scrollbar="false">
      <view class="tabs-inner">
        <view
          v-for="(meta, key) in MEDIA_LABEL"
          :key="key"
          class="media-tab"
          :class="{ active: currentMediaType === key }"
          @tap="currentMediaType = key"
        >
          <text class="tab-emoji">{{ meta.emoji }}</text>
          <text class="tab-name">{{ meta.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 最爱精选列表 -->
    <view class="fav-list">
      <view v-if="favList.length === 0" class="empty-state">
        <text class="empty-icon">🏆</text>
        <text class="empty-title">暂未收录最爱{{ MEDIA_LABEL[currentMediaType]?.name }}</text>
        <text class="empty-desc">点击下方按钮，从你的藏库中选入顶格神作并写下策展推荐语</text>
        <button class="btn-empty-add" @tap="showPickerModal = true">＋ 选入典藏神作</button>
      </view>

      <view v-for="(item, idx) in favList" :key="item.id" class="fav-card">
        <view class="card-left">
          <view class="gold-rank">
            <text class="rank-hash">#</text>
            <text class="rank-num">{{ String(idx + 1).padStart(2, '0') }}</text>
          </view>
          <image
            v-if="item.coverUrl"
            class="fav-cover"
            :src="item.coverUrl"
            mode="aspectFill"
            @tap="goToDetail(item.id)"
          />
          <view v-else class="fav-cover-placeholder" @tap="goToDetail(item.id)">
            <text>{{ MEDIA_LABEL[item.mediaType]?.emoji || '📖' }}</text>
          </view>
        </view>

        <view class="card-right">
          <view class="fav-header">
            <text class="fav-title" @tap="goToDetail(item.id)">{{ item.title }}</text>
            <text class="btn-remove" @tap="handleRemoveFavorite(item.id, item.title)">✕</text>
          </view>
          <text class="fav-author">{{ item.author || '未知创作者' }}</text>
          <view v-if="item.rating" class="fav-rating">
            <text class="star">★</text>
            <text class="score">{{ item.rating.toFixed(1) }}</text>
          </view>

          <!-- 策展人推荐语 -->
          <view class="reason-bubble" @tap="openEditReasonModal(item)">
            <text class="reason-quote">“</text>
            <text class="reason-text">{{ item.favoriteReason || '点击写下为什么将它列为私享最爱...' }}</text>
            <text class="edit-icon">✎</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部悬浮添加按钮 -->
    <view v-if="favList.length > 0" class="bottom-bar">
      <button class="btn-bottom-add" @tap="showPickerModal = true">
        ＋ 选入更多{{ MEDIA_LABEL[currentMediaType]?.name }}神作
      </button>
    </view>

    <!-- 候选作品勾选选择弹窗 -->
    <view v-if="showPickerModal" class="modal-mask" @tap.self="showPickerModal = false">
      <view class="modal-box picker-box">
        <view class="modal-header">
          <text class="modal-title">选入最爱{{ MEDIA_LABEL[currentMediaType]?.name }}</text>
          <text class="close-btn" @tap="showPickerModal = false">✕</text>
        </view>

        <scroll-view scroll-y class="picker-scroll">
          <view v-if="candidateWorks.length === 0" class="empty-candidates">
            <text>藏库中暂无可添加的{{ MEDIA_LABEL[currentMediaType]?.name }}作品</text>
          </view>
          <view
            v-for="cand in candidateWorks"
            :key="cand.id"
            class="cand-item"
            @tap="handleSelectCandidate(cand.id)"
          >
            <image
              v-if="cand.coverUrl"
              class="cand-cover"
              :src="cand.coverUrl"
              mode="aspectFill"
            />
            <view v-else class="cand-cover-placeholder">
              <text>{{ MEDIA_LABEL[cand.mediaType]?.emoji || '📖' }}</text>
            </view>
            <view class="cand-info">
              <text class="cand-title">{{ cand.title }}</text>
              <text class="cand-author">{{ cand.author || '未知创作者' }}</text>
            </view>
            <view class="btn-cand-add">选入</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 编辑推荐语弹窗 -->
    <view v-if="editReasonModal.visible" class="modal-mask" @tap.self="editReasonModal.visible = false">
      <view class="modal-box reason-box">
        <view class="modal-header">
          <text class="modal-title">策展人独白</text>
          <text class="close-btn" @tap="editReasonModal.visible = false">✕</text>
        </view>
        <textarea
          v-model="editReasonModal.text"
          class="reason-textarea"
          placeholder="写下这部作品在你精神世界中的独家地位或高光理由..."
          maxlength="200"
        />
        <view class="modal-actions">
          <button class="btn-cancel" @tap="editReasonModal.visible = false">取消</button>
          <button class="btn-confirm" @tap="saveFavoriteReason">保存独白</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Book, MediaType } from '@/utils/models';
import { MEDIA_LABEL } from '@/utils/models';
import { loadLocalWorks } from '@/utils/sync';
import { getFavorites, toggleFavorite } from '@/utils/backup';

const currentMediaType = ref<MediaType>('book');
const allWorks = ref<Book[]>([]);

const showPickerModal = ref(false);
const editReasonModal = ref({
  visible: false,
  bookId: 0,
  text: '',
});

function refreshData() {
  allWorks.value = loadLocalWorks();
}

onMounted(() => {
  refreshData();
});

const favList = computed(() => {
  return getFavorites(currentMediaType.value);
});

const candidateWorks = computed(() => {
  return allWorks.value.filter(
    (b) => !b.isDeleted && b.mediaType === currentMediaType.value && !b.isFavorite,
  );
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/profile/index' });
    },
  });
}

function goToDetail(id: number) {
  uni.navigateTo({ url: `/pages/book-detail/index?id=${id}` });
}

function handleRemoveFavorite(id: number, title: string) {
  uni.showModal({
    title: '移出我的最爱',
    content: `确定将《${title}》从最爱展架移除？作品仍会保留在藏库中。`,
    success: (res) => {
      if (res.confirm) {
        toggleFavorite(id, false);
        uni.showToast({ title: '已移出最爱', icon: 'none' });
        refreshData();
      }
    },
  });
}

function handleSelectCandidate(id: number) {
  toggleFavorite(id, true);
  showPickerModal.value = false;
  uni.showToast({ title: '已入选我的最爱', icon: 'success' });
  refreshData();
}

function openEditReasonModal(item: Book) {
  editReasonModal.value = {
    visible: true,
    bookId: item.id,
    text: item.favoriteReason || '',
  };
}

function saveFavoriteReason() {
  toggleFavorite(editReasonModal.value.bookId, true, editReasonModal.value.text);
  editReasonModal.value.visible = false;
  uni.showToast({ title: '已保存策展独白', icon: 'success' });
  refreshData();
}
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #F8F7F4;
  padding: 40rpx 32rpx 140rpx;
  box-sizing: border-box;
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
  background: #ECEAE4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.back-icon {
  font-size: 38rpx;
  color: #2C2A26;
  line-height: 1;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #2C2A26;
}

.page-subtitle {
  font-size: 22rpx;
  color: #8C887B;
  margin-top: 4rpx;
  font-family: Georgia, serif;
}

.media-tabs {
  white-space: nowrap;
  margin-bottom: 36rpx;
}

.tabs-inner {
  display: flex;
  gap: 16rpx;
}

.media-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 28rpx;
  background: #ECEAE4;
  border-radius: 36rpx;
  font-size: 26rpx;
  color: #5C584E;
  transition: all 0.2s ease;
}

.media-tab.active {
  background: #9E7638;
  color: #FFFFFF;
  box-shadow: 0 4rpx 14rpx rgba(158, 118, 56, 0.3);
}

.fav-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 1rpx solid #ECEAE4;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2C2A26;
}

.empty-desc {
  font-size: 24rpx;
  color: #8C887B;
  text-align: center;
  margin: 12rpx 0 36rpx;
  line-height: 1.5;
}

.btn-empty-add {
  background: #9E7638;
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 600;
  padding: 16rpx 44rpx;
  border-radius: 36rpx;
}

.fav-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  border: 1rpx solid #ECEAE4;
  box-shadow: 0 8rpx 24rpx rgba(44, 42, 38, 0.05);
}

.card-left {
  position: relative;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.gold-rank {
  position: absolute;
  top: -12rpx;
  left: -8rpx;
  background: #9E7638;
  color: #FFFFFF;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 800;
  font-family: Georgia, serif;
  box-shadow: 0 4rpx 10rpx rgba(158, 118, 56, 0.4);
  z-index: 2;
}

.fav-cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
}

.fav-cover-placeholder {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #ECEAE4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fav-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.fav-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2C2A26;
  line-height: 1.3;
  flex: 1;
  margin-right: 16rpx;
}

.btn-remove {
  font-size: 28rpx;
  color: #B4B0A5;
  padding: 4rpx 12rpx;
}

.fav-author {
  font-size: 22rpx;
  color: #8C887B;
  margin-top: 6rpx;
}

.fav-rating {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin: 10rpx 0;
}

.star {
  font-size: 24rpx;
  color: #9E7638;
}

.score {
  font-size: 24rpx;
  font-weight: 700;
  color: #9E7638;
}

.reason-bubble {
  background: #F8F7F4;
  border-radius: 16rpx;
  padding: 14rpx 18rpx;
  margin-top: 10rpx;
  border: 1rpx dashed #DCD8CD;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.reason-quote {
  color: #9E7638;
  font-size: 32rpx;
  line-height: 1;
  font-family: Georgia, serif;
}

.reason-text {
  flex: 1;
  font-size: 22rpx;
  color: #5C584E;
  line-height: 1.4;
  font-style: italic;
}

.edit-icon {
  font-size: 22rpx;
  color: #9E7638;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx env(safe-area-inset-bottom);
  background: rgba(248, 247, 244, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1rpx solid #ECEAE4;
}

.btn-bottom-add {
  height: 84rpx;
  line-height: 84rpx;
  background: #9E7638;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 42rpx;
  box-shadow: 0 8rpx 20rpx rgba(158, 118, 56, 0.35);
}

/* 弹窗 */
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C2A26;
}

.close-btn {
  font-size: 36rpx;
  color: #8C887B;
}

.picker-scroll {
  max-height: 520rpx;
}

.cand-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F4F2EE;
}

.cand-cover {
  width: 80rpx;
  height: 112rpx;
  border-radius: 8rpx;
  margin-right: 18rpx;
}

.cand-cover-placeholder {
  width: 80rpx;
  height: 112rpx;
  border-radius: 8rpx;
  background: #ECEAE4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
}

.cand-info {
  flex: 1;
}

.cand-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #2C2A26;
}

.cand-author {
  font-size: 20rpx;
  color: #8C887B;
  margin-top: 4rpx;
}

.btn-cand-add {
  padding: 8rpx 20rpx;
  background: #9E7638;
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 24rpx;
}

.reason-textarea {
  width: 100%;
  height: 200rpx;
  background: #F8F7F4;
  border: 1rpx solid #ECEAE4;
  border-radius: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
  font-size: 26rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.btn-cancel {
  background: #ECEAE4;
  color: #5C584E;
}

.btn-confirm {
  background: #9E7638;
  color: #FFFFFF;
}
</style>
