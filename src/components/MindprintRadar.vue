<template>
  <view class="radar-container">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="radar-svg">
      <!-- 背景六边形参考网格环 (3 圈) -->
      <polygon
        v-for="ring in rings"
        :key="ring"
        :points="getHexagonPoints(center, center, radius * ring)"
        fill="none"
        stroke="rgba(0, 0, 0, 0.08)"
        stroke-width="1"
      />

      <!-- 轴线 -->
      <line
        v-for="(axis, i) in axes"
        :key="`axis-${i}`"
        :x1="center"
        :y1="center"
        :x2="axis.x"
        :y2="axis.y"
        stroke="rgba(0, 0, 0, 0.08)"
        stroke-width="1"
      />

      <!-- 雷达数据多边形填充面 -->
      <polygon
        :points="dataPolygonPoints"
        fill="rgba(58, 99, 72, 0.25)"
        stroke="#3A6348"
        stroke-width="2.5"
      />

      <!-- 数据顶点圆点 -->
      <circle
        v-for="(pt, i) in dataPoints"
        :key="`dot-${i}`"
        :cx="pt.x"
        :cy="pt.y"
        r="3.5"
        fill="#3A6348"
        stroke="#FFFFFF"
        stroke-width="1.5"
      />

      <!-- 维度文本标签 -->
      <text
        v-for="(axis, i) in axes"
        :key="`label-${i}`"
        :x="axis.labelX"
        :y="axis.labelY"
        :text-anchor="axis.textAnchor"
        dominant-baseline="central"
        fill="#686E64"
        font-size="11"
        font-family="sans-serif"
        font-weight="bold"
      >
        {{ axis.label }} ({{ (scores[i] || 8.0).toFixed(1) }})
      </text>
    </svg>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    depth?: number;
    artistry?: number;
    emotion?: number;
    logic?: number;
    difficulty?: number;
    healing?: number;
    size?: number;
  }>(),
  {
    depth: 8.5,
    artistry: 8.8,
    emotion: 8.2,
    logic: 9.0,
    difficulty: 6.5,
    healing: 8.6,
    size: 260,
  }
);

const center = computed(() => props.size / 2);
const radius = computed(() => props.size * 0.36);
const rings = [0.33, 0.66, 1.0];

const labels = ['深度', '美学', '共情', '思辨', '难度', '治愈'];
const scores = computed(() => [
  props.depth,
  props.artistry,
  props.emotion,
  props.logic,
  props.difficulty,
  props.healing,
]);

// 6 个顶点的角度（从正上方 -90度 开始）
const angles = [-90, -30, 30, 90, 150, 210].map((deg) => (deg * Math.PI) / 180);

function getHexagonPoints(cx: number, cy: number, r: number): string {
  return angles
    .map((ang) => {
      const x = cx + r * Math.cos(ang);
      const y = cy + r * Math.sin(ang);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

// 轴线终点与标签定位
const axes = computed(() =>
  angles.map((ang, i) => {
    const x = center.value + radius.value * Math.cos(ang);
    const y = center.value + radius.value * Math.sin(ang);
    const labelDist = radius.value + 18;
    const lx = center.value + labelDist * Math.cos(ang);
    const ly = center.value + labelDist * Math.sin(ang);

    let anchor: 'middle' | 'start' | 'end' = 'middle';
    if (Math.abs(Math.cos(ang)) > 0.3) {
      anchor = Math.cos(ang) > 0 ? 'start' : 'end';
    }

    return {
      x,
      y,
      labelX: lx,
      labelY: ly,
      label: labels[i],
      textAnchor: anchor,
    };
  })
);

// 根据实际数值计算多边形顶点
const dataPoints = computed(() =>
  scores.value.map((score, i) => {
    const normalized = Math.min(10, Math.max(1, score)) / 10;
    const r = radius.value * normalized;
    const ang = angles[i];
    return {
      x: center.value + r * Math.cos(ang),
      y: center.value + r * Math.sin(ang),
    };
  })
);

const dataPolygonPoints = computed(() =>
  dataPoints.value.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
);
</script>

<style>
.radar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.radar-svg {
  display: block;
}
</style>
