<template>
  <view class="aurora-bg" aria-hidden="true">
    <view class="aurora-blob b1"></view>
    <view class="aurora-blob b2"></view>
    <view class="aurora-blob b3"></view>
    <view class="aurora-blob b4"></view>
  </view>
</template>

<script setup lang="ts">
/**
 * 极光流体背景 · 对齐 Android AuroraFluidBackgroundView
 * 4 个高斯模糊光斑球沿正弦轨迹缓慢流动（昼间调色盘：草木绿/晨曦金/薄雾蓝/浅粉霞光）。
 * 纯 CSS transform/opacity 合成层动画，不阻塞逻辑层。
 */
</script>

<style scoped>
.aurora-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90rpx);
  opacity: 0.5;
  will-change: transform;
}

/* 草木绿 · 左上 */
.b1 {
  width: 70vw;
  height: 70vw;
  left: -18vw;
  top: -12vw;
  background: radial-gradient(circle, rgba(143, 179, 153, 0.55) 0%, rgba(143, 179, 153, 0) 68%);
  animation: aurora-drift-1 22s ease-in-out infinite alternate;
}

/* 晨曦金 · 右上 */
.b2 {
  width: 62vw;
  height: 62vw;
  right: -16vw;
  top: 4vw;
  background: radial-gradient(circle, rgba(224, 211, 175, 0.6) 0%, rgba(224, 211, 175, 0) 68%);
  animation: aurora-drift-2 26s ease-in-out infinite alternate;
}

/* 薄雾蓝 · 左下 */
.b3 {
  width: 66vw;
  height: 66vw;
  left: -10vw;
  bottom: -14vw;
  background: radial-gradient(circle, rgba(155, 183, 212, 0.5) 0%, rgba(155, 183, 212, 0) 68%);
  animation: aurora-drift-3 24s ease-in-out infinite alternate;
}

/* 浅粉霞光 · 右下 */
.b4 {
  width: 56vw;
  height: 56vw;
  right: -12vw;
  bottom: 2vw;
  background: radial-gradient(circle, rgba(224, 180, 192, 0.5) 0%, rgba(224, 180, 192, 0) 68%);
  animation: aurora-drift-4 20s ease-in-out infinite alternate;
}

/* 正弦轨迹漂移：位移 + 微缩放（对齐 App 20s 周期呼吸感） */
@keyframes aurora-drift-1 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(10vw, 8vh) scale(1.12); }
  100% { transform: translate(-4vw, 16vh) scale(0.94); }
}
@keyframes aurora-drift-2 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-12vw, 10vh) scale(1.08); }
  100% { transform: translate(4vw, 18vh) scale(0.92); }
}
@keyframes aurora-drift-3 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(12vw, -10vh) scale(1.14); }
  100% { transform: translate(-6vw, -18vh) scale(0.96); }
}
@keyframes aurora-drift-4 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-10vw, -8vh) scale(1.1); }
  100% { transform: translate(6vw, -14vh) scale(0.9); }
}
</style>
