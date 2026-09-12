<template>
  <view class="standby-page" :class="{ 'dark-mode': isDark }">
    <!-- 顶部状态栏与导航 -->
    <view class="top-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="time-greeting">
        <text class="greeting-text">{{ timeGreeting }}</text>
        <text class="date-text">{{ currentDateStr }}</text>
      </view>
      <view class="mode-switch-pill">
        <view
          class="pill-opt"
          :class="{ active: viewMode === 'vinyl' }"
          @tap="viewMode = 'vinyl'"
        >
          💽 黑胶
        </view>
        <view
          class="pill-opt"
          :class="{ active: viewMode === 'clock' }"
          @tap="viewMode = 'clock'"
        >
          ⏳ 翻页钟
        </view>
      </view>
    </view>

    <!-- ═══ 主舞台展示区 ═══ -->
    <view class="stage-container">
      <!-- 视图 A：3D 拟真黑胶唱机 -->
      <view v-if="viewMode === 'vinyl'" class="vinyl-stage">
        <view class="turntable-box">
          <!-- 旋转黑胶唱片 -->
          <view class="vinyl-record" :class="{ spinning: audioEngine.isPlaying }">
            <view class="groove g1" />
            <view class="groove g2" />
            <view class="groove g3" />
            <view class="record-center">
              <image class="center-art" :src="currentTrack.coverUrl" mode="aspectFill" />
            </view>
          </view>

          <!-- 机械唱臂 (Tonearm) -->
          <view class="tonearm-wrap" :class="{ dropped: audioEngine.tonearmDropped }">
            <view class="tonearm-pivot" />
            <view class="tonearm-stick" />
            <view class="tonearm-head" />
          </view>
        </view>

        <!-- 曲目与金句随想 -->
        <view class="track-meta">
          <text class="track-name">{{ currentTrack.emoji }} {{ currentTrack.title }}</text>
          <text class="track-artist">{{ currentTrack.artist }}</text>
          <text v-if="currentTrack.quote" class="track-quote">“{{ currentTrack.quote }}”</text>
        </view>
      </view>

      <!-- 视图 B：禅意桌面大字翻页时钟 -->
      <view v-else class="clock-stage">
        <view class="flip-clock" :style="{ transform: `translateX(${pixelShift}px)` }">
          <view class="clock-digit-card">
            <text class="digit-val">{{ clockHour }}</text>
          </view>
          <text class="clock-colon">:</text>
          <view class="clock-digit-card">
            <text class="digit-val">{{ clockMinute }}</text>
          </view>
        </view>
        <text class="clock-sec-sub">{{ clockSecond }}s · 息心凝眸</text>
      </view>
    </view>

    <!-- ═══ 4 大沉浸白噪音声场选择 ═══ -->
    <view class="section-title">🌿 沉浸声场与自然白噪音</view>
    <scroll-view scroll-x class="noise-scroller" :show-scrollbar="false">
      <view class="noise-list">
        <view
          v-for="track in noiseTracks"
          :key="track.id"
          class="noise-card"
          :class="{ active: currentTrack.id === track.id && audioEngine.isPlaying }"
          @tap="playNoise(track)"
        >
          <text class="noise-emoji">{{ track.emoji }}</text>
          <view class="noise-info">
            <text class="noise-title">{{ track.title }}</text>
            <text class="noise-desc">{{ track.artist.split('·')[0] }}</text>
          </view>
          <view class="noise-state-badge">
            <text v-if="currentTrack.id === track.id && audioEngine.isPlaying">▶ 正在播放</text>
            <text v-else>点击启幕</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- ═══ 禅意伴读番茄钟 ═══ -->
    <view class="section-title">🧘 禅意专注伴读钟</view>
    <view class="pomodoro-panel">
      <view class="pomo-dur-selector">
        <view
          v-for="d in [15, 25, 45, 60]"
          :key="d"
          class="dur-chip"
          :class="{ active: audioEngine.pomodoroTotalSec === d * 60 }"
          @tap="setDuration(d)"
        >
          {{ d }}分钟
        </view>
      </view>

      <view class="pomo-clock-display">
        <text class="pomo-time-text">{{ pomodoroDisplayTime }}</text>
        <text class="pomo-status-label">
          {{ audioEngine.pomodoroRunning ? '● 专注伴读中…' : '○ 准备就绪' }}
        </text>
      </view>

      <view class="pomo-actions">
        <button
          class="btn-pomo-start"
          :class="{ running: audioEngine.pomodoroRunning }"
          @tap="togglePomodoro"
        >
          {{ audioEngine.pomodoroRunning ? '暂停计时' : '开启沉浸伴读' }}
        </button>
        <button class="btn-pomo-reset" @tap="resetPomodoro">重置</button>
      </view>
    </view>

    <!-- ═══ 底部播放控制器 ═══ -->
    <view class="bottom-controller">
      <!-- 进度条 -->
      <view class="progress-bar-wrap">
        <text class="time-label">{{ formatTime(audioEngine.currentTime) }}</text>
        <slider
          class="audio-slider"
          :value="audioEngine.currentTime"
          :max="audioEngine.duration || currentTrack.durationSec"
          :step="1"
          active-color="#9E7638"
          block-size="16"
          @change="onSliderChange"
        />
        <text class="time-label">{{ formatTime(audioEngine.duration || currentTrack.durationSec) }}</text>
      </view>

      <!-- 核心控制按键 -->
      <view class="control-buttons">
        <view class="ctrl-btn" @tap="prevTrack">
          <text class="btn-icon">⏮</text>
        </view>
        <view class="ctrl-btn-play" @tap="togglePlay">
          <text class="play-icon">{{ audioEngine.isPlaying ? '❚❚' : '▶' }}</text>
        </view>
        <view class="ctrl-btn" @tap="nextTrack">
          <text class="btn-icon">⏭</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { audioEngine, SOUND_TRACKS, type AudioTrack } from '@/utils/audio-engine';

const isDark = ref(true);
const viewMode = ref<'vinyl' | 'clock'>('vinyl');

// 翻页钟与防烧屏
const clockHour = ref('00');
const clockMinute = ref('00');
const clockSecond = ref('00');
const pixelShift = ref(0);
let clockInterval: any = null;

// 音频状态同步触发器
const syncTick = ref(0);
let unsubscribeAudio: any = null;

const currentTrack = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  syncTick.value;
  return audioEngine.currentTrack;
});

const noiseTracks = SOUND_TRACKS.filter((t) => t.type === 'noise');

const currentDateStr = computed(() => {
  const d = new Date();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
});

const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return '清晨初光 · 晨读思绪';
  if (hour >= 9 && hour < 12) return '晴明上午 · 专注时光';
  if (hour >= 12 && hour < 17) return '午后幽静 · 茶香伴卷';
  if (hour >= 17 && hour < 21) return '暮色向晚 · 灵魂沉潜';
  return '深宵万籁 · 静夜神游';
});

const pomodoroDisplayTime = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  syncTick.value;
  const total = audioEngine.pomodoroRemainSec;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

function updateClock() {
  const now = new Date();
  clockHour.value = String(now.getHours()).padStart(2, '0');
  clockMinute.value = String(now.getMinutes()).padStart(2, '0');
  clockSecond.value = String(now.getSeconds()).padStart(2, '0');

  // 每 30 秒微像素漂移防烧屏
  if (now.getSeconds() % 30 === 0) {
    pixelShift.value = ((now.getSeconds() / 30) % 3 - 1) * 2;
  }
}

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);

  unsubscribeAudio = audioEngine.subscribe(() => {
    syncTick.value++;
  });
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  if (unsubscribeAudio) unsubscribeAudio();
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/hub/index' });
    },
  });
}

function playNoise(track: AudioTrack) {
  audioEngine.playTrack(track);
}

function togglePlay() {
  audioEngine.togglePlay();
}

function prevTrack() {
  audioEngine.prevTrack();
}

function nextTrack() {
  audioEngine.nextTrack();
}

function onSliderChange(e: any) {
  const sec = Number(e.detail.value);
  audioEngine.seek(sec);
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function setDuration(min: number) {
  audioEngine.setPomodoroDuration(min);
}

function togglePomodoro() {
  if (audioEngine.pomodoroRunning) {
    audioEngine.pausePomodoro();
  } else {
    audioEngine.startPomodoro();
  }
}

function resetPomodoro() {
  audioEngine.resetPomodoro();
}
</script>

<style>
/* 暗色页全局底色：覆盖 App.vue 浅色 page 背景，防止回弹露白（page 选择器不能放 scoped 块） */
page {
  background: #0A0C10;
}
</style>

<style scoped>
.standby-page {
  min-height: 100vh;
  background-color: #0A0C10;
  color: #FFFFFF;
  padding: 40rpx 32rpx 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-top: 20rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 38rpx;
  color: #FFFFFF;
}

.time-greeting {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.greeting-text {
  font-size: 26rpx;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 1rpx;
}

.date-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4rpx;
}

.mode-switch-pill {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 36rpx;
  padding: 4rpx;
}

.pill-opt {
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 30rpx;
  transition: all 0.2s ease;
}

.pill-opt.active {
  background: #D4AF37;
  color: #0A0C10;
  font-weight: 700;
}

/* 舞台容器 */
.stage-container {
  height: 520rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

/* 视图 A：黑胶唱机 */
.vinyl-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.turntable-box {
  width: 440rpx;
  height: 360rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-record {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #2C2C2C 0%, #151515 70%, #080808 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.8), 0 0 0 4rpx rgba(255, 255, 255, 0.05);
}

.vinyl-record.spinning {
  animation: spin 16s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.groove {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}
.groove.g1 { width: 260rpx; height: 260rpx; }
.groove.g2 { width: 200rpx; height: 200rpx; }
.groove.g3 { width: 140rpx; height: 140rpx; }

.record-center {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #D4AF37;
  z-index: 2;
}

.center-art {
  width: 100%;
  height: 100%;
}

/* 唱臂 (Tonearm) */
.tonearm-wrap {
  position: absolute;
  top: 10rpx;
  right: 20rpx;
  width: 80rpx;
  height: 220rpx;
  transform-origin: 60rpx 20rpx;
  transform: rotate(-24deg);
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
}

.tonearm-wrap.dropped {
  transform: rotate(6deg);
}

.tonearm-pivot {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #D4AF37;
  box-shadow: 0 0 10rpx rgba(212, 175, 55, 0.5);
}

.tonearm-stick {
  position: absolute;
  top: 24rpx;
  right: 20rpx;
  width: 6rpx;
  height: 180rpx;
  background: linear-gradient(180deg, #D4AF37 0%, #A89F91 100%);
  border-radius: 3rpx;
}

.tonearm-head {
  position: absolute;
  bottom: 10rpx;
  right: 14rpx;
  width: 18rpx;
  height: 32rpx;
  background: #EFEFEF;
  border-radius: 4rpx;
}

.track-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16rpx;
}

.track-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.track-artist {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6rpx;
}

.track-quote {
  font-size: 22rpx;
  color: #D4AF37;
  font-style: italic;
  margin-top: 10rpx;
  text-align: center;
  max-width: 580rpx;
}

/* 视图 B：翻页时钟 */
.clock-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flip-clock {
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: transform 0.3s ease;
}

.clock-digit-card {
  background: #181B22;
  border: 2rpx solid rgba(212, 175, 55, 0.4);
  border-radius: 24rpx;
  width: 180rpx;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.7);
}

.digit-val {
  font-size: 110rpx;
  font-weight: 800;
  color: #FAF6EE;
  font-family: Georgia, serif;
}

.clock-colon {
  font-size: 80rpx;
  color: #D4AF37;
  font-weight: 700;
}

.clock-sec-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 24rpx;
  letter-spacing: 2rpx;
}

/* 沉浸白噪音 */
.section-title {
  font-size: 24rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.noise-scroller {
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.noise-list {
  display: flex;
  gap: 16rpx;
}

.noise-card {
  width: 220rpx;
  background: #151A24;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.noise-card.active {
  border-color: #D4AF37;
  background: #202734;
  box-shadow: 0 8rpx 20rpx rgba(212, 175, 55, 0.2);
}

.noise-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.noise-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.noise-desc {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4rpx;
}

.noise-state-badge {
  font-size: 18rpx;
  color: #D4AF37;
  margin-top: 12rpx;
  font-weight: 600;
}

/* 番茄钟面板 */
.pomodoro-panel {
  background: #151A24;
  border-radius: 24rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  margin-bottom: 30rpx;
}

.pomo-dur-selector {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.dur-chip {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.dur-chip.active {
  background: #3A6348;
  color: #FFFFFF;
  font-weight: 700;
}

.pomo-clock-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16rpx 0;
}

.pomo-time-text {
  font-size: 72rpx;
  font-weight: 800;
  color: #FAF6EE;
  font-family: Georgia, serif;
}

.pomo-status-label {
  font-size: 20rpx;
  color: #4ADE80;
  margin-top: 4rpx;
}

.pomo-actions {
  display: flex;
  gap: 16rpx;
}

.btn-pomo-start {
  flex: 3;
  height: 72rpx;
  line-height: 72rpx;
  background: #3A6348;
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 700;
  border-radius: 36rpx;
}

.btn-pomo-start.running {
  background: #D4AF37;
  color: #0A0C10;
}

.btn-pomo-reset {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  border-radius: 36rpx;
}

/* 底部控制器 */
.bottom-controller {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

.audio-slider {
  flex: 1;
  margin: 0;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
}

.ctrl-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  font-size: 34rpx;
  color: rgba(255, 255, 255, 0.8);
}

.ctrl-btn-play {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.play-icon {
  font-size: 42rpx;
  color: #0A0C10;
  font-weight: 900;
}
</style>
