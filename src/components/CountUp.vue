<template>
  <text class="count-up">{{ display }}</text>
</template>

<script setup lang="ts">
/**
 * 数字滚动 · 对齐 App 统计区 count-up（550ms ease-out）
 * 挂载时从 0 滚到目标值；目标变化时从当前值平滑滚动。
 */
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    duration?: number;
    decimals?: number;
  }>(),
  {
    value: 0,
    duration: 900,
    decimals: 0,
  }
);

const display = ref((0).toFixed(props.decimals));
let timer: ReturnType<typeof setInterval> | null = null;

function animateTo(target: number, from: number) {
  if (timer) clearInterval(timer);
  if (target === from) {
    display.value = target.toFixed(props.decimals);
    return;
  }
  const startAt = Date.now();
  timer = setInterval(() => {
    const t = Math.min(1, (Date.now() - startAt) / props.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    display.value = (from + (target - from) * eased).toFixed(props.decimals);
    if (t >= 1) {
      if (timer) clearInterval(timer);
      timer = null;
    }
  }, 16);
}

onMounted(() => animateTo(props.value, 0));
watch(
  () => props.value,
  (nv) => animateTo(nv, parseFloat(display.value) || 0)
);
</script>

<style scoped>
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
