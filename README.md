# 阅痕 ReadTrace · 微信小程序端 (mp-readtrace)

P19 跨端漫游：uni-app Vue3 + TypeScript 构建的微信轻量漫游端，
与 Android 端数据模型 **100% 同构**（字段名与 JSON 备份 Schema v4 完全一致）。

> 📐 **App 深度对齐工程进行中**：进度事实源见 [`开发计划-App深度对齐.md`](./开发计划-App深度对齐.md)。
> 三个核心页面（首页 Hub / 详情页 / 我的页）正按 `design-reference/` 中的 App 实机截图逐页重构。

## 设计参考 · App 实机截图（design-reference/）

以下截图来自模拟器运行的 Android App v1.0.12（用户真实数据 207 部藏品），
是小程序页面深度对齐的**唯一视觉基准**：

| 文件 | 内容 | 对齐要点 |
|---|---|---|
| `hub_1_top.png` | Hub 首屏 | 方形记录台、眉标行、衬线标题、五媒介统计、按钮组、悬浮胶囊导航 |
| `hub_2_mid.png` | Hub 中段 | 跑马灯、Hero 策展主位（破壁封面+徽标+双按钮）、晶体工坊胶囊、羊皮纸笺 |
| `hub_3_low.png` | Hub 底段 | 羊皮纸笺全文、文化印记总览（207/1/190/16）、时光深处的印记（封面+引语条） |
| `library_top.png` | 藏库首屏 | 一体化玻璃筛选面板（搜索/媒介胶囊/状态分段/评分分段/标签流）、统计条、双列网格、悬浮翻页条 |
| `library_scrolled.png` | 藏库滚动 | 网格卡片细节与翻页条悬浮态 |
| `detail_1_top.png` | 详情首屏 | 悬浮返回光球、流光边框主卡、NO.徽标、衬线书名、星级评分、状态胶囊、媒介定制按钮组、快捷导航条 |
| `detail_2~4.png` | 详情滚动 | 15 区块逐段（雷达/时间轴/角色谱/大纲等） |
| `profile_1_top.png` | 我的首屏 | 档案面板、**羊皮纸暖金色调通行卡**（注意：不是深蓝色）、云端同步条、虚拟空间分组 |
| `profile_2.png` | 我的滚动 | 系统管理分组（搬家/备份/回收站/版本 v1.0.12）、关于卡、勋章 **9/10**（注意勋章总数与小程序 18 枚不一致，需对齐） |
| `profile_3.png` | 我的底段 | 页尾 |

## 功能范围（对应 P19 计划）

| 模块 | 说明 |
|---|---|
| `pages/library` | 库藏列表：媒介筛选 + 搜索 + Local-First 本地缓存（离线可用） |
| `pages/quick-log` | 3 秒极速速记：一句话分词（与 `NaturalQuickAddParser` 同构）+ 五态秒存 + 智能心智推导 |
| `components/DioramaCard` | 2.5D 空间视差标本微卡：`wx.onDeviceMotionChange` 陀螺仪 + 触控双通道，4 层差速 |
| `components/VinylPlayer` | 悬浮黑胶：WebAudio 合成 432~528Hz 泛音（评分分级，与引力琴同构），无音频实现时纯视觉降级 |
| `utils/sync.ts` | WebDAV 增量同步：与 Android `WebDavSyncEngine` 同路径/同 Schema，拉推 + 内容级去重 |
| `utils/models.ts` | Book / Note / Mindprint 数据模型镜像 + `deriveMindprint` 智能推导 |

## 运行

```bash
cd mp-readtrace
npm install          # 仅安装到本目录 node_modules
npm run dev:mp-weixin
# 用微信开发者工具打开 dist/dev/mp-weixin
```

`src/manifest.json` 的 appid **已填为本项目 AppID**（`wx78b31c8ce9bd4418`），无需替换即可直接导入。

## 与 Android 端互通

- **方式一（数据主权，推荐）**：两端均配置同一坚果云/NAS WebDAV，
  分别执行同步即可按内容级去重合并（Schema v4 全量高阶资产）。
- **方式二**：Android 端 `WechatMinappSyncProtocol.kt` 定义的序列化协议
  可用于后续接入「微信云开发」托管模式（尚未实装，预留）。

## 已知边界

> 本节于 **2026-09-22** 按代码事实重新核验，原文两条中有一条已过时。

- ~~小程序端暂不承载六维雷达编辑、海报工坊等重交互（请使用 App 端）~~
  → **该说明已过时**：`pages/book-detail` 已有 `✏️ 编辑印记弹窗`（六维雷达可编辑）；
  `pages/memoir` 的海报工坊四模组（`generateWorkshopPoster` / `generateCoverGallery` / `generateChronicleScroll`）
  与 `pages/library` 的宣纸长卷导出（`generateLibraryScroll`）均已落地。
- **⚠️ 音频当前不可用（P0，未修）**：`utils/audio-engine.ts` 的 8 条音源全部指向 `cdn.pixabay.com`，
  该 CDN 对小程序请求返回 403，白噪音与黑胶目前都播不出声。修复方案待定，
  详见 [`开发计划-App深度对齐.md`](./开发计划-App深度对齐.md) 的「Phase B」。
- **未接线组件**：`components/DioramaCard.vue`、`components/VinylPlayer.vue` 递归检索确认**无任何页面引用**
  （上方「功能范围」表把二者列为已有能力，属 P19 立项时的设计愿景，真实入口在 App 端）。处置待定。
- `wx.request` 对 PUT/MKCOL 的兼容性以坚果云/Nextcloud 实测为准，失败时回退只读浏览。
