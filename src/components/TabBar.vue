<template>
  <!-- 底部悬浮毛玻璃导航栏 (FluidSpotlightNavBar 复刻) -->
  <view class="nav-wrapper">
    <view class="nav-shell">
      <!-- 滑动选中指示胶囊（位于 Tab 层之下，切换时弹性滑移） -->
      <view
        class="nav-indicator"
        :style="{
          left: `calc(${active * 20}% + 8rpx)`,
          width: 'calc(20% - 16rpx)'
        }"
      ></view>

      <!-- 5 个等分 Tab 栏 -->
      <view
        v-for="(t, i) in tabs"
        :key="t.key"
        class="nav-tab"
        :class="{ active: active === i }"
        @tap="go(i)"
      >
        <text class="nav-emoji">{{ t.emoji }}</text>
        <text class="nav-label">{{ t.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ active: number }>();

const tabs = [
  { key: 'hub', emoji: '🏛️', label: '展馆', url: '/pages/hub/index' },
  { key: 'library', emoji: '📚', label: '藏库', url: '/pages/library/index' },
  { key: 'galaxy', emoji: '🌌', label: '星系', url: '/pages/constellation/index' },
  { key: 'memoir', emoji: '🎟️', label: '纪念', url: '/pages/memoir/index' },
  { key: 'profile', emoji: '👤', label: '我的', url: '/pages/profile/index' },
];

function go(i: number) {
  if (i === props.active) return;
  uni.redirectTo({ url: tabs[i].url });
}
</script>

<style>
.nav-wrapper {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 999;
  pointer-events: none;
}

.nav-shell {
  pointer-events: auto;
  position: relative;
  height: 128rpx;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 52rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.1), 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  padding: 8rpx;
  box-sizing: border-box;
}

/* 滑动指示胶囊 */
.nav-indicator {
  position: absolute;
  top: 10rpx;
  bottom: 10rpx;
  background: var(--rt-chip);
  border-radius: 38rpx;
  transition: left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
  pointer-events: none;
}

.nav-tab {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: transform 0.15s ease;
}

.nav-tab:active {
  transform: scale(0.92);
}

.nav-emoji {
  font-size: 34rpx;
  line-height: 1.2;
}

.nav-label {
  color: var(--rt-muted);
  font-size: 21rpx;
  margin-top: 4rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 1rpx;
}

.nav-tab.active .nav-label {
  color: var(--rt-ink);
  font-weight: bold;
}
</style>
