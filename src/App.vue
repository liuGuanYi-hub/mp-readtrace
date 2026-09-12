<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('阅痕小程序启动 · Local-First 漫游端');
});
</script>

<style>
/* 全局浅色底（对齐 App 暖纸白 readtrace_background）；暗色页（星图/伴读）在其页内单独覆盖 page 背景 */
page {
  background: #F8F7F4;
  color: #1a1c19;
}
</style>
