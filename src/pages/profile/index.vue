<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <!-- 顶部策展人档案面板（对齐 App fragment_profile.xml） -->
    <view class="header-panel">
      <view class="title-row">
        <text class="page-title">👤 精神档案与通行证</text>
        <view class="btn-auth" @tap="onEditCurator">✦ 策展人入驻</view>
      </view>
      <text class="profile-summary">记录认知心智演化轨迹 · 沉淀灵魂深处的回忆与勋章</text>

      <!-- 全息策展人通行卡 (CuratorPassCardView 复刻) -->
      <view class="curator-pass-card">
        <view class="pass-hologram-shine"></view>
        <view class="pass-head">
          <view class="pass-brand">
            <text class="pass-brand-text">READTRACE CURATOR PASS</text>
            <text class="pass-vol">VOL. I · 2026</text>
          </view>
          <text class="pass-chip">🎴</text>
        </view>

        <view class="pass-body">
          <view class="pass-avatar">{{ avatarText }}</view>
          <view class="pass-user">
            <text class="pass-name">{{ curatorName || '首席独立策展人' }}</text>
            <text class="pass-id">ID: RT-2026-88019 · 殿堂级</text>
          </view>
        </view>

        <view class="pass-foot">
          <text class="pass-meta">已入库 {{ totalWorks }} 部跨界藏品 · 解锁 {{ unlockedCount }} 枚心智徽章</text>
          <text class="pass-sign">AUTHENTIC ARCHIVE</text>
        </view>
      </view>

      <!-- 云端保险库增量同步操作条 -->
      <view class="vault-sync-bar" @tap="showSyncModal = true">
        <text class="vault-status-text">☁️ 云端保险库 · {{ syncStatusText }}</text>
        <view class="btn-sync-now" :class="{ syncing }" @tap.stop="triggerSync">
          {{ syncing ? '🔄 同步中…' : '🔄 立即同步' }}
        </view>
      </view>
    </view>

    <!-- 🧠 年度认知心智画像面板 (MindprintRadar) -->
    <view class="annual-persona-panel">
      <view class="persona-head">
        <text class="persona-title">🧠 年度认知心智画像</text>
        <view class="persona-badge">{{ personaTitle }}</view>
      </view>
      <text class="persona-desc">{{ personaDesc }}</text>

      <!-- 原生六维心智雷达图 -->
      <view class="radar-box">
        <MindprintRadar
          :depth="avgMindprint.depth"
          :artistry="avgMindprint.artistry"
          :emotion="avgMindprint.emotion"
          :logic="avgMindprint.logic"
          :difficulty="avgMindprint.difficulty"
          :healing="avgMindprint.healing"
          :size="260"
        />
      </view>
    </view>

    <!-- 🏛️ 虚拟空间与展览广场 -->
    <view class="section-label">🏛️ 虚拟空间与展览广场</view>

    <view class="action-card" @tap="onAction('favorites')">
      <view class="card-head">
        <text class="card-title">❤️ 我的最爱 · 跨媒介心选</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        书籍、番剧、电影、游戏、音乐五大分类心选收藏，支持金标排位与一键导出长图
      </text>
    </view>

    <view class="action-card" @tap="onAction('chronicle')">
      <view class="card-head">
        <text class="card-title">🏆 策展人年度精神年鉴</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        美术馆级年度精神画册：宏观足迹、巅峰海拔雷达与灵魂金句，一键导出印刷级长图
      </text>
    </view>

    <view class="action-card" @tap="onAction('community')">
      <view class="card-head">
        <text class="card-title">🌐 阅痕云端展览广场</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        漫游探访同频策展人的 3D 虚拟展厅与灵魂长评共鸣
      </text>
    </view>

    <view class="action-card" @tap="onAction('badges')">
      <view class="card-head">
        <text class="card-title">🏅 精神阅痕成就勋章</text>
        <view class="card-badge">已解锁 {{ unlockedCount }}/18</view>
      </view>
      <text class="card-desc">
        收集深邃探索者、时间旅人、黄金精神等 18 枚策展人专属荣誉勋章
      </text>
    </view>

    <!-- ⚙️ 系统管理与备份恢复 -->
    <view class="section-label">⚙️ 系统管理与备份恢复</view>

    <view class="action-card" @tap="onAction('migration')">
      <view class="card-head">
        <text class="card-title">🚚 多源资产搬家中心</text>
        <view class="card-pill">豆瓣 · B站 · Steam</view>
      </view>
      <text class="card-desc">
        0 门槛一键导入豆瓣书影音、Bangumi 番剧与 Steam 游戏库
      </text>
    </view>

    <view class="action-card" @tap="onAction('backup')">
      <view class="card-head">
        <text class="card-title">📦 数据备份与多格式导出</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        支持 JSON 完整备份、Obsidian Markdown 文集与 CSV 数据表格导出
      </text>
    </view>

    <view class="action-card" @tap="onAction('trash')">
      <view class="card-head">
        <text class="card-title">🗑️ 回收站与归档恢复</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        查看已软删除的作品，支持一键还原或彻底清空
      </text>
    </view>

    <view class="action-card" @tap="onAction('changelog')">
      <view class="card-head">
        <text class="card-title">📜 版本演进纪要</text>
        <view class="card-pill accent">v4.3.0</view>
      </view>
      <text class="card-desc">
        查看历史版本迭代、双端漫游协议与最新更新日志
      </text>
    </view>

    <view class="action-card" @tap="onAction('about')">
      <view class="card-head">
        <text class="card-title">🏷️ 关于阅痕 ReadTrace</text>
        <text class="card-arrow">➔</text>
      </view>
      <text class="card-desc">
        跨媒介文化印记策展空间 · 记录看过的作品，也记录当时的自己
      </text>
    </view>

    <!-- WebDAV 配置弹窗 -->
    <view class="sync-modal-mask" v-if="showSyncModal" @tap.self="showSyncModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">☁️ WebDAV 云端保险库配置</text>
          <view class="modal-close" @tap="showSyncModal = false">✕</view>
        </view>
        <text class="modal-sub">与坚果云、NAS 或 Nextcloud 同步，数据主权 100% 归你所有</text>

        <view class="form-item">
          <text class="form-label">服务器地址</text>
          <input class="form-input" v-model="webdavServer" placeholder="https://dav.jianguoyun.com/dav/" />
        </view>

        <view class="form-item">
          <text class="form-label">账号 / 用户名</text>
          <input class="form-input" v-model="webdavUser" placeholder="your_email@example.com" />
        </view>

        <view class="form-item">
          <text class="form-label">应用密码</text>
          <input class="form-input" type="password" v-model="webdavPass" placeholder="坚果云应用密码" />
        </view>

        <view class="modal-btn-row">
          <view class="modal-btn-save" @tap="saveWebDavSettings">保存并立即同步</view>
        </view>
      </view>
    </view>

    <!-- 🏅 成就勋章墙（真实本地统计） -->
    <view class="sync-modal-mask" v-if="showBadgesModal" @tap.self="showBadgesModal = false">
      <view class="sync-dialog badges-dialog">
        <view class="modal-header">
          <text class="modal-title">🏅 精神阅痕成就勋章</text>
          <view class="modal-close" @tap="showBadgesModal = false">✕</view>
        </view>
        <text class="modal-sub">已解锁 {{ unlockedCount }} / {{ badges.length }} 枚 · 由你的真实馆藏数据点亮</text>
        <view class="badge-grid">
          <view
            v-for="b in badges"
            :key="b.name"
            class="badge-cell"
            :class="{ locked: !b.unlocked }"
          >
            <text class="badge-emoji">{{ b.unlocked ? b.emoji : '🔒' }}</text>
            <text class="badge-name">{{ b.name }}</text>
            <text class="badge-desc">{{ b.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 📜 版本演进纪要 -->
    <view class="sync-modal-mask" v-if="showChangelogModal" @tap.self="showChangelogModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">📜 版本演进纪要</text>
          <view class="modal-close" @tap="showChangelogModal = false">✕</view>
        </view>
        <scroll-view scroll-y class="changelog-scroll">
          <view v-for="c in CHANGELOG" :key="c.version" class="cl-block">
            <view class="cl-head">
              <text class="cl-version">{{ c.version }}</text>
              <text class="cl-date">{{ c.date }}</text>
            </view>
            <text class="cl-title">{{ c.title }}</text>
            <text v-for="(it, i) in c.items" :key="i" class="cl-item">· {{ it }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 🏷️ 关于阅痕 -->
    <view class="sync-modal-mask" v-if="showAboutModal" @tap.self="showAboutModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">🏷️ 关于阅痕 ReadTrace</text>
          <view class="modal-close" @tap="showAboutModal = false">✕</view>
        </view>
        <view class="about-body">
          <text class="about-slogan">— 记录看过的作品，也记录当时的自己 —</text>
          <text class="about-para">阅痕是一个跨媒介文化印记策展空间：书籍、番剧、影视、游戏与音乐，都值得被认真归档。它像一座只属于你的私人美术馆，每部作品都是一件带故事的藏品。</text>
          <text class="about-para">小程序端与 Android App 端数据模型完全同构，通过 WebDAV 或 JSON 备份即可双端漫游。Local-First：所有数据默认只存在你的设备里。</text>
          <text class="about-meta">小程序版本 v1.1.0 · 对齐 App v1.0.12</text>
        </view>
      </view>
    </view>

    <!-- ✦ 策展人署名编辑 -->
    <view class="sync-modal-mask" v-if="showCuratorModal" @tap.self="showCuratorModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">✦ 策展人入驻</text>
          <view class="modal-close" @tap="showCuratorModal = false">✕</view>
        </view>
        <text class="modal-sub">署名将显示在你的全息通行卡上</text>
        <view class="form-item">
          <text class="form-label">策展人署名</text>
          <input class="form-input" v-model="curatorInput" placeholder="如：ZZD / 阿澈 / 星海漫游者" />
        </view>
        <view class="modal-btn-row">
          <view class="modal-btn-save" @tap="saveCurator">保存署名</view>
        </view>
      </view>
    </view>

    <TabBar :active="4" />
  </scroll-view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import TabBar from '../../components/TabBar.vue';
import MindprintRadar from '../../components/MindprintRadar.vue';
import { loadLocalWorks, loadLocalNotes, loadLocalMindprints, performSync, loadConfig, saveConfig } from '../../utils/sync';
import { performDualChannelSync, getCloudStats } from '../../utils/cloud-sync';
import type { Book, Mindprint, Note } from '../../utils/models';

const totalWorks = ref(0);
const syncing = ref(false);
const syncStatusText = ref('免密漫游就绪');
const mindprints = ref<Mindprint[]>([]);
const worksFull = ref<Book[]>([]);
const notesFull = ref<Note[]>([]);

const showSyncModal = ref(false);
const webdavServer = ref('');
const webdavUser = ref('');
const webdavPass = ref('');

// ── 徽章墙 / 版本纪要 / 关于 / 策展人编辑 ──
const showBadgesModal = ref(false);
const showChangelogModal = ref(false);
const showAboutModal = ref(false);
const showCuratorModal = ref(false);
const curatorName = ref('');
const curatorInput = ref('');

onShow(() => {
  const works = loadLocalWorks();
  totalWorks.value = works.length;
  worksFull.value = works;
  notesFull.value = loadLocalNotes();
  mindprints.value = loadLocalMindprints();
  curatorName.value = uni.getStorageSync('rt_curator_name') || '';

  const cloudStats = getCloudStats();
  if (cloudStats.lastSyncTime) {
    syncStatusText.value = `已漫游 (${cloudStats.lastSyncTime.slice(5, 16)})`;
  }

  const cfg = loadConfig();
  if (cfg) {
    webdavServer.value = cfg.serverUrl;
    webdavUser.value = cfg.username;
    webdavPass.value = cfg.password;
    if (!cloudStats.lastSyncTime) {
      syncStatusText.value = '已配置 WebDAV';
    }
  }
});

// 计算库藏平均六维心智
const avgMindprint = computed(() => {
  const list = mindprints.value;
  if (!list.length) {
    return { depth: 9.6, artistry: 9.8, emotion: 9.2, logic: 9.5, difficulty: 7.2, healing: 8.8 };
  }
  const avg = (key: keyof Mindprint) => {
    const nums = list.map((m) => Number(m[key]) || 0);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };
  return {
    depth: avg('depthScore'),
    artistry: avg('artistryScore'),
    emotion: avg('emotionScore'),
    logic: avg('logicScore'),
    difficulty: avg('difficultyScore'),
    healing: avg('healingScore'),
  };
});

async function triggerSync() {
  if (syncing.value) return;
  syncing.value = true;
  syncStatusText.value = '正在双端免密漫游…';
  try {
    const res = await performDualChannelSync();
    syncStatusText.value = res.cloudResult.message;
    uni.showToast({
      title: '✅ 漫游同步完成',
      icon: 'none',
    });
    const works = loadLocalWorks();
    totalWorks.value = works.length;
    mindprints.value = loadLocalMindprints();
  } catch (err: any) {
    syncStatusText.value = '漫游异常';
    uni.showToast({ title: err?.message || '漫游失败', icon: 'none' });
  } finally {
    syncing.value = false;
  }
}

function saveWebDavSettings() {
  if (!webdavServer.value || !webdavUser.value || !webdavPass.value) {
    uni.showToast({ title: '请完整填写 WebDAV 配置', icon: 'none' });
    return;
  }
  saveConfig({
    serverUrl: webdavServer.value.trim(),
    username: webdavUser.value.trim(),
    password: webdavPass.value.trim(),
  });
  showSyncModal.value = false;
  uni.showToast({ title: '配置已保存', icon: 'none' });
  triggerSync();
}

function onEditCurator() {
  curatorInput.value = curatorName.value;
  showCuratorModal.value = true;
}

function saveCurator() {
  const name = curatorInput.value.trim();
  if (!name) {
    uni.showToast({ title: '请填写策展人署名', icon: 'none' });
    return;
  }
  curatorName.value = name;
  uni.setStorageSync('rt_curator_name', name);
  showCuratorModal.value = false;
  uni.showToast({ title: '通行证署名已更新', icon: 'none' });
}

const avatarText = computed(() => (curatorName.value ? curatorName.value.slice(0, 2) : '策展'));

// ── 认知画像称号：由六维均值的主导维度推导（对齐 App ReadingPersona 思路）──
const personaTitle = computed(() => {
  const m = avgMindprint.value;
  const dims: Array<[string, number]> = [
    ['深邃博学者', m.depth],
    ['美学鉴赏家', m.artistry],
    ['共情诗人', m.emotion],
    ['逻辑星图师', m.logic],
    ['硬核攀登者', m.difficulty],
    ['治愈系旅人', m.healing],
  ];
  dims.sort((a, b) => b[1] - a[1]);
  return dims[0][0];
});

const personaDesc = computed(() => {
  const n = mindprints.value.length;
  if (!n) return '开始记录作品后，这里会生成你的年度认知心智画像';
  const m = avgMindprint.value;
  const top = personaTitle.value;
  return `基于 ${n} 部作品的六维心智均值推导 · 当前主导维度映射为「${top}」，思想 ${m.depth.toFixed(1)} / 情感 ${m.emotion.toFixed(1)} / 逻辑 ${m.logic.toFixed(1)}`;
});

// ── 真实成就统计与 18 枚徽章（对齐 App MilestoneBadgeHelper 思路）──
interface BadgeDef {
  emoji: string;
  name: string;
  desc: string;
  check: () => boolean;
}

const badgeStats = computed(() => {
  const works = worksFull.value;
  const finished = works.filter((b) => b.status === 'finished').length;
  const highRated = works.filter((b) => (b.rating ?? 0) >= 9).length;
  const perfect = works.some((b) => b.rating === 10);
  const favs = works.filter((b) => b.isFavorite).length;
  const archived = works.filter((b) => b.isDeleted).length;
  const reviews = works.filter((b) => !!b.review).length;
  const categorized = works.filter((b) => !!b.category).length;
  const mediaSet = new Set(works.filter((b) => !b.isDeleted).map((b) => b.mediaType));
  const tagCount = new Set(works.filter((b) => !b.isDeleted).flatMap((b) => b.tags || [])).size;
  return {
    total: totalWorks.value,
    finished,
    highRated,
    perfect,
    favs,
    archived,
    reviews,
    categorized,
    mediaKinds: mediaSet.size,
    tagCount,
    noteCount: notesFull.value.length,
    mindprintCount: mindprints.value.length,
  };
});

const BADGE_DEFS: BadgeDef[] = [
  { emoji: '🌱', name: '初次印记', desc: '入库第 1 部作品', check: () => badgeStats.value.total >= 1 },
  { emoji: '📚', name: '十部典藏', desc: '累计入库 10 部', check: () => badgeStats.value.total >= 10 },
  { emoji: '🏛️', name: '三十收藏家', desc: '累计入库 30 部', check: () => badgeStats.value.total >= 30 },
  { emoji: '👑', name: '全知策展人', desc: '累计入库 50 部', check: () => badgeStats.value.total >= 50 },
  { emoji: '⏳', name: '时间旅人', desc: '完结 5 部作品', check: () => badgeStats.value.finished >= 5 },
  { emoji: '🏁', name: '完卷礼赞', desc: '完结 15 部作品', check: () => badgeStats.value.finished >= 15 },
  { emoji: '🌌', name: '五域行者', desc: '五种媒介均有藏品', check: () => badgeStats.value.mediaKinds >= 5 },
  { emoji: '🌍', name: '三栖漫游', desc: '书/番/影三域各有收藏', check: () => badgeStats.value.mediaKinds >= 3 },
  { emoji: '✍️', name: '心流记录者', desc: '写下 5 条笔记', check: () => badgeStats.value.noteCount >= 5 },
  { emoji: '📜', name: '金句猎手', desc: '写下 20 条笔记', check: () => badgeStats.value.noteCount >= 20 },
  { emoji: '🖋️', name: '长文思考者', desc: '沉淀 3 篇长评', check: () => badgeStats.value.reviews >= 3 },
  { emoji: '🏷️', name: '标签诗人', desc: '使用 15 个不同标签', check: () => badgeStats.value.tagCount >= 15 },
  { emoji: '🗂️', name: '分类学家', desc: '为 5 部作品归类', check: () => badgeStats.value.categorized >= 5 },
  { emoji: '⭐', name: '品鉴之眼', desc: '收藏 3 部 9 分神作', check: () => badgeStats.value.highRated >= 3 },
  { emoji: '🌟', name: '满分致敬', desc: '存在 10 分满分藏品', check: () => badgeStats.value.perfect },
  { emoji: '💖', name: '心选策展', desc: '心选展厅收录 3 部', check: () => badgeStats.value.favs >= 3 },
  { emoji: '🧠', name: '心智测绘', desc: '生成 10 组六维画像', check: () => badgeStats.value.mindprintCount >= 10 },
  { emoji: '🗑️', name: '断舍离', desc: '使用过回收站归档', check: () => badgeStats.value.archived >= 1 },
];

const badges = computed(() => BADGE_DEFS.map((d) => ({ ...d, unlocked: d.check() })));
const unlockedCount = computed(() => badges.value.filter((b) => b.unlocked).length);

// ── 版本演进纪要（双端同步迭代节奏）──
const CHANGELOG = [
  {
    version: 'v1.1.0',
    date: '2026-09-12',
    title: '与 Android App 对齐工程',
    items: [
      '设计 Token 体系对齐 App 色彩规范（苔绿/烫金/暖纸白）',
      '极光流体背景、全息流光、字符解密、数字滚动等标志性特效移植',
      '六维雷达与星图连线 Canvas 化，根治真机 SVG 不渲染',
      '收藏/归档数据链路打通，编辑印记与海报带参直达落地',
      '成就勋章接入真实本地统计',
    ],
  },
  {
    version: 'v1.0.x',
    date: '2026-08',
    title: '七轮快速迭代',
    items: [
      '五 Tab 框架、Local-First 本地库与 WebDAV 同步',
      'Schema v4/v5 双端同构与 JSON/Markdown/CSV 导出',
      '文心雕龙 AI 读后感润色（流式输出）',
      '伴读白噪音、黑胶唱机与禅意番茄钟',
      '微信云开发双通道漫游（云数据库 + 本地快照）',
    ],
  },
];

const onAction = (type: string) => {
  switch (type) {
    case 'favorites':
      uni.navigateTo({ url: '/pages/favorites/index' });
      break;
    case 'chronicle':
      uni.redirectTo({ url: '/pages/memoir/index' });
      break;
    case 'community':
      uni.showToast({ title: '3D 展厅依赖自建后端，计划接入微信云开发实现', icon: 'none' });
      break;
    case 'badges':
      showBadgesModal.value = true;
      break;
    case 'migration':
      uni.navigateTo({ url: '/pages/backup/index' });
      break;
    case 'backup':
      uni.navigateTo({ url: '/pages/backup/index' });
      break;
    case 'trash':
      uni.navigateTo({ url: '/pages/trash/index' });
      break;
    case 'changelog':
      showChangelogModal.value = true;
      break;
    case 'about':
      showAboutModal.value = true;
      break;
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: var(--rt-bg);
  padding: 24rpx 28rpx 260rpx;
  box-sizing: border-box;
}

/* ── 顶部 Header ── */
.header-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 40rpx;
  padding: 34rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  color: var(--rt-ink);
  font-size: 44rpx;
  font-weight: bold;
  font-family: serif;
}

.btn-auth {
  padding: 8rpx 24rpx;
  border-radius: 26rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 14rpx rgba(58, 99, 72, 0.3);
}

.profile-summary {
  display: block;
  color: var(--rt-muted);
  font-size: 24rpx;
  line-height: 1.5;
  margin-top: 10rpx;
}

/* ── 全息策展人通行卡 ── */
.curator-pass-card {
  margin-top: 24rpx;
  background: linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%);
  border: 2rpx solid rgba(255, 215, 0, 0.3);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(13, 27, 42, 0.35);
  position: relative;
  overflow: hidden;
}

.pass-hologram-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
  pointer-events: none;
}

.pass-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pass-brand-text {
  color: var(--rt-gold-bright);
  font-size: 22rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.pass-vol {
  color: #a0aec0;
  font-size: 19rpx;
  margin-left: 12rpx;
}

.pass-chip {
  font-size: 32rpx;
}

.pass-body {
  display: flex;
  align-items: center;
  margin-top: 26rpx;
}

.pass-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: var(--rt-accent);
  border: 2rpx solid #ffd700;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 22rpx;
}

.pass-name {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  font-family: serif;
}

.pass-id {
  color: #cbd5e0;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.pass-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding-top: 18rpx;
  border-top: 1.5rpx solid rgba(255, 255, 255, 0.1);
}

.pass-meta {
  color: #a0aec0;
  font-size: 20rpx;
}

.pass-sign {
  color: var(--rt-gold-bright);
  font-size: 18rpx;
  letter-spacing: 2rpx;
  font-weight: bold;
}

/* ── 同步条 ── */
.vault-sync-bar {
  margin-top: 22rpx;
  height: 76rpx;
  background: var(--rt-chip);
  border-radius: 24rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vault-status-text {
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
}

.btn-sync-now {
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

.btn-sync-now.syncing {
  opacity: 0.5;
}

/* ── 年度认知心智画像面板 ── */
.annual-persona-panel {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 40rpx;
  padding: 34rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.persona-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.persona-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.persona-badge {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(58, 99, 72, 0.1);
  border: 1.5rpx solid rgba(58, 99, 72, 0.3);
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

.persona-desc {
  display: block;
  color: var(--rt-muted);
  font-size: 23rpx;
  line-height: 1.5;
  margin-top: 12rpx;
}

.radar-box {
  margin-top: 20rpx;
}

/* ── 列表标签 ── */
.section-label {
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 32rpx;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

/* ── 操作卡片 ── */
.action-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}

.action-card:active {
  transform: scale(0.99);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  color: var(--rt-ink);
  font-size: 28rpx;
  font-weight: bold;
}

.card-arrow {
  color: #9e9c94;
  font-size: 24rpx;
}

.card-badge {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  background: var(--rt-chip);
  color: var(--rt-accent);
  font-size: 21rpx;
  font-weight: bold;
}

.card-pill {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  background: var(--rt-chip);
  color: var(--rt-muted);
  font-size: 21rpx;
  font-weight: bold;
}

.card-pill.accent {
  background: rgba(58, 99, 72, 0.1);
  color: var(--rt-accent);
}

.card-desc {
  display: block;
  color: var(--rt-muted);
  font-size: 22rpx;
  line-height: 1.5;
  margin-top: 10rpx;
}

/* ── WebDAV 同步配置弹窗 ── */
.sync-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  box-sizing: border-box;
}

.sync-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.modal-close {
  color: var(--rt-muted);
  font-size: 32rpx;
  padding: 8rpx;
}

.modal-sub {
  display: block;
  color: var(--rt-muted);
  font-size: 22rpx;
  margin-top: 6rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 18rpx;
}

.form-label {
  display: block;
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.form-input {
  height: 76rpx;
  background: var(--rt-bg);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 20rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: var(--rt-ink);
}

.modal-btn-row {
  margin-top: 30rpx;
}

.modal-btn-save {
  height: 84rpx;
  background: var(--rt-accent);
  color: #ffffff;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 20rpx rgba(58, 99, 72, 0.3);
}

/* ── 成就勋章墙 ── */
.badges-dialog {
  max-height: 78vh;
  overflow-y: auto;
}

.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-top: 24rpx;
}

.badge-cell {
  width: calc((100% - 36rpx) / 3);
  background: var(--rt-parchment);
  border: 1rpx solid rgba(140, 110, 74, 0.29);
  border-radius: 18rpx;
  padding: 20rpx 12rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge-cell.locked {
  opacity: 0.45;
  filter: grayscale(0.8);
}

.badge-emoji {
  font-size: 44rpx;
}

.badge-name {
  margin-top: 10rpx;
  font-size: 23rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.badge-desc {
  margin-top: 6rpx;
  font-size: 19rpx;
  color: var(--rt-muted);
  line-height: 1.4;
}

/* ── 版本演进纪要 ── */
.changelog-scroll {
  max-height: 56vh;
  margin-top: 20rpx;
}

.cl-block {
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--rt-stroke);
  display: flex;
  flex-direction: column;
}

.cl-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cl-version {
  font-family: serif;
  font-weight: bold;
  font-size: 28rpx;
  color: var(--rt-accent);
}

.cl-date {
  font-size: 21rpx;
  color: var(--rt-faint);
}

.cl-title {
  margin-top: 8rpx;
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.cl-item {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--rt-muted);
  line-height: 1.6;
}

/* ── 关于 ── */
.about-body {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
}

.about-slogan {
  font-family: serif;
  font-size: 26rpx;
  color: var(--rt-gold);
  text-align: center;
  margin-bottom: 20rpx;
}

.about-para {
  font-size: 24rpx;
  color: var(--rt-ink);
  line-height: 1.8;
  margin-bottom: 16rpx;
}

.about-meta {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: var(--rt-faint);
  text-align: right;
}
</style>
