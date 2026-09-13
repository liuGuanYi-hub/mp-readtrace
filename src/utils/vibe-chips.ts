import type { MediaType, Mindprint } from './models';

export interface VibeChip {
  tag: string;
  label: string;
  emoji: string;
  depthDelta: number;
  artistryDelta: number;
  emotionDelta: number;
  logicDelta: number;
  difficultyDelta: number;
  healingDelta: number;
}

const MEDIA_VIBE_CHIPS: Record<MediaType, VibeChip[]> = {
  book: [
    { tag: '#硬核烧脑', label: '硬核烧脑', emoji: '🧠', depthDelta: 1.4, artistryDelta: 0.2, emotionDelta: 0.0, logicDelta: 1.6, difficultyDelta: 1.6, healingDelta: -0.6 },
    { tag: '#枕边治愈', label: '枕边治愈', emoji: '🌿', depthDelta: -0.2, artistryDelta: 0.6, emotionDelta: 1.0, logicDelta: -0.4, difficultyDelta: -1.6, healingDelta: 1.8 },
    { tag: '#字字珠玑', label: '字字珠玑', emoji: '🖋️', depthDelta: 1.0, artistryDelta: 1.8, emotionDelta: 0.5, logicDelta: 0.6, difficultyDelta: 0.4, healingDelta: 0.2 },
    { tag: '#直击灵魂', label: '直击灵魂', emoji: '⚡', depthDelta: 1.6, artistryDelta: 0.8, emotionDelta: 1.6, logicDelta: 0.4, difficultyDelta: 0.6, healingDelta: 0.4 },
    { tag: '#荡气回肠', label: '荡气回肠', emoji: '📜', depthDelta: 1.0, artistryDelta: 1.2, emotionDelta: 1.6, logicDelta: 0.8, difficultyDelta: 0.5, healingDelta: 0.3 },
    { tag: '#轻松下饭', label: '轻松下饭', emoji: '🍵', depthDelta: -0.8, artistryDelta: 0.0, emotionDelta: 0.4, logicDelta: -0.6, difficultyDelta: -2.0, healingDelta: 1.4 },
  ],
  movie: [
    { tag: '#后劲极大', label: '后劲极大', emoji: '🌊', depthDelta: 1.2, artistryDelta: 0.8, emotionDelta: 1.8, logicDelta: 0.4, difficultyDelta: 0.4, healingDelta: -0.6 },
    { tag: '#神级反转', label: '神级反转', emoji: '🎭', depthDelta: 0.8, artistryDelta: 0.6, emotionDelta: 0.8, logicDelta: 1.8, difficultyDelta: 0.5, healingDelta: -0.2 },
    { tag: '#视觉盛宴', label: '视觉盛宴', emoji: '🌌', depthDelta: 0.4, artistryDelta: 2.0, emotionDelta: 0.8, logicDelta: 0.2, difficultyDelta: -0.2, healingDelta: 0.5 },
    { tag: '#催泪暴击', label: '催泪暴击', emoji: '💧', depthDelta: 0.6, artistryDelta: 0.6, emotionDelta: 2.0, logicDelta: -0.2, difficultyDelta: 0.0, healingDelta: 0.6 },
    { tag: '#哲学隐喻', label: '哲学隐喻', emoji: '👁️', depthDelta: 2.0, artistryDelta: 1.2, emotionDelta: 0.6, logicDelta: 1.2, difficultyDelta: 1.8, healingDelta: -0.4 },
    { tag: '#全程高能', label: '全程高能', emoji: '⚡', depthDelta: 0.2, artistryDelta: 0.8, emotionDelta: 1.4, logicDelta: 1.0, difficultyDelta: -0.4, healingDelta: 0.4 },
  ],
  anime: [
    { tag: '#致郁神作', label: '致郁神作', emoji: '🥀', depthDelta: 1.5, artistryDelta: 1.0, emotionDelta: 1.8, logicDelta: 0.6, difficultyDelta: 0.8, healingDelta: -2.0 },
    { tag: '#热血燃爆', label: '热血燃爆', emoji: '🔥', depthDelta: 0.4, artistryDelta: 0.8, emotionDelta: 2.0, logicDelta: 0.2, difficultyDelta: -0.6, healingDelta: 1.2 },
    { tag: '#治愈日常', label: '治愈日常', emoji: '🌸', depthDelta: -0.4, artistryDelta: 0.8, emotionDelta: 1.0, logicDelta: -0.5, difficultyDelta: -1.8, healingDelta: 2.0 },
    { tag: '#作画封神', label: '作画封神', emoji: '🎨', depthDelta: 0.4, artistryDelta: 2.0, emotionDelta: 1.0, logicDelta: 0.2, difficultyDelta: 0.0, healingDelta: 0.6 },
    { tag: '#神展开', label: '神展开', emoji: '🌀', depthDelta: 1.0, artistryDelta: 0.6, emotionDelta: 1.2, logicDelta: 1.8, difficultyDelta: 0.6, healingDelta: -0.4 },
    { tag: '#青春共鸣', label: '青春共鸣', emoji: '🚲', depthDelta: 0.6, artistryDelta: 0.8, emotionDelta: 1.8, logicDelta: 0.2, difficultyDelta: -0.4, healingDelta: 1.4 },
  ],
  game: [
    { tag: '#电子阳痿解药', label: '电子阳痿解药', emoji: '💊', depthDelta: 0.8, artistryDelta: 1.2, emotionDelta: 1.8, logicDelta: 1.0, difficultyDelta: -0.6, healingDelta: 1.6 },
    { tag: '#神作跪拜', label: '神作跪拜', emoji: '👑', depthDelta: 1.8, artistryDelta: 1.8, emotionDelta: 1.6, logicDelta: 1.6, difficultyDelta: 0.8, healingDelta: 0.5 },
    { tag: '#硬核受苦', label: '硬核受苦', emoji: '⚔️', depthDelta: 0.8, artistryDelta: 0.8, emotionDelta: 1.0, logicDelta: 1.4, difficultyDelta: 2.6, healingDelta: -1.4 },
    { tag: '#叙事天花板', label: '叙事天花板', emoji: '📖', depthDelta: 1.6, artistryDelta: 1.6, emotionDelta: 1.8, logicDelta: 1.2, difficultyDelta: 0.4, healingDelta: 0.4 },
    { tag: '#沉浸感拉满', label: '沉浸感拉满', emoji: '🎧', depthDelta: 0.6, artistryDelta: 1.6, emotionDelta: 1.6, logicDelta: 1.0, difficultyDelta: 0.2, healingDelta: 0.8 },
    { tag: '#爽快解压', label: '爽快解压', emoji: '💥', depthDelta: -0.6, artistryDelta: 0.4, emotionDelta: 1.2, logicDelta: -0.4, difficultyDelta: -2.0, healingDelta: 1.6 },
  ],
  music: [
    { tag: '#颅内共潮', label: '颅内共潮', emoji: '🌊', depthDelta: 0.6, artistryDelta: 2.0, emotionDelta: 1.8, logicDelta: 0.2, difficultyDelta: 0.2, healingDelta: 0.8 },
    { tag: '#深夜emo', label: '深夜emo', emoji: '🌙', depthDelta: 0.8, artistryDelta: 1.2, emotionDelta: 2.0, logicDelta: -0.2, difficultyDelta: 0.4, healingDelta: -0.8 },
    { tag: '#温柔抚慰', label: '温柔抚慰', emoji: '☕', depthDelta: 0.2, artistryDelta: 0.8, emotionDelta: 1.4, logicDelta: -0.2, difficultyDelta: -1.6, healingDelta: 2.0 },
    { tag: '#单曲循环', label: '单曲循环', emoji: '🔁', depthDelta: 0.4, artistryDelta: 1.6, emotionDelta: 1.6, logicDelta: 0.4, difficultyDelta: -0.4, healingDelta: 1.2 },
    { tag: '#先锋实验', label: '先锋实验', emoji: '🧪', depthDelta: 1.2, artistryDelta: 2.0, emotionDelta: 0.6, logicDelta: 1.4, difficultyDelta: 1.8, healingDelta: -0.4 },
    { tag: '#热血鼓点', label: '热血鼓点', emoji: '🥁', depthDelta: 0.2, artistryDelta: 0.8, emotionDelta: 1.8, logicDelta: 0.4, difficultyDelta: -0.6, healingDelta: 1.4 },
  ],
};

export function getVibeChips(mediaType: MediaType): VibeChip[] {
  return MEDIA_VIBE_CHIPS[mediaType] || MEDIA_VIBE_CHIPS.book;
}

export function normalizeTag(rawTag: string): string {
  return (rawTag || '').trim().replace(/^#/, '').trim();
}

export function findChip(rawTag: string, mediaType?: MediaType): VibeChip | undefined {
  const norm = normalizeTag(rawTag);
  if (mediaType && MEDIA_VIBE_CHIPS[mediaType]) {
    const found = MEDIA_VIBE_CHIPS[mediaType].find((c) => normalizeTag(c.tag) === norm);
    if (found) return found;
  }
  for (const list of Object.values(MEDIA_VIBE_CHIPS)) {
    const found = list.find((c) => normalizeTag(c.tag) === norm);
    if (found) return found;
  }
  return undefined;
}

export function applyChipStep(
  current: Mindprint,
  chipTag: string,
  isAdd: boolean,
  mediaType: MediaType
): Mindprint {
  const chip = findChip(chipTag, mediaType);
  if (!chip) return current;
  const sign = isAdd ? 1.0 : -1.0;

  const clamp = (v: number) => Math.round(Math.min(10.0, Math.max(1.0, v)) * 10) / 10;

  return {
    ...current,
    depthScore: clamp(current.depthScore + chip.depthDelta * sign),
    artistryScore: clamp(current.artistryScore + chip.artistryDelta * sign),
    emotionScore: clamp(current.emotionScore + chip.emotionDelta * sign),
    logicScore: clamp(current.logicScore + chip.logicDelta * sign),
    difficultyScore: clamp(current.difficultyScore + chip.difficultyDelta * sign),
    healingScore: clamp(current.healingScore + chip.healingDelta * sign),
    updatedAt: new Date().toISOString(),
  };
}
