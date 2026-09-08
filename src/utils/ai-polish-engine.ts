/**
 * 🖋️ P25 文心雕龙：AI 读后感大师润色与金句提炼工坊
 *
 * 对标 Android 原生：
 * - ThoughtPolisherEngine.kt (双轨推导引擎与金句清洗管线)
 * - dialog_thought_polisher_bottom_sheet.xml (文心雕龙交互弹窗)
 *
 * 核心特性：
 * 1. 5 大经典文风流派：典雅哲思、犀利艺评、私享手记、物哀余韵、治愈纯真
 * 2. 双轨驱动：已配置 DeepSeek API Key 时调用大模型，未配置或离线时 50ms 无缝触发离线经典修辞推导母题库
 * 3. 严格萃取 <= 15 字灵魂高光金句，清洗 Markdown 与多余标点，完美适配藏书票火漆与海报票根
 * 4. 打字机逐字输出动画 (Typewriter Streaming)
 */

import type { MediaType } from './models';

export type PolishStyle = 'classical' | 'critique' | 'journal' | 'mono' | 'fairy';

export interface PolishStyleOption {
  id: PolishStyle;
  name: string;
  emoji: string;
  desc: string;
  tagline: string;
}

export const POLISH_STYLES: PolishStyleOption[] = [
  {
    id: 'classical',
    name: '典雅哲思',
    emoji: '🌿',
    desc: '文辞温润，含蓄深邃，善用形而上哲学与自然隐喻。如木心、黑塞笔调。',
    tagline: '形而上凝眸 · 木心黑塞质感',
  },
  {
    id: 'critique',
    name: '犀利艺评',
    emoji: '⚡',
    desc: '冷峻解构，刺穿消费主义与叙事套路，字句如锋刃剖析时代症候。',
    tagline: '解构叙事套路 · 刺穿时代精神',
  },
  {
    id: 'journal',
    name: '私享手记',
    emoji: '🕊️',
    desc: '温存低语，私密共振，记录灵魂在深夜被文字轻柔接住的真实心悸。',
    tagline: '私密温存低语 · 深夜心灵震颤',
  },
  {
    id: 'mono',
    name: '物哀余韵',
    emoji: '🌸',
    desc: '草木枯荣，流云易逝，在无常造化中凝视不可挽回的脆弱与至美。',
    tagline: '凝视浮生瞬息 · 川端康成物哀',
  },
  {
    id: 'fairy',
    name: '治愈纯真',
    emoji: '🎈',
    desc: '纯粹澄澈，不染机心，如小王子在荒原与星夜守望一朵会咳嗽的玫瑰。',
    tagline: '不染机心纯净 · 守望荒原星火',
  },
];

export interface PolishResult {
  polishedText: string;
  goldenQuote: string;
  style: PolishStyle;
  source: 'remote_api' | 'offline_motif';
}

const AI_API_KEY_STORAGE = 'readtrace_deepseek_api_key';
const AI_API_URL_STORAGE = 'readtrace_deepseek_api_url';

export function getAiApiKey(): string {
  try {
    return uni.getStorageSync(AI_API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setAiApiKey(key: string): void {
  try {
    uni.setStorageSync(AI_API_KEY_STORAGE, key.trim());
  } catch (e) {
    console.error('保存 API Key 失败', e);
  }
}

export function getAiApiUrl(): string {
  try {
    return uni.getStorageSync(AI_API_URL_STORAGE) || 'https://api.deepseek.com/chat/completions';
  } catch {
    return 'https://api.deepseek.com/chat/completions';
  }
}

export function setAiApiUrl(url: string): void {
  try {
    uni.setStorageSync(AI_API_URL_STORAGE, url.trim());
  } catch (e) {
    console.error('保存 API URL 失败', e);
  }
}

/**
 * 严格清洗金句，限制在 15 汉字以内，剥离外围引号与收尾标点
 */
export function sanitizeGoldenQuote(quote: string): string {
  if (!quote) return '在时光里打捞微光';
  let clean = quote
    .replace(/^["'“‘《\s]+|["'”’》\s]+$/g, '')
    .replace(/[，。！？、；：,.!?;:]+$/g, '')
    .trim();

  // 若仍有换行取第一句
  if (clean.includes('\n')) {
    clean = clean.split('\n')[0].trim();
  }

  // 严格截断 <= 15 字
  if (clean.length > 15) {
    clean = clean.slice(0, 15);
    clean = clean.replace(/[，。！？、；：,.!?;:]+$/g, '');
  }
  return clean || '在时光深处凝眸';
}

// ── 🏛️ 离线经典修辞推导母题库 ──

interface MotifSet {
  paragraphs: string[];
  quotes: string[];
}

const MOTIF_DATABASE: Record<PolishStyle, Record<string, MotifSet>> = {
  classical: {
    book: {
      paragraphs: [
        '掩卷沉思，文字如静水流深，在纸页翻折的清脆里拂去尘世喧嚣。作者并不急于给出确凿的答案，而是以近乎宗教般的克制，将生命的宏大与荒芜徐徐铺陈。那些未经修饰的哲思片语，宛如暗夜里微弱却执拗的星火，照亮了灵魂最深处的虚无。我们在此处所遭遇的，不仅是一部著作，更是与自身永恒孤独的深沉和解。',
        '书页之间的白昼与长夜交错，像是一场漫长的形而上独白。在物欲横流的时代，这样的文本以其冷冽的古典严谨，重新丈量了思想的高度与温度。它让人意识到，阅读并非为了攫取功利答案，而是为了学会在不可逆的岁月中，保持一种有尊严的凝视。',
      ],
      quotes: ['在虚无的浪潮里打捞微光', '静水流深处，听见灵魂独白', '万物皆有裂痕，那是光照处', '穿透岁月的有尊严凝视'],
    },
    movie: {
      paragraphs: [
        '光影在视网膜上褪去，胶片的颗粒感却在心底烙下不可磨灭的纹理。镜头调度以其沉静克制的美学，将时间的重量化作银幕上的明暗喘息。故事终会散场，但在黑暗中与千万个孤独灵魂共同屏息的瞬间，让短暂的生命体验获得了超越物理维度的辽阔延展。',
      ],
      quotes: ['光影散场，时间有了重量', '在两小时的黑夜里重获新生', '银幕明暗处，灵魂轻颤'],
    },
    default: {
      paragraphs: [
        '精神的跋涉在此刻沉淀为温润的心印。这不仅仅是一次感官的游历，更是一场向内探寻的庄严仪式。在浮躁与速朽的潮流中，它以近乎执拗的美学坚持，守住了心智殿堂里最后一方洁净的火塘。所有的困惑并未消弭，却在沉思中拥有了从容立足的根系。',
      ],
      quotes: ['守住心智殿堂最后火塘', '向内探寻，与孤独深沉和解', '在浮光掠影里构筑方舟'],
    },
  },
  critique: {
    book: {
      paragraphs: [
        '作者毫不留情地撕碎了当代叙事中廉价的温情滤镜。文字如同手术刀般精准而冰冷，剖开社会机理与人性深处隐匿的脓疮。它拒绝提供廉价的救赎与虚假的拥抱，而是将残酷的荒诞现实赤裸裸地置于强光之下。这种近乎冒犯的清醒，恰是麻木时代最急需的解毒剂。',
      ],
      quotes: ['刺穿虚妄叙事的冷峻锋刃', '撕碎温情，强光逼视真实', '清醒是对平庸最大的叛逆'],
    },
    default: {
      paragraphs: [
        '这是一次对既定规则与套路的尖锐解构。作品拒绝平庸的抚慰，以犀利的叙事语法瓦解了被消费主义驯化的审美惰性。在看似激烈的对抗之下，是对时代精神症候最决绝的诊断与叩问。只有敢于直面真实的残缺，思想才能从虚妄的温床中破土而出。',
      ],
      quotes: ['冷峻解构，刺穿命运齿轮', '拒绝被驯化的审美叛逆', '以锋刃笔触叩问时代精神'],
    },
  },
  journal: {
    default: {
      paragraphs: [
        '夜深人静时读完最后一笔，胸口微微发紧，仿佛有人在最深处的房间轻轻敲了敲门。现实里那些无人可诉的委屈、迷茫与微小欢喜，全都在这里被轻柔地认出并妥帖安放。我知道明天太阳升起时，生活依旧庞大而琐碎，但今夜，它在无边暗色中真切地接住了我。',
        '合上它的那一刻，窗外有微风吹过树梢。突然很想坐着发一会儿呆。很多未曾言说的情绪，被作者以那样恰到好处的句子写了出来，像是一杯温热的红茶，无声地暖透了疲惫的指尖。精神的居所很小，但今夜足够安稳。',
      ],
      quotes: ['它在夜深处轻轻接住了我', '无人知晓的隐秘被妥帖认出', '窗外风吹过，指尖留有余温', '精神的偏安一隅，静穆安稳'],
    },
  },
  mono: {
    default: {
      paragraphs: [
        '落樱如雪，流水浮槎，天地间最动人的美，往往带着不可挽回的凋零与脆弱。作者以细腻入微的笔触，捕捉着光阴流转中转瞬即逝的幽微心境。无需多言壮阔，一叶落而知天下秋的怅惘，早已将生命无常的叹惋渲染到了极致。在哀伤与至美交织的空芒里，世界静穆如初。',
      ],
      quotes: ['在凋零里凝视不可挽回的美', '一叶飘零，知人间万般无常', '浮生如梦，瞬息即是永恒', '物哀微芒，抚慰尘世离合'],
    },
  },
  fairy: {
    default: {
      paragraphs: [
        '如果世界太吵闹，就躲进这片纯净的云朵里吧。没有复杂的算计与沉重的说教，只有澄澈透明的眼神和守望星空的初心。像是在漫长的荒漠跋涉后，突然喝到了一口清冽甘甜的井水。它提醒我们：所有的大人都曾经是小孩，虽然，只有少数人记得。',
      ],
      quotes: ['守望属于自己的那朵玫瑰', '所有大人都曾是纯真小孩', '眼里有星光，荒原亦生花', '在澄澈星空下做个好梦'],
    },
  },
};

/**
 * 离线启发式推导
 */
function generateOfflinePolish(
  bookTitle: string,
  mediaType: string,
  draft: string,
  style: PolishStyle
): { polishedText: string; goldenQuote: string } {
  const styleSet = MOTIF_DATABASE[style] || MOTIF_DATABASE.classical;
  const mediaSet = styleSet[mediaType] || styleSet.default;

  // 选定母题段落与金句
  const baseParagraph = mediaSet.paragraphs[Math.floor(Math.random() * mediaSet.paragraphs.length)];
  const baseQuote = mediaSet.quotes[Math.floor(Math.random() * mediaSet.quotes.length)];

  let polishedText = '';
  let goldenQuote = baseQuote;

  if (draft && draft.trim().length > 0) {
    const cleanDraft = draft.trim().replace(/[。！!？?]+$/, '');
    // 融合用户自己的感悟大白话
    if (style === 'classical') {
      polishedText = `「${cleanDraft}」——这句初见朴素的感触，恰如其分地点破了《${bookTitle}》深层的内核气象。${baseParagraph}`;
    } else if (style === 'critique') {
      polishedText = `正如所言「${cleanDraft}」，《${bookTitle}》在此处完成了对既定叙事套路的精准暴击。${baseParagraph}`;
    } else if (style === 'journal') {
      polishedText = `记录下此刻的心绪：「${cleanDraft}」。在与《${bookTitle}》对视的时光里，${baseParagraph}`;
    } else if (style === 'mono') {
      polishedText = `「${cleanDraft}」，字句间流淌着未被抚平的心弦。凝视《${bookTitle}》，${baseParagraph}`;
    } else {
      polishedText = `「${cleanDraft}」！在《${bookTitle}》构建的这片天地里，${baseParagraph}`;
    }

    // 从用户草稿提炼金句，如果草稿短且有力则提取，否则用母题金句
    if (cleanDraft.length <= 15 && cleanDraft.length >= 4) {
      goldenQuote = sanitizeGoldenQuote(cleanDraft);
    }
  } else {
    polishedText = `沉浸于《${bookTitle}》的精神世界，${baseParagraph}`;
  }

  return {
    polishedText,
    goldenQuote: sanitizeGoldenQuote(goldenQuote),
  };
}

/**
 * 文心雕龙主推导函数
 * 支持打字机流式输出
 */
export async function polishThought(params: {
  bookTitle: string;
  author?: string;
  mediaType: MediaType | string;
  draft: string;
  style: PolishStyle;
  onStream?: (chunk: string, isFinished: boolean) => void;
}): Promise<PolishResult> {
  const { bookTitle, author, mediaType, draft, style, onStream } = params;
  const apiKey = getAiApiKey();
  const apiUrl = getAiApiUrl();

  // 若未配置 API Key，直接走离线母题推导
  if (!apiKey) {
    const offlineResult = generateOfflinePolish(bookTitle, mediaType, draft, style);
    if (onStream) {
      // 模拟 500ms 打字机逐字输出
      await simulateTypewriter(offlineResult.polishedText, onStream);
    }
    return {
      polishedText: offlineResult.polishedText,
      goldenQuote: offlineResult.goldenQuote,
      style,
      source: 'offline_motif',
    };
  }

  // 尝试调用远程大模型 API (DeepSeek / OpenAI 格式)
  try {
    const styleOption = POLISH_STYLES.find((s) => s.id === style) || POLISH_STYLES[0];
    const systemPrompt = `你是一位享誉文坛的深度文艺评论家与修辞大师。当前正在为精神轨迹应用《阅痕 ReadTrace》重塑读后感。
请根据用户提供的作品名、创作者以及用户写下的质朴大白话草稿，按照指定文学流派风格进行深度润色，并提炼一句灵魂高光金句。

【流派风格】：${styleOption.name}（${styleOption.desc}）
【输出格式要求】：
请务必直接输出合法纯 JSON，严禁输出任何 markdown 格式围栏代码块（严禁出现 \`\`\`json 或 \`\`\`），不要包含任何额外寒暄。
JSON Schema 结构：
{
  "polishedText": "升华重塑后的完整读后感（180-280字，文采斐然，思想深刻，切合金句与作品内核）",
  "goldenQuote": "提炼的灵魂高光金句（严格 <= 15个汉字，无句末标点，适合镌刻于藏书票火漆与电影票根）"
}`;

    const userPrompt = `作品：《${bookTitle}》
创作者：${author || '未知'}
媒介类型：${mediaType}
用户感悟草稿：${draft || '这部作品给我留下了非常深刻的触动，内心久久不能平静。'}`;

    const res = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
        },
        timeout: 15000,
        success: resolve,
        fail: reject,
      });
    });

    if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
      const rawContent = res.data.choices[0].message.content.trim();
      // 清洗 json 围栏
      const cleanJson = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsed = JSON.parse(cleanJson);
      const polishedText = parsed.polishedText || '';
      const goldenQuote = sanitizeGoldenQuote(parsed.goldenQuote || '');

      if (onStream) {
        await simulateTypewriter(polishedText, onStream);
      }

      return {
        polishedText,
        goldenQuote,
        style,
        source: 'remote_api',
      };
    } else {
      throw new Error(`API 响应异常: ${res.statusCode}`);
    }
  } catch (err) {
    console.warn('远程大模型调用失败，无缝降级至离线经典推导', err);
    // 降级兜底
    const fallback = generateOfflinePolish(bookTitle, mediaType, draft, style);
    if (onStream) {
      await simulateTypewriter(fallback.polishedText, onStream);
    }
    return {
      polishedText: fallback.polishedText,
      goldenQuote: fallback.goldenQuote,
      style,
      source: 'offline_motif',
    };
  }
}

/**
 * 逐字打字机微动效播放器
 */
async function simulateTypewriter(
  fullText: string,
  onStream: (chunk: string, isFinished: boolean) => void
): Promise<void> {
  const step = 4; // 每次输出 4 个字符以保证流畅度和速度
  for (let i = step; i < fullText.length; i += step) {
    onStream(fullText.slice(0, i), false);
    await new Promise((r) => setTimeout(r, 20));
  }
  onStream(fullText, true);
}