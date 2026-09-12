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
  height: 56rpx;
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%);
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

.marquee-item {
  display: inline-flex;
  align-items: center;
  margin-right: 48rpx;
  font-size: 22rpx;
}

.item-bullet {
  color: var(--rt-gold);
  margin-right: 12rpx;
  font-size: 18rpx;
}

.item-title {
  color: var(--rt-ink);
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
