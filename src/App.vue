<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('阅痕小程序启动 · Local-First 漫游端');
});
</script>

<style>
/* ═══════════════════════════════════════════════════════════
   阅痕设计 Token · 逐项对齐 Android res/values/colors.xml
   （小程序端全局唯一色彩来源；夜间主题预留位见文末注释）
   ═══════════════════════════════════════════════════════════ */
page {
  /* 背景 / 表面 */
  --rt-bg: #F8F7F4;                        /* readtrace_background 暖纸白 */
  --rt-glass: rgba(255, 255, 255, 0.95);   /* readtrace_glass 玻璃面板 */
  --rt-glass-soft: rgba(255, 255, 255, 0.85); /* readtrace_glass_soft */
  --rt-stroke: rgba(0, 0, 0, 0.08);        /* readtrace_glass_stroke 描边 */
  --rt-chip: #ECE7DE;                      /* readtrace_chip 未选中胶囊 */
  --rt-parchment: #F6F1E8;                 /* readtrace_parchment 羊皮纸 */
  --rt-parchment-stroke: rgba(140, 110, 74, 0.29); /* 便签描边 #268C6E4A */
  --rt-cover-ph: #EAE2D5;                  /* readtrace_book_cover 封面占位 */

  /* 文字 */
  --rt-ink: #1A1C19;                       /* readtrace_ink 主墨色 */
  --rt-muted: #686E64;                     /* readtrace_muted 次要文字 */
  --rt-faint: #8C887B;                     /* 三级弱文字（小程序端扩展） */
  --rt-stone: #5C584E;                     /* 深暖灰：铭文/票据文字 */

  /* 强调色 */
  --rt-accent: #3A6348;                    /* readtrace_accent 苔绿主色 */
  --rt-accent-pressed: #2B4E37;            /* readtrace_accent_pressed 按压态 */
  --rt-danger: #9E4545;                    /* readtrace_danger 危险红 */
  --rt-gold: #9E7638;                      /* readtrace_gold_accent 烫金 */
  --rt-gold-bright: #D4AF37;               /* 金属高光金：通行卡/排位徽章 */

  /* 深空 / 终端场景 */
  --rt-deep: #0A0C10;                      /* 星图/伴读/速记暗底（归并三种黑） */

  background: var(--rt-bg);
  color: var(--rt-ink);
}

/* ── 夜间主题预留位（本期不启用，Token 结构已就绪）──
   启用方式：后续在 page 选择器按主题切换以下变量即可，无需改动业务样式。
   夜间值参考（对齐 values-night/colors.xml）：
   --rt-bg: #121412 · --rt-ink: #F5F3ED · --rt-accent: #5E9E71 ·
   --rt-gold: #E5C07B · --rt-danger: #E06D6D · --rt-glass: #1C201C
*/
</style>
