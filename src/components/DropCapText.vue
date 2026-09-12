<template>
  <view class="dropcap-wrap">
    <text class="dropcap-char">{{ firstChar }}</text>
    <text class="dropcap-rest">{{ rest }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 首字下沉 · 对齐 Android DropCapTextView（首字符 serif 3.2 倍放大环绕 + 微光晕）
 */
import { computed } from 'vue';

const props = defineProps<{
  text: string;
}>();

const firstChar = computed(() => (props.text || '').charAt(0));
const rest = computed(() => (props.text || '').slice(1));
</script>

<style scoped>
.dropcap-wrap {
  overflow: hidden; /* 触发 BFC 包住浮动首字 */
  line-height: 1.75;
}

.dropcap-char {
  float: left;
  font-family: serif;
  font-weight: bold;
  font-size: 2.6em;
  line-height: 1;
  margin: 0.04em 0.14em 0 0;
  color: #5C584E;
  text-shadow: 0 0 12rpx rgba(92, 88, 78, 0.12);
}

.dropcap-rest {
  font-size: 1em;
}
</style>
