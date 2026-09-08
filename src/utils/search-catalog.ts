/**
 * 🔍 外部搜源与自动建库引擎 (Search Catalog & Metadata Resolver)
 *
 * 对标 Android 原生 DiscoverActivity.kt 与 BangumiApiClient / DoubanClient：
 * 1. 内置跨媒介殿堂级权威作品榜单与元数据（覆盖书籍、番剧、影视、游戏、音乐）
 * 2. 包含高阶角色图谱 (characters) 与分幕大纲 (outlines) 自动补全
 * 3. 微信原生 ISBN 条形码扫描识别 (uni.scanCode)
 * 4. 实时搜索与去重判别（已在馆藏标记）
 * 5. 一键入库并自动生成六维心智模型
 */

import type { Book, MediaType, BookStatus, BookCharacter, BookOutline, Mindprint } from './models';
import { deriveMindprint } from './models';
import { loadAllLocalWorks, saveLocalWorks, loadAllLocalMindprints } from './sync';

export interface SearchCatalogItem {
  sourceId: string;
  sourceType: 'bangumi' | 'douban' | 'steam' | 'manual';
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  mediaType: MediaType;
  remoteRating: number;
  tags: string[];
  description: string;
  isbn?: string;
  characters?: BookCharacter[];
  outlines?: BookOutline[];
}

/** 内置权威全媒元数据库（具备角色谱与剧情分幕，秒级直出） */
export const DISCOVER_PRESETS: SearchCatalogItem[] = [
  // ── 📚 书籍 ──
  {
    sourceId: 'book_01',
    sourceType: 'douban',
    title: '三体：地球往事三部曲',
    author: '刘慈欣',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
    category: '科幻 / 硬科幻 / 哲学',
    mediaType: 'book',
    remoteRating: 9.6,
    tags: ['硬科幻', '黑暗森林', '雨果奖', '中国科幻'],
    isbn: '9787536692930',
    description: '文化大革命如火如荼进行之际，军方探寻外星文明的绝秘计划“红岸工程”取得了突破性进展。但在按下发射键的那一刻，历经劫难的叶文洁没有意识到，她彻底改变了人类的命运。',
    characters: [
      { name: '叶文洁', roleTitle: '天体物理学家 / 统帅', avatarEmoji: '🔭', description: '红岸基地核心技术人员，向三体世界发送第一声啼鸣的引路人。' },
      { name: '罗辑', roleTitle: '面壁者 / 执剑人', avatarEmoji: '🌌', description: '玩世不恭的社会学家，最终顿悟宇宙社会学与黑暗森林法则的守护神。' },
      { name: '史强 (大史)', roleTitle: '反恐安全警察', avatarEmoji: '🕵️', description: '粗中有细的退伍军人，人类文明最顽强的野草精神具象化。' },
      { name: '庄颜', roleTitle: '罗辑的心灵缪斯', avatarEmoji: '🎨', description: '罗辑在脑海中虚拟并最终在现实中找寻到的完美纯净爱人。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '红岸绝响与古筝行动', summary: '叶文洁向太阳发射增益信号，汪淼遭遇纳米幽灵倒计时与审判日号切割。' },
      { chapterOrder: 2, title: '面壁计划与咒语生效', summary: '联合国遴选四位面壁者，罗辑向恒星 187J3X1 发射诅咒。' },
      { chapterOrder: 3, title: '末日之战与水滴降临', summary: '三体强相互作用力探测器“水滴”以凡人之力瞬间摧毁人类两千艘太空战舰。' },
      { chapterOrder: 4, title: '威慑纪元与执剑人交接', summary: '罗辑在褐矮星旁建立引力波威慑，程心继任后威慑瞬间崩溃。' },
      { chapterOrder: 5, title: '二向箔降维打击与小宇宙', summary: '歌者文明随手抛出二向箔，太阳系化为梵高画作般的平面二维画卷。' },
    ],
  },
  {
    sourceId: 'book_02',
    sourceType: 'douban',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '童话 / 哲理 / 经典文学',
    mediaType: 'book',
    remoteRating: 9.7,
    tags: ['治愈', '法原文艺', '哲思', '永恒童真'],
    isbn: '9787020042494',
    description: '小王子是一个超凡脱俗的仙童，住在一颗只比他大一丁点儿的小行星 B612 上。因为和一朵傲娇的玫瑰闹别扭，他告别家园，展开了周游各个星球的星际旅行。',
    characters: [
      { name: '小王子', roleTitle: 'B612星球的主人', avatarEmoji: '👑', description: '留着金黄卷发的小孩，眼神清澈，执着寻找关于驯服的意义。' },
      { name: '玫瑰花', roleTitle: '独一无二的骄傲', avatarEmoji: '🌹', description: '拥有四根刺的花朵，虽然虚荣脆弱，却是小王子一生牵挂的源头。' },
      { name: '狐狸', roleTitle: '关于驯服的导师', avatarEmoji: '🦊', description: '教导小王子“用心灵才能看清本质”的挚友。' },
      { name: '飞行员', roleTitle: '叙述者 / 倾听者', avatarEmoji: '✈️', description: '在撒哈拉沙漠飞机失事的成年人，重新找回了内心的孩童。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '撒哈拉沙漠的迫降', summary: '飞行员在极度干渴与孤独中，遇见了从外星球来的金发小男孩。' },
      { chapterOrder: 2, title: 'B612 上的火山与玫瑰', summary: '小王子打理微型星球，经历与骄傲玫瑰的初恋和离开。' },
      { chapterOrder: 3, title: '荒诞的六个大人星球', summary: '先后探访国王、虚荣者、酒鬼、商人、点灯人与地理学家的世界。' },
      { chapterOrder: 4, title: '地球上的麦田与狐狸', summary: '在麦浪的金黄色中，狐狸道破了驯服与负责的终极秘密。' },
      { chapterOrder: 5, title: '黄蛇之吻与化作星尘', summary: '小王子褪去沉重的肉身，化作夜空五亿颗眨眼欢笑的铃铛星辰。' },
    ],
  },
  {
    sourceId: 'book_03',
    sourceType: 'douban',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '魔幻现实主义 / 诺贝尔文学奖',
    mediaType: 'book',
    remoteRating: 9.8,
    tags: ['马尔克斯', '魔幻现实', '家族史诗', '拉丁美洲'],
    isbn: '9787544253994',
    description: '《百年孤独》是魔幻现实主义文学的巅峰之作，讲述布恩迪亚家族七代人在加勒比海沿岸小镇马孔多的百年兴衰史。',
    characters: [
      { name: '何塞·阿尔卡蒂奥·布恩迪亚', roleTitle: '家族始祖 / 探险家', avatarEmoji: '🗺️', description: '马孔多的缔造者，迷恋炼金术与磁铁，最终被绑在大树上与鬼魂低语。' },
      { name: '乌尔苏拉', roleTitle: '家族老祖母 / 灵魂支柱', avatarEmoji: '👵', description: '活过百岁的坚韧女性，用糖果小动物维系着荒唐家族的生存。' },
      { name: '奥雷里亚诺·布恩迪亚上校', roleTitle: '传奇革命军总司令', avatarEmoji: '⚔️', description: '发动过 32 次武装起义并全部失败，晚年退隐闭门制作小金鱼。' },
      { name: '梅尔基亚德斯', roleTitle: '吉普赛预言家', avatarEmoji: '📜', description: '洞悉马孔多宿命的智者，留下用梵文写就的羊皮纸手卷。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '马孔多的诞生与冰块奇遇', summary: '布恩迪亚夫妇翻越山脉建立世外小镇，吉普赛人带来望远镜与磁铁。' },
      { chapterOrder: 2, title: '失眠症与忘却之瘟疫', summary: '小镇陷入失眠，人们被迫给每样物件贴上名字标签以对抗遗忘。' },
      { chapterOrder: 3, title: '上校的起义与孤独暮年', summary: '战争如火如荼却徒劳无功，上校在虚无中退回到制作小金鱼的熔炉旁。' },
      { chapterOrder: 4, title: '香蕉公司的血色屠杀', summary: '现代资本与大屠杀席卷马孔多，随后是长达四年十一月零两天的倾盆大雨。' },
      { chapterOrder: 5, title: '飓风刮过与羊皮纸破译', summary: '最后一个长着猪尾巴的婴儿被蚂蚁吃掉，飓风将马孔多从地表彻底抹去。' },
    ],
  },

  // ── 🎬 影视 ──
  {
    sourceId: 'movie_01',
    sourceType: 'douban',
    title: '星际穿越 (Interstellar)',
    author: '克里斯托弗·诺兰',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '科幻 / 冒险 / 悬疑',
    mediaType: 'movie',
    remoteRating: 9.8,
    tags: ['黑洞', '硬科幻', '引力波', '汉斯·季默'],
    description: '近未来的地球黄沙遍野，人类面临灭顶之灾。前 NASA 宇航员库珀穿过土星附近的虫洞，远赴未知星系探寻人类延续希望。',
    characters: [
      { name: '库珀 (Cooper)', roleTitle: '宇航员 / 父亲', avatarEmoji: '🚀', description: '永不放弃希望的王牌飞行员，为挽救女儿与文明孤身坠入黑洞。' },
      { name: '墨菲 (Murphy)', roleTitle: '物理学家 / 女儿', avatarEmoji: '⌚', description: '守候父亲半个世纪的天才科学家，凭借秒针引力摩斯密码解开大一统理论。' },
      { name: '布兰德博士 (Brand)', roleTitle: '生物学家 / 探险队员', avatarEmoji: '🔬', description: '深信爱是超越高维空间引力的坚毅学者，孤身抵达第三行星播种新文明。' },
      { name: '塔斯 (TARS)', roleTitle: '军用战术智能机器人', avatarEmoji: '🤖', description: '幽默度 75%、忠诚度 100% 的多功能四足金属魔方。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '沙尘暴与书房引力异象', summary: '地球农业枯萎，库珀与幼年墨菲破译灰尘落点坐标，发现地下 NASA 秘密基地。' },
      { chapterOrder: 2, title: '穿越虫洞与米勒浪涌', summary: '永恒号穿越虫洞，米勒行星由于卡冈图雅引力导致一小时等于地球七年，巨浪袭来。' },
      { chapterOrder: 3, title: '曼恩冰原的背叛与绝境对接', summary: '冰雪星球上的谎言被揭穿，库珀在飞船极速失控旋转中完成人类史上最惊险手动对接。' },
      { chapterOrder: 4, title: '超立方体与引力秒针', summary: '库珀跳入卡冈图雅奇点，坠入未来人类构建的五维高维书房，用手表秒针传递量子数据。' },
      { chapterOrder: 5, title: '空间站重逢与奔向新世界', summary: '垂暮的墨菲在空间站病榻前与容貌未改的父亲告别，库珀驾机启程寻找布兰德。' },
    ],
  },
  {
    sourceId: 'movie_02',
    sourceType: 'douban',
    title: '肖申克的救赎',
    author: '弗兰克·德拉邦特',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '剧情 / 犯罪 / 自由',
    mediaType: 'movie',
    remoteRating: 9.7,
    tags: ['希望', '自由', '影史第一', '经典'],
    description: '一场谋杀案使年轻的银行家安迪蒙冤入狱，在长达近二十年的肖申克黑牢中，他凭借一柄鹤嘴锄与对自由的永恒信念完成救赎。',
    characters: [
      { name: '安迪·杜弗伦', roleTitle: '银行家 / 越狱者', avatarEmoji: '♟️', description: '外表冷静儒雅，内心坚若磐石，用 19 年挖出通往自由的通道。' },
      { name: '艾利斯·博伊德·瑞德 (Red)', roleTitle: '狱中老手 / 旁白者', avatarEmoji: '🚬', description: '服刑四十年的老囚犯，在安迪的影响下重新理解了希望的意义。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '蒙冤入狱与屋顶啤酒', summary: '安迪被判终身监禁，凭借精湛财税知识为狱警避税换得工友屋顶上的冰镇啤酒。' },
      { chapterOrder: 2, title: '莫扎特与监狱图书馆', summary: '安迪锁上办公室门，通过广播系统为全监狱犯人播放《费加罗的婚礼》。' },
      { chapterOrder: 3, title: '雷雨之夜的终极脱逃', summary: '安迪爬过五百码恶臭污水管，在雷电暴雨中撕扯囚衣拥抱自由。' },
      { chapterOrder: 4, title: '太平洋蔚蓝海岸的重聚', summary: '瑞德获得假释，按照约定前往墨西哥芝华塔尼欧，在蔚蓝大海旁与安迪相拥。' },
    ],
  },

  // ── 🌸 番剧 ──
  {
    sourceId: 'anime_01',
    sourceType: 'bangumi',
    title: '新世纪福音战士：终 (EVA 3.0+1.0)',
    author: '庵野秀明',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
    category: '机战 / 意识流 / 哲学 / 科幻',
    mediaType: 'anime',
    remoteRating: 9.7,
    tags: ['EVA', '意识流', '人类补完', '再见所有福音战士'],
    description: '在赤红荒芜的世界边缘，真嗣、明日香与绫波丽踏入生机勃勃的第三村。历经三十年的羁绊与补完，走向真正的成人礼。',
    characters: [
      { name: '碇真嗣', roleTitle: '初号机驾驶员 / 救赎者', avatarEmoji: '🎧', description: '从封闭怯弱中走出，在负宇宙中与父亲坦诚相对，终结福音战士世界。' },
      { name: '式波·明日香·兰格雷', roleTitle: '改2号机驾驶员', avatarEmoji: '🎀', description: '孤傲好强的王牌，终于承认自己曾真正喜欢过真嗣，解开克隆心结。' },
      { name: '绫波丽 (暂称)', roleTitle: '黑丽 / 农作少女', avatarEmoji: '🌾', description: '在第三村体验洗衣服、种稻谷与说晚安，学会了生而为人的温暖。' },
      { name: '碇源堂', roleTitle: 'NERV 司令 / 孤独的父亲', avatarEmoji: '🕶️', description: '双手交叠的冷酷男人，做的一切不过是为了能再次见到唯。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '巴黎旧城净化与重逢第三村', summary: 'WILLE 夺回卢浮宫封存备件，真嗣行尸走肉般踏入第三村的市井炊烟中。' },
      { chapterOrder: 2, title: '黑丽的心智苏醒与消逝', summary: '黑丽在猫咪与稻田间学会微笑，在真嗣怀中化作橙色 LCL 告别。' },
      { chapterOrder: 3, title: '南极最终决战与负宇宙', summary: 'AAA Wunder 突入红海地狱，真嗣驾驶初号机与碇源堂的第 13 号机在记忆特摄影棚中死斗。' },
      { chapterOrder: 4, title: 'Neon Genesis 没有 EVA 的新世界', summary: '真嗣在没有 EVA 的宇部新川站站台，牵起真希波的手奔向彩色现实生活。' },
    ],
  },
  {
    sourceId: 'anime_02',
    sourceType: 'bangumi',
    title: '葬送的芙莉莲',
    author: '斋藤圭一郎',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '奇幻 / 治愈 / 冒险 / 史诗',
    mediaType: 'anime',
    remoteRating: 9.9,
    tags: ['治愈', '时光流动', '霸权', '魔法'],
    description: '打倒魔王半个世纪后，长生不老的高等精灵魔法使芙莉莲，在目睹伙伴老去长眠后，重新启程踏上探寻人类心意与灵魂安眠之地的旅程。',
    characters: [
      { name: '芙莉莲 (Frieren)', roleTitle: '千年精灵魔法使', avatarEmoji: '🧝‍♀️', description: '看似懒散且感情淡泊，却在时光的长河里珍藏着勇者辛美尔留下的每一寸微光。' },
      { name: '辛美尔 (Himmel)', roleTitle: '勇者', avatarEmoji: '🗡️', description: '自恋而温柔的绝世勇者，终其一生用行动让芙莉莲在漫长的未来不再孤单。' },
      { name: '费伦 (Fern)', roleTitle: '人类魔法使徒弟', avatarEmoji: '🪄', description: '沉稳周到如母亲般的弟子，施法速度极快的常规攻击魔法大师。' },
      { name: '修尔克 (Stark)', roleTitle: '战士弟子', avatarEmoji: '🪓', description: '爱哭却在关键时刻绝不后退的红发斧头战士。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '半世纪流星雨与勇者的葬礼', summary: '辛美尔在平静中寿终正寝，芙莉莲在墓前落泪，懊悔自己未曾试着去了解他。' },
      { chapterOrder: 2, title: '拂晓的蓝月草与苍月草', summary: '芙莉莲与费伦在北方诸国搜寻变出花田的魔法，重现辛美尔故乡的蓝色花海。' },
      { chapterOrder: 3, title: '断头台阿乌拉与服从天平', summary: '魔族军团入侵伯爵领地，芙莉莲压制了千年的庞大魔力瞬间让天平失衡。' },
      { chapterOrder: 4, title: '一极魔法使测验与安魂之地', summary: '在奥伊萨斯特参加考级，与各路魔法使结识，继续向灵魂安眠之地恩德前行。' },
    ],
  },

  // ── 🎮 游戏 ──
  {
    sourceId: 'game_01',
    sourceType: 'steam',
    title: '塞尔达传说：王国之泪',
    author: '任天堂 (Nintendo)',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '开放世界 / 动作冒险 / 物理沙盒',
    mediaType: 'game',
    remoteRating: 9.8,
    tags: ['开放世界', '究极手', '海拉鲁', 'GOTY'],
    description: '天地反转，左纳乌文明苏醒。林克凭借全新右臂与「究极手」组装神力，自由穿梭于天界浮岛、辽阔海拉鲁与深邃地底之间。',
    characters: [
      { name: '林克 (Link)', roleTitle: '海拉鲁近卫骑士', avatarEmoji: '🗡️', description: '失去右臂后继承劳鲁之力的勇者，沉默而不可阻挡。' },
      { name: '塞尔达 (Zelda)', roleTitle: '海拉鲁王室公主', avatarEmoji: '👑', description: '穿梭时光返回神话时代，化身白龙守候万年修复退魔之剑。' },
      { name: '加侬多夫', roleTitle: '格鲁德盗贼王 / 魔王', avatarEmoji: '👹', description: '挣脱千年封印，掀起天变地异企图吞噬海拉鲁大陆的狂妄魔君。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '城堡地下的瘴气与浮空觉醒', summary: '魔王苏醒大师剑折断，林克在空岛觉醒究极手、余料建造与通天术能力。' },
      { chapterOrder: 2, title: '四方异变与贤者同盟', summary: '飞往利特村风暴神殿，漫步鼓隆城地底熔岩，与四贤者签订共鸣契约。' },
      { chapterOrder: 3, title: '白龙巡天与万年悲愿拔剑', summary: '林克跃上高空破云而出的白龙额头，含泪拔出充盈了万年光芒的黄金大师剑。' },
      { chapterOrder: 4, title: '地底深处与黑龙终战', summary: '孤身突入城堡地底魔窟，击溃加侬多夫，在云海之上救下坠落的塞尔达公主。' },
    ],
  },
  {
    sourceId: 'game_02',
    sourceType: 'steam',
    title: '艾尔登法环 (Elden Ring)',
    author: 'FromSoftware / 宫崎英高',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
    category: '黑暗奇幻 / 魂系动作 / 角色扮演',
    mediaType: 'game',
    remoteRating: 9.7,
    tags: ['宫崎英高', '开放世界', '魂系', '交界地'],
    description: '交界地的大黄金树下，褪色者遵循赐福指引跨越雾海，击败半神子嗣，挑战破碎的艾尔登法环，加冕为艾尔登之王。',
    characters: [
      { name: '梅琳娜', roleTitle: '木头 / 引路指头巫女', avatarEmoji: '🔥', description: '提供灵马托雷特与卢恩转换力量的神秘少女，背负着灰灭的命运。' },
      { name: '菈妮 (Ranni)', roleTitle: '月之公主 / 暗月追随者', avatarEmoji: '🌙', description: '舍弃神人肉身的四手魔女，誓要打破无上意志的黄金秩序开启群星时代。' },
      { name: '玛莲妮亚', roleTitle: '米凯拉的锋刃 / 腐败女神', avatarEmoji: '🌸', description: '一生未尝败绩的红发女武神，猩红腐败之力的绽放者。' },
    ],
    outlines: [
      { chapterOrder: 1, title: '宁姆格福的赐福苏醒', summary: '褪色者从求学洞窟走出，迎面看到恢弘壮丽的黄金树与大树守卫。' },
      { chapterOrder: 2, title: '史东薇尔城与满月女王', summary: '斩下葛瑞克的接肢，漫步魔法学院雷亚卢卡利亚，夺得大卢恩。' },
      { chapterOrder: 3, title: '碎星祭典与群星坠落', summary: '红狮子城千人挑战拉塔恩将军，陨石轰击交界地砸出永恒之城入口。' },
      { chapterOrder: 4, title: '王城罗德尔与灰烬之巅', summary: '登临黄金王城与蒙葛特对决，在巨人山顶引燃火种，挑战黄金律法艾尔登之兽。' },
    ],
  },
];

/**
 * 跨源搜索候选作品
 */
export async function searchCatalog(
  keyword: string,
  mediaType?: MediaType,
): Promise<SearchCatalogItem[]> {
  const kw = keyword.trim().toLowerCase();

  // 1. 优先本地预设模糊匹配
  let results = DISCOVER_PRESETS.filter((item) => {
    if (mediaType && item.mediaType !== mediaType) return false;
    if (!kw) return true; // 关键词为空返回热门排行榜
    return (
      item.title.toLowerCase().includes(kw) ||
      item.author.toLowerCase().includes(kw) ||
      item.tags.some((t) => t.toLowerCase().includes(kw)) ||
      (item.isbn && item.isbn.includes(kw))
    );
  });

  // 2. 若本地无匹配且有关键词，尝试轻量网络查询（此处支持 Bangumi open API 搜索）
  if (results.length === 0 && kw) {
    try {
      const netResults = await fetchBangumiSearch(kw, mediaType);
      if (netResults.length > 0) {
        results = netResults;
      }
    } catch {
      // 网络降级静默忽略
    }
  }

  return results;
}

/** 异步请求 Bangumi 搜索接口 */
function fetchBangumiSearch(keyword: string, mediaType?: MediaType): Promise<SearchCatalogItem[]> {
  return new Promise((resolve) => {
    uni.request({
      url: `https://api.bgm.tv/search/subject/${encodeURIComponent(keyword)}?responseGroup=small`,
      method: 'GET',
      timeout: 3000,
      success: (res: any) => {
        if (res.statusCode === 200 && Array.isArray(res.data?.list)) {
          const list = res.data.list.slice(0, 5).map((item: any, idx: number) => ({
            sourceId: `bgm_${item.id}`,
            sourceType: 'bangumi' as const,
            title: item.name_cn || item.name || '未知作品',
            author: item.staff || 'Bangumi 认证企划',
            coverUrl: item.images?.large || item.images?.common || '',
            category: '番剧 / 动漫',
            mediaType: (mediaType || 'anime') as MediaType,
            remoteRating: Number(item.rating?.score) || 8.0,
            tags: ['网络搜源', 'Bangumi'],
            description: item.summary || '暂无详细剧情简介。',
            characters: [
              { name: '主角', roleTitle: '核心角色', avatarEmoji: '👤', description: '作品核心主人公。' },
            ],
            outlines: [
              { chapterOrder: 1, title: '序幕：初逢与启程', summary: '故事开端与世界观铺展。' },
            ],
          }));
          resolve(list);
        } else {
          resolve([]);
        }
      },
      fail: () => resolve([]),
    });
  });
}

/**
 * 微信扫码录入 (识别图书 ISBN 条形码)
 */
export function scanIsbnCode(): Promise<SearchCatalogItem | null> {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType: ['barCode'],
      success: async (res) => {
        const code = (res.result || '').trim();
        if (!code) {
          uni.showToast({ title: '未识别到有效条形码', icon: 'none' });
          resolve(null);
          return;
        }

        uni.showLoading({ title: '正在匹配 ISBN 资料库...' });
        const match = DISCOVER_PRESETS.find((p) => p.isbn === code);
        uni.hideLoading();

        if (match) {
          resolve(match);
        } else {
          // 动态合成一个基于该条形码的基础作品骨架
          resolve({
            sourceId: `isbn_${code}`,
            sourceType: 'manual',
            title: `ISBN 书籍 (${code.slice(-4)})`,
            author: '出版机构认证',
            coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
            category: '图书典藏',
            mediaType: 'book',
            remoteRating: 8.5,
            tags: ['ISBN 录入', code],
            isbn: code,
            description: `通过条形码 ${code} 自动识别入库。`,
            characters: [],
            outlines: [],
          });
        }
      },
      fail: (err) => {
        if (!err.errMsg?.includes('cancel')) {
          uni.showToast({ title: '扫码未成功', icon: 'none' });
        }
        reject(err);
      },
    });
  });
}

/**
 * 检查作品是否已存在于本地馆藏中
 */
export function checkWorkExistsInLibrary(title: string): boolean {
  const currentWorks = loadAllLocalWorks();
  const normalized = title.trim().toLowerCase();
  return currentWorks.some((w) => !w.isDeleted && w.title.trim().toLowerCase() === normalized);
}

/**
 * 一键将搜源结果录入本地典藏库
 */
export function importSearchResultToLibrary(
  item: SearchCatalogItem,
  customStatus: BookStatus = 'reading',
  customRating: number = 9.0,
  customComment: string = '',
): Book {
  const currentWorks = loadAllLocalWorks();
  const maxId = currentWorks.reduce((max, b) => Math.max(max, b.id || 0), 0);

  const newBook: Book = {
    id: maxId + 1,
    title: item.title,
    author: item.author,
    coverUrl: item.coverUrl,
    category: item.category,
    status: customStatus,
    mediaType: item.mediaType,
    rating: customRating,
    tags: item.tags || [],
    shortComment: customComment || item.description.slice(0, 48) + '…',
    review: null,
    startDate: new Date().toISOString().slice(0, 10),
    finishDate: customStatus === 'finished' ? new Date().toISOString().slice(0, 10) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    remoteRating: item.remoteRating,
    description: item.description,
    isDeleted: false,
    deletedAt: null,
    isFavorite: false,
    characters: item.characters || [],
    outlines: item.outlines || [],
  };

  currentWorks.unshift(newBook);
  saveLocalWorks(currentWorks);

  // 自动派生与存储六维心智切片
  const currentMindprints = loadAllLocalMindprints();
  const newMp: Mindprint = deriveMindprint(customRating, newBook.id);
  currentMindprints.unshift(newMp);
  uni.setStorageSync('rt_local_mindprints', currentMindprints);

  return newBook;
}
