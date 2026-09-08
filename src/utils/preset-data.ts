import type { Book, Note, Mindprint } from './models';

export interface CharacterItem {
  id: number;
  bookId: number;
  name: string;
  role: string;
  description: string;
  avatarEmoji?: string;
}

export interface OutlineItem {
  id: number;
  bookId: number;
  title: string;
  summary: string;
  orderIndex: number;
}

export interface AudioTrackItem {
  id: number;
  bookId: number;
  title: string;
  artist: string;
  tag: string;
}

export const PRESET_BOOKS: Book[] = [
  {
    id: 1001,
    title: '小王子',
    author: '圣埃克苏佩里',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/03cd3e02df47b9200cf566c1d4048baf26f504c8.jpg',
    category: '外国文学',
    status: 'finished',
    mediaType: 'book',
    rating: 9.8,
    tags: ['经典', '治愈', '童话', '哲学'],
    shortComment: '正因为你为你的玫瑰花费了时间，这才使你的玫瑰变得如此重要。',
    review: '这是一本写给所有曾经是小孩的大人的童话。它用最纯净的语言，道出了人世间最深刻的真理：爱是驯服与责任，唯有用心才能看清本质。',
    startDate: '2026-03-01',
    finishDate: '2026-03-05',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-05T20:30:00.000Z',
    sourceType: 'douban',
    sourceId: '1084336',
    remoteRating: 9.1,
    description: '遥远小星球上的小王子，因与任性骄傲的玫瑰产生误解而离开星球游历宇宙。在旅途中，他拜访了各色古怪星球的大人，最终来到地球结识了狐狸和飞行员。',
  },
  {
    id: 1002,
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/ee2924296d2ef7a7235b229ca3a0a40039f603f5.jpg',
    category: '拉美魔幻',
    status: 'finished',
    mediaType: 'book',
    rating: 9.9,
    tags: ['魔幻现实', '马尔克斯', '家族史诗', '孤独'],
    shortComment: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。',
    review: '魔幻现实主义的巅峰之作。马孔多小镇百年的兴衰荣辱与布恩迪亚家族七代人的孤独轮回，写尽了拉美大陆乃至全人类命运的悲凉与壮阔。',
    startDate: '2026-01-10',
    finishDate: '2026-02-15',
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-02-15T18:00:00.000Z',
    sourceType: 'douban',
    sourceId: '6082808',
    remoteRating: 9.3,
    description: '讲述布恩迪亚家族七代人在虚构城镇马孔多历经的开荒、繁荣、内战、衰落与毁灭的百年史诗，将神话传说与严酷历史完美交融。',
  },
  {
    id: 1003,
    title: '三体',
    author: '刘慈欣',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/6b431f3e7aef2fd476a11a59449096f20e5c34a4.jpg',
    category: '硬核科幻',
    status: 'finished',
    mediaType: 'book',
    rating: 9.7,
    tags: ['宇宙社会学', '黑暗森林', '刘慈欣', '雨果奖'],
    shortComment: '给岁月以文明，而不是给文明以岁月。消灭人类暴政，世界属于三体！',
    review: '中国科幻文学的丰碑之作。从红岸基地的第一声啼鸣到浩瀚宇宙的黑暗森林法则，展现了宏大宇宙与渺小人类文明的震撼碰撞。',
    startDate: '2026-04-01',
    finishDate: '2026-04-20',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-20T22:00:00.000Z',
    sourceType: 'douban',
    sourceId: '2768378',
    remoteRating: 8.9,
    description: '文化大革命期间向太空发送的和平信号被处于乱纪元的三体文明截获，一场关乎两个文明生死存亡的四百年星际博弈由此拉开序幕。',
  },
  {
    id: 1004,
    title: '新世纪福音战士：终',
    author: '庵野秀明',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/c3c68d569810a1eec76d878ae39f62e8c0096d3e.jpg',
    category: '机战哲思',
    status: 'finished',
    mediaType: 'anime',
    rating: 9.8,
    tags: ['庵野秀明', 'EVA', '意识流', '补完神作'],
    shortComment: '再见了，所有的福音战士。向着没有EVA的真实世界迈出脚步。',
    review: '历经二十六年的伟大告别。庵野秀明在银幕上完成了对自身与一代人精神创伤的终极和解与救赎，从此我们真正告别了青春。',
    startDate: '2026-05-01',
    finishDate: '2026-05-02',
    createdAt: '2026-05-01T20:00:00.000Z',
    updatedAt: '2026-05-02T01:30:00.000Z',
    sourceType: 'bangumi',
    sourceId: '1424',
    remoteRating: 8.6,
    description: 'WILLE在近第三次冲击后的赤红荒原上展开反攻，碇真嗣在第三村经历创伤修复，最终直面父亲碇源堂，在负宇宙中开启弑神与心智补完。',
  },
  {
    id: 1005,
    title: '葬送的芙莉莲',
    author: '斋藤圭一郎 / 山田钟人',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/b4946cac2cbb8524541d500854e71e3d1cae6484.png',
    category: '奇幻旅程',
    status: 'reading',
    mediaType: 'anime',
    rating: 9.6,
    tags: ['时间跨度', '精灵', '细腻情感', '后日谈'],
    shortComment: '所谓冒险，就是当你蓦然回首时，那段微不足道的旅程早已照亮了整个人生。',
    review: '一部讲述勇者离去之后、长寿精灵重新理解人类与时间的温柔诗篇。每一次驻足、每一道阳光，都承载着关于回忆的永恒重力。',
    startDate: '2026-08-10',
    finishDate: null,
    createdAt: '2026-08-10T14:00:00.000Z',
    updatedAt: '2026-08-25T11:00:00.000Z',
    sourceType: 'bangumi',
    sourceId: '400602',
    remoteRating: 8.9,
    description: '打倒魔王的勇者小队解散后，寿命长达千年的精灵魔法使芙莉莲，在勇者辛美尔逝世后，踏上了前往灵魂长眠之地的朝圣之旅。',
  },
  {
    id: 1006,
    title: '奥本海默',
    author: '克里斯托弗·诺兰',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg',
    category: '传记剧情',
    status: 'finished',
    mediaType: 'movie',
    rating: 9.5,
    tags: ['诺兰', '原子弹之父', '普罗米修斯', '核裂变'],
    shortComment: '我现在成了死神，世界的毁灭者。当我们按下引爆按钮，链式反应或许从未停止。',
    review: '诺兰对现代普罗米修斯悲剧史诗的巅峰诠释。交错的彩色与黑白双时间线中，展现了科学天才在政治博弈与人性深渊间的残酷撕裂。',
    startDate: '2026-06-15',
    finishDate: '2026-06-15',
    createdAt: '2026-06-15T19:00:00.000Z',
    updatedAt: '2026-06-15T22:30:00.000Z',
    sourceType: 'douban',
    sourceId: '35593344',
    remoteRating: 8.8,
    description: '讲述美国理论物理学家罗伯特·奥本海默领导曼哈顿计划研发原子弹，并在二战后深陷麦卡锡主义政治迫害与道德拷问的风暴中心。',
  },
  {
    id: 1007,
    title: '星际穿越',
    author: '克里斯托弗·诺兰',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/14ccd8457a9b7351e7be1d87db2719791108ddc0.png',
    category: '科幻史诗',
    status: 'finished',
    mediaType: 'movie',
    rating: 9.8,
    tags: ['硬科幻', '黑洞', '高维空间', '父女之爱'],
    shortComment: '爱是一种力量，能超越时空维度。不要温和地走进那个良夜，怒斥光明的消逝。',
    review: '宇宙尺度的硬核浪漫。当物理学方程推导到尽头，支撑人类跨越黑洞奇点的唯一超光速媒介，是跨越引力与时空的爱。',
    startDate: '2026-02-20',
    finishDate: '2026-02-20',
    createdAt: '2026-02-20T20:00:00.000Z',
    updatedAt: '2026-02-20T23:15:00.000Z',
    sourceType: 'douban',
    sourceId: '1889243',
    remoteRating: 9.4,
    description: '地球生态濒临崩溃之际，一队探险家利用虫洞穿梭星际寻找人类新家园，宇航员库珀穿梭黑洞卡冈图雅并在五维超立方体中与女儿通信。',
  },
  {
    id: 1008,
    title: '塞尔达传说：王国之泪',
    author: '任天堂 / 藤林秀麿',
    coverUrl: 'https://media.steampowered.com/steam/apps/1057090/library_600x900.jpg',
    category: '开放世界',
    status: 'finished',
    mediaType: 'game',
    rating: 9.9,
    tags: ['任天堂', '余料建造', '天空与地底', '神作'],
    shortComment: '林克，请务必找到我。纵身跃入万米天际的那一刻，海拉鲁大陆再次苏醒。',
    review: '电子游戏交互设计的奇迹。物理引擎与化学反应的极致纵深，创造了近乎无边界的探索沉浸与自由构建感。',
    startDate: '2026-01-01',
    finishDate: '2026-03-28',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-03-28T23:50:00.000Z',
    sourceType: 'bangumi',
    sourceId: '280837',
    remoteRating: 9.5,
    description: '海拉鲁城堡地底的瘴气喷发，塞尔达公主穿越时空，林克获得究极手与余料建造能力，在天空群岛、广袤陆地与漆黑地底三层世界展开壮丽冒险。',
  },
  {
    id: 1009,
    title: '艾尔登法环',
    author: 'FromSoftware / 宫崎英高',
    coverUrl: 'https://media.steampowered.com/steam/apps/1245620/library_600x900.jpg',
    category: '魂系奇幻',
    status: 'finished',
    mediaType: 'game',
    rating: 9.7,
    tags: ['宫崎英高', '交界地', '黄金律法', 'GOTY'],
    shortComment: '落叶捎来讯息，在雾的彼端，我们的故乡交界地。褪色者啊，成为艾尔登之王吧。',
    review: '魂系叙事与宏大开放世界的黄金交融。黄金树下的壮丽废墟、残忍又崇高的半神神话，构筑了无可比拟的探索震撼。',
    startDate: '2026-03-10',
    finishDate: '2026-05-18',
    createdAt: '2026-03-10T11:00:00.000Z',
    updatedAt: '2026-05-18T19:20:00.000Z',
    sourceType: 'steam',
    sourceId: '1245620',
    remoteRating: 9.4,
    description: '艾尔登法环破碎，无上意志离去，散落各地的褪色者响应赐福指引回到交界地，击败掌握大卢恩的半神英雄，追逐成王之路。',
  },
  {
    id: 1010,
    title: 'One Last Kiss',
    author: '宇多田光',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
    category: '电子流行',
    status: 'finished',
    mediaType: 'music',
    rating: 9.7,
    tags: ['宇多田光', 'EVA终', '神级OST', '单曲循环'],
    shortComment: '忘られぬ人（难以忘怀的人）—— 哪怕这是最后的吻，也足以烙印漫长的一生。',
    review: '宇多田光用近乎叹息的合成器声浪，为长达四分之一个世纪的福音战士终曲画上最温柔的句点。副歌一起，泪流满面。',
    startDate: '2026-05-02',
    finishDate: '2026-05-02',
    createdAt: '2026-05-02T02:00:00.000Z',
    updatedAt: '2026-05-02T02:30:00.000Z',
    sourceType: 'bangumi',
    sourceId: '329906',
    remoteRating: 9.2,
    description: '《新世纪福音战士新剧场版：终》主题曲EP，宇多田光携手A.G.Cook编曲制作，融合贝斯节奏与梦幻合成器流行。',
  },
];

export const PRESET_NOTES: Note[] = [
  { id: 2001, bookId: 1001, noteType: 'quote', content: '正是你花费在玫瑰上的时间，才使得你的玫瑰变得如此重要。', page: '第21章', chapter: '驯服的秘密', createdAt: '2026-03-02 14:20', updatedAt: '2026-03-02 14:20' },
  { id: 2002, bookId: 1001, noteType: 'note', content: '大人喜欢数字，当你告诉他们你结识了一个新朋友，他们从不问最核心的特质，而是问他父亲赚多少钱。', page: '第4章', chapter: 'B612星球', createdAt: '2026-03-04 19:40', updatedAt: '2026-03-04 19:40' },
  { id: 2003, bookId: 1002, noteType: 'quote', content: '家族的第一个人被捆在树上，最后一个人正被蚂蚁吃掉。', page: '卷终', chapter: '羊皮卷破译', createdAt: '2026-02-14 23:10', updatedAt: '2026-02-14 23:10' },
  { id: 2004, bookId: 1003, noteType: 'quote', content: '毁灭你，与你有何相干？整个宇宙就是一座黑暗森林，每个文明都是带枪的猎人。', page: '下篇', chapter: '黑暗森林法则', createdAt: '2026-04-18 21:05', updatedAt: '2026-04-18 21:05' },
  { id: 2005, bookId: 1004, noteType: 'note', content: '真嗣在第三村洗衣服、插秧、学会对人道谢，这一段田园日常的沉淀，是全片最动人的心智治愈环节。', page: '78分', chapter: '第三村生活', createdAt: '2026-05-01 22:30', updatedAt: '2026-05-01 22:30' },
];

export const PRESET_CHARACTERS: Record<number, CharacterItem[]> = {
  1001: [
    { id: 3001, bookId: 1001, name: '小王子', role: '主角 / 纯真化身', description: '来自B612小行星，拥有一头金黄头发，对世界充满真挚的好奇与赤诚。', avatarEmoji: '👑' },
    { id: 3002, bookId: 1001, name: '玫瑰花', role: '启蒙与羁绊', description: '骄傲、任性又深情，四根小刺是她抵抗世界的全部武器。', avatarEmoji: '🌹' },
    { id: 3003, bookId: 1001, name: '狐狸', role: '导师 / 哲思者', description: '教会小王子什么是“驯服”与“仪式感”，点破了爱的本质。', avatarEmoji: '🦊' },
  ],
  1004: [
    { id: 3010, bookId: 1004, name: '碇真嗣', role: '主角 / 第三人称', description: '经历无数次崩溃与逃避，最终选择面对父亲与现实的初号机驾驶员。', avatarEmoji: '🎧' },
    { id: 3011, bookId: 1004, name: '绫波丽 (假名)', role: '克隆体 / 觉醒灵魂', description: '在第三村体验了人类的情感、农作与道别，拥有最纯粹的温柔。', avatarEmoji: '🌾' },
    { id: 3012, bookId: 1004, name: '真希波·玛丽', role: '破局者 / 现实引路人', description: '不受旧EVA诅咒束缚的自由之风，最后牵起真嗣奔向真实站台。', avatarEmoji: '👓' },
  ],
};

export const PRESET_OUTLINES: Record<number, OutlineItem[]> = {
  1001: [
    { id: 4001, bookId: 1001, orderIndex: 1, title: '撒哈拉的坠机相遇', summary: '飞行员因故障降落沙漠，偶遇请求画一只绵羊的神秘金发小男孩。' },
    { id: 4002, bookId: 1001, orderIndex: 2, title: 'B612星球与傲娇玫瑰', summary: '小王子讲述他在自己星球清理猴面包树嫩苗与照顾独特玫瑰的过往。' },
    { id: 4003, bookId: 1001, orderIndex: 3, title: '六颗古怪的大人星球', summary: '拜访国王、虚荣者、酒鬼、实业家、点灯人与地理学家的荒诞奇遇。' },
    { id: 4004, bookId: 1001, orderIndex: 4, title: '狐狸的秘密与蛇的告别', summary: '领悟驯服之真谛，最终借助毒蛇之吻卸下沉重躯壳重返玫瑰身边。' },
  ],
  1004: [
    { id: 4010, bookId: 1004, orderIndex: 1, title: '巴黎旧市街绝域恢复', summary: 'WILLE战舰在塞纳河畔利用反L结界净化红色大地并回收零号机备用件。' },
    { id: 4011, bookId: 1004, orderIndex: 2, title: '第三村的宁静农耕', summary: '真嗣在旧同窗避难所经历失语、沉淀与心灵觉醒，告别黑丽。' },
    { id: 4012, bookId: 1004, orderIndex: 3, title: '南极决战与负宇宙父子', summary: '进军盖乌斯之枪发生地，在特摄剧摄影棚般的记忆舞台与父亲碇源堂对谈。' },
    { id: 4013, bookId: 1004, orderIndex: 4, title: 'Neon Genesis 新世纪', summary: '重写世界规则，消除所有EVA，牵手真希波奔向生机盎然的现实城市。' },
  ],
};

export const PRESET_TRACKS: Record<number, AudioTrackItem[]> = {
  1004: [
    { id: 5001, bookId: 1004, title: 'One Last Kiss', artist: '宇多田光', tag: '主题终曲 · 5:12' },
    { id: 5002, bookId: 1004, title: 'Beautiful World (Da Capo Version)', artist: '宇多田光', tag: '纪念重制 · 5:58' },
    { id: 5003, bookId: 1004, title: 'VOYAGER ~日付のない墓標~', artist: '林原めぐみ', tag: '告别插曲 · 4:48' },
  ],
  1001: [
    { id: 5010, bookId: 1001, title: 'Le Petit Prince', artist: 'Richard Harvey', tag: '原声随行 · 3:24' },
    { id: 5011, bookId: 1001, title: 'Suis-moi', artist: 'Camille / Hans Zimmer', tag: '心流漫步 · 3:27' },
  ],
};

export const PRESET_MINDPRINTS: Mindprint[] = [
  { bookId: 1001, depthScore: 9.6, artistryScore: 9.8, emotionScore: 9.9, logicScore: 8.8, difficultyScore: 3.5, healingScore: 9.9, updatedAt: '2026-03-05T20:30:00.000Z' },
  { bookId: 1002, depthScore: 9.9, artistryScore: 9.9, emotionScore: 9.5, logicScore: 9.2, difficultyScore: 8.9, healingScore: 7.2, updatedAt: '2026-02-15T18:00:00.000Z' },
  { bookId: 1003, depthScore: 9.8, artistryScore: 9.0, emotionScore: 8.5, logicScore: 9.9, difficultyScore: 7.8, healingScore: 5.5, updatedAt: '2026-04-20T22:00:00.000Z' },
  { bookId: 1004, depthScore: 9.7, artistryScore: 9.9, emotionScore: 9.8, logicScore: 8.9, difficultyScore: 8.5, healingScore: 9.2, updatedAt: '2026-05-02T01:30:00.000Z' },
  { bookId: 1005, depthScore: 9.2, artistryScore: 9.6, emotionScore: 9.8, logicScore: 8.9, difficultyScore: 4.2, healingScore: 9.9, updatedAt: '2026-08-25T11:00:00.000Z' },
  { bookId: 1006, depthScore: 9.7, artistryScore: 9.5, emotionScore: 9.1, logicScore: 9.6, difficultyScore: 7.5, healingScore: 6.0, updatedAt: '2026-06-15T22:30:00.000Z' },
  { bookId: 1007, depthScore: 9.8, artistryScore: 9.7, emotionScore: 9.9, logicScore: 9.8, difficultyScore: 7.0, healingScore: 8.5, updatedAt: '2026-02-20T23:15:00.000Z' },
  { bookId: 1008, depthScore: 9.5, artistryScore: 9.9, emotionScore: 9.6, logicScore: 9.7, difficultyScore: 6.8, healingScore: 9.4, updatedAt: '2026-03-28T23:50:00.000Z' },
  { bookId: 1009, depthScore: 9.8, artistryScore: 9.9, emotionScore: 9.2, logicScore: 9.5, difficultyScore: 9.5, healingScore: 6.5, updatedAt: '2026-05-18T19:20:00.000Z' },
  { bookId: 1010, depthScore: 9.0, artistryScore: 9.8, emotionScore: 9.9, logicScore: 8.8, difficultyScore: 3.0, healingScore: 9.8, updatedAt: '2026-05-02T02:30:00.000Z' },
];
