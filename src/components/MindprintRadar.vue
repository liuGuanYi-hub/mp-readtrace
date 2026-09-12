<template>
  <view class="radar-container">
    <canvas
      type="2d"
      :id="canvasId"
      :canvas-id="canvasId"
      class="radar-canvas"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
/**
 * 六维心智雷达 · Canvas 2D 版
 * 视觉对齐 Android MindprintRadarView：#DDD4CA 蛛网 + 琥珀 #C47D5C 数据多边形
 * （原 SVG 直写模板在微信真机不渲染，故重写为 Canvas；打开/数据变化时 800ms 从中心展开）
 */
import { getCurrentInstance, onMounted, watch } from 'vue';

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

const canvasId = `radar-${Math.random().toString(36).slice(2, 8)}`;
const instance = getCurrentInstance();

const labels = ['深度', '美学', '共情', '思辨', '难度', '治愈'];
// 6 个顶点的角度（从正上方 -90° 开始）
const angles = [-90, -30, 30, 90, 150, 210].map((deg) => (deg * Math.PI) / 180);

let canvasNode: any = null;
let ctx: any = null;
let rafId = 0;

function getScores(): number[] {
  return [props.depth, props.artistry, props.emotion, props.logic, props.difficulty, props.healing];
}

function draw(progress: number) {
  if (!ctx) return;
  const size = props.size;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const scores = getScores();

  ctx.clearRect(0, 0, size, size);

  const webStroke = '#DDD4CA';
  ctx.lineWidth = 1;
  ctx.strokeStyle = webStroke;

  // 背景六边形参考网格环（3 圈）
  for (const ring of [0.33, 0.66, 1.0]) {
    ctx.beginPath();
    angles.forEach((ang, i) => {
      const x = cx + radius * ring * Math.cos(ang);
      const y = cy + radius * ring * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  // 轴线
  angles.forEach((ang) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(ang), cy + radius * Math.sin(ang));
    ctx.stroke();
  });

  // 数据多边形（progress: 0→1 从中心展开）
  const pts = scores.map((score, i) => {
    const normalized = (Math.min(10, Math.max(1, score)) / 10) * progress;
    const r = radius * normalized;
    return {
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
    };
  });

  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = 'rgba(196, 125, 92, 0.27)'; // #C47D5C @ 27%
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#C47D5C';
  ctx.stroke();

  // 数据顶点圆点（随展开进度渐显）
  if (progress > 0.6) {
    const dotAlpha = Math.min(1, (progress - 0.6) / 0.4);
    ctx.globalAlpha = dotAlpha;
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#C47D5C';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  // 维度文本标签
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#686E64';
  ctx.textBaseline = 'middle';
  angles.forEach((ang, i) => {
    const labelDist = radius + 18;
    const lx = cx + labelDist * Math.cos(ang);
    const ly = cy + labelDist * Math.sin(ang);
    const cos = Math.cos(ang);
    ctx.textAlign = Math.abs(cos) > 0.3 ? (cos > 0 ? 'left' : 'right') : 'center';
    ctx.globalAlpha = progress;
    ctx.fillText(`${labels[i]} (${(scores[i] || 8.0).toFixed(1)})`, lx, ly);
    ctx.globalAlpha = 1;
  });
}

function startExpandAnimation() {
  if (!canvasNode) return;
  if (rafId) canvasNode.cancelAnimationFrame(rafId);
  const duration = 800;
  const start = Date.now();
  const tick = () => {
    const t = Math.min(1, (Date.now() - start) / duration);
    // ease-out cubic：先快后慢，贴近 App 的 Decelerate 展开手感
    const progress = 1 - Math.pow(1 - t, 3);
    draw(progress);
    if (t < 1) rafId = canvasNode.requestAnimationFrame(tick);
  };
  tick();
}

onMounted(() => {
  const query = uni.createSelectorQuery().in(instance);
  query
    .select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res: any) => {
      const info = res && res[0];
      if (!info || !info.node) return;
      canvasNode = info.node;
      const dpr = (uni.getSystemInfoSync().pixelRatio) || 2;
      canvasNode.width = props.size * dpr;
      canvasNode.height = props.size * dpr;
      ctx = canvasNode.getContext('2d');
      ctx.scale(dpr, dpr);
      startExpandAnimation();
    });
});

watch(
  () => [props.depth, props.artistry, props.emotion, props.logic, props.difficulty, props.healing],
  () => {
    if (ctx) startExpandAnimation();
  }
);
</script>

<style>
.radar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.radar-canvas {
  display: block;
}
</style>
