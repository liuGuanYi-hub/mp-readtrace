<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <!-- 顶部策展人档案面板（对齐 App fragment_profile.xml） -->
    <view class="header-panel">
      <view class="title-row">
        <text class="page-title">👤 精神档案与通行证</text>
        <view class="btn-auth rt-press" @tap="onEditCurator">
          {{ hasCustomCurator ? '⚙️ 通行证' : '✦ 策展人入驻' }}
        </view>
      </view>
      <text class="profile-summary">
        {{ totalWorks > 0 ? `已沉淀 ${totalWorks} 部文化藏品 · 记录心智演化轨迹` : '记录认知心智演化轨迹 · 沉淀灵魂深处的回忆与勋章' }}
      </text>

      <!-- 全息策展人通行卡 CuratorPassCardView (羊皮和纸暖金色调对齐) -->
      <view class="curator-pass-card rt-press" @tap="onEditCurator">
        <view class="pass-gold-arc"></view>
        <view class="pass-head">
          <text class="pass-brand-text">CURATOR PASS ✦ 策展人通行证</text>
          <text class="pass-id">#{{ curatorId }}</text>
        </view>

        <view class="pass-divider"></view>

        <view class="pass-body">
          <view class="pass-avatar">🏛️</view>
          <view class="pass-info">
            <text class="pass-name">{{ curatorName }}</text>
            <text class="pass-title">✦ {{ curatorTitle }}</text>
            <text class="pass-binding" v-if="curatorBinding">{{ curatorBinding }}</text>
          </view>
        </view>

        <text class="pass-bio">{{ curatorBio }}</text>

        <view class="pass-foot">
          <text class="pass-status" :class="{ synced: isSynced }">
            {{ isSynced ? '● 云端已同步' : '○ 纯本地漫游' }}
          </text>
          <text class="pass-joined">SINCE {{ curatorJoinedDate }}</text>
        </view>
      </view>

      <!-- 云端保险库增量同步操作条 -->
      <view class="vault-sync-bar rt-press" @tap="triggerSync" @longpress="showSyncModal = true">
        <text class="vault-status-text">☁️ 云端保险库 · {{ syncStatusText }}</text>
        <view class="btn-sync-now" :class="{ syncing }">
          {{ syncing ? '🔄 同步中…' : '🔄 立即同步' }}
        </view>
      </view>
    </view>

    <!-- 🧠 年度认知心智画像面板 (MindprintRadar) -->
    <view class="annual-persona-panel" v-if="hasPersona && personaStats">
      <text class="persona-title">🧠 年度认知心智画像</text>
      <text class="persona-badge">{{ personaStats.title }}</text>
      <text class="persona-desc">{{ personaStats.desc }}（已深度量化分析 {{ personaStats.count }} 部作品）</text>

      <view class="radar-box">
        <MindprintRadar
          :depth="personaStats.mindprint.depth"
          :artistry="personaStats.mindprint.artistry"
          :emotion="personaStats.mindprint.emotion"
          :logic="personaStats.mindprint.logic"
          :difficulty="personaStats.mindprint.difficulty"
          :healing="personaStats.mindprint.healing"
          :size="260"
        />
      </view>
    </view>

    <!-- 🏛️ 虚拟空间与展览广场 -->
    <view class="section-label">🏛️ 虚拟空间与展览广场</view>

    <!-- ❤️ 我的最爱 -->
    <view class="action-card rt-press" @tap="onAction('favorites')">
      <text class="card-title">❤️ 我的最爱 · 跨媒介心选</text>
      <text class="card-desc">
        书籍、番剧、电影、游戏、音乐五大分类心选收藏，支持金标排位与一键导出长图
      </text>
    </view>

    <!-- 🏆 策展人年度精神年鉴 -->
    <view class="action-card rt-press" @tap="onAction('chronicle')">
      <text class="card-title">🏆 策展人年度精神年鉴</text>
      <text class="card-desc">
        美术馆级年度精神画册：宏观足迹、巅峰海拔雷达与灵魂金句，一键导出印刷级长图
      </text>
    </view>

    <!-- 🌐 阅痕云端展览广场 -->
    <view class="action-card rt-press" @tap="onAction('community')">
      <text class="card-title">🌐 阅痕云端展览广场</text>
      <text class="card-desc">
        漫游探访同频策展人的 3D 虚拟展厅与灵魂长评共鸣
      </text>
    </view>

    <!-- 🏅 精神阅痕成就勋章 -->
    <view class="action-card rt-press" @tap="onAction('badges')">
      <text class="card-title">🏅 精神阅痕成就勋章</text>
      <text class="card-desc">
        已解锁 {{ unlockedCount }} / {{ badges.length }} 枚专属精神荣誉勋章
      </text>
    </view>

    <!-- ⚙️ 系统管理与备份恢复 -->
    <view class="section-label">⚙️ 系统管理与备份恢复</view>

    <!-- 🚚 多源资产搬家中心 -->
    <view class="action-card rt-press" @tap="onAction('migration')">
      <view class="card-head">
        <text class="card-title">🚚 多源资产搬家中心</text>
        <view class="card-pill">豆瓣 · B站 · Steam</view>
      </view>
      <text class="card-desc">
        0 门槛一键导入豆瓣书影音、Bangumi 番剧与 Steam 游戏库
      </text>
    </view>

    <!-- 📦 数据备份与多格式导出 -->
    <view class="action-card rt-press" @tap="onAction('backup')">
      <text class="card-title">📦 数据备份与多格式导出</text>
      <text class="card-desc">
        支持 JSON 完整备份、Obsidian Markdown 文集与 CSV 数据表格导出
      </text>
    </view>

    <!-- 🗑️ 回收站与归档恢复 -->
    <view class="action-card rt-press" @tap="onAction('trash')">
      <text class="card-title">🗑️ 回收站与归档恢复</text>
      <text class="card-desc">
        查看已软删除的作品，支持一键还原或彻底清空
      </text>
    </view>

    <!-- 📜 版本演进纪要 -->
    <view class="action-card rt-press" @tap="onAction('changelog')">
      <view class="card-head">
        <text class="card-title">📜 版本演进纪要</text>
        <view class="card-pill">v1.0.12</view>
      </view>
      <text class="card-desc">
        查看历史版本迭代与演进纪要
      </text>
    </view>

    <!-- 关于阅痕与品牌卡片 (profileVersionPanel 对齐) -->
    <view class="about-card rt-press" @tap="onAction('about')">
      <image class="app-logo" src="/static/logo.png" mode="aspectFit" />
      <view class="about-info-col">
        <view class="about-title-row">
          <text class="about-name">阅痕 ReadTrace</text>
          <view class="about-pill">v1.0.12</view>
        </view>
        <text class="about-sub">阅痕 ReadTrace v1.0.12 · 纯本地掌控</text>
        <text class="about-link">🏷️ 点击查看关于详情与设计理念 ❯</text>
      </view>
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

    <!-- 🏅 精神阅痕成就勋章墙 (对齐 App MilestoneBadgeHelper 10枚体系) -->
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
            :key="b.id"
            class="badge-cell"
            :class="{ locked: !b.isUnlocked }"
          >
            <text class="badge-emoji">{{ b.isUnlocked ? b.iconEmoji : '🔒' }}</text>
            <view class="badge-info">
              <view class="badge-title-row">
                <text class="badge-name">{{ b.title }}</text>
                <text class="badge-progress">{{ b.current }} / {{ b.max }}</text>
              </view>
              <text class="badge-desc">{{ b.description }}</text>
            </view>
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
          <view class="about-logo-box">
            <image class="about-dialog-logo" src="/static/logo.png" mode="aspectFit" />
            <text class="about-app-title">阅痕 ReadTrace</text>
            <view class="about-dialog-pill">v1.0.12</view>
          </view>
          <text class="about-slogan">— 记录看过的作品，也记录当时的自己 —</text>
          <text class="about-para">阅痕是一个跨媒介文化印记策展空间：书籍、番剧、影视、游戏与音乐，都值得被认真归档。它像一座只属于你的私人美术馆，每部作品都是一件带故事的藏品。</text>
          <text class="about-para">小程序端与 Android App 端数据模型完全同构，通过 WebDAV 即可双端漫游。Local-First：所有数据默认只保存在你的设备本地，保护个人隐私。</text>
          <text class="about-meta">版本号 v1.0.12 · 纯本地掌控</text>
        </view>
      </view>
    </view>

    <!-- ✦ 策展人档案入驻 / 编辑 -->
    <view class="sync-modal-mask" v-if="showCuratorModal" @tap.self="showCuratorModal = false">
      <view class="sync-dialog">
        <view class="modal-header">
          <text class="modal-title">✦ 策展人档案入驻</text>
          <view class="modal-close" @tap="showCuratorModal = false">✕</view>
        </view>
        <text class="modal-sub">档案信息将实时显化于全息通行证</text>
        <view class="form-item">
          <text class="form-label">策展人署名 / 昵称</text>
          <input class="form-input" v-model="curatorInput" placeholder="自由漫游策展人" />
        </view>
        <view class="form-item">
          <text class="form-label">策展座右铭 / 心境印记</text>
          <input class="form-input" v-model="curatorBioInput" placeholder="纯本地掌控 · 尚未绑定云端通行证" />
        </view>
        <view class="modal-btn-row">
          <view class="modal-btn-save" @tap="saveCurator">保存并更新通行证</view>
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
const syncStatusText = ref('离线优先就绪');
const isSynced = ref(false);
const mindprints = ref<Mindprint[]>([]);
const worksFull = ref<Book[]>([]);
const notesFull = ref<Note[]>([]);

const showSyncModal = ref(false);
const webdavServer = ref('');
const webdavUser = ref('');
const webdavPass = ref('');

// ── 策展人通行卡档案信息（对齐 CuratorPassCardView 羊皮和纸）──
const curatorId = ref('RT-GUEST-2026');
const curatorName = ref('自由漫游策展人');
const curatorTitle = ref('未认证自由旅人');
const curatorBio = ref('纯本地掌控 · 尚未绑定云端通行证');
const curatorBinding = ref('');
const curatorJoinedDate = ref('2026.09.01');
const hasCustomCurator = ref(false);

const curatorInput = ref('');
const curatorBioInput = ref('');

// ── 弹窗控制 ──
const showBadgesModal = ref(false);
const showChangelogModal = ref(false);
const showAboutModal = ref(false);
const showCuratorModal = ref(false);

onShow(() => {
  const works = loadLocalWorks();
  totalWorks.value = works.length;
  worksFull.value = works;
  notesFull.value = loadLocalNotes();
  mindprints.value = loadLocalMindprints();

  // 读取策展人通行卡持久化档案
  const storedName = uni.getStorageSync('rt_curator_name');
  if (storedName) {
    curatorName.value = storedName;
    curatorTitle.value = '特约星河馆长';
    hasCustomCurator.value = true;
  } else {
    curatorName.value = '自由漫游策展人';
    curatorTitle.value = '未认证自由旅人';
    hasCustomCurator.value = false;
  }

  const storedBio = uni.getStorageSync('rt_curator_bio');
  if (storedBio) {
    curatorBio.value = storedBio;
  } else {
    curatorBio.value = '纯本地掌控 · 尚未绑定云端通行证';
  }

  const storedId = uni.getStorageSync('rt_curator_id');
  if (storedId) {
    curatorId.value = storedId;
  }

  const storedJoined = uni.getStorageSync('rt_curator_joined');
  if (storedJoined) {
    curatorJoinedDate.value = storedJoined;
  }

  const cloudStats = getCloudStats();
  if (cloudStats.lastSyncTime) {
    syncStatusText.value = `上次同步: ${cloudStats.lastSyncTime.slice(5, 16)}`;
    isSynced.value = true;
  } else {
    syncStatusText.value = '离线优先就绪';
    isSynced.value = false;
  }

  const cfg = loadConfig();
  if (cfg) {
    webdavServer.value = cfg.serverUrl;
    webdavUser.value = cfg.username;
    webdavPass.value = cfg.password;
  }
});

// ── 认知画像计算（仅在有完结且录入心智档案的作品时显化，对齐 App getAnnualMindprintPersona）──
const finishedBooks = computed(() => worksFull.value.filter((b) => b.status === 'finished' && !b.isDeleted));
const finishedWithMindprints = computed(() => {
  const fIds = new Set(finishedBooks.value.map((b) => b.id));
  return mindprints.value.filter((m) => fIds.has(m.bookId));
});
const hasPersona = computed(() => finishedWithMindprints.value.length > 0);

const personaStats = computed(() => {
  const list = finishedWithMindprints.value;
  if (!list.length) return null;
  const count = list.length;
  const avg = (key: keyof Mindprint) => list.map((m) => Number(m[key]) || 0).reduce((a, b) => a + b, 0) / count;
  const depth = avg('depthScore');
  const artistry = avg('artistryScore');
  const emotion = avg('emotionScore');
  const logic = avg('logicScore');
  const difficulty = avg('difficultyScore');
  const healing = avg('healingScore');

  const dims: Array<[string, number, string, string]> = [
    ['depth', depth, '🧠 深邃哲思探索者', '沉醉于对世界本质与生命哲理的深度审视，在思想高原上自由漫步。'],
    ['artistry', artistry, '🖋️ 唯美文学审美家', '对文字的韵律美、诗性意境与修辞质感具有极高的审美敏锐度。'],
    ['emotion', emotion, '❤️ 细腻共鸣共情家', '在字里行间捕获最真挚的人性温热，以心感应万千生灵的喜怒哀乐。'],
    ['logic', logic, '🧭 严谨逻辑构架师', '擅长剖析精密庞杂的世界观设定与缜密推理，追求理性的秩序之美。'],
    ['difficulty', difficulty, '🏔️ 硬核攀登探索者', '乐于向思想的高难险峰发起挑战，在艰深的文本中体会征服的快意。'],
    ['healing', healing, '🌿 温暖治愈栖息者', '在轻柔温婉的心灵绿洲中沉淀思绪，让疲惫的精神重获安宁。'],
  ];
  dims.sort((a, b) => b[1] - a[1]);
  const top = dims[0];

  return {
    title: top[2],
    desc: top[3],
    count,
    mindprint: { depth, artistry, emotion, logic, difficulty, healing },
  };
});

async function triggerSync() {
  if (syncing.value) return;
  syncing.value = true;
  syncStatusText.value = '正在同步…';
  try {
    const res = await performDualChannelSync();
    syncStatusText.value = res.cloudResult.message;
    isSynced.value = true;
    uni.showToast({
      title: '✅ 同步完成',
      icon: 'none',
    });
    const works = loadLocalWorks();
    totalWorks.value = works.length;
    mindprints.value = loadLocalMindprints();
  } catch (err: any) {
    syncStatusText.value = '同步异常';
    uni.showToast({ title: err?.message || '同步失败', icon: 'none' });
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
  curatorInput.value = curatorName.value === '自由漫游策展人' ? '' : curatorName.value;
  curatorBioInput.value = curatorBio.value === '纯本地掌控 · 尚未绑定云端通行证' ? '' : curatorBio.value;
  showCuratorModal.value = true;
}

function saveCurator() {
  const name = curatorInput.value.trim() || '自由漫游策展人';
  const bio = curatorBioInput.value.trim() || '纯本地掌控 · 尚未绑定云端通行证';
  curatorName.value = name;
  curatorBio.value = bio;
  curatorTitle.value = name === '自由漫游策展人' ? '未认证自由旅人' : '特约星河馆长';
  hasCustomCurator.value = name !== '自由漫游策展人';

  uni.setStorageSync('rt_curator_name', name);
  uni.setStorageSync('rt_curator_bio', bio);
  showCuratorModal.value = false;
  uni.showToast({ title: '通行证档案已更新', icon: 'none' });
}

// ── 真实成就统计与 10 枚勋章体系（100% 同构移植 App MilestoneBadgeHelper）──
interface MilestoneBadgeItem {
  id: string;
  category: string;
  title: string;
  description: string;
  iconEmoji: string;
  current: number;
  max: number;
  isUnlocked: boolean;
}

const badgeStats = computed(() => {
  const activeWorks = worksFull.value.filter((b) => !b.isDeleted);
  const finishedCount = activeWorks.filter((b) => b.status === 'finished').length;
  const totalBooksCount = activeWorks.length;
  const notesCount = notesFull.value.length;
  const categories = new Set(activeWorks.map((b) => b.category).filter(Boolean));
  const categoriesCount = categories.size;
  const highRatingCount = activeWorks.filter((b) => (b.rating ?? 0) >= 9).length;

  return {
    finishedCount,
    totalBooksCount,
    notesCount,
    categoriesCount,
    highRatingCount,
  };
});

const badges = computed<MilestoneBadgeItem[]>(() => {
  const s = badgeStats.value;
  return [
    // 维度一：书卷浩瀚 (已读书籍)
    {
      id: 'finish_1',
      category: '书卷浩瀚',
      title: '初涉书海',
      description: '读完第 1 本书，迈出阅读旅程的第一步',
      iconEmoji: '📖',
      current: s.finishedCount,
      max: 1,
      isUnlocked: s.finishedCount >= 1,
    },
    {
      id: 'finish_5',
      category: '书卷浩瀚',
      title: '渐入佳境',
      description: '累计读完 5 本书籍，沉浸于阅读心流',
      iconEmoji: '📚',
      current: s.finishedCount,
      max: 5,
      isUnlocked: s.finishedCount >= 5,
    },
    {
      id: 'finish_10',
      category: '书卷浩瀚',
      title: '卷帙浩繁',
      description: '累计读完 10 本书籍，知识蔚然成林',
      iconEmoji: '🏛️',
      current: s.finishedCount,
      max: 10,
      isUnlocked: s.finishedCount >= 10,
    },
    {
      id: 'finish_30',
      category: '书卷浩瀚',
      title: '阅尽沧桑',
      description: '累计读完 30 本经典，见天地与众生',
      iconEmoji: '👑',
      current: s.finishedCount,
      max: 30,
      isUnlocked: s.finishedCount >= 30,
    },
    // 维度二：吉光片羽 (摘录笔记)
    {
      id: 'notes_1',
      category: '吉光片羽',
      title: '第一声回响',
      description: '记录第 1 条阅读摘录或随想',
      iconEmoji: '✍️',
      current: s.notesCount,
      max: 1,
      isUnlocked: s.notesCount >= 1,
    },
    {
      id: 'notes_10',
      category: '吉光片羽',
      title: '妙笔留痕',
      description: '累计摘录与沉淀 10 条深刻字句',
      iconEmoji: '📝',
      current: s.notesCount,
      max: 10,
      isUnlocked: s.notesCount >= 10,
    },
    {
      id: 'notes_50',
      category: '吉光片羽',
      title: '思想宝库',
      description: '累计沉淀 50 条摘录随想，汇聚智慧海洋',
      iconEmoji: '💡',
      current: s.notesCount,
      max: 50,
      isUnlocked: s.notesCount >= 50,
    },
    // 维度三：见微知著 (品味广度)
    {
      id: 'books_10',
      category: '见微知著',
      title: '藏书万卷',
      description: '书架收录超过 10 本书籍',
      iconEmoji: '🔖',
      current: s.totalBooksCount,
      max: 10,
      isUnlocked: s.totalBooksCount >= 10,
    },
    {
      id: 'categories_3',
      category: '见微知著',
      title: '百家争鸣',
      description: '涉猎覆盖 3 个及以上不同书籍分类',
      iconEmoji: '🧭',
      current: s.categoriesCount,
      max: 3,
      isUnlocked: s.categoriesCount >= 3,
    },
    {
      id: 'high_rating_5',
      category: '见微知著',
      title: '慧眼识珠',
      description: '为 5 本书籍打出 9.0 分以上的至臻好评',
      iconEmoji: '🌟',
      current: s.highRatingCount,
      max: 5,
      isUnlocked: s.highRatingCount >= 5,
    },
  ];
});

const unlockedCount = computed(() => badges.value.filter((b) => b.isUnlocked).length);

// ── 版本演进纪要（对齐 App v1.0.12）──
const CHANGELOG = [
  {
    version: 'v1.0.12',
    date: '2026-09-13',
    title: '全端展馆级视觉与交互深度对齐',
    items: [
      'Hub / 藏库 / 详情 / 我的 四大核心页面与 Android App 像素级对齐',
      '全息策展人通行卡 3D 羊皮纸暖金质感与防伪编号系统',
      '10 枚精神荣誉成就勋章体系与真实本地馆藏数据打通',
      'BorderBeam 360° 流光边框与 15 展馆区块连续流',
      '六维心智雷达与情绪胶囊动态注入引擎',
    ],
  },
  {
    version: 'v1.0.11',
    date: '2026-09-08',
    title: '跨媒介策展体系建立',
    items: [
      '书·影·音·番·游 五大媒介深度档案建立',
      '多源资产搬家（豆瓣·B站·Steam）与回收站支持',
      'WebDAV 云端保险库与双端同构备份机制',
    ],
  },
  {
    version: 'v1.0.10',
    date: '2026-08-25',
    title: 'Local-First 本地优先与艺术化体验',
    items: [
      '五 Tab 架构打通，沉浸式艺术馆展陈风格设计 Token 实装',
      '离线优先本地 SQLite/Storage 存储，数据主权 100% 归用户所有',
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
      uni.showToast({ title: '3D 虚拟展厅正在云端策展中，敬请期待', icon: 'none' });
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
};
</script>

<style>
.page {
  min-height: 100vh;
  background: var(--rt-bg, #F7F4EE);
  padding: 40rpx 36rpx 240rpx;
  box-sizing: border-box;
}

/* ── 顶部档案面板（对齐 App fragment_profile.xml: bg_glass_panel, padding 16dp） ── */
.header-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  color: var(--rt-ink, #1A1C19);
  font-size: 44rpx;
  font-weight: bold;
  font-family: sans-serif;
}

.btn-auth {
  padding: 10rpx 24rpx;
  border-radius: 32rpx;
  background: var(--rt-accent, #3A6348);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 14rpx rgba(58, 99, 72, 0.3);
}

.profile-summary {
  display: block;
  color: var(--rt-muted, #737571);
  font-size: 25rpx;
  line-height: 1.5;
  margin-top: 12rpx;
}

/* ── 全息策展人通行卡 CuratorPassCardView (羊皮和纸暖金色调，对齐 App PARCHMENT_WOOD) ── */
.curator-pass-card {
  margin-top: 28rpx;
  background: linear-gradient(135deg, #F6F1E8 0%, #ECE2D0 100%);
  border: 2.4rpx solid rgba(0, 0, 0, 0.18);
  border-radius: 36rpx;
  padding: 20rpx 36rpx 36rpx 36rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.pass-gold-arc {
  position: absolute;
  top: 0;
  left: 36rpx;
  right: 36rpx;
  height: 3rpx;
  background: linear-gradient(90deg, transparent, rgba(158, 118, 56, 0.5), transparent);
}

.pass-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pass-brand-text {
  color: rgba(26, 28, 25, 0.60);
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.pass-id {
  color: rgba(26, 28, 25, 0.75);
  font-size: 21rpx;
  font-family: monospace;
  font-weight: 500;
}

.pass-divider {
  height: 2rpx;
  background: rgba(0, 0, 0, 0.12);
  margin: 14rpx 0 24rpx 0;
}

.pass-body {
  display: flex;
  align-items: center;
}

.pass-avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  border: 2rpx solid rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.pass-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pass-name {
  color: #1A1C19;
  font-size: 36rpx;
  font-weight: bold;
  font-family: sans-serif;
}

.pass-title {
  color: #8A6D3B;
  font-size: 23rpx;
  font-weight: 600;
  margin-top: 6rpx;
}

.pass-binding {
  font-size: 19rpx;
  color: rgba(26, 28, 25, 0.6);
  font-family: monospace;
  margin-top: 4rpx;
}

.pass-bio {
  color: rgba(26, 28, 25, 0.70);
  font-size: 24rpx;
  line-height: 1.4;
  margin-top: 24rpx;
  display: block;
}

.pass-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
}

.pass-status {
  font-size: 21rpx;
  color: #808080;
  font-weight: 500;
}

.pass-status.synced {
  color: #48C78E;
}

.pass-joined {
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: rgba(26, 28, 25, 0.44);
  font-family: monospace;
}

/* ── 云端保险库同步操作条（对齐 App: bg_segmented_container, height 38dp） ── */
.vault-sync-bar {
  margin-top: 24rpx;
  height: 76rpx;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 20rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vault-status-text {
  color: var(--rt-ink, #1A1C19);
  font-size: 24rpx;
}

.btn-sync-now {
  color: var(--rt-accent, #3A6348);
  font-size: 24rpx;
  font-weight: bold;
}

.btn-sync-now.syncing {
  opacity: 0.5;
}

/* ── 年度认知心智画像面板 (对齐 App annualPersonaPanel) ── */
.annual-persona-panel {
  margin-top: 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 36rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.05);
}

.persona-title {
  display: block;
  color: var(--rt-ink, #1A1C19);
  font-size: 33rpx;
  font-weight: bold;
  font-family: sans-serif;
}

.persona-badge {
  display: block;
  margin-top: 12rpx;
  color: var(--rt-accent, #3A6348);
  font-size: 32rpx;
  font-weight: bold;
}

.persona-desc {
  display: block;
  color: var(--rt-muted, #737571);
  font-size: 26rpx;
  line-height: 1.5;
  margin-top: 8rpx;
}

.radar-box {
  margin-top: 20rpx;
}

/* ── 分组标签（对齐 App ReadTraceFieldLabel: 16.5sp, bold） ── */
.section-label {
  color: var(--rt-ink, #1A1C19);
  font-size: 33rpx;
  font-weight: bold;
  font-family: sans-serif;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
  padding-left: 4rpx;
}

/* ── 操作卡片（对齐 App bg_glass_panel: padding 16dp, radius 16dp） ── */
.action-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  color: var(--rt-ink, #1A1C19);
  font-size: 32rpx;
  font-weight: bold;
}

.card-pill {
  background: var(--rt-chip, #EAE4D8);
  color: var(--rt-accent, #3A6348);
  border: 1rpx solid rgba(58, 99, 72, 0.15);
  border-radius: 999rpx;
  padding: 4rpx 14rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.card-desc {
  display: block;
  color: var(--rt-muted, #737571);
  font-size: 25rpx;
  line-height: 1.5;
  margin-top: 8rpx;
}

/* ── 关于卡片（对齐 App profileVersionPanel: logo 52dp + pill + slogan） ── */
.about-card {
  margin-top: 24rpx;
  margin-bottom: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
}

.app-logo {
  width: 104rpx;
  height: 104rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.about-info-col {
  margin-left: 28rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.about-title-row {
  display: flex;
  align-items: center;
}

.about-name {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--rt-ink, #1A1C19);
}

.about-pill {
  margin-left: 16rpx;
  background: var(--rt-accent, #3A6348);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: bold;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

.about-sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: var(--rt-muted, #737571);
}

.about-link {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: var(--rt-accent, #3A6348);
}

/* ── 弹窗公共遮罩与主体 ── */
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
  border-radius: 36rpx;
  padding: 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: var(--rt-ink, #1A1C19);
  font-size: 32rpx;
  font-weight: bold;
  font-family: sans-serif;
}

.modal-close {
  color: var(--rt-muted, #737571);
  font-size: 32rpx;
  padding: 8rpx;
}

.modal-sub {
  display: block;
  color: var(--rt-muted, #737571);
  font-size: 22rpx;
  margin-top: 6rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 18rpx;
}

.form-label {
  display: block;
  color: var(--rt-ink, #1A1C19);
  font-size: 22rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.form-input {
  height: 76rpx;
  background: var(--rt-bg, #F7F4EE);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 20rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: var(--rt-ink, #1A1C19);
}

.modal-btn-row {
  margin-top: 30rpx;
}

.modal-btn-save {
  height: 84rpx;
  background: var(--rt-accent, #3A6348);
  color: #ffffff;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 20rpx rgba(58, 99, 72, 0.3);
}

/* ── 成就勋章大厅 ── */
.badges-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.badge-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.badge-cell {
  background: var(--rt-parchment, #FAF6EE);
  border: 1.5rpx solid rgba(140, 110, 74, 0.22);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.badge-cell.locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}

.badge-emoji {
  font-size: 48rpx;
  width: 72rpx;
  flex-shrink: 0;
  text-align: center;
}

.badge-info {
  margin-left: 20rpx;
  flex: 1;
}

.badge-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-name {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--rt-ink, #1A1C19);
}

.badge-progress {
  font-size: 20rpx;
  color: var(--rt-accent, #3A6348);
  font-weight: bold;
  margin-left: 12rpx;
}

.badge-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 21rpx;
  color: var(--rt-muted, #737571);
  line-height: 1.4;
}

/* ── 版本演进纪要 ── */
.changelog-scroll {
  max-height: 56vh;
  margin-top: 20rpx;
}

.cl-block {
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.cl-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cl-version {
  font-weight: bold;
  font-size: 28rpx;
  color: var(--rt-accent, #3A6348);
}

.cl-date {
  font-size: 21rpx;
  color: var(--rt-muted, #737571);
}

.cl-title {
  margin-top: 8rpx;
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-ink, #1A1C19);
}

.cl-item {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--rt-muted, #737571);
  line-height: 1.6;
}

/* ── 关于详情弹窗 ── */
.about-body {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
}

.about-logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.about-dialog-logo {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
}

.about-app-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--rt-ink, #1A1C19);
}

.about-dialog-pill {
  background: var(--rt-accent, #3A6348);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.about-slogan {
  font-size: 25rpx;
  color: #8A6D3B;
  text-align: center;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.about-para {
  font-size: 24rpx;
  color: var(--rt-ink, #1A1C19);
  line-height: 1.8;
  margin-bottom: 16rpx;
}

.about-meta {
  margin-top: 12rpx;
  font-size: 21rpx;
  color: var(--rt-muted, #737571);
  text-align: right;
}
</style>
