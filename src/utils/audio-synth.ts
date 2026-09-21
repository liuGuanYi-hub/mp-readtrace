/**
 * 🔊 程序化音频合成引擎 (AudioSynthEngine)
 *
 * 对标 Android `app/src/main/java/com/example/readtrace/util/SpatialAudioEngine.kt`：
 * **纯内存实时合成，0 外部资源、0 网络依赖**。
 *
 * 为什么必须这么写（2026-09-22 对账得出的事实）：
 * App 端全仓**没有任何音频资源文件**——没有 `res/raw/`，`assets/` 下也没有 mp3/wav/ogg；
 * 所有声音都是 `AudioTrack` 直接算 PCM 波形产生的（如「拟真翻页」「黑胶落针」）。
 * 小程序端此前用 8 条 `cdn.pixabay.com` 外链充当音源，那从来不是 App 的做法：
 * 该 CDN 对小程序请求返回 403，导致伴读白噪音与黑胶全部无声。
 * 按「小程序完全对齐 App」的原则，这里用 WebAudioContext 复刻同一条合成路线。
 *
 * ⚠️ 平台约束：微信小程序 WebAudio **不支持 ScriptProcessor / AudioWorklet**，
 *    因此噪声无法边播边算，必须先离线渲染进 AudioBuffer，再用
 *    `AudioBufferSourceNode.loop = true` 无缝循环播放。
 *    循环接缝靠 `makeSeamless()` 做环尾→环首的交叉淡化消除爆音。
 */

export type NoiseKind = 'rain' | 'hearth' | 'pages' | 'cafe';

/** 6 类物理拟真微声学，与 App `SpatialAudioEngine` 一一对应 */
export type SfxName = 'stamp' | 'ticket' | 'pageTurn' | 'needle' | 'cartridge' | 'celestial';

const SAMPLE_RATE = 44100;

/** 噪声循环缓冲时长（秒）：越长越不易察觉重复，代价是内存（8s 立体声约 2.8MB） */
const LOOP_SECONDS = 8;

/** 循环接缝交叉淡化长度（样本）≈50ms */
const SEAM_FADE = 2205;

/** 渲染结果的峰值目标，避免 4 类噪声响度差过大 */
const NOISE_PEAK = 0.5;

// ════════════════════════════════════════════════════════════
// 噪声渲染：4 类声场
// ════════════════════════════════════════════════════════════

interface StereoPcm {
  left: Float32Array;
  right: Float32Array;
}

/** 🍃 林间夜雨：白噪过一阶低通成雨幕 + 随机雨滴颗粒（左右随机落点，呼应 App 的双耳 pan） */
function renderRain(l: Float32Array, r: Float32Array, n: number): void {
  let lpL = 0;
  let lpR = 0;
  let dropCountdown = 400;
  let dropEnv = 0;
  let dropPhase = 0;
  let dropFreq = 0;
  let dropAmp = 0;
  let dropL = 0.5;
  let dropR = 0.5;

  for (let i = 0; i < n; i++) {
    const wL = Math.random() * 2 - 1;
    const wR = Math.random() * 2 - 1;
    lpL += (wL - lpL) * 0.14;
    lpR += (wR - lpR) * 0.14;
    l[i] = lpL * 0.55;
    r[i] = lpR * 0.55;

    if (dropCountdown-- <= 0) {
      dropCountdown = 180 + Math.floor(Math.random() * 900);
      dropFreq = 900 + Math.random() * 1800;
      dropAmp = 0.18 + Math.random() * 0.22;
      dropEnv = 1;
      dropPhase = 0;
      dropL = Math.random();
      dropR = 1 - dropL;
    }
    if (dropEnv > 0.0005) {
      dropPhase += (2 * Math.PI * dropFreq) / SAMPLE_RATE;
      const s = Math.sin(dropPhase) * dropEnv * dropAmp;
      l[i] += s * dropL;
      r[i] += s * dropR;
      dropEnv *= 0.9994;
    }
  }
}

/** 🪵 温暖壁炉：白噪积分成布朗噪声作火焰底噪 + 随机柴火爆裂脉冲 */
function renderHearth(l: Float32Array, r: Float32Array, n: number): void {
  let bL = 0;
  let bR = 0;
  let crackCountdown = 900;
  let crackEnv = 0;
  let crackPhase = 0;
  let crackFreq = 0;
  let crackAmp = 0;
  let crackL = 0.5;
  let crackR = 0.5;

  for (let i = 0; i < n; i++) {
    const wL = Math.random() * 2 - 1;
    const wR = Math.random() * 2 - 1;
    bL = (bL + 0.02 * wL) / 1.02;
    bR = (bR + 0.02 * wR) / 1.02;
    l[i] = bL * 2.2;
    r[i] = bR * 2.2;

    if (crackCountdown-- <= 0) {
      crackCountdown = 500 + Math.floor(Math.random() * 2600);
      crackFreq = 300 + Math.random() * 2600;
      crackAmp = 0.25 + Math.random() * 0.45;
      crackEnv = 1;
      crackPhase = 0;
      crackL = Math.random();
      crackR = 1 - crackL;
    }
    if (crackEnv > 0.001) {
      crackPhase += (2 * Math.PI * crackFreq) / SAMPLE_RATE;
      const body = Math.sin(crackPhase) * 0.7 + (Math.random() * 2 - 1) * 0.3;
      const s = body * crackEnv * crackAmp;
      l[i] += s * crackL;
      r[i] += s * crackR;
      crackEnv *= 0.994;
    }
  }
}

/**
 * 📖 书房翻书：差分+平滑做出中高频带通的纸张摩擦声。
 * 包络取「周期整除缓冲长度」的正弦平方 ⇒ 循环天然连贯，本类不依赖交叉淡化。
 */
function renderPages(l: Float32Array, r: Float32Array, n: number): void {
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < n; i++) {
    const swell = Math.sin((2 * Math.PI * 2 * i) / n); // 8 秒翻 2 次
    const env = 0.25 + 0.75 * swell * swell;
    const wL = Math.random() * 2 - 1;
    const wR = Math.random() * 2 - 1;
    lpL += (wL - lpL) * 0.45;
    lpR += (wR - lpR) * 0.45;
    const hpL = wL - lpL;
    const hpR = wR - lpR;
    l[i] = (hpL * 0.7 + lpL * 0.3) * env * 0.5;
    r[i] = (hpR * 0.7 + lpR * 0.3) * env * 0.5;
  }
}

/** ☕ 晨间咖啡馆：粉噪声空气底噪 + 低频人声絮语（絮语用整数周期正弦，天然无缝） */
function renderCafe(l: Float32Array, r: Float32Array, n: number): void {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let c0 = 0;
  let c1 = 0;
  let c2 = 0;

  for (let i = 0; i < n; i++) {
    const wL = Math.random() * 2 - 1;
    const wR = Math.random() * 2 - 1;

    // 粉噪声：3 段一阶滤波近似（-3dB/oct）
    b0 = 0.99765 * b0 + wL * 0.099046;
    b1 = 0.963 * b1 + wL * 0.2965164;
    b2 = 0.57 * b2 + wL * 1.0526913;
    const pL = (b0 + b1 + b2 + wL * 0.1848) * 0.2;

    c0 = 0.99765 * c0 + wR * 0.099046;
    c1 = 0.963 * c1 + wR * 0.2965164;
    c2 = 0.57 * c2 + wR * 1.0526913;
    const pR = (c0 + c1 + c2 + wR * 0.1848) * 0.2;

    // 人声絮语：3/5/7 个整周期 + 慢起伏，周期整除以缓冲长度 ⇒ 无缝
    const murmur =
      (Math.sin((2 * Math.PI * 3 * i) / n) +
        Math.sin((2 * Math.PI * 5 * i) / n) +
        Math.sin((2 * Math.PI * 7 * i) / n)) /
      3;
    const m = Math.abs(murmur) * 0.06;

    l[i] = pL * 0.8 + Math.sin((2 * Math.PI * 160 * i) / SAMPLE_RATE) * m;
    r[i] = pR * 0.8 + Math.sin((2 * Math.PI * 164 * i) / SAMPLE_RATE) * m;
  }
}

/** 环尾与环首交叉淡化，消除循环点爆音 */
function makeSeamless(data: Float32Array): void {
  const n = data.length;
  const fade = Math.min(SEAM_FADE, Math.floor(n / 4));
  for (let i = 0; i < fade; i++) {
    const w = i / fade;
    data[i] = data[i] * w + data[n - fade + i] * (1 - w);
  }
}

/** 归一化到指定峰值，避免 4 类声场响度差别过大 */
function normalize(l: Float32Array, r: Float32Array, peak: number): void {
  let max = 0;
  for (let i = 0; i < l.length; i++) {
    const a = Math.abs(l[i]);
    if (a > max) max = a;
    const b = Math.abs(r[i]);
    if (b > max) max = b;
  }
  if (max <= 0.0001) return;
  const k = peak / max;
  for (let i = 0; i < l.length; i++) {
    l[i] *= k;
    r[i] *= k;
  }
}

/** 渲染 4 类噪声之一为可无缝循环的立体声 PCM */
function renderNoise(kind: NoiseKind): StereoPcm {
  const n = SAMPLE_RATE * LOOP_SECONDS;
  const left = new Float32Array(n);
  const right = new Float32Array(n);

  if (kind === 'rain') renderRain(left, right, n);
  else if (kind === 'hearth') renderHearth(left, right, n);
  else if (kind === 'pages') renderPages(left, right, n);
  else renderCafe(left, right, n);

  makeSeamless(left);
  makeSeamless(right);
  normalize(left, right, NOISE_PEAK);
  return { left, right };
}

// ════════════════════════════════════════════════════════════
// 6 类物理拟真短音效（**语义与触发点**对齐 App SpatialAudioEngine）
//
// ⚠️ 2026-09-22 悦耳化重做：App 原波形是**裸正弦 + 噪声**——撕票 = 2400Hz 正弦 0.6、
//    卡带 = 1800/900Hz 双正弦、星音 = 基频 + 八度纯正弦、落针 = 480Hz 正弦 + 噪声。
//    听感是电子「哔——」而非拟物拟音，而且**通通没有起音包络**，每个音头都带一记爆音。
//    此处保留同一套声音语义（盖印/撕票/翻页/落针/卡带/星音）与同样的触发时机，
//    改用「噪声整形 + 共振峰 + 钟式泛音堆 + 起音淡入 + 软限幅」重做音色，
//    目标是拟物耐听，而不是电子提示音。
// ════════════════════════════════════════════════════════════

/** 起音淡入时长（秒）。消除音头爆音，是「悦耳」最关键的一步 */
const ATTACK_SEC = 0.003;

/**
 * 音效总线增益。
 * 刻意压低：App 原音效峰值约 0.27~0.43（9000~14000/32768），是**背景层拟音**而非提示音。
 * 拟音过响会立刻变「不悦耳」，宁可让人「注意到有声音」而不是「被声音打到」。
 */
const SFX_MASTER = 0.7;

/** 一阶低通整形器（每次渲染新建一份，自带滤波状态） */
function makeOnePole(coef: number) {
  let z = 0;
  return (x: number) => {
    z += (x - z) * coef;
    return z;
  };
}

/** 软限幅：把叠加后的过冲圆滑掉，避免数字削波带来的刺耳感 */
function softClip(v: number) {
  return v / (1 + Math.abs(v) * 0.35);
}

interface SfxSpec {
  durationMs: number;
  /** 最终增益（≤1，过冲交给 softClip 兜底） */
  amp: number;
  /**
   * 生成本次渲染专用的采样函数。
   * 用工厂而非纯函数，是为了让噪声整形能携带一阶滤波状态、并让左右声道各自去相关。
   * @param numSamples 总样本数
   * @param freqHz 仅 celestial 使用：评分分级基频（App 端 432~528Hz）
   */
  create: (numSamples: number, freqHz: number) => (i: number) => number;
}

const SFX_SPECS: Record<SfxName, SfxSpec> = {
  // 🛂 护照盖印 / 火漆封蜡：低频下扫钝响 + 次谐波厚度 + 极短接触瞬态（听感「咚」）
  stamp: {
    durationMs: 140,
    amp: 0.85,
    create: (num) => {
      const contactLp = makeOnePole(0.62);
      return (i) => {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / ATTACK_SEC);
        const decay = Math.exp(-t * 24);
        const freq = 110 - 50 * (i / num);
        const thud = Math.sin(2 * Math.PI * freq * t);
        const sub = Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.35;
        const contact = contactLp(Math.random() * 2 - 1) * Math.exp(-t * 300) * 2.4;
        return (thud + sub + contact * 0.32) * decay * attack * 0.8;
      };
    },
  },
  // 🎟️ 电影票撕开：宽带噪声经高通留下纸纤维的中高频 + 手撕颗粒颤动（听感「嚓」）
  ticket: {
    durationMs: 130,
    amp: 0.78,
    create: () => {
      const lp = makeOnePole(0.55);
      return (i) => {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / 0.002);
        const env = Math.exp(-t * 22) * attack;
        const n = Math.random() * 2 - 1;
        const hp = n - lp(n);
        const grain = 0.65 + 0.35 * Math.sin(2 * Math.PI * 34 * t);
        return hp * env * grain;
      };
    },
  },
  // 📜 纸张翻动：中高频摩擦 + 柔和鼓包包络（听感「沙」）
  pageTurn: {
    durationMs: 180,
    amp: 0.62,
    create: (num) => {
      const lp = makeOnePole(0.5);
      return (i) => {
        const attack = Math.min(1, i / (SAMPLE_RATE * 0.004));
        const env = Math.pow(Math.sin((Math.PI * i) / num), 1.4) * attack;
        const n = Math.random() * 2 - 1;
        const shaped = lp(n);
        return ((n - shaped) * 0.78 + shaped * 0.22) * env;
      };
    },
  },
  // 💽 黑胶落针：针尖触盘的低频「啵」+ 静电微爆音（听感「噗」）
  needle: {
    durationMs: 110,
    amp: 0.7,
    create: () => {
      const lp = makeOnePole(0.35);
      return (i) => {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / 0.0015);
        const thump = Math.sin(2 * Math.PI * 210 * t) * Math.exp(-t * 85);
        const crackle = lp(Math.random() * 2 - 1) * Math.exp(-t * 40) * 1.7;
        return (thump * 0.75 + crackle * 0.5) * attack;
      };
    },
  },
  // 🕹️ 卡带插入卡槽：极短噪声「咔」+ 塑料腔体低频回响（不再是 1800Hz 高频哔）
  cartridge: {
    durationMs: 130,
    amp: 0.78,
    create: () => {
      const lp = makeOnePole(0.75);
      return (i) => {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / 0.0012);
        const snap = lp(Math.random() * 2 - 1) * Math.exp(-t * 190) * 2.4;
        const body =
          (Math.sin(2 * Math.PI * 300 * t) * 0.55 + Math.sin(2 * Math.PI * 610 * t) * 0.3) *
          Math.exp(-t * 55);
        return (snap + body * 0.7) * attack;
      };
    },
  },
  // 🌌 星系引力琴：钟式泛音堆——基频 + 八度 + **非谐泛音 2.76f**（钟的特征）+ 三度泛音，
  //    高次泛音衰减更快（听感是空灵钟声，而非测试音）
  celestial: {
    durationMs: 460,
    amp: 0.6,
    create: (_num, freqHz) => {
      const f = freqHz;
      return (i) => {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / ATTACK_SEC);
        const p1 = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4.2);
        const p2 = Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 7) * 0.42;
        const p3 = Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 11) * 0.2;
        const p4 = Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 14) * 0.12;
        return (p1 + p2 + p3 + p4) * attack * 0.75;
      };
    },
  },
};

/** 渲染一个短音效为立体声 PCM；pan ∈ [-1, 1] 对应 App 的双耳定位 */
function renderSfx(name: SfxName, pan: number, freqHz: number): StereoPcm {
  const spec = SFX_SPECS[name];
  const num = Math.floor((SAMPLE_RATE * spec.durationMs) / 1000);
  const left = new Float32Array(num);
  const right = new Float32Array(num);
  const safePan = Math.max(-1, Math.min(1, pan));
  const gainL = Math.min(1, Math.max(0.1, (1 - safePan) / 2));
  const gainR = Math.min(1, Math.max(0.1, (1 + safePan) / 2));

  // 左右声道各起一份独立发生器：噪声去相关后才有真实空间宽度（纯音则自然居中）
  const genL = spec.create(num, freqHz);
  const genR = spec.create(num, freqHz);

  for (let i = 0; i < num; i++) {
    left[i] = softClip(genL(i)) * spec.amp * SFX_MASTER * gainL;
    right[i] = softClip(genR(i)) * spec.amp * SFX_MASTER * gainR;
  }
  return { left, right };
}

// ════════════════════════════════════════════════════════════
// 引擎
// ════════════════════════════════════════════════════════════

class AudioSynthEngine {
  private ctx: any = null;
  private noiseSource: any = null;
  private noiseGain: any = null;
  private kind: NoiseKind | null = null;

  /** 解析可用的 WebAudio 构造器；取不到即代表本运行时无 WebAudio */
  private resolveCtor(): any {
    if (typeof wx !== 'undefined' && typeof (wx as any).WebAudioContext === 'function') {
      return (wx as any).WebAudioContext;
    }
    const g = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
    if (g && typeof g.AudioContext === 'function') return g.AudioContext;
    return null;
  }

  /** 小程序 WebAudio 可用性探测；不可用时调用方须走纯视觉降级 */
  isSupported(): boolean {
    return this.resolveCtor() !== null;
  }

  private ensureCtx(): any {
    if (this.ctx) return this.ctx;
    const Ctor = this.resolveCtor();
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch (e) {
      console.warn('WebAudioContext 初始化失败', e);
      this.ctx = null;
    }
    return this.ctx;
  }

  /** 当前正在循环的声场类型 */
  get currentKind(): NoiseKind | null {
    return this.kind;
  }

  get isRunning(): boolean {
    return this.noiseSource !== null;
  }

  /**
   * 开始循环播放某类白噪音。
   * @returns 是否真的出声（false ⇒ 应降级为纯视觉，勿谎报「正在播放」）
   */
  start(kind: NoiseKind, volume = 0.5): boolean {
    const ctx = this.ensureCtx();
    if (!ctx) return false;

    this.stop();
    try {
      const { left, right } = renderNoise(kind);
      const buffer = ctx.createBuffer(2, left.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(left);
      buffer.getChannelData(1).set(right);

      const gain = ctx.createGain();
      gain.gain.value = volume;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain).connect(ctx.destination);
      source.start();

      this.noiseSource = source;
      this.noiseGain = gain;
      this.kind = kind;
      return true;
    } catch (e) {
      console.warn('白噪音合成失败', e);
      this.noiseSource = null;
      this.noiseGain = null;
      this.kind = null;
      return false;
    }
  }

  /** 停止循环并释放缓冲区（不关闭 context，避免反复重建开销） */
  stop(): void {
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
      } catch {
        /* 可能已停止 */
      }
      try {
        this.noiseSource.disconnect?.();
      } catch {
        /* 忽略 */
      }
    }
    this.noiseSource = null;
    this.noiseGain = null;
    this.kind = null;
  }

  setVolume(v: number): void {
    if (this.noiseGain) {
      this.noiseGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  /**
   * 播放一次短音效（对标 App 的 6 类微声学）
   * @param freqHz 仅 'celestial' 使用，默认 528Hz（治愈声波）
   */
  playSfx(name: SfxName, pan = 0, freqHz = 528): boolean {
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    try {
      const { left, right } = renderSfx(name, pan, freqHz);
      const buffer = ctx.createBuffer(2, left.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(left);
      buffer.getChannelData(1).set(right);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return true;
    } catch (e) {
      console.warn('音效合成失败', e);
      return false;
    }
  }
}

export const audioSynth = new AudioSynthEngine();
