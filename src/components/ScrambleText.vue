<template>
  <text class="scramble-text" @tap="replay">{{ display }}</text>
</template>

<script setup lang="ts">
/**
 * 字符解密标题 · 对齐 Android ScrambleTextView
 * 随机符号矩阵逐字落定 + 点击重放；落定后保留纯文本。
 */
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    text: string;
    duration?: number; // 解密总时长 ms
  }>(),
  {
    text: '',
    duration: 1100,
  }
);

const SYMBOL_POOL = '▓▒░█▄▀#%&@※✦✧＋×÷=<>';
const display = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

function randomSymbols(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
  }
  return s;
}

function start() {
  if (timer) clearInterval(timer);
  if (!props.text) {
    display.value = '';
    return;
  }
  const startAt = Date.now();
  timer = setInterval(() => {
    const t = Math.min(1, (Date.now() - startAt) / props.duration);
    // 前 60% 时间快速逐字落定，尾段扫尾
    const eased = t < 0.6 ? (t / 0.6) * 0.9 : 0.9 + ((t - 0.6) / 0.4) * 0.1;
    const resolved = Math.floor(eased * props.text.length);
    display.value = props.text.slice(0, resolved) + randomSymbols(props.text.length - resolved);
    if (t >= 1) {
      display.value = props.text;
      if (timer) clearInterval(timer);
      timer = null;
    }
  }, 42);
}

function replay() {
  start();
}

onMounted(start);
watch(() => props.text, start);
</script>

<style scoped>
.scramble-text {
  font-family: serif;
}
</style>
