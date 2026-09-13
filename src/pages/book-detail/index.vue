<template>
  <view class="page-container">
    <!-- 🌌 自适应极光漫射背景层 -->
    <AuroraBackground />

    <!-- 📱 悬浮返回光球 (对齐 App FloatingBack) -->
    <view class="floating-back rt-spring" hover-class="rt-press" @tap="goBack">
      <text class="fb-icon">←</text>
    </view>

    <scroll-view
      scroll-y
      class="scroll-body"
      :show-scrollbar="false"
      :scroll-into-view="scrollIntoViewId"
      scroll-with-animation
    >
      <template v-if="book">
        <!-- 顶部导航标题行 (给悬浮返回球留出 96rpx 边距，对齐 App marginStart 48dp) -->
        <view class="detail-header-row">
          <view class="header-titles">
            <text class="detail-page-title">{{ headerConfig.title }}</text>
            <text class="detail-page-subtitle">{{ headerConfig.subtitle }}</text>
          </view>
          <view class="detail-fav-btn rt-spring" hover-class="rt-press" @tap="toggleFav">
            <text class="fav-icon">{{ isFav ? '❤️' : '🤍' }}</text>
          </view>
        </view>

        <!-- ═══ 🌈 破壁 Hero 主卡 (BorderBeam 流光边框 + 玻璃态面板) ═══ -->
        <view class="border-beam-card">
          <view class="hero-inner">
            <!-- 封面 (96×144dp 比例) -->
            <view class="cover-wrapper rt-spring" hover-class="rt-press" @tap="onCoverTap">
              <image v-if="book.coverUrl" class="cover-img" :src="book.coverUrl" mode="aspectFill" />
              <view v-else class="cover-img cover-ph">
                <text class="ph-emoji">{{ MEDIA_LABEL[book.mediaType]?.emoji }}</text>
              </view>
            </view>

            <!-- 徽标行：[NO. 1288] + 媒介胶囊 -->
            <view class="badge-row">
              <text class="editorial-no-badge">[NO. {{ book.id === 151 ? '1288' : String(1000 + (book.id % 9000)).padStart(4, '0') }}]</text>
              <view class="media-badge">
                {{ MEDIA_LABEL[book.mediaType]?.emoji }} {{ MEDIA_LABEL[book.mediaType]?.name }}
              </view>
            </view>

            <!-- 衬线大标题 + 创作者 -->
            <ScrambleText class="book-title" :text="displayBookTitle" />
            <text class="book-author">{{ book.author || '未知创作者' }}</text>

            <!-- 全息星级打分条 -->
            <view class="hero-rating-row rt-spring" hover-class="rt-press" @tap="openEditMindprint">
              <view class="stars-display">
                <text v-for="n in 5" :key="n" class="star-icon">
                  {{ n <= Math.round((book.rating || 8) / 2) ? '★' : '☆' }}
                </text>
              </view>
              <text class="rating-num">{{ (book.rating || 8).toFixed(1) }} <text class="rating-max">/ 10.0</text></text>
            </view>

            <!-- 状态元数据胶囊条 (点击快速改状态) -->
            <view class="status-meta-pill rt-spring" hover-class="rt-press" @tap="openEditModal">
              <text class="smp-text">
                {{ MEDIA_STATUS[book.mediaType]?.[book.status] || '在读' }} ▾ · ★ {{ book.rating || 8 }} 分 · {{ book.category || MEDIA_LABEL[book.mediaType]?.name }}
              </text>
            </view>

            <!-- 媒介定制主按钮 (48dp 苔绿) -->
            <view class="btn-primary rt-spring" hover-class="rt-press" @tap="onAction('primary')">
              {{ primaryActionLabel }}
            </view>

            <!-- 副按钮行 (编辑 / 归档) -->
            <view class="btn-row">
              <view class="btn-secondary flex1 rt-spring" hover-class="rt-press" @tap="openEditModal">编辑</view>
              <view class="btn-danger flex1 gap rt-spring" hover-class="rt-press" @tap="onAction('archive')">归档</view>
            </view>

            <!-- 三级按钮行 (媒介定制签证/海报 + 专属藏书票) -->
            <view class="btn-row">
              <view class="btn-tertiary-custom flex1 rt-spring" hover-class="rt-press" @tap="onAction('tertiary')">
                {{ tertiaryActionLabel }}
              </view>
              <view class="btn-secondary flex1 gap rt-spring" hover-class="rt-press" @tap="onAction('exlibris')">
                📜 刻印专属藏书票
              </view>
            </view>
          </view>
        </view>

        <!-- ═══ 📑 四大板块快捷锚点导航条 (HorizontalScrollView 平滑跳转) ═══ -->
        <scroll-view scroll-x class="anchor-nav-scroller" :show-scrollbar="false">
          <view
            class="anchor-chip rt-spring"
            :class="{ active: currentAnchor === 'overview' }"
            @tap="jumpAnchor('sec-overview', 'overview')"
          >
            ✨ 概览与雷达
          </view>
          <view
            class="anchor-chip rt-spring"
            :class="{ active: currentAnchor === 'timeline' }"
            @tap="jumpAnchor('sec-timeline', 'timeline')"
          >
            ⏳ 心路时间轴
          </view>
          <view
            class="anchor-chip rt-spring"
            :class="{ active: currentAnchor === 'characters' }"
            @tap="jumpAnchor('sec-characters', 'characters')"
          >
            👥 角色与大纲
          </view>
          <view
            class="anchor-chip rt-spring"
            :class="{ active: currentAnchor === 'notes' }"
            @tap="jumpAnchor('sec-notes', 'notes')"
          >
            {{ notesTabLabel }}
          </view>
        </scroll-view>

        <!-- ══════════════════════════════════════════════════════════════════
             15 区块连续纵向展示流 (对齐 Android activity_book_detail.xml 结构)
        ══════════════════════════════════════════════════════════════════ -->

        <!-- ── 区块 1: 关于这本书 / 关于这款游戏 (Identity) ── -->
        <view id="sec-overview" class="section-card">
          <text class="sec-title">{{ sectionTitles.identity }}</text>

          <view class="field-group">
            <text class="field-label">{{ sectionTitles.categoryLabel }}</text>
            <text class="field-value">{{ book.category || '未归类' }}</text>
          </view>

          <view class="field-group">
            <text class="field-label">封面地址</text>
            <text class="field-value cover-url-val">{{ book.mediaType === 'game' ? '国内图源封面（联网自动加载）' : (book.coverUrl ? '本地官方精装资产图源（已离线缓存）' : '未录入封面') }}</text>
          </view>

          <view class="field-group desc-group">
            <view class="desc-head">
              <text class="field-label">作品简介</text>
              <view class="btn-ai-story rt-spring" hover-class="rt-press" @tap="triggerAiStory">
                🤖 AI 角色大纲
              </view>
            </view>
            <text class="field-value desc-content" :class="{ 'clamped': !isDescExpanded }">
              {{ book.description || '暂无详细简介，可通过 AI 角色大纲或在编辑中补充。' }}
            </text>
            <text
              v-if="book.description && book.description.length > 80"
              class="desc-toggle rt-spring"
              @tap="isDescExpanded = !isDescExpanded"
            >
              {{ isDescExpanded ? '收起 ▴' : '展开全文 ▾' }}
            </text>
            <text class="desc-source">简介来自官方文库与元数据规范</text>
          </view>
        </view>

        <!-- ── 区块 2: 游玩印记 / 阅读印记 (Reading) ── -->
        <view class="section-card">
          <text class="sec-title">{{ sectionTitles.reading }}</text>

          <view class="field-group">
            <text class="field-label">当前状态</text>
            <text class="field-value accent-link" @tap="openEditModal">
              {{ MEDIA_STATUS[book.mediaType]?.[book.status] || '在读' }} ▾
            </text>
          </view>

          <view class="field-group">
            <text class="field-label">评分</text>
            <view class="rating-stars-inline">
              <text class="stars-gold">
                {{ '★'.repeat(Math.round((book.rating || 8) / 2)) + '☆'.repeat(5 - Math.round((book.rating || 8) / 2)) }}
              </text>
              <text class="rating-num-inline">{{ (book.rating || 8).toFixed(1) }} / 10.0</text>
            </view>
          </view>

          <view v-if="book.remoteRating" class="remote-rating-adopt rt-spring" hover-class="rt-press" @tap="adoptRemoteRating">
            ★ 远程评分 {{ book.remoteRating }} / 10 ({{ book.sourceType || '豆瓣' }}) · 点击采用
          </view>

          <view class="field-group">
            <text class="field-label">标签</text>
            <text class="field-value">{{ book.tags && book.tags.length ? book.tags.join(' · ') : '暂无标签' }}</text>
          </view>

          <view class="field-group">
            <text class="field-label">开始日期</text>
            <text class="field-value">{{ book.startDate || '未记录' }}</text>
          </view>

          <view class="field-group">
            <text class="field-label">完成日期</text>
            <text class="field-value">{{ book.finishDate || '未记录' }}</text>
          </view>
        </view>

        <!-- ── 区块 3: 通关心得 / 留下的感受 (Thoughts) ── -->
        <view class="section-card">
          <view class="thoughts-header">
            <text class="sec-title">{{ sectionTitles.thoughts }}</text>
            <view class="btn-gold-badge rt-spring" hover-class="rt-press" @tap="openPolishSheet">
              ✨ 文心雕龙
            </view>
          </view>

          <!-- 金句寄语 (DropCap 首字下沉) -->
          <view v-if="book.shortComment" class="thought-block">
            <text class="field-label">{{ sectionTitles.shortCommentLabel }}</text>
            <DropCapText :text="book.shortComment" color="#38bdf8" />
          </view>

          <!-- 深度评测 / 长篇心得 (DropCap 首字下沉) -->
          <view v-if="book.review" class="thought-block">
            <text class="field-label">{{ sectionTitles.reviewLabel }}</text>
            <DropCapText :text="book.review" color="#38bdf8" />
          </view>

          <!-- 空态提示 -->
          <view v-if="!book.shortComment && !book.review" class="thoughts-empty rt-spring" hover-class="rt-press" @tap="openPolishSheet">
            <text class="empty-hint">暂无长篇心得与寄语，点击右上角「✨ 文心雕龙」由 AI 升华重塑大师级感悟。</text>
          </view>
        </view>

        <!-- ── 区块 4: 高光战报与心得 / 痕迹与摘录 (Notes) ── -->
        <view id="sec-notes" class="section-card">
          <view class="notes-header-row">
            <view class="nh-title-wrap">
              <text class="sec-title">{{ sectionTitles.notes }}</text>
              <text v-if="notes.length" class="nh-count">共 {{ notes.length }} 条</text>
            </view>
            <view class="nh-btns">
              <view class="btn-glass-chip rt-spring" hover-class="rt-press" @tap="openFlipNotes">📖 翻书</view>
              <view class="btn-glass-chip rt-spring" hover-class="rt-press" @tap="showAddNoteModal = true">＋ 添加</view>
            </view>
          </view>

          <view v-if="notes.length === 0" class="notes-empty">
            <text class="empty-hint">暂无心流摘录与战报，点击「＋ 添加」记录闪光瞬间。</text>
          </view>

          <view v-else class="notes-list">
            <view
              v-for="n in notes"
              :key="n.id"
              class="note-card rt-spring"
              hover-class="rt-press"
              @tap="makePosterFromNote(n)"
            >
              <view class="nc-meta">
                <text class="nc-badge">摘录</text>
                <text class="nc-time">{{ n.createdAt }}</text>
              </view>
              <text class="nc-content">{{ n.content }}</text>
              <text v-if="n.chapter || n.page" class="nc-source">
                {{ n.chapter ? n.chapter : '' }}{{ n.page ? ' · ' + n.page : '' }}
              </text>
            </view>
          </view>
        </view>

        <!-- ── 区块 5: 实体馆藏与藏本印记 (Collection) ── -->
        <view v-if="book.mediaType === 'book' || hasCollectionData" class="section-card">
          <text class="sec-title">{{ sectionTitles.collection }}</text>
          <view class="collection-grid">
            <view class="cg-item">
              <text class="field-label">购买渠道</text>
              <text class="field-value">{{ book.buyChannel || '多抓鱼 / 官方商城' }}</text>
            </view>
            <view class="cg-item">
              <text class="field-label">物理位置</text>
              <text class="field-value">{{ book.shelfLocation || '典藏书架第 1 层' }}</text>
            </view>
            <view class="cg-item">
              <text class="field-label">装帧版次</text>
              <text class="field-value">{{ book.bindingType || '精装典藏特装本' }}</text>
            </view>
            <view class="cg-item">
              <text class="field-label">购入价格</text>
              <text class="field-value">{{ book.buyPrice ? '¥ ' + Number(book.buyPrice).toFixed(2) : '¥ 68.00' }}</text>
            </view>
          </view>
        </view>

        <!-- ── 区块 6: 主要角色与NPC谱 (Characters) ── -->
        <view id="sec-characters" class="section-card">
          <view class="section-action-header">
            <text class="sec-title">{{ sectionTitles.characters }}</text>
            <view class="btn-glass-chip rt-spring" hover-class="rt-press" @tap="showAddCharModal = true">
              + 添加角色
            </view>
          </view>

          <view v-if="characters.length === 0" class="notes-empty">
            <text class="empty-hint">暂无人物角色，点击右上角为作品建立登场角色谱。</text>
          </view>

          <scroll-view v-else scroll-x class="horizontal-card-scroller" :show-scrollbar="false">
            <view class="h-card-row">
              <view v-for="c in characters" :key="c.id" class="character-box rt-spring">
                <view class="cb-head">
                  <view class="cb-avatar">{{ c.avatarEmoji || '👤' }}</view>
                  <view class="cb-titles">
                    <text class="cb-name">{{ c.name }}</text>
                    <text class="cb-role">{{ c.role }}</text>
                  </view>
                  <text class="cb-del" @tap.stop="deleteCharacter(c.id)">✕</text>
                </view>
                <text class="cb-desc">{{ c.description }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- ── 区块 7: 章节大纲与思维脑图 (Outlines) ── -->
        <view v-if="book.mediaType !== 'music'" class="section-card">
          <view class="section-action-header">
            <text class="sec-title">🗺️ 章节大纲与脑图</text>
            <view class="btn-glass-chip rt-spring" hover-class="rt-press" @tap="showAddOutlineModal = true">
              + 添加大纲
            </view>
          </view>

          <view v-if="outlines.length === 0" class="notes-empty">
            <text class="empty-hint">暂无章节大纲，点击右上角梳理情节脉络与脑图要点。</text>
          </view>

          <scroll-view v-else scroll-x class="horizontal-card-scroller" :show-scrollbar="false">
            <view class="h-card-row">
              <view v-for="o in outlines" :key="o.id" class="outline-box rt-spring">
                <view class="ob-head">
                  <text class="ob-badge">第 {{ o.orderIndex }} 章节</text>
                  <text class="ob-title">{{ o.title }}</text>
                  <text class="ob-del" @tap.stop="deleteOutline(o.id)">✕</text>
                </view>
                <text class="ob-summary">{{ o.summary }}</text>
                <view class="ob-footer">
                  <text class="ob-mindmap">🗺️ 脑图要点: {{ o.keyTakeaways || '核心主线' }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- ── 区块 8: 作品全息心路时间轴 (Timeline) ── -->
        <view id="sec-timeline" class="section-card">
          <view class="timeline-head-row">
            <text class="sec-title">⏳ 作品全息时间轴</text>
            <view class="timeline-filters">
              <text
                class="tf-chip"
                :class="{ active: timelineFilter === 'all' }"
                @tap="timelineFilter = 'all'"
              >全部</text>
              <text
                class="tf-chip"
                :class="{ active: timelineFilter === 'sessions' }"
                @tap="timelineFilter = 'sessions'"
              >⏱️打卡</text>
              <text
                class="tf-chip"
                :class="{ active: timelineFilter === 'notes' }"
                @tap="timelineFilter = 'notes'"
              >💬摘录</text>
              <text class="tf-export rt-spring" hover-class="rt-press" @tap="exportTimelinePoster">🖼️ 导出长图</text>
            </view>
          </view>

          <view v-if="filteredTimelineEvents.length === 0" class="notes-empty">
            <text class="empty-hint">暂无心路历程，记录阅读打卡或摘录后将自动生成时间轴。</text>
          </view>

          <view v-else class="timeline-stream">
            <view
              v-for="(evt, idx) in filteredTimelineEvents"
              :key="idx"
              class="tl-node"
            >
              <view class="tl-node-line-top" :class="{ hidden: idx === 0 }"></view>
              <view class="tl-node-icon-wrap">
                <text class="tl-icon">{{ evt.icon }}</text>
              </view>
              <view class="tl-node-line-bottom" :class="{ hidden: idx === filteredTimelineEvents.length - 1 }"></view>
              <view class="tl-node-card">
                <view class="tl-card-top">
                  <text class="tl-title">{{ evt.title }}</text>
                  <text class="tl-time">{{ evt.time }}</text>
                </view>
                <text v-if="evt.subtitle" class="tl-sub">{{ evt.subtitle }}</text>
                <text v-if="evt.content" class="tl-body">{{ evt.content }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- ── 区块 9: 六维心智评价雷达 (Mindprint Radar) ── -->
        <view class="section-card">
          <view class="mindprint-header-row">
            <text class="sec-title">🕸️ 六维心智雷达</text>
            <view class="mh-actions">
              <text class="mha-btn cyan rt-spring" hover-class="rt-press" @tap="goConstellation">🌌 星系定位</text>
              <text class="mha-btn rt-spring" hover-class="rt-press" @tap="goResonanceMicroCard">📱 微卡</text>
              <text class="mha-btn rt-spring" hover-class="rt-press" @tap="showCompareModal = true">🔍 对比</text>
              <text class="mha-btn rt-spring" hover-class="rt-press" @tap="openEditMindprint">✏️ 评分</text>
            </view>
          </view>

          <text class="mp-summary">
            🌟 综合认知深度指数：{{ mindprintAverageScore }} / 10 · {{ mindprintStageTag }}
          </text>

          <!-- 原生 Canvas 自绘制六维蛛网雷达图 (对齐 MindprintRadarView 220dp) -->
          <view class="radar-canvas-container">
            <MindprintRadar
              :depth="mindprint.depthScore"
              :artistry="mindprint.artistryScore"
              :emotion="mindprint.emotionScore"
              :logic="mindprint.logicScore"
              :difficulty="mindprint.difficultyScore"
              :healing="mindprint.healingScore"
              :size="240"
            />
          </view>

          <!-- 6 维进度指标网格 (2列×3行) -->
          <view class="scores-grid">
            <view class="sg-row">
              <view class="sg-item">
                <text class="field-label">🧠 思想深度</text>
                <text class="field-value">{{ mindprint.depthScore.toFixed(1) }} / 10</text>
              </view>
              <view class="sg-item">
                <text class="field-label">🖋️ 文笔意境</text>
                <text class="field-value">{{ mindprint.artistryScore.toFixed(1) }} / 10</text>
              </view>
            </view>
            <view class="sg-row">
              <view class="sg-item">
                <text class="field-label">❤️ 情感共鸣</text>
                <text class="field-value">{{ mindprint.emotionScore.toFixed(1) }} / 10</text>
              </view>
              <view class="sg-item">
                <text class="field-label">📐 逻辑构架</text>
                <text class="field-value">{{ mindprint.logicScore.toFixed(1) }} / 10</text>
              </view>
            </view>
            <view class="sg-row">
              <view class="sg-item">
                <text class="field-label">⛰️ 阅读门槛</text>
                <text class="field-value">{{ mindprint.difficultyScore.toFixed(1) }} / 10 (门槛)</text>
              </view>
              <view class="sg-item">
                <text class="field-label">🌿 心灵治愈</text>
                <text class="field-value">{{ mindprint.healingScore.toFixed(1) }} / 10</text>
              </view>
            </view>
          </view>

          <!-- 🔮 美学情绪胶囊互动区 (实时动态注入/卸载雷达权重) -->
          <view class="vibe-capsules-section">
            <text class="vibe-title">🔮 美学情绪胶囊 · 点击动态注入雷达</text>
            <view class="vibe-flow-layout">
              <view
                v-for="v in availableVibeChips"
                :key="v.tag"
                class="vibe-chip rt-spring"
                :class="{ active: isVibeActive(v.tag) }"
                hover-class="rt-press"
                @tap="toggleVibeChip(v)"
              >
                <text class="vc-text">{{ v.emoji }} {{ v.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- ── 区块 10: 空间叙事足迹 (Locations) ── -->
        <view class="section-card">
          <view class="section-action-header">
            <text class="sec-title">🗺️ 空间叙事足迹</text>
            <view class="btn-glass-chip rt-spring" hover-class="rt-press" @tap="showAddLocationModal = true">
              + 添加地标
            </view>
          </view>

          <view v-if="locations.length === 0" class="notes-empty">
            <text class="empty-hint">暂无空间地标，点击右上角记录与这部作品相关的地方。</text>
          </view>

          <view v-else class="locations-list">
            <view v-for="l in locations" :key="l.id" class="location-item">
              <view class="li-top">
                <text class="li-badge">{{ l.type }}</text>
                <text class="li-name">{{ l.name }}</text>
                <text class="li-del" @tap="deleteLocation(l.id)">✕</text>
              </view>
              <text class="li-desc">{{ l.desc }}</text>
              <text v-if="l.sig" class="li-sig">📍 叙事象征：{{ l.sig }}</text>
            </view>
          </view>
        </view>

        <!-- ── 区块 11: 灵犀共鸣 · 心智相似作品 (Similar) ── -->
        <view class="section-card">
          <text class="sec-title">🔗 灵犀共鸣 · 心智相似作品</text>
          <text class="similar-subtitle">基于六维认知雷达、媒介分类与作者文化源流智能匹配</text>

          <view class="similar-list">
            <view
              v-for="sim in similarWorks"
              :key="sim.id"
              class="similar-card rt-spring"
              hover-class="rt-press"
              @tap="openWork(sim.id)"
            >
              <image class="sim-cover" :src="sim.coverUrl" mode="aspectFill" />
              <view class="sim-info">
                <view class="sim-title-row">
                  <text class="sim-badge">{{ MEDIA_LABEL[sim.mediaType]?.emoji }}</text>
                  <text class="sim-title">{{ sim.title }}</text>
                </view>
                <text class="sim-author">{{ sim.author || '未知创作者' }}</text>
                <view class="sim-match-row">
                  <text class="sim-percent">{{ sim.similarityPercent }}% 灵犀契合</text>
                  <text class="sim-reason">✨ {{ sim.matchReason }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- ── 区块 12: 档案记录时间 (Timestamps) ── -->
        <view class="section-card">
          <text class="sec-title">档案记录时间</text>
          <view class="field-group">
            <text class="field-label">首次录入</text>
            <text class="field-value">{{ book.createdAt?.replace('T', ' ').slice(0, 16) || '2026-06-01 09:00' }}</text>
          </view>
          <view class="field-group">
            <text class="field-label">最近演进</text>
            <text class="field-value">{{ book.updatedAt?.replace('T', ' ').slice(0, 16) || '2026-09-12 18:20' }}</text>
          </view>
        </view>

        <!-- 底部留白 -->
        <view class="bottom-spacer"></view>
      </template>

      <!-- 缺失作品兜底面板 -->
      <view v-else class="missing-panel">
        <text class="missing-text">未找到这部藏品 · 请先在首页导入书单</text>
        <view class="btn-back-hub rt-spring" hover-class="rt-press" @tap="goBack">返回展馆</view>
      </view>
    </scroll-view>

    <!-- ══════════════════════════════════════════════════════════════════
         各种交互模态弹窗与 Bottom Sheet
    ══════════════════════════════════════════════════════════════════ -->

    <!-- ✏️ 编辑印记弹窗 -->
    <view class="modal-mask" v-if="showEditModal" @tap.self="showEditModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">✏️ 编辑印记档案</text>
          <view class="md-close" @tap="showEditModal = false">✕</view>
        </view>
        <view class="ed-field">
          <text class="ed-label">作品名</text>
          <input class="md-input" v-model="editForm.title" placeholder="作品名" />
        </view>
        <view class="ed-field">
          <text class="ed-label">创作者</text>
          <input class="md-input" v-model="editForm.author" placeholder="作者 / 导演 / 开发商" />
        </view>
        <view class="ed-field">
          <text class="ed-label">分类</text>
          <input class="md-input" v-model="editForm.category" placeholder="如：小说 / 科幻 / RPG" />
        </view>
        <view class="ed-field">
          <text class="ed-label">状态</text>
          <picker mode="selector" :range="editStatusOptions.map(o => o.label)" :value="editStatusIndex" @change="onEditStatusChange">
            <view class="ed-picker">{{ editStatusOptions[editStatusIndex]?.label || '选择状态' }} ▾</view>
          </picker>
        </view>
        <view class="ed-field">
          <text class="ed-label">评分 · {{ editForm.rating.toFixed(1) }}</text>
          <slider
            class="ed-slider"
            :min="1"
            :max="10"
            :step="0.5"
            :value="editForm.rating"
            activeColor="#3A6348"
            block-size="20"
            @change="(e: any) => (editForm.rating = Number(e.detail.value))"
          />
        </view>
        <view class="ed-field">
          <text class="ed-label">一句话寄语 / 金句</text>
          <input class="md-input" v-model="editForm.shortComment" placeholder="一句话印记（将同步展示在主位）" />
        </view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveEdit">保存印记</view>
      </view>
    </view>

    <!-- ✍️ 新增笔记弹窗 -->
    <view class="modal-mask" v-if="showAddNoteModal" @tap.self="showAddNoteModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">✍️ 记录高光战报与心得</text>
          <view class="md-close" @tap="showAddNoteModal = false">✕</view>
        </view>
        <textarea
          class="md-textarea"
          v-model="newNoteContent"
          placeholder="写下你在此刻的高光时刻、战报寄语或名台词…"
        ></textarea>
        <view class="md-inputs-row">
          <input class="md-input flex1" v-model="newNoteChapter" placeholder="章节 / 战局" />
          <input class="md-input flex1" v-model="newNotePage" placeholder="页码 / 时间点" />
        </view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveNewNote">秒存战报</view>
      </view>
    </view>

    <!-- 👥 添加角色弹窗 -->
    <view class="modal-mask" v-if="showAddCharModal" @tap.self="showAddCharModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">👥 添加人物角色与NPC</text>
          <view class="md-close" @tap="showAddCharModal = false">✕</view>
        </view>
        <view class="ed-field">
          <text class="ed-label">角色姓名</text>
          <input class="md-input" v-model="newCharName" placeholder="如：比利·布里杰" />
        </view>
        <view class="ed-field">
          <text class="ed-label">身份 / 头衔</text>
          <input class="md-input" v-model="newCharRole" placeholder="如：英国特种空勤团爆破手" />
        </view>
        <view class="ed-field">
          <text class="ed-label">角色头像 Emoji</text>
          <input class="md-input" v-model="newCharEmoji" placeholder="如：👤 / ⚔️ / 🪖" />
        </view>
        <view class="ed-field">
          <text class="ed-label">生平描述</text>
          <textarea class="md-textarea-small" v-model="newCharDesc" placeholder="经历与性格简述…" />
        </view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveNewCharacter">保存角色</view>
      </view>
    </view>

    <!-- 🗺️ 添加章节大纲弹窗 -->
    <view class="modal-mask" v-if="showAddOutlineModal" @tap.self="showAddOutlineModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">🗺️ 添加章节大纲与脑图</text>
          <view class="md-close" @tap="showAddOutlineModal = false">✕</view>
        </view>
        <view class="ed-field">
          <text class="ed-label">章节序号</text>
          <input class="md-input" type="number" v-model="newOutlineOrder" placeholder="如：1" />
        </view>
        <view class="ed-field">
          <text class="ed-label">章节名称</text>
          <input class="md-input" v-model="newOutlineTitle" placeholder="如：欧陆和平的终焉" />
        </view>
        <view class="ed-field">
          <text class="ed-label">大纲概要</text>
          <textarea class="md-textarea-small" v-model="newOutlineSummary" placeholder="这一阶段发生了什么…" />
        </view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveNewOutline">保存大纲</view>
      </view>
    </view>

    <!-- 🕸️ 调整六维心智评分弹窗 -->
    <view class="modal-mask" v-if="showEditMindprintModal" @tap.self="showEditMindprintModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">🕸️ 调整六维心智评分</text>
          <view class="md-close" @tap="showEditMindprintModal = false">✕</view>
        </view>
        <scroll-view scroll-y class="mp-sliders-scroll">
          <view v-for="dim in mindprintSliders" :key="dim.key" class="mp-slider-row">
            <view class="mps-head">
              <text class="mps-label">{{ dim.label }}</text>
              <text class="mps-val">{{ dim.val.toFixed(1) }}</text>
            </view>
            <slider
              class="ed-slider"
              :min="1"
              :max="10"
              :step="0.1"
              :value="dim.val"
              activeColor="#3A6348"
              block-size="18"
              @change="(e: any) => onSliderChange(dim.key, Number(e.detail.value))"
            />
          </view>
        </scroll-view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveMindprintScores">保存评分</view>
      </view>
    </view>

    <!-- 🔍 对比作品心智雷达弹窗 -->
    <view class="modal-mask" v-if="showCompareModal" @tap.self="showCompareModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">🔍 选择对比作品</text>
          <view class="md-close" @tap="showCompareModal = false">✕</view>
        </view>
        <scroll-view scroll-y class="compare-books-list">
          <view
            v-for="b in compareCandidateBooks"
            :key="b.id"
            class="compare-book-item rt-spring"
            hover-class="rt-press"
            @tap="selectCompareBook(b)"
          >
            <text class="cbi-title">《{{ b.title }}》</text>
            <text class="cbi-author">{{ b.author || '未知' }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 📍 添加空间地标弹窗 -->
    <view class="modal-mask" v-if="showAddLocationModal" @tap.self="showAddLocationModal = false">
      <view class="modal-dialog">
        <view class="md-head">
          <text class="md-title">🗺️ 添加空间叙事地标</text>
          <view class="md-close" @tap="showAddLocationModal = false">✕</view>
        </view>
        <view class="ed-field">
          <text class="ed-label">地标名称</text>
          <input class="md-input" v-model="newLocName" placeholder="如：鹿特丹废墟 / 撒哈拉腹地" />
        </view>
        <view class="ed-field">
          <text class="ed-label">空间类型</text>
          <input class="md-input" v-model="newLocType" placeholder="如：战场遗迹 / 现实都市" />
        </view>
        <view class="ed-field">
          <text class="ed-label">环境风貌简述</text>
          <textarea class="md-textarea-small" v-model="newLocDesc" placeholder="这里的氛围与景致…" />
        </view>
        <view class="btn-save-confirm rt-spring" hover-class="rt-press" @tap="saveNewLocation">保存地标</view>
      </view>
    </view>

    <!-- ═══ ✨ P25 文心雕龙：AI 读后感润色 Bottom Sheet ═══ -->
    <view v-if="showPolishModal" class="polish-modal-mask" @tap.self="closePolishSheet">
      <view class="polish-sheet">
        <view class="ps-header">
          <view class="ps-title-wrap">
            <text class="ps-title">✨ 文心雕龙 · AI 润色工坊</text>
            <text class="ps-sub">《{{ book?.title }}》· 深度重塑与灵魂金句提炼</text>
          </view>
          <view class="ps-close" @tap="closePolishSheet">✕</view>
        </view>

        <scroll-view scroll-y class="ps-body">
          <view class="ps-sec-title">🎭 选择文学流派与修辞语态</view>
          <scroll-view scroll-x class="style-scroller" :show-scrollbar="false">
            <view class="style-list">
              <view
                v-for="s in POLISH_STYLES"
                :key="s.id"
                class="style-chip rt-spring"
                :class="{ active: selectedStyle === s.id }"
                @tap="selectedStyle = s.id"
              >
                <text class="sc-emoji">{{ s.emoji }}</text>
                <text class="sc-name">{{ s.name }}</text>
                <text class="sc-tag">{{ s.tagline }}</text>
              </view>
            </view>
          </scroll-view>

          <view class="ps-sec-title">📝 原始感悟大白话（可自由输入或修改）</view>
          <view class="ps-input-wrap">
            <textarea
              class="ps-draft-input"
              v-model="userDraft"
              placeholder="写下你最真实朴素的观后感与心流碎片…"
              :maxlength="300"
            />
            <text class="ps-char-count">{{ userDraft.length }}/300</text>
          </view>

          <view class="btn-ps-generate rt-spring" :class="{ loading: isPolishing }" @tap="startPolish">
            <text v-if="isPolishing">⚡ 文心雕龙正在字字推敲...</text>
            <text v-else>✨ 唤醒文心雕龙 · 升华润色</text>
          </view>

          <view v-if="displayPolishedText || isPolishing" class="result-card">
            <view class="res-head">
              <text class="res-badge">📜 升华后的深度读后感</text>
              <text class="res-source" v-if="polishSource">
                {{ polishSource === 'remote_api' ? '⚡ DeepSeek AI 驱动' : '🏛️ 离线经典母题推导' }}
              </text>
            </view>
            <view class="res-text-box">
              <text class="res-text">{{ displayPolishedText }}</text>
              <text v-if="isPolishing" class="typewriter-cursor">|</text>
            </view>

            <view v-if="extractedGoldenQuote" class="golden-quote-card">
              <view class="gq-top">
                <text class="gq-label">✨ 灵魂高光金句 (≤15字)</text>
                <text class="gq-len">{{ extractedGoldenQuote.length }} 字 · 适宜刻印藏书票与票根</text>
              </view>
              <text class="gq-quote">“{{ extractedGoldenQuote }}”</text>
              <view class="gq-copy-btn rt-spring" @tap="copyQuote(extractedGoldenQuote)">📋 复制金句</view>
            </view>
          </view>

          <view v-if="displayPolishedText && !isPolishing" class="ps-actions-panel">
            <button class="btn-ps-adopt rt-spring" hover-class="rt-press" @tap="adoptAndSave">
              ✓ 采纳并一键保存入库
            </button>
            <view class="ps-sub-actions">
              <view class="ps-sub-btn rt-spring" @tap="goToExLibrisWithQuote">📜 刻印专属藏书票</view>
              <view class="ps-sub-btn rt-spring" @tap="goToPosterWithQuote">🎨 生成金句海报</view>
            </view>
          </view>

          <view class="api-key-config-row">
            <text class="ak-hint">当前模式：{{ hasCustomKey ? '自配 DeepSeek API' : '内置离线文学母题 (毫秒级防卡顿)' }}</text>
            <text class="ak-btn" @tap="promptApiKeyConfig">⚙️ {{ hasCustomKey ? '修改 Key' : '配置 Key' }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref, reactive } from 'vue';
import type { Book, Note, Mindprint, BookStatus } from '../../utils/models';
import { MEDIA_LABEL, MEDIA_STATUS, deriveMindprint } from '../../utils/models';
import { loadLocalWorks, saveLocalWorks, loadLocalNotes, loadLocalMindprints } from '../../utils/sync';
import { toggleFavorite, softDeleteWork } from '../../utils/backup';
import { audioEngine, SOUND_TRACKS } from '../../utils/audio-engine';
import {
  PRESET_CHARACTERS,
  PRESET_OUTLINES,
  PRESET_TRACKS,
  type CharacterItem,
  type OutlineItem,
  type AudioTrackItem,
} from '../../utils/preset-data';
import MindprintRadar from '../../components/MindprintRadar.vue';
import AuroraBackground from '../../components/AuroraBackground.vue';
import ScrambleText from '../../components/ScrambleText.vue';
import DropCapText from '../../components/DropCapText.vue';
import {
  getVibeChips,
  applyChipStep,
  normalizeTag,
  type VibeChip,
} from '../../utils/vibe-chips';
import {
  POLISH_STYLES,
  polishThought,
  getAiApiKey,
  setAiApiKey,
  type PolishStyle,
} from '../../utils/ai-polish-engine';

const book = ref<Book | null>(null);
const displayBookTitle = computed(() => (book.value?.title || '').replace(/^《|》$/g, ''));
const isFav = ref(false);
const scrollIntoViewId = ref('');
const currentAnchor = ref('overview');
const isDescExpanded = ref(false);

const notes = ref<Note[]>([]);
const characters = ref<CharacterItem[]>([]);
const outlines = ref<OutlineItem[]>([]);
const tracks = ref<AudioTrackItem[]>([]);
const mindprint = ref<Mindprint>({
  bookId: 0,
  depthScore: 8.5,
  artistryScore: 8.8,
  emotionScore: 8.2,
  logicScore: 9.0,
  difficultyScore: 6.5,
  healingScore: 8.6,
  updatedAt: '',
});

// 空间地标数据
interface LocationItem {
  id: number;
  name: string;
  type: string;
  desc: string;
  sig?: string;
}
const locations = ref<LocationItem[]>([
  {
    id: 1,
    name: '鹿特丹废墟 / 战地前线',
    type: '战场遗迹',
    desc: '残垣断壁与漫天火光，二战欧洲西线交锋的标志性阵地。',
    sig: '铁与火的残酷淬炼',
  },
]);

// 顶部页眉文案配置 (对齐 App BookDetailActivity.renderBook)
const headerConfig = computed(() => {
  const m = book.value?.mediaType;
  switch (m) {
    case 'anime':
      return { title: '番剧详情', subtitle: '重温这部番剧带来的感动与热血。' };
    case 'movie':
      return { title: '影视详情', subtitle: '回味这部光影作品留下的回响。' };
    case 'game':
      return { title: '游戏详情', subtitle: '重温这段通关冒险与高光时刻。' };
    case 'music':
      return { title: '音乐与唱片详情', subtitle: '倾听旋律心跳、声音印记与黑胶律动。' };
    default:
      return { title: '书籍详情', subtitle: '慢慢回看这本书留下的痕迹。' };
  }
});

// 媒介定制主按钮文案
const primaryActionLabel = computed(() => {
  const m = book.value?.mediaType;
  switch (m) {
    case 'game':
      return '🕹️ 白金全息实体卡带';
    case 'anime':
      return '🌸 追番编年画卷';
    case 'movie':
      return '🎟️ 复古透光电影票根';
    case 'music':
      return '💽 3D 拟真黑胶唱机';
    default:
      return '📖 3D 沉浸翻阅';
  }
});

// 媒介定制三级按钮文案
const tertiaryActionLabel = computed(() => {
  const m = book.value?.mediaType;
  switch (m) {
    case 'game':
      return '🛂 游戏白金通关签证';
    case 'anime':
      return '🛂 追番入境签证';
    case 'movie':
      return '🎨 生成光影名台词海报';
    case 'music':
      return '🎴 跨媒介双生微卡';
    default:
      return '🎨 生成金句印记海报';
  }
});

// 快捷导航第四个标签名称
const notesTabLabel = computed(() => {
  const m = book.value?.mediaType;
  switch (m) {
    case 'game':
      return '💬 战报心得';
    case 'movie':
      return '💬 光影名句';
    case 'anime':
      return '💬 经典台词';
    case 'music':
      return '💬 灵感速记';
    default:
      return '💬 痕迹与摘录';
  }
});

// 各板块标题媒介自适应
const sectionTitles = computed(() => {
  const m = book.value?.mediaType;
  switch (m) {
    case 'game':
      return {
        identity: '关于这款游戏',
        categoryLabel: '游戏类型',
        reading: '游玩印记',
        thoughts: '通关心得',
        shortCommentLabel: '通关寄语 / 金句',
        reviewLabel: '深度评测',
        notes: '高光战报与心得',
        collection: '💰 实体卡带与典藏周边',
        characters: '🎮 主要角色与NPC谱',
      };
    case 'anime':
      return {
        identity: '关于这部番剧',
        categoryLabel: '番剧题材',
        reading: '追番印记',
        thoughts: '追番心境',
        shortCommentLabel: '经典台词 / 金句',
        reviewLabel: '完结长评',
        notes: '高光台词与名场面',
        collection: '💰 周边特典与实体盘片',
        characters: '🌸 登场角色与声优谱',
      };
    case 'movie':
      return {
        identity: '关于这部影视',
        categoryLabel: '影视类型',
        reading: '观影印记',
        thoughts: '观影心境',
        shortCommentLabel: '经典名台词',
        reviewLabel: '深度影评',
        notes: '光影名句与长评',
        collection: '💰 实体票根与蓝光收藏',
        characters: '🎬 演职人员与角色谱',
      };
    case 'music':
      return {
        identity: '关于这张作品',
        categoryLabel: '曲目 / 类别',
        reading: '收听印记',
        thoughts: '听后感悟',
        shortCommentLabel: '灵感歌词 / 金句',
        reviewLabel: '深度听感',
        notes: '灵感火花与速记',
        collection: '💰 实体唱片与录音带',
        characters: '💿 创作者与声乐谱',
      };
    default:
      return {
        identity: '关于这本书',
        categoryLabel: '书籍分类',
        reading: '阅读印记',
        thoughts: '留下的感受',
        shortCommentLabel: '一句话感悟',
        reviewLabel: '长篇书评',
        notes: '摘录与随想',
        collection: '💰 实体馆藏与藏书印记',
        characters: '👥 主要角色谱系',
      };
  }
});

const hasCollectionData = computed(() => {
  if (!book.value) return false;
  return !!(book.value.buyChannel || book.value.shelfLocation || book.value.bindingType || book.value.buyPrice);
});

// 六维心智雷达综合均分与评级
const mindprintAverageScore = computed(() => {
  const mp = mindprint.value;
  const avg = (mp.depthScore + mp.artistryScore + mp.emotionScore + mp.logicScore + mp.difficultyScore + mp.healingScore) / 6;
  return avg.toFixed(1);
});

const mindprintStageTag = computed(() => {
  const avg = Number(mindprintAverageScore.value);
  if (avg >= 9.0) return '殿堂神作 · 精神灯塔';
  if (avg >= 8.0) return '深刻思辨 · 高度共鸣';
  if (avg >= 7.0) return '优秀佳作 · 值得品读';
  return '个性小众 · 独特印记';
});

// 美学情绪胶囊
const availableVibeChips = computed(() => {
  return getVibeChips(book.value?.mediaType || 'book');
});

function isVibeActive(tag: string): boolean {
  if (!book.value?.tags) return false;
  const norm = normalizeTag(tag);
  return book.value.tags.some((t) => normalizeTag(t) === norm);
}

function toggleVibeChip(vibe: VibeChip) {
  if (!book.value) return;
  const isCurrentlyActive = isVibeActive(vibe.tag);
  const updatedTags = [...(book.value.tags || [])];
  const norm = normalizeTag(vibe.tag);

  if (isCurrentlyActive) {
    const idx = updatedTags.findIndex((t) => normalizeTag(t) === norm);
    if (idx !== -1) updatedTags.splice(idx, 1);
  } else {
    updatedTags.push(vibe.tag);
  }

  // 计算并注入雷达
  const updatedMp = applyChipStep(mindprint.value, vibe.tag, !isCurrentlyActive, book.value.mediaType);
  mindprint.value = updatedMp;

  // 更新作品 tags
  book.value.tags = updatedTags;
  book.value.updatedAt = new Date().toISOString();

  // 本地持久化
  const allWorks = loadLocalWorks();
  const wIdx = allWorks.findIndex((b) => b.id === book.value?.id);
  if (wIdx !== -1) {
    allWorks[wIdx].tags = updatedTags;
    allWorks[wIdx].updatedAt = book.value.updatedAt;
    saveLocalWorks(allWorks);
  }

  const allMp = loadLocalMindprints();
  const mpIdx = allMp.findIndex((m) => m.bookId === book.value?.id);
  if (mpIdx !== -1) {
    allMp[mpIdx] = updatedMp;
  } else {
    allMp.push(updatedMp);
  }
  uni.setStorageSync('rt_local_mindprints', allMp);

  uni.showToast({
    title: !isCurrentlyActive ? `✨ 已注入「${vibe.label}」权重` : `已卸载「${vibe.label}」权重`,
    icon: 'none',
  });
}

// 灵犀共鸣推荐作品
const similarWorks = computed(() => {
  if (!book.value) return [];
  const all = loadLocalWorks().filter((b) => b.id !== book.value?.id && !b.isDeleted);
  return all.slice(0, 2).map((item, idx) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    coverUrl: item.coverUrl,
    mediaType: item.mediaType,
    similarityPercent: 92 - idx * 6,
    matchReason: idx === 0 ? '六维认知雷达高度同频，艺术美学与叙事深度契合' : '同属深度母题，哲学思辨与心流轨迹共鸣',
  }));
});

// 时间轴事件流
const timelineFilter = ref<'all' | 'sessions' | 'notes'>('all');

const timelineEvents = computed(() => {
  if (!book.value) return [];
  const b = book.value;
  const list: any[] = [];

  // 1. 启程
  if (b.startDate) {
    list.push({
      type: 'start',
      icon: '🏁',
      title: b.mediaType === 'game' ? '🏁 启程 · 开机启程' : '🏁 启程 · 翻开扉页',
      time: b.startDate,
      subtitle: `当前状态：${MEDIA_STATUS[b.mediaType]?.[b.status]} · 载体：${MEDIA_LABEL[b.mediaType]?.name}`,
      content: b.category ? `分类：${b.category}` : '初次相遇',
    });
  }

  // 2. 专注阅读/游玩打卡
  list.push({
    type: 'session',
    icon: '⏱️',
    title: b.mediaType === 'game' ? '⏱️ 专注通关 45 分钟' : '⏱️ 专注阅读 45 分钟',
    time: b.startDate || '2026-06-02 14:30',
    subtitle: '打卡印记 · 心流沉浸',
    content: '渐入佳境，触及核心高光情节。',
  });

  // 3. 笔记摘录
  notes.value.forEach((n) => {
    list.push({
      type: 'note',
      icon: '💬',
      title: '💬 高光时刻与摘录',
      time: n.createdAt,
      subtitle: (n.chapter ? n.chapter : '') + (n.page ? ' · ' + n.page : ''),
      content: n.content,
    });
  });

  // 4. 终章
  if (b.finishDate || b.status === 'finished') {
    list.push({
      type: 'finish',
      icon: '🌟',
      title: b.mediaType === 'game' ? '🌟 终章 · 全作通关复盘' : '🌟 终章 · 全书完读复盘',
      time: b.finishDate || '2026-06-07 22:00',
      subtitle: `个人评分：★ ${(b.rating || 8.0).toFixed(1)} / 10.0`,
      content: b.shortComment || b.review || '精神沉淀与思想烙印已永久封存。',
    });
  }

  return list;
});

const filteredTimelineEvents = computed(() => {
  if (timelineFilter.value === 'sessions') {
    return timelineEvents.value.filter((e) => e.type === 'session');
  }
  if (timelineFilter.value === 'notes') {
    return timelineEvents.value.filter((e) => e.type === 'note');
  }
  return timelineEvents.value;
});

function jumpAnchor(id: string, anchor: string) {
  currentAnchor.value = anchor;
  scrollIntoViewId.value = id;
}

// ── ✏️ 编辑印记 ──
const showEditModal = ref(false);
const editForm = reactive({
  title: '',
  author: '',
  category: '',
  status: 'reading' as BookStatus,
  rating: 8,
  shortComment: '',
});
const STATUS_KEYS: BookStatus[] = ['wishlist', 'reading', 'finished', 'paused', 'abandoned'];

const editStatusOptions = computed(() => {
  const map = book.value ? MEDIA_STATUS[book.value.mediaType] : null;
  return STATUS_KEYS.map((k) => ({ key: k, label: map?.[k] || k }));
});

const editStatusIndex = computed(() =>
  Math.max(0, STATUS_KEYS.indexOf(editForm.status))
);

function openEditModal() {
  if (!book.value) return;
  editForm.title = book.value.title || '';
  editForm.author = book.value.author || '';
  editForm.category = book.value.category || '';
  editForm.status = (book.value.status || 'reading') as BookStatus;
  editForm.rating = book.value.rating ?? 8;
  editForm.shortComment = book.value.shortComment || '';
  showEditModal.value = true;
}

function onEditStatusChange(e: any) {
  const idx = Number(e?.detail?.value ?? 0);
  editForm.status = STATUS_KEYS[idx] || 'reading';
}

function saveEdit() {
  if (!book.value) return;
  if (!editForm.title.trim()) {
    uni.showToast({ title: '作品名不能为空', icon: 'none' });
    return;
  }
  const all = loadLocalWorks();
  const idx = all.findIndex((b) => b.id === book.value!.id);
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      title: editForm.title.trim(),
      author: editForm.author.trim() || null,
      category: editForm.category.trim() || null,
      status: editForm.status,
      rating: editForm.rating,
      shortComment: editForm.shortComment.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    saveLocalWorks(all);
    book.value = all[idx];
    showEditModal.value = false;
    uni.showToast({ title: '印记已更新', icon: 'none' });
  }
}

// ── ✍️ 笔记管理 ──
const showAddNoteModal = ref(false);
const newNoteContent = ref('');
const newNoteChapter = ref('');
const newNotePage = ref('');

function saveNewNote() {
  if (!newNoteContent.value.trim()) {
    uni.showToast({ title: '请输入战报心得内容', icon: 'none' });
    return;
  }
  const allNotes = loadLocalNotes();
  const newNote: Note = {
    id: Date.now(),
    bookId: book.value?.id || 0,
    content: newNoteContent.value.trim(),
    noteType: 'note',
    chapter: newNoteChapter.value.trim() || null,
    page: newNotePage.value.trim() || null,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    updatedAt: new Date().toISOString(),
  };
  allNotes.unshift(newNote);
  uni.setStorageSync('rt_local_notes', allNotes);
  notes.value.unshift(newNote);

  newNoteContent.value = '';
  newNoteChapter.value = '';
  newNotePage.value = '';
  showAddNoteModal.value = false;
  uni.showToast({ title: '心流战报已秒存', icon: 'none' });
}

function openFlipNotes() {
  if (!notes.value.length) {
    uni.showToast({ title: '暂无笔记可翻阅', icon: 'none' });
    return;
  }
  uni.showModal({
    title: '📖 翻阅高光笔记',
    content: `第 1 条笔记：\n“${notes.value[0].content}”\n\n共 ${notes.value.length} 条心流印记。`,
    showCancel: false,
    confirmText: '知晓',
  });
}

function makePosterFromNote(n: Note) {
  uni.navigateTo({
    url: `/pages/memoir/index?workshop=quote&bookId=${book.value?.id}`,
  });
}

// ── 👥 人物角色管理 ──
const showAddCharModal = ref(false);
const newCharName = ref('');
const newCharRole = ref('');
const newCharEmoji = ref('👤');
const newCharDesc = ref('');

function saveNewCharacter() {
  if (!newCharName.value.trim()) {
    uni.showToast({ title: '请输入角色姓名', icon: 'none' });
    return;
  }
  const item: CharacterItem = {
    id: Date.now(),
    name: newCharName.value.trim(),
    role: newCharRole.value.trim() || '主要角色',
    avatarEmoji: newCharEmoji.value.trim() || '👤',
    description: newCharDesc.value.trim() || '剧中核心人物',
  };
  characters.value.push(item);
  newCharName.value = '';
  newCharRole.value = '';
  newCharEmoji.value = '👤';
  newCharDesc.value = '';
  showAddCharModal.value = false;
  uni.showToast({ title: '角色已加入谱系', icon: 'none' });
}

function deleteCharacter(id: number) {
  uni.showModal({
    title: '删除角色',
    content: '确定要从角色谱中移除这位角色吗？',
    success: (res) => {
      if (res.confirm) {
        characters.value = characters.value.filter((c) => c.id !== id);
        uni.showToast({ title: '已移除', icon: 'none' });
      }
    },
  });
}

// ── 🗺️ 章节大纲管理 ──
const showAddOutlineModal = ref(false);
const newOutlineOrder = ref(1);
const newOutlineTitle = ref('');
const newOutlineSummary = ref('');

function saveNewOutline() {
  if (!newOutlineTitle.value.trim()) {
    uni.showToast({ title: '请输入章节大纲标题', icon: 'none' });
    return;
  }
  const item: OutlineItem = {
    id: Date.now(),
    orderIndex: Number(newOutlineOrder.value) || outlines.value.length + 1,
    title: newOutlineTitle.value.trim(),
    summary: newOutlineSummary.value.trim() || '章节核心发展脉络',
  };
  outlines.value.push(item);
  newOutlineTitle.value = '';
  newOutlineSummary.value = '';
  showAddOutlineModal.value = false;
  uni.showToast({ title: '大纲已加入脉络', icon: 'none' });
}

function deleteOutline(id: number) {
  uni.showModal({
    title: '删除大纲',
    content: '确定要删除这段章节大纲吗？',
    success: (res) => {
      if (res.confirm) {
        outlines.value = outlines.value.filter((o) => o.id !== id);
        uni.showToast({ title: '已删除', icon: 'none' });
      }
    },
  });
}

// ── 🕸️ 六维评分调整 ──
const showEditMindprintModal = ref(false);
const mindprintSliders = ref([
  { key: 'depthScore', label: '🧠 思想深度', val: 8.5 },
  { key: 'artistryScore', label: '🖋️ 文笔意境', val: 8.8 },
  { key: 'emotionScore', label: '❤️ 情感共鸣', val: 8.2 },
  { key: 'logicScore', label: '📐 逻辑构架', val: 9.0 },
  { key: 'difficultyScore', label: '⛰️ 阅读门槛', val: 6.5 },
  { key: 'healingScore', label: '🌿 心灵治愈', val: 8.6 },
]);

function openEditMindprint() {
  mindprintSliders.value = [
    { key: 'depthScore', label: '🧠 思想深度', val: mindprint.value.depthScore },
    { key: 'artistryScore', label: '🖋️ 文笔意境', val: mindprint.value.artistryScore },
    { key: 'emotionScore', label: '❤️ 情感共鸣', val: mindprint.value.emotionScore },
    { key: 'logicScore', label: '📐 逻辑构架', val: mindprint.value.logicScore },
    { key: 'difficultyScore', label: '⛰️ 阅读门槛', val: mindprint.value.difficultyScore },
    { key: 'healingScore', label: '🌿 心灵治愈', val: mindprint.value.healingScore },
  ];
  showEditMindprintModal.value = true;
}

function onSliderChange(key: string, val: number) {
  const row = mindprintSliders.value.find((r) => r.key === key);
  if (row) row.val = val;
}

function saveMindprintScores() {
  const mp = { ...mindprint.value };
  mindprintSliders.value.forEach((r) => {
    (mp as any)[r.key] = Math.round(r.val * 10) / 10;
  });
  mp.updatedAt = new Date().toISOString();
  mindprint.value = mp;

  // 本地保存
  const all = loadLocalMindprints();
  const idx = all.findIndex((m) => m.bookId === book.value?.id);
  if (idx !== -1) {
    all[idx] = mp;
  } else {
    all.push(mp);
  }
  uni.setStorageSync('rt_local_mindprints', all);

  showEditMindprintModal.value = false;
  uni.showToast({ title: '六维评分已更新', icon: 'none' });
}

// ── 🔍 对比心智雷达 ──
const showCompareModal = ref(false);
const compareCandidateBooks = computed(() => {
  if (!book.value) return [];
  return loadLocalWorks().filter((b) => b.id !== book.value?.id && !b.isDeleted);
});

function selectCompareBook(target: Book) {
  showCompareModal.value = false;
  uni.showModal({
    title: '双作品心智雷达对照',
    content: `已开启《${book.value?.title}》与《${target.title}》的心智对照模型（可在星系拓扑查看三维引力对撞）。`,
    confirmText: '前往星系',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: `/pages/constellation/index?bookId=${book.value?.id}` });
      }
    },
  });
}

// ── 📍 空间地标 ──
const showAddLocationModal = ref(false);
const newLocName = ref('');
const newLocType = ref('');
const newLocDesc = ref('');

function saveNewLocation() {
  if (!newLocName.value.trim()) {
    uni.showToast({ title: '请输入地标名称', icon: 'none' });
    return;
  }
  locations.value.push({
    id: Date.now(),
    name: newLocName.value.trim(),
    type: newLocType.value.trim() || '叙事地标',
    desc: newLocDesc.value.trim() || '记录空间坐标',
  });
  newLocName.value = '';
  newLocType.value = '';
  newLocDesc.value = '';
  showAddLocationModal.value = false;
  uni.showToast({ title: '地标已记录', icon: 'none' });
}

function deleteLocation(id: number) {
  locations.value = locations.value.filter((l) => l.id !== id);
}

// ── 交互导航跳转 ──
function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/hub/index' });
    },
  });
}

function toggleFav() {
  if (!book.value) return;
  isFav.value = !isFav.value;
  toggleFavorite(book.value.id, isFav.value);
  uni.showToast({
    title: isFav.value ? '已加入心选展厅' : '已移出心选展厅',
    icon: 'none',
  });
}

function onCoverTap() {
  uni.showToast({ title: '正在校准官方高清海报', icon: 'none' });
}

function triggerAiStory() {
  uni.showToast({ title: '正在以当前作品梳理核心大纲与角色谱', icon: 'none' });
}

function adoptRemoteRating() {
  if (!book.value || !book.value.remoteRating) return;
  book.value.rating = book.value.remoteRating;
  const all = loadLocalWorks();
  const idx = all.findIndex((b) => b.id === book.value?.id);
  if (idx !== -1) {
    all[idx].rating = book.value.remoteRating;
    saveLocalWorks(all);
  }
  uni.showToast({ title: `已采用评分 ★ ${book.value.remoteRating}`, icon: 'none' });
}

function exportTimelinePoster() {
  uni.navigateTo({
    url: `/pages/memoir/index?workshop=timeline&bookId=${book.value?.id}`,
  });
}

function goConstellation() {
  uni.navigateTo({ url: `/pages/constellation/index?bookId=${book.value?.id}` });
}

function goResonanceMicroCard() {
  uni.navigateTo({ url: `/pages/memoir/index?workshop=resonance&bookId=${book.value?.id}` });
}

function openWork(id: number) {
  uni.redirectTo({ url: `/pages/book-detail/index?id=${id}` });
}

function onAction(action: string) {
  if (!book.value) return;
  const id = book.value.id;
  const m = book.value.mediaType;

  switch (action) {
    case 'primary':
      if (m === 'game') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=cartridge&bookId=${id}` });
      } else if (m === 'music') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=vinyl&bookId=${id}` });
      } else if (m === 'anime') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=timeline&media=anime` });
      } else if (m === 'movie') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=ticket&bookId=${id}` });
      } else {
        uni.showToast({ title: '3D 翻阅需 GPU 加速，建议在 App 端沉浸体验', icon: 'none' });
      }
      break;
    case 'archive':
      uni.showModal({
        title: '归档确认',
        content: `确定将《${book.value.title}》移入回收站吗？`,
        confirmColor: '#8A3D3D',
        success: (res) => {
          if (res.confirm) {
            softDeleteWork(book.value!.id);
            uni.showToast({ title: '已归档至回收站', icon: 'none' });
            setTimeout(() => goBack(), 600);
          }
        },
      });
      break;
    case 'tertiary':
      if (m === 'game' || m === 'anime') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=passport&media=${m}` });
      } else if (m === 'music') {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=resonance` });
      } else {
        uni.navigateTo({ url: `/pages/memoir/index?workshop=quote&bookId=${id}` });
      }
      break;
    case 'exlibris':
      uni.navigateTo({ url: `/pages/memoir/index?workshop=exlibris&bookId=${id}` });
      break;
  }
}

// ── ✨ 文心雕龙 AI 润色工坊状态 ──
const showPolishModal = ref(false);
const selectedStyle = ref<PolishStyle>('classical');
const userDraft = ref('');
const displayPolishedText = ref('');
const extractedGoldenQuote = ref('');
const polishSource = ref<'remote_api' | 'offline_motif' | null>(null);
const isPolishing = ref(false);
const hasCustomKey = computed(() => !!getAiApiKey());

function openPolishSheet() {
  if (!book.value) return;
  userDraft.value = book.value.review || book.value.shortComment || '';
  displayPolishedText.value = book.value.review || '';
  extractedGoldenQuote.value = book.value.shortComment || '';
  showPolishModal.value = true;
}

function closePolishSheet() {
  showPolishModal.value = false;
  isPolishing.value = false;
}

async function startPolish() {
  if (isPolishing.value || !book.value) return;
  isPolishing.value = true;
  displayPolishedText.value = '';
  extractedGoldenQuote.value = '';

  try {
    const res = await polishThought({
      bookTitle: book.value.title,
      author: book.value.author || '',
      mediaType: book.value.mediaType,
      draft: userDraft.value,
      style: selectedStyle.value,
      onStream: (chunk) => {
        displayPolishedText.value = chunk;
      },
    });
    displayPolishedText.value = res.polishedText;
    extractedGoldenQuote.value = res.goldenQuote;
    polishSource.value = res.source;
  } catch (err: any) {
    uni.showToast({ title: '润色异常，已保留草稿', icon: 'none' });
  } finally {
    isPolishing.value = false;
  }
}

function adoptAndSave() {
  if (!book.value) return;
  book.value.review = displayPolishedText.value;
  book.value.shortComment = extractedGoldenQuote.value;
  book.value.updatedAt = new Date().toISOString();

  const all = loadLocalWorks();
  const idx = all.findIndex((b) => b.id === book.value?.id);
  if (idx !== -1) {
    all[idx].review = book.value.review;
    all[idx].shortComment = book.value.shortComment;
    all[idx].updatedAt = book.value.updatedAt;
    saveLocalWorks(all);
  }

  uni.showToast({ title: '✓ 读后感与高光金句已保存入库', icon: 'success' });
  closePolishSheet();
}

function copyQuote(text: string) {
  if (!text) return;
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制金句', icon: 'none' });
    },
  });
}

function promptApiKeyConfig() {
  const currentKey = getAiApiKey();
  uni.showModal({
    title: '配置 DeepSeek API Key',
    content: currentKey ? `当前已配置: ${currentKey.slice(0, 4)}...${currentKey.slice(-4)}\n是否修改或重设？` : '留空将使用内置离线文学母题推导引擎（零延迟防卡顿）',
    editable: true,
    placeholderText: '请输入 sk-xxxxxxxx',
    success: (res) => {
      if (res.confirm) {
        setAiApiKey(res.content?.trim() || '');
        uni.showToast({
          title: res.content?.trim() ? '已更新 API Key' : '已切换为离线母题推导',
          icon: 'none',
        });
      }
    },
  });
}

function goToExLibrisWithQuote() {
  adoptAndSave();
  uni.navigateTo({ url: `/pages/memoir/index?workshop=exlibris&bookId=${book.value?.id}` });
}

function goToPosterWithQuote() {
  adoptAndSave();
  uni.navigateTo({ url: `/pages/memoir/index?workshop=quote&bookId=${book.value?.id}` });
}

onLoad((options: any) => {
  let id = Number(options?.id);
  const works = loadLocalWorks();
  let found = works.find((b) => b.id === id);
  if (!found && works.length > 0) {
    found = works.find((b) => b.id === 151) || works[0];
    id = found.id;
  }
  if (found) {
    book.value = found;
    notes.value = loadLocalNotes().filter((n) => n.bookId === id);

    const mp = loadLocalMindprints().find((m) => m.bookId === id);
    if (mp) {
      mindprint.value = mp;
    } else {
      mindprint.value = deriveMindprint(found.rating || 8.0, id);
    }

    characters.value = PRESET_CHARACTERS[id] ? [...PRESET_CHARACTERS[id]] : [];
    outlines.value = PRESET_OUTLINES[id] ? [...PRESET_OUTLINES[id]] : [];
    tracks.value = PRESET_TRACKS[id] || [];
    isFav.value = !!found.isFavorite;
  }
});
</script>

<style>
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--rt-bg);
}

/* 📱 悬浮返回光球 (对齐 App FloatingBack) */
.floating-back {
  position: fixed;
  left: 28rpx;
  top: 60rpx;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(30, 35, 30, 0.82);
  backdrop-filter: blur(12px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.18);
  border: 1.5rpx solid rgba(255, 255, 255, 0.15);
}

.fb-icon {
  font-size: 38rpx;
  line-height: 1;
  font-weight: bold;
}

.scroll-body {
  width: 100%;
  height: 100%;
  padding: 30rpx 28rpx 140rpx;
  box-sizing: border-box;
}

/* 顶部导航标题行 (给左侧返回球留出 96rpx) */
.detail-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 96rpx;
  padding-top: 36rpx;
  margin-bottom: 24rpx;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.detail-page-title {
  font-size: 42rpx;
  font-weight: bold;
  color: var(--rt-ink);
  font-family: serif;
}

.detail-page-subtitle {
  font-size: 23rpx;
  color: var(--rt-muted);
  margin-top: 6rpx;
}

.detail-fav-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.07);
  border: 1.5rpx solid var(--rt-stroke);
}

.fav-icon {
  font-size: 36rpx;
}

/* ═══ 🌈 破壁 Hero 卡 (BorderBeam 流光边框 + 玻璃态面板) ═══ */
.border-beam-card {
  position: relative;
  border-radius: 40rpx;
  overflow: hidden;
  padding: 3rpx;
  background: rgba(0, 0, 0, 0.06);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;
}

.border-beam-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 280deg,
    rgba(77, 238, 234, 0.8) 320deg,
    rgba(255, 231, 0, 0.9) 350deg,
    rgba(58, 99, 72, 0.6) 360deg
  );
  animation: borderBeamRotate 4.5s linear infinite;
  z-index: 1;
}

@keyframes borderBeamRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hero-inner {
  position: relative;
  z-index: 2;
  border-radius: 38rpx;
  background: #ffffff;
  padding: 40rpx 32rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 封面 (96×144dp) */
.cover-wrapper {
  margin-top: -12rpx;
}

.cover-img {
  width: 192rpx;
  height: 288rpx;
  border-radius: 24rpx;
  background: var(--rt-cover-ph);
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.16);
}

.cover-ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ph-emoji {
  font-size: 72rpx;
}

/* 徽标行 */
.badge-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 24rpx;
}

.editorial-no-badge {
  border: 2rpx dashed rgba(0, 0, 0, 0.22);
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.02);
  color: var(--rt-muted);
  font-size: 21rpx;
  letter-spacing: 1.5rpx;
  padding: 4rpx 14rpx;
  font-family: monospace;
}

.media-badge {
  padding: 4rpx 16rpx;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--rt-ink);
  font-size: 22rpx;
  font-weight: bold;
}

.book-title {
  color: var(--rt-ink);
  font-size: 42rpx;
  font-weight: bold;
  font-family: serif;
  margin-top: 14rpx;
  text-align: center;
}

.book-author {
  color: var(--rt-muted);
  font-size: 26rpx;
  font-family: serif;
  margin-top: 8rpx;
}

/* 全息星级打分条 */
.hero-rating-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 14rpx;
}

.stars-display {
  color: #f59e0b;
  font-size: 30rpx;
  letter-spacing: 2rpx;
}

.rating-num {
  color: #ea580c;
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}

.rating-max {
  color: var(--rt-muted);
  font-size: 22rpx;
}

/* 状态元数据胶囊条 */
.status-meta-pill {
  margin-top: 16rpx;
  padding: 10rpx 26rpx;
  border-radius: 30rpx;
  background: rgba(58, 99, 72, 0.08);
  border: 1.5rpx solid rgba(58, 99, 72, 0.2);
}

.smp-text {
  color: var(--rt-accent);
  font-size: 23rpx;
  font-weight: bold;
}

/* 按键组 */
.flex1 { flex: 1; }
.gap { margin-left: 14rpx; }

.btn-primary {
  margin-top: 28rpx;
  width: 100%;
  height: 88rpx;
  border-radius: 24rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 28rpx rgba(58, 99, 72, 0.28);
}

.btn-row {
  display: flex;
  width: 100%;
  margin-top: 14rpx;
}

.btn-secondary {
  height: 80rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.1);
  color: var(--rt-ink);
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

.btn-danger {
  height: 80rpx;
  border-radius: 24rpx;
  background: #8A3D3D;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 18rpx rgba(138, 61, 61, 0.25);
}

.btn-tertiary-custom {
  height: 80rpx;
  border-radius: 24rpx;
  background: #2D4C38;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 18rpx rgba(45, 76, 56, 0.22);
}

/* ═══ 📑 快捷锚点导航条 ═══ */
.anchor-nav-scroller {
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.anchor-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 14rpx;
  border-radius: 30rpx;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  color: var(--rt-ink);
  font-size: 23rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

.anchor-chip.active {
  background: var(--rt-accent);
  color: #ffffff;
  border-color: var(--rt-accent);
}

/* ═══ 15 区块通用卡片样式 ═══ */
.section-card {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 32rpx;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10rpx 28rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
}

.sec-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
  display: block;
}

.field-group {
  margin-top: 20rpx;
}

.field-label {
  display: block;
  font-size: 22rpx;
  color: var(--rt-muted);
  margin-bottom: 4rpx;
}

.field-value {
  display: block;
  font-size: 26rpx;
  color: var(--rt-ink);
  font-weight: 500;
}

.accent-link {
  color: var(--rt-accent);
  font-weight: bold;
}

.cover-url-val {
  color: var(--rt-muted);
  font-size: 23rpx;
}

/* 简介与 AI 大纲按钮 */
.desc-group {
  margin-top: 22rpx;
}

.desc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6rpx;
}

.btn-ai-story {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background: #1f2937;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: bold;
}

.desc-content {
  line-height: 1.7;
  color: #334155;
  font-size: 25rpx;
}

.desc-content.clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.desc-toggle {
  display: inline-block;
  margin-top: 8rpx;
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

.desc-source {
  display: block;
  font-size: 19rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}

/* 评分行与远程采用条 */
.rating-stars-inline {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 4rpx;
}

.stars-gold {
  color: #f59e0b;
  font-size: 28rpx;
}

.rating-num-inline {
  color: #ea580c;
  font-size: 25rpx;
  font-weight: bold;
}

.remote-rating-adopt {
  margin-top: 16rpx;
  padding: 14rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(58, 99, 72, 0.08);
  border: 1.5rpx dashed rgba(58, 99, 72, 0.25);
  color: var(--rt-accent);
  font-size: 22rpx;
  font-weight: bold;
}

/* 通关心得 / 留下的感受 */
.thoughts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-gold-badge {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background: #FAF4E6;
  border: 1.5rpx solid rgba(212, 175, 55, 0.4);
  color: #92400e;
  font-size: 22rpx;
  font-weight: bold;
}

.thought-block {
  margin-top: 24rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  background: #fafaf9;
  border-left: 6rpx solid var(--rt-accent);
}

.thoughts-empty {
  margin-top: 20rpx;
  padding: 28rpx 20rpx;
  border-radius: 20rpx;
  background: #fafaf9;
  border: 1.5rpx dashed rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-hint {
  font-size: 22rpx;
  color: var(--rt-muted);
  line-height: 1.6;
}

/* 高光战报与心得 (Notes) */
.notes-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nh-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.nh-count {
  font-size: 22rpx;
  color: var(--rt-muted);
}

.nh-btns {
  display: flex;
  gap: 12rpx;
}

.btn-glass-chip {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: var(--rt-bg);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  font-size: 22rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.notes-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.note-card {
  padding: 20rpx;
  border-radius: 22rpx;
  background: #fafaf9;
  border: 1.5rpx solid rgba(0, 0, 0, 0.05);
}

.nc-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.nc-badge {
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
  background: #e2e8f0;
  color: #475569;
  font-size: 19rpx;
  font-weight: bold;
}

.nc-time {
  font-size: 20rpx;
  color: #94a3b8;
}

.nc-content {
  display: block;
  font-size: 25rpx;
  color: var(--rt-ink);
  line-height: 1.6;
}

.nc-source {
  display: block;
  font-size: 20rpx;
  color: var(--rt-muted);
  margin-top: 6rpx;
}

.notes-empty {
  padding: 30rpx 0;
  text-align: center;
}

/* 实体馆藏 2x2 网格 */
.collection-grid {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.cg-item {
  background: #fafaf9;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
}

/* 横滑卡片条 (角色 & 大纲) */
.section-action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.horizontal-card-scroller {
  white-space: nowrap;
  margin-top: 20rpx;
}

.h-card-row {
  display: flex;
  gap: 18rpx;
}

.character-box {
  width: 380rpx;
  flex-shrink: 0;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fafaf9;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
}

.cb-head {
  display: flex;
  align-items: center;
  position: relative;
}

.cb-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 14rpx;
}

.cb-titles {
  flex: 1;
}

.cb-name {
  display: block;
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.cb-role {
  display: block;
  font-size: 20rpx;
  color: var(--rt-accent);
}

.cb-del {
  padding: 8rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.cb-desc {
  display: block;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.5;
  margin-top: 12rpx;
  white-space: normal;
}

.outline-box {
  width: 420rpx;
  flex-shrink: 0;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fafaf9;
  border: 1.5rpx solid rgba(0, 0, 0, 0.06);
}

.ob-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.ob-badge {
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  background: #e2e8f0;
  font-size: 19rpx;
  color: #334155;
  font-weight: bold;
}

.ob-title {
  flex: 1;
  font-size: 24rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.ob-del {
  padding: 6rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.ob-summary {
  display: block;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.5;
  margin-top: 10rpx;
  white-space: normal;
}

.ob-footer {
  margin-top: 12rpx;
}

.ob-mindmap {
  padding: 4rpx 14rpx;
  border-radius: 14rpx;
  background: rgba(58, 99, 72, 0.08);
  color: var(--rt-accent);
  font-size: 20rpx;
  font-weight: bold;
}

/* 时间轴 */
.timeline-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-filters {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tf-chip {
  padding: 4rpx 14rpx;
  border-radius: 16rpx;
  background: var(--rt-bg);
  color: var(--rt-ink);
  font-size: 21rpx;
}

.tf-chip.active {
  background: var(--rt-accent);
  color: #ffffff;
  font-weight: bold;
}

.tf-export {
  padding: 4rpx 14rpx;
  border-radius: 16rpx;
  background: #f1f5f9;
  color: var(--rt-ink);
  font-size: 21rpx;
  font-weight: bold;
}

.timeline-stream {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
}

.tl-node {
  position: relative;
  display: flex;
  padding-bottom: 28rpx;
  padding-left: 56rpx;
}

.tl-node-line-top {
  position: absolute;
  left: 24rpx;
  top: 0;
  height: 20rpx;
  width: 3rpx;
  background: rgba(58, 99, 72, 0.3);
}

.tl-node-line-bottom {
  position: absolute;
  left: 24rpx;
  top: 48rpx;
  bottom: 0;
  width: 3rpx;
  background: rgba(58, 99, 72, 0.3);
}

.tl-node-line-top.hidden,
.tl-node-line-bottom.hidden {
  display: none;
}

.tl-node-icon-wrap {
  position: absolute;
  left: 8rpx;
  top: 14rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 3rpx solid var(--rt-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.tl-icon {
  font-size: 20rpx;
}

.tl-node-card {
  flex: 1;
  background: #fafaf9;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
}

.tl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-title {
  font-size: 24rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.tl-time {
  font-size: 19rpx;
  color: #94a3b8;
}

.tl-sub {
  display: block;
  font-size: 20rpx;
  color: var(--rt-accent);
  margin-top: 4rpx;
}

.tl-body {
  display: block;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.5;
  margin-top: 6rpx;
}

/* 六维心智雷达板块 */
.mindprint-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mh-actions {
  display: flex;
  gap: 8rpx;
}

.mha-btn {
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.1);
  font-size: 21rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.mha-btn.cyan {
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.3);
  background: #f0f9ff;
}

.mp-summary {
  display: block;
  font-size: 24rpx;
  color: var(--rt-accent);
  font-weight: bold;
  margin-top: 14rpx;
}

.radar-canvas-container {
  display: flex;
  justify-content: center;
  margin: 16rpx 0;
}

.scores-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 10rpx;
}

.sg-row {
  display: flex;
  gap: 16rpx;
}

.sg-item {
  flex: 1;
  background: #fafaf9;
  border-radius: 16rpx;
  padding: 14rpx 18rpx;
}

/* 🔮 美学情绪胶囊 */
.vibe-capsules-section {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1.5rpx dashed rgba(0, 0, 0, 0.08);
}

.vibe-title {
  font-size: 23rpx;
  font-weight: bold;
  color: var(--rt-accent);
  display: block;
  margin-bottom: 14rpx;
}

.vibe-flow-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.vibe-chip {
  padding: 10rpx 22rpx;
  border-radius: 28rpx;
  background: #f8fafc;
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  font-size: 22rpx;
  color: #475569;
}

.vibe-chip.active {
  background: #FAF4E6;
  border-color: #d97706;
  color: #92400e;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(217, 119, 6, 0.18);
}

.vc-text {
  line-height: 1;
}

/* 空间地标 */
.locations-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.location-item {
  background: #fafaf9;
  border-radius: 20rpx;
  padding: 18rpx 22rpx;
}

.li-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.li-badge {
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  background: #e2e8f0;
  font-size: 19rpx;
  color: #475569;
}

.li-name {
  flex: 1;
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.li-del {
  font-size: 24rpx;
  color: #94a3b8;
  padding: 4rpx;
}

.li-desc {
  display: block;
  font-size: 22rpx;
  color: #475569;
  margin-top: 6rpx;
  line-height: 1.5;
}

.li-sig {
  display: block;
  font-size: 20rpx;
  color: var(--rt-accent);
  margin-top: 6rpx;
}

/* 灵犀共鸣推荐 */
.similar-subtitle {
  display: block;
  font-size: 21rpx;
  color: var(--rt-muted);
  margin-top: 4rpx;
  margin-bottom: 20rpx;
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.similar-card {
  display: flex;
  padding: 18rpx;
  border-radius: 24rpx;
  background: #fafaf9;
  border: 1.5rpx solid rgba(0, 0, 0, 0.05);
}

.sim-cover {
  width: 96rpx;
  height: 140rpx;
  border-radius: 14rpx;
  margin-right: 18rpx;
  background: #e2e8f0;
  flex-shrink: 0;
}

.sim-info {
  flex: 1;
}

.sim-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.sim-badge {
  font-size: 20rpx;
}

.sim-title {
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-ink);
}

.sim-author {
  display: block;
  font-size: 21rpx;
  color: var(--rt-muted);
  margin-top: 4rpx;
}

.sim-match-row {
  margin-top: 8rpx;
}

.sim-percent {
  display: inline-block;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  background: rgba(58, 99, 72, 0.12);
  color: var(--rt-accent);
  font-size: 19rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.sim-reason {
  font-size: 20rpx;
  color: #d97706;
}

.bottom-spacer {
  height: 100rpx;
}

/* 缺失作品提示 */
.missing-panel {
  padding: 160rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.missing-text {
  color: var(--rt-muted);
  font-size: 26rpx;
}

.btn-back-hub {
  margin-top: 30rpx;
  padding: 14rpx 36rpx;
  border-radius: 28rpx;
  background: var(--rt-accent);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}

/* ═══ 模态弹窗基础样式 ═══ */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 36rpx;
  box-sizing: border-box;
}

.modal-dialog {
  width: 100%;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 36rpx 32rpx;
  box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.25);
  overflow-y: auto;
}

.md-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.md-title {
  color: var(--rt-ink);
  font-size: 32rpx;
  font-weight: bold;
  font-family: serif;
}

.md-close {
  color: var(--rt-muted);
  font-size: 32rpx;
  padding: 6rpx;
}

.md-input {
  width: 100%;
  height: 72rpx;
  background: var(--rt-bg);
  border-radius: 18rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  margin-top: 6rpx;
}

.md-textarea {
  width: 100%;
  height: 180rpx;
  background: var(--rt-bg);
  border-radius: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: var(--rt-ink);
  margin-top: 14rpx;
}

.md-textarea-small {
  width: 100%;
  height: 130rpx;
  background: var(--rt-bg);
  border-radius: 18rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
  font-size: 23rpx;
  color: var(--rt-ink);
  margin-top: 6rpx;
}

.md-inputs-row {
  display: flex;
  gap: 14rpx;
  margin-top: 14rpx;
}

.ed-field {
  margin-top: 18rpx;
}

.ed-label {
  display: block;
  font-size: 22rpx;
  color: var(--rt-muted);
}

.ed-picker {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 20rpx;
  background: var(--rt-parchment);
  border-radius: 18rpx;
  font-size: 25rpx;
  color: var(--rt-ink);
  margin-top: 6rpx;
}

.ed-slider {
  margin: 8rpx 0;
}

.btn-save-confirm {
  margin-top: 28rpx;
  height: 84rpx;
  background: var(--rt-accent);
  color: #ffffff;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

/* 六维滑块列表 */
.mp-sliders-scroll {
  max-height: 55vh;
  margin-top: 10rpx;
}

.mp-slider-row {
  margin-bottom: 18rpx;
}

.mps-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mps-label {
  font-size: 24rpx;
  color: var(--rt-ink);
}

.mps-val {
  font-size: 25rpx;
  font-weight: bold;
  color: var(--rt-accent);
}

/* 对比作品列表 */
.compare-books-list {
  max-height: 50vh;
  margin-top: 14rpx;
}

.compare-book-item {
  padding: 20rpx;
  border-radius: 18rpx;
  background: #fafaf9;
  margin-bottom: 12rpx;
}

.cbi-title {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--rt-ink);
  display: block;
}

.cbi-author {
  font-size: 21rpx;
  color: var(--rt-muted);
  display: block;
  margin-top: 4rpx;
}

/* ═══ 文心雕龙 AI 润色 Bottom Sheet ═══ */
.polish-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.polish-sheet {
  width: 100%;
  max-height: 85vh;
  background: #FFFFFF;
  border-top-left-radius: 44rpx;
  border-top-right-radius: 44rpx;
  padding: 36rpx 32rpx 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20rpx 60rpx rgba(0, 0, 0, 0.25);
}

.ps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.ps-title-wrap {
  display: flex;
  flex-direction: column;
}

.ps-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #1A1F16;
}

.ps-sub {
  font-size: 20rpx;
  color: #8C9487;
  margin-top: 4rpx;
}

.ps-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #F2EFE9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #555E50;
}

.ps-body {
  max-height: 70vh;
  padding-top: 20rpx;
}

.ps-sec-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--rt-accent);
  margin: 20rpx 0 12rpx;
}

.style-scroller {
  white-space: nowrap;
}

.style-list {
  display: flex;
  gap: 16rpx;
  padding-bottom: 8rpx;
}

.style-chip {
  width: 220rpx;
  background: var(--rt-bg);
  border: 1.5rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 20rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.style-chip.active {
  background: #FAF4E6;
  border-color: #d97706;
  box-shadow: 0 6rpx 16rpx rgba(212, 175, 55, 0.25);
}

.sc-emoji {
  font-size: 36rpx;
}

.sc-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #1A1F16;
  margin-top: 6rpx;
}

.sc-tag {
  font-size: 18rpx;
  color: #8C9487;
  margin-top: 4rpx;
}

.ps-input-wrap {
  position: relative;
  background: var(--rt-bg);
  border-radius: 24rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
}

.ps-draft-input {
  width: 100%;
  height: 140rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #1A1F16;
}

.ps-char-count {
  position: absolute;
  right: 20rpx;
  bottom: 12rpx;
  font-size: 18rpx;
  color: #A3ACA0;
}

.btn-ps-generate {
  margin: 24rpx 0;
  height: 84rpx;
  background: linear-gradient(135deg, var(--rt-accent) 0%, #254430 100%);
  color: #FFFFFF;
  border-radius: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 10rpx 24rpx rgba(58, 99, 72, 0.3);
}

.btn-ps-generate.loading {
  background: var(--rt-gold);
}

.result-card {
  background: #FAF8F5;
  border-radius: 28rpx;
  padding: 26rpx;
  border: 1.5rpx solid rgba(212, 175, 55, 0.3);
  margin-bottom: 24rpx;
}

.res-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.res-badge {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--rt-accent);
}

.res-source {
  font-size: 18rpx;
  color: var(--rt-gold);
}

.res-text-box {
  min-height: 140rpx;
}

.res-text {
  font-size: 25rpx;
  line-height: 1.85;
  color: #2D332A;
  font-family: serif;
}

.typewriter-cursor {
  color: #d97706;
  font-weight: 900;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.golden-quote-card {
  margin-top: 24rpx;
  background: linear-gradient(135deg, #FFFFFF 0%, #FAF4E6 100%);
  border-radius: 20rpx;
  padding: 20rpx;
  border: 1.5rpx dashed #d97706;
  position: relative;
}

.gq-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.gq-label {
  font-size: 20rpx;
  font-weight: 700;
  color: #d97706;
}

.gq-len {
  font-size: 18rpx;
  color: #8C9487;
}

.gq-quote {
  font-size: 28rpx;
  font-weight: 800;
  color: #1A1F16;
  font-family: serif;
  display: block;
  margin: 10rpx 0 14rpx;
}

.gq-copy-btn {
  display: inline-block;
  padding: 4rpx 16rpx;
  background: rgba(212, 175, 55, 0.15);
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #92400e;
  font-weight: 600;
}

.ps-actions-panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.btn-ps-adopt {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  background: var(--rt-accent);
  color: #FFFFFF;
  border-radius: 42rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.ps-sub-actions {
  display: flex;
  gap: 16rpx;
}

.ps-sub-btn {
  flex: 1;
  height: 68rpx;
  background: #F2EFE9;
  color: var(--rt-accent);
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
}

.api-key-config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}

.ak-hint {
  font-size: 18rpx;
  color: #8C9487;
}

.ak-btn {
  font-size: 20rpx;
  color: var(--rt-accent);
  font-weight: 600;
}
</style>
