<template>
  <view class="marquee-wrapper">
    <view class="marquee-track">
      <view class="marquee-content">
        <view v-for="(item, idx) in items" :key="`a-${idx}`" class="marquee-item">
          <text class="item-bullet">✦</text>
          <text class="item-title">{{ item.title }}</text>
          <text class="item-quote" v-if="item.quote">“{{ item.quote }}”</text>
        </view>
      </view>
      <view class="marquee-content" aria-hidden="true">
        <view v-for="(item, idx) in items" :key="`b-${idx}`" class="marquee-item">
          <text class="item-bullet">✦</text>
          <text class="item-title">{{ item.title }}</text>
          <text class="item-quote" v-if="item.quote">“{{ item.quote }}”</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface MarqueeItem {
  title: string;
  quote?: string;
}

defineProps<{
  items: MarqueeItem[];
}>();
</script>

<style>
.marquee-wrapper {
  overflow: hidden;
  width: 100%;
  height: 64rpx;
  position: relative;
  background: transparent;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 6%, rgba(0, 0, 0, 1) 94%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 6%, rgba(0, 0, 0, 1) 94%, transparent 100%);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 32s linear infinite;
}

.marquee-content {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* 对齐 App：绿字浅底胶囊条目 */
.marquee-item {
  display: inline-flex;
  align-items: center;
  margin-right: 20rpx;
  font-size: 22rpx;
  background: rgba(58, 99, 72, 0.07);
  border: 1.5rpx solid rgba(58, 99, 72, 0.2);
  border-radius: 24rpx;
  padding: 10rpx 26rpx;
}

.item-bullet {
  color: var(--rt-accent);
  margin-right: 12rpx;
  font-size: 18rpx;
}

.item-title {
  color: var(--rt-accent);
  font-weight: bold;
  font-family: serif;
}

.item-quote {
  color: var(--rt-muted);
  margin-left: 10rpx;
  font-style: italic;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
