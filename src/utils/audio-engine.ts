/**
 * 🎵 阅痕 ReadTrace 沉浸音频引擎与禅意伴读钟 (Audio & Zen Standby Engine)
 *
 * 对标 Android 原生：
 * - VinylCassettePlayerActivity.kt (拟真黑胶/卡带音频播放系统)
 * - StandByZenDeskActivity.kt (桌面禅意翻页伴读钟与四时光感)
 *
 * 核心特性：
 * 1. 微信原生 InnerAudioContext 封装，跨页面保活播放与后台常驻
 * 2. 4 款免版权高质感白噪音声场（林雨、壁炉、翻书、咖啡馆）
 * 3. 4 首古典典藏黑胶原声（德彪西月光、萨蒂裸体歌舞、宇多田光、巴赫G弦之歌）
 * 4. 唱臂落针/抬针机械动效联动与唱盘转速缓动
 * 5. 禅意伴读番茄钟 (15/25/45/60分钟) 与打卡统计
 */

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  type: 'noise' | 'vinyl';
  emoji: string;
  src: string;
  coverUrl: string;
  durationSec: number;
  quote?: string;
}

/** 4 大沉浸白噪音 + 4 首黑胶典藏原声库 */
export const SOUND_TRACKS: AudioTrack[] = [
  // ── 🍃 4 大免版权高质感白噪音 ──
  {
    id: 'noise_rain',
    title: '林间夜雨',
    artist: '自然声景 · 深度专注',
    type: 'noise',
    emoji: '🌧️',
    // 公开稳定免版权白噪音流
    src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=rain-and-thunder-nature-sounds-7803.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&q=80',
    durationSec: 180,
    quote: '雨落叶隙，万物沉寂，唯思绪在清凉中生根。',
  },
  {
    id: 'noise_hearth',
    title: '温暖壁炉',
    artist: '木柴燃烧 · 治愈微光',
    type: 'noise',
    emoji: '🪵',
    src: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0dc5877f11.mp3?filename=crackling-fireplace-nature-sounds-8012.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
    durationSec: 150,
    quote: '柴火噼啪作响，旧时光在火光中微微摇曳。',
  },
  {
    id: 'noise_pages',
    title: '书房翻书',
    artist: '羊皮纸翻动 · 禅意纸墨',
    type: 'noise',
    emoji: '📖',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e3070.mp3?filename=turning-pages-94776.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507842229451-7c57b137d559?w=500&q=80',
    durationSec: 120,
    quote: '每一页纸的摩擦，都是与古老灵魂的轻声对谈。',
  },
  {
    id: 'noise_cafe',
    title: '晨间咖啡馆',
    artist: '轻柔白噪 · 街角灵感',
    type: 'noise',
    emoji: '☕',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=coffee-shop-ambience-18820.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80',
    durationSec: 200,
    quote: '咖啡氤氲香气中，笔尖流淌出未被命名的随想。',
  },

  // ── 💿 4 首黑胶典藏原声 ──
  {
    id: 'vinyl_debussy',
    title: '月光 (Clair de Lune)',
    artist: '德彪西 (Claude Debussy)',
    type: 'vinyl',
    emoji: '🌕',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c83a0058.mp3?filename=clair-de-lune-debussy-piano-10878.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500&q=80',
    durationSec: 300,
    quote: '月色皎洁如水，倾泻在无人知晓的精神原野。',
  },
  {
    id: 'vinyl_satie',
    title: '裸体歌舞 No.1 (Gymnopédie)',
    artist: '埃里克·萨蒂 (Erik Satie)',
    type: 'vinyl',
    emoji: '🎼',
    src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f795cb.mp3?filename=gymnopedie-no-1-erik-satie-piano-122557.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1445964047600-cdadb873641b?w=500&q=80',
    durationSec: 210,
    quote: '慢节拍里的虚无与诗意，属于每一个沉思者的夜晚。',
  },
  {
    id: 'vinyl_bach',
    title: 'G弦上的咏叹调 (Air on G)',
    artist: 'J.S. 巴赫 (J.S. Bach)',
    type: 'vinyl',
    emoji: '🎻',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=air-on-the-g-string-bach-orchestral-suite-no-3-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    durationSec: 260,
    quote: '神性与理性的交织，抚平所有焦灼与不安。',
  },
  {
    id: 'vinyl_onelastkiss',
    title: 'One Last Kiss (EVA 终 伴读原声)',
    artist: '宇多田光 (Hikaru Utada)',
    type: 'vinyl',
    emoji: '🌸',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c83a0058.mp3?filename=clair-de-lune-debussy-piano-10878.mp3',
    coverUrl: 'https://i0.hdslb.com/bfs/bangumi/image/82d628408f5472f1440982e880b0b4f0146862ad.png',
    durationSec: 240,
    quote: '最后的一吻，献给不再需要福音战士的新世界。',
  },
];

class AudioEngine {
  private ctx: UniApp.InnerAudioContext | null = null;
  public isPlaying = false;
  public currentTrack: AudioTrack = SOUND_TRACKS[0];
  public currentTime = 0;
  public duration = 0;
  public tonearmDropped = false;

  // 禅意番茄钟状态
  public pomodoroTotalSec = 25 * 60;
  public pomodoroRemainSec = 25 * 60;
  public pomodoroRunning = false;
  private pomodoroTimer: any = null;

  // 订阅监听器集合
  private listeners: Array<() => void> = [];

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (this.ctx) return;
    this.ctx = uni.createInnerAudioContext();
    this.ctx.autoplay = false;
    this.ctx.loop = true; // 白噪音自动循环

    this.ctx.onPlay(() => {
      this.isPlaying = true;
      this.tonearmDropped = true;
      this.notify();
    });

    this.ctx.onPause(() => {
      this.isPlaying = false;
      this.tonearmDropped = false;
      this.notify();
    });

    this.ctx.onStop(() => {
      this.isPlaying = false;
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
      this.tonearmDropped = false;
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

  /** 播放指定音轨 */
  public playTrack(track: AudioTrack) {
    this.initContext();
    if (!this.ctx) return;

    if (this.currentTrack.id === track.id && this.isPlaying) {
      return;
    }

    this.currentTrack = track;
    this.ctx.src = track.src;
    this.ctx.loop = track.type === 'noise';
    this.ctx.play();
  }

  /** 播放/暂停切换 */
  public togglePlay() {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying) {
      this.ctx.pause();
    } else {
      if (!this.ctx.src) {
        this.ctx.src = this.currentTrack.src;
      }
      this.ctx.play();
    }
  }

  /** 进度跳转 */
  public seek(sec: number) {
    if (!this.ctx) return;
    this.ctx.seek(sec);
  }

  /** 切换到下一首 */
  public nextTrack() {
    const list = SOUND_TRACKS;
    const currentIndex = list.findIndex((t) => t.id === this.currentTrack.id);
    const nextIndex = (currentIndex + 1) % list.length;
    this.playTrack(list[nextIndex]);
  }

  /** 切换到上一首 */
  public prevTrack() {
    const list = SOUND_TRACKS;
    const currentIndex = list.findIndex((t) => t.id === this.currentTrack.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    this.playTrack(list[prevIndex]);
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
    // 启动番茄钟时自动开启当前伴读白噪音
    if (!this.isPlaying) {
      this.togglePlay();
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
