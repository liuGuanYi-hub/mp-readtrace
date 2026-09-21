/**
 * 🎵 阅痕 ReadTrace 沉浸音频引擎与禅意伴读钟 (Audio & Zen Standby Engine)
 *
 * 对标 Android 原生：
 * - VinylCassettePlayerActivity.kt (拟真黑胶/卡带音频播放系统)
 * - StandByZenDeskActivity.kt (桌面禅意翻页伴读钟与四时光感)
 *
 * ────────────────────────────────────────────────────────────
 * ⚠️ 2026-09-22 音源路线修正（按「小程序完全对齐 App」重做）
 *
 * 事实：App 端**没有任何音频资源文件**（无 `res/raw/`、`assets/` 无 mp3/wav/ogg）。
 * 它的声音有两条路：
 *   ① `util/SpatialAudioEngine.kt`：**纯 PCM 内存实时合成**（6 类 80~280ms 物理微声学
 *      + 4 类无缝循环白噪音，见 App v1.0.5 更新日志）；
 *   ② 音乐播放走**网易云外部音源**，App 源码注释原文即「无版权音频内置，跳转外部播放」。
 *
 * 此前小程序用 8 条 `cdn.pixabay.com` 外链充当音源——那从来不是 App 的做法，
 * 且该 CDN 对小程序请求返回 403，导致伴读白噪音与黑胶**全部无声**。
 * 现按 App 同策略改造：白噪音改走程序化合成（零资源、零网络），
 * 版权音频一律不内置、如实标注不可播放，绝不再用境外 CDN 假装有音源。
 * ────────────────────────────────────────────────────────────
 *
 * 核心特性：
 * 1. 白噪音 = WebAudio 程序化合成无缝循环（`utils/audio-synth.ts`，对标 App 的 AudioTrack 路线）
 * 2. 6 类物理拟真微声学短音效（盖印/撕票/翻页/落针/卡带/星音），经 `playSfx()` 调用
 * 3. 唱臂落针/抬针机械动效联动与唱盘转速缓动
 * 4. 禅意伴读番茄钟 (15/25/45/60分钟) 与打卡统计
 * 5. **如实呈现**：播不出声时不谎报「正在播放」，经 `audible` 与 `lastNotice` 告知 UI
 */

import { audioSynth, type NoiseKind, type SfxName } from './audio-synth';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  type: 'noise' | 'vinyl';
  emoji: string;
  /** 程序化合成声场类型。有值时走 WebAudio 合成（App 路线），忽略 `src` */
  synth?: NoiseKind;
  /**
   * 真实音频地址。本轮已清空全部境外 CDN 外链；
   * 保留字段供后续接入自有/可直连音源，有值时走 InnerAudioContext
   */
  src?: string;
  /**
   * 不可播放的原因。有值时 `playTrack` 不会假装播放，只如实回报原因。
   * App 亦不内置版权音频（走网易云外部播放），小程序无法外跳故如实降级
   */
  unavailable?: string;
  coverUrl: string;
  durationSec: number;
  quote?: string;
}

/** 4 类白噪音统一使用本地中性占位图，避免依赖境外图床（App 亦无远程封面依赖） */
const LOCAL_PLACEHOLDER = '/static/covers/placeholder.jpg';

/** 版权音频统一不可播说明（与 App「无版权音频内置」同策略） */
const COPYRIGHT_NOTICE = '版权音频未内置（App 同策略，请到 App 端播放）';

/** 4 大沉浸白噪音 + 4 首黑胶典藏原声库 */
export const SOUND_TRACKS: AudioTrack[] = [
  // ── 🍃 4 大高质感白噪音（程序化合成，对标 App 的纯 PCM 无缝循环） ──
  {
    id: 'noise_rain',
    title: '林间夜雨',
    artist: '自然声景 · 深度专注',
    type: 'noise',
    emoji: '🌧️',
    synth: 'rain',
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 180,
    quote: '雨落叶隙，万物沉寂，唯思绪在清凉中生根。',
  },
  {
    id: 'noise_hearth',
    title: '温暖壁炉',
    artist: '木柴燃烧 · 治愈微光',
    type: 'noise',
    emoji: '🪵',
    synth: 'hearth',
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 150,
    quote: '柴火噼啪作响，旧时光在火光中微微摇曳。',
  },
  {
    id: 'noise_pages',
    title: '书房翻书',
    artist: '羊皮纸翻动 · 禅意纸墨',
    type: 'noise',
    emoji: '📖',
    synth: 'pages',
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 120,
    quote: '每一页纸的摩擦，都是与古老灵魂的轻声对谈。',
  },
  {
    id: 'noise_cafe',
    title: '晨间咖啡馆',
    artist: '轻柔白噪 · 街角灵感',
    type: 'noise',
    emoji: '☕',
    synth: 'cafe',
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 200,
    quote: '咖啡氤氲香气中，笔尖流淌出未被命名的随想。',
  },

  // ── 💿 4 首黑胶典藏原声（版权音频不内置，如实标注） ──
  {
    id: 'vinyl_debussy',
    title: '月光 (Clair de Lune)',
    artist: '德彪西 (Claude Debussy)',
    type: 'vinyl',
    emoji: '🌕',
    unavailable: COPYRIGHT_NOTICE,
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 300,
    quote: '月色皎洁如水，倾泻在无人知晓的精神原野。',
  },
  {
    id: 'vinyl_satie',
    title: '裸体歌舞 No.1 (Gymnopédie)',
    artist: '埃里克·萨蒂 (Erik Satie)',
    type: 'vinyl',
    emoji: '🎼',
    unavailable: COPYRIGHT_NOTICE,
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 210,
    quote: '慢节拍里的虚无与诗意，属于每一个沉思者的夜晚。',
  },
  {
    id: 'vinyl_bach',
    title: 'G弦上的咏叹调 (Air on G)',
    artist: 'J.S. 巴赫 (J.S. Bach)',
    type: 'vinyl',
    emoji: '🎻',
    unavailable: COPYRIGHT_NOTICE,
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 260,
    quote: '神性与理性的交织，抚平所有焦灼与不安。',
  },
  {
    id: 'vinyl_onelastkiss',
    title: 'One Last Kiss (EVA 终 伴读原声)',
    artist: '宇多田光 (Hikaru Utada)',
    type: 'vinyl',
    emoji: '🌸',
    unavailable: COPYRIGHT_NOTICE,
    coverUrl: LOCAL_PLACEHOLDER,
    durationSec: 240,
    quote: '最后的一吻，献给不再需要福音战士的新世界。',
  },
];

/** 白噪音合成音量（缓冲已归一化到 0.5 峰值，此处为总线增益） */
const NOISE_VOLUME = 0.45;

class AudioEngine {
  /** 保留的 InnerAudioContext，供后续接入自有可直连音源时使用（当前音源表内无此类条目） */
  private ctx: UniApp.InnerAudioContext | null = null;

  public isPlaying = false;
  /**
   * 是否真的出声。
   * `isPlaying === true && audible === false` 表示已降级为**纯视觉模式**（运行时无 WebAudio），
   * UI 应据此如实提示，勿谎称「正在播放」。
   */
  public audible = false;
  public currentTrack: AudioTrack = SOUND_TRACKS[0];
  public currentTime = 0;
  public duration = 0;
  public tonearmDropped = false;
  /** 最近一次不可播放 / 播放失败的原因，供 UI 如实提示 */
  public lastNotice = '';

  // 禅意番茄钟状态
  public pomodoroTotalSec = 25 * 60;
  public pomodoroRemainSec = 25 * 60;
  public pomodoroRunning = false;
  private pomodoroTimer: any = null;

  /** 合成播放时的进度模拟定时器（合成是无限循环，需自行推进显示进度） */
  private progressTimer: any = null;

  // 订阅监听器集合
  private listeners: Array<() => void> = [];

  constructor() {
    this.initContext();
  }

  /** 可播放的音轨（跳过无音源的版权曲，保证上一曲/下一曲不会停在没声音的曲目上） */
  public get playableTracks(): AudioTrack[] {
    return SOUND_TRACKS.filter((t) => !t.unavailable);
  }

  private initContext() {
    if (this.ctx) return;
    this.ctx = uni.createInnerAudioContext();
    this.ctx.autoplay = false;
    this.ctx.loop = true; // 白噪音自动循环

    this.ctx.onPlay(() => {
      this.isPlaying = true;
      this.audible = true;
      this.tonearmDropped = true;
      this.notify();
    });

    this.ctx.onPause(() => {
      this.isPlaying = false;
      this.audible = false;
      this.tonearmDropped = false;
      this.notify();
    });

    this.ctx.onStop(() => {
      this.isPlaying = false;
      this.audible = false;
      this.tonearmDropped = false;
      this.currentTime = 0;
      this.notify();
    });

    this.ctx.onTimeUpdate(() => {
      if (this.ctx) {
        this.currentTime = this.ctx.currentTime || 0;
        this.duration = this.ctx.duration || this.currentTrack.durationSec;
        this.notify();
      }
    });

    this.ctx.onError((res) => {
      console.warn('音频播放异常', res);
      this.isPlaying = false;
      this.audible = false;
      this.tonearmDropped = false;
      this.lastNotice = '音源加载失败，请稍后重试';
      this.notify();
    });
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /**
   * 播放指定音轨。
   * @returns 是否真的出声
   */
  public playTrack(track: AudioTrack): boolean {
    if (this.currentTrack.id === track.id && this.isPlaying) {
      return this.audible;
    }

    this.stopAllSources();
    this.currentTrack = track;
    this.currentTime = 0;
    this.lastNotice = '';

    // ── 情形 A：版权音频未内置 → 如实拒绝，不假装播放 ──
    if (track.unavailable) {
      this.isPlaying = false;
      this.audible = false;
      this.tonearmDropped = false;
      this.lastNotice = track.unavailable;
      this.notify();
      return false;
    }

    // ── 情形 B：程序化合成声场（App 路线） ──
    if (track.synth) {
      const ok = audioSynth.start(track.synth, NOISE_VOLUME);
      this.isPlaying = true;
      this.audible = ok;
      this.tonearmDropped = true;
      this.duration = track.durationSec;
      this.lastNotice = ok ? '' : '本设备暂不支持程序化音频合成，已降级为纯视觉模式';
      this.startProgressTicker();
      this.notify();
      return ok;
    }

    // ── 情形 C：真实音频地址（当前音源表内暂无此类条目，保留通道） ──
    if (track.src) {
      this.initContext();
      if (!this.ctx) return false;
      this.ctx.loop = true;
      this.ctx.src = track.src;
      this.ctx.play();
      return true;
    }

    this.isPlaying = false;
    this.audible = false;
    this.tonearmDropped = false;
    this.lastNotice = '该曲目暂无可用音源';
    this.notify();
    return false;
  }

  /** 播放/暂停切换。@returns 是否真的在出声 */
  public togglePlay(): boolean {
    const track = this.currentTrack;

    if (track.unavailable) {
      this.isPlaying = false;
      this.audible = false;
      this.tonearmDropped = false;
      this.lastNotice = track.unavailable;
      this.notify();
      return false;
    }

    if (track.synth) {
      if (this.isPlaying) {
        audioSynth.stop();
        this.stopProgressTicker();
        this.isPlaying = false;
        this.audible = false;
        this.tonearmDropped = false;
        this.notify();
        return false;
      }
      const ok = audioSynth.start(track.synth, NOISE_VOLUME);
      this.isPlaying = true;
      this.audible = ok;
      this.tonearmDropped = true;
      this.lastNotice = ok ? '' : '本设备暂不支持程序化音频合成，已降级为纯视觉模式';
      this.startProgressTicker();
      this.notify();
      return ok;
    }

    this.initContext();
    if (!this.ctx) return false;
    if (this.isPlaying) {
      this.ctx.pause();
    } else {
      if (!this.ctx.src && track.src) {
        this.ctx.src = track.src;
      }
      this.ctx.play();
    }
    return true;
  }

  /** 进度跳转（合成声场为无限循环，此处仅移动显示进度） */
  public seek(sec: number) {
    if (this.currentTrack.synth) {
      this.currentTime = Math.max(0, Math.min(sec, this.duration || sec));
      this.notify();
      return;
    }
    if (this.ctx) {
      this.ctx.seek(sec);
    }
  }

  /** 切换到下一首（在**可播放**音轨内轮转，避免停在无音源曲目上） */
  public nextTrack() {
    const list = this.playableTracks;
    const idx = list.findIndex((t) => t.id === this.currentTrack.id);
    const next = list[(idx + 1 + list.length) % list.length];
    this.playTrack(next);
  }

  /** 切换到上一首（同上） */
  public prevTrack() {
    const list = this.playableTracks;
    const idx = list.findIndex((t) => t.id === this.currentTrack.id);
    const next = list[(idx - 1 + list.length) % list.length];
    this.playTrack(next);
  }

  /**
   * 播放一次物理拟真短音效（对标 App SpatialAudioEngine 的 6 类微声学）
   * @param freqHz 仅 'celestial' 使用：评分分级基频（App 端高分 528Hz、低分 432Hz）
   */
  public playSfx(name: SfxName, pan = 0, freqHz = 528): boolean {
    return audioSynth.playSfx(name, pan, freqHz);
  }

  // ── 内部：合成播放的进度模拟 ──

  private startProgressTicker() {
    this.stopProgressTicker();
    this.progressTimer = setInterval(() => {
      const total = this.duration || this.currentTrack.durationSec || 1;
      this.currentTime = (this.currentTime + 1) % total;
      this.notify();
    }, 1000);
  }

  private stopProgressTicker() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private stopAllSources() {
    audioSynth.stop();
    this.stopProgressTicker();
    if (this.ctx && this.isPlaying) {
      try {
        this.ctx.stop();
      } catch {
        /* 可能未在播放 */
      }
    }
  }

  // ── 🍅 禅意伴读番茄钟 ──

  public setPomodoroDuration(minutes: number) {
    this.pausePomodoro();
    this.pomodoroTotalSec = minutes * 60;
    this.pomodoroRemainSec = minutes * 60;
    this.notify();
  }

  public startPomodoro() {
    if (this.pomodoroRunning) return;
    this.pomodoroRunning = true;
    // 启动番茄钟时自动开启伴读声场；若当前曲目无音源，改播第一条可播放音轨
    if (!this.isPlaying) {
      if (this.currentTrack.unavailable) {
        this.playTrack(this.playableTracks[0]);
      } else {
        this.togglePlay();
      }
    }

    this.pomodoroTimer = setInterval(() => {
      if (this.pomodoroRemainSec > 0) {
        this.pomodoroRemainSec--;
        this.notify();
      } else {
        this.completePomodoro();
      }
    }, 1000);
    this.notify();
  }

  public pausePomodoro() {
    this.pomodoroRunning = false;
    if (this.pomodoroTimer) {
      clearInterval(this.pomodoroTimer);
      this.pomodoroTimer = null;
    }
    this.notify();
  }

  public resetPomodoro() {
    this.pausePomodoro();
    this.pomodoroRemainSec = this.pomodoroTotalSec;
    this.notify();
  }

  private completePomodoro() {
    this.pausePomodoro();
    uni.vibrateLong?.();
    uni.showModal({
      title: '🧘 伴读完成 · 功不唐捐',
      content: `恭喜您完成了 ${Math.round(this.pomodoroTotalSec / 60)} 分钟的沉浸专注！精神印记已留存。`,
      showCancel: false,
    });
  }
}

// 导出全局单例
export const audioEngine = new AudioEngine();
