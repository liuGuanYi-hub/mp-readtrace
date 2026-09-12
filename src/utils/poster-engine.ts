/**
 * 🎨 阅痕 ReadTrace 实体海报离屏渲染引擎 (Canvas 2D Poster Engine)
 *
 * 对标 Android 原生：
 * - MovieTicketPosterView (16:9 复古透光打孔电影票根)
 * - ExLibrisStampView (中世纪铜版画藏书票)
 * - QuotePosterActivity (羊皮纸金句便签)
 * - CulturalPassportActivity (精神巡礼护照印章)
 *
 * 核心特性：
 * 1. 自动处理网络封面图片下载并转为本地临时路径 (wx.getImageInfo)
 * 2. 2K 超清导出 (750 x 1334 px)，在高分屏下字迹与边缘极度锐利
 * 3. 真实几何与拟物细节：票根侧边半圆打孔、虚线打孔裂痕、火漆封蜡 3D 浮雕光影、印章印泥浸染
 * 4. 微信系统相册授权与保存闭环
 */

import type { Book } from './models';

export type PosterType = 'ticket' | 'exlibris' | 'quote' | 'passport';

export interface PosterOptions {
  type: PosterType;
  book: Book;
  customQuote?: string;
  theme?: 'dark' | 'parchment';
}

/** 缓存已下载的封面本地临时路径 */
const imageCache = new Map<string, string>();

export function getLocalImagePath(url: string): Promise<string> {
  if (!url) return Promise.reject(new Error('图片 URL 为空'));
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: url,
      success: (res) => {
        imageCache.set(url, res.path);
        resolve(res.path);
      },
      fail: (err) => {
        console.warn('获取图片本地路径失败，回退占位图', err);
        reject(err);
      },
    });
  });
}

/** 绘制多行文本并自动换行，返回最终 y 坐标 */
function drawWrappedText(
  ctx: UniApp.CanvasContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4,
): number {
  const chars = text.split('');
  let line = '';
  let lineCount = 0;
  let currentY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    // 粗略估算或用固定字宽计算
    const isOver = testLine.length * 14 > maxWidth; // 适配中文字符
    if (isOver && i > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.slice(0, -1) + '…', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/**
 * 绘制复古透光电影票根 (Movie Ticket)
 * 尺寸：750 x 1334
 */
export async function drawMovieTicketPoster(
  ctx: UniApp.CanvasContext,
  book: Book,
  localCoverPath?: string,
): Promise<void> {
  const W = 750;
  const H = 1334;

  // 1. 底层深空微光渐变
  ctx.save();
  ctx.setFillStyle('#0D0D0E');
  ctx.fillRect(0, 0, W, H);

  // 2. 票身卡片区域（左右留白 48px，圆角 32px）
  const cardX = 48;
  const cardY = 64;
  const cardW = W - 96;
  const cardH = H - 128;
  const cardR = 28;

  // 票券主体背景
  ctx.setFillStyle('#1C1B1F');
  ctx.beginPath();
  ctx.arc(cardX + cardR, cardY + cardR, cardR, Math.PI, Math.PI * 1.5);
  ctx.arc(cardX + cardW - cardR, cardY + cardR, cardR, Math.PI * 1.5, Math.PI * 2);
  ctx.arc(cardX + cardW - cardR, cardY + cardH - cardR, cardR, 0, Math.PI * 0.5);
  ctx.arc(cardX + cardR, cardY + cardH - cardR, cardR, Math.PI * 0.5, Math.PI);
  ctx.closePath();
  ctx.fill();

  // 票券精细金色描边
  ctx.setStrokeStyle('rgba(212, 175, 55, 0.35)');
  ctx.setLineWidth(2);
  ctx.stroke();

  // 3. 票头 Cinema Header
  ctx.setFillStyle('#D4AF37');
  ctx.setFontSize(22);
  ctx.setTextAlign('left');
  ctx.fillText('READTRACE ARCHIVE CINEMA 🏛️', cardX + 36, cardY + 60);

  ctx.setFillStyle('#8C887B');
  ctx.setFontSize(18);
  ctx.setTextAlign('right');
  ctx.fillText('HALL 07 · SEAT 14A', cardX + cardW - 36, cardY + 60);

  // 4. 2:3 电影剧照海报居中
  const coverW = 380;
  const coverH = 530;
  const coverX = cardX + (cardW - coverW) / 2;
  const coverY = cardY + 90;

  ctx.save();
  // 封面圆角裁剪
  ctx.beginPath();
  const cR = 16;
  ctx.arc(coverX + cR, coverY + cR, cR, Math.PI, Math.PI * 1.5);
  ctx.arc(coverX + coverW - cR, coverY + cR, cR, Math.PI * 1.5, Math.PI * 2);
  ctx.arc(coverX + coverW - cR, coverY + coverH - cR, cR, 0, Math.PI * 0.5);
  ctx.arc(coverX + cR, coverY + coverH - cR, cR, Math.PI * 0.5, Math.PI);
  ctx.closePath();
  ctx.clip();

  if (localCoverPath) {
    ctx.drawImage(localCoverPath, coverX, coverY, coverW, coverH);
  } else {
    ctx.setFillStyle('#2C2A2E');
    ctx.fillRect(coverX, coverY, coverW, coverH);
    ctx.setFillStyle('#D4AF37');
    ctx.setFontSize(72);
    ctx.setTextAlign('center');
    ctx.fillText('🎬', coverX + coverW / 2, coverY + coverH / 2 + 24);
  }
  ctx.restore();

  // 封面金色细描边
  ctx.setStrokeStyle('rgba(212, 175, 55, 0.4)');
  ctx.setLineWidth(2);
  ctx.strokeRect(coverX, coverY, coverW, coverH);

  // 5. 影片信息排版
  let textY = coverY + coverH + 60;
  ctx.setFillStyle('#FAF6EE');
  ctx.setFontSize(36);
  ctx.setTextAlign('center');
  ctx.fillText(`《${book.title}》`, W / 2, textY);

  textY += 40;
  ctx.setFillStyle('#A89F91');
  ctx.setFontSize(22);
  ctx.fillText(`导演 / 创作者：${book.author || '未知'}`, W / 2, textY);

  textY += 36;
  ctx.setFillStyle('#D4AF37');
  ctx.setFontSize(24);
  const ratingText = book.rating ? `★ ${book.rating.toFixed(1)} 影史殿堂级典藏` : '★ 9.8 影史殿堂级典藏';
  ctx.fillText(ratingText, W / 2, textY);

  // 6. 经典打孔撕票中缝线 (Perforation Line)
  const tearY = cardY + cardH - 240;
  const punchRadius = 24;

  // 左右两侧打孔凹槽（半圆吃入卡片）
  ctx.save();
  ctx.setFillStyle('#0D0D0E');
  ctx.beginPath();
  ctx.arc(cardX, tearY, punchRadius, -Math.PI / 2, Math.PI / 2, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cardX + cardW, tearY, punchRadius, Math.PI / 2, Math.PI * 1.5, false);
  ctx.fill();
  ctx.restore();

  // 虚线撕痕
  ctx.save();
  ctx.setStrokeStyle('rgba(212, 175, 55, 0.5)');
  ctx.setLineWidth(2);
  // @ts-ignore
  if (ctx.setLineDash) ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(cardX + punchRadius + 8, tearY);
  ctx.lineTo(cardX + cardW - punchRadius - 8, tearY);
  ctx.stroke();
  ctx.restore();

  // 7. 副券 (Ticket Stub) 内容：金句与防伪条形码
  const quote = book.shortComment || '“在时间的尽头，唯有爱与引力能穿越浩瀚维度。”';
  ctx.setFillStyle('rgba(250, 246, 238, 0.85)');
  ctx.setFontSize(22);
  ctx.setTextAlign('center');
  ctx.fillText(`“${quote}”`, W / 2, tearY + 54);

  // 条形码生成
  const barY = tearY + 100;
  const barH = 50;
  const startX = cardX + 60;
  const endX = cardX + cardW - 60;
  const barCount = 45;
  const step = (endX - startX) / barCount;

  ctx.setFillStyle('rgba(212, 175, 55, 0.7)');
  for (let i = 0; i < barCount; i++) {
    const isThick = (i % 3 === 0 || i % 7 === 0);
    const bw = isThick ? 4 : 2;
    ctx.fillRect(startX + i * step, barY, bw, barH);
  }

  // 票券唯一防伪编号
  ctx.setFillStyle('#8C887B');
  ctx.setFontSize(18);
  ctx.setTextAlign('center');
  ctx.fillText('NO. RT-2026-88019 // ADMIT ONE', W / 2, barY + barH + 34);

  ctx.restore();
}

/**
 * 绘制欧洲中世纪火漆藏书票 (Ex-Libris Stamp)
 * 尺寸：750 x 1100
 */
export async function drawExLibrisPoster(
  ctx: UniApp.CanvasContext,
  book: Book,
  localCoverPath?: string,
): Promise<void> {
  const W = 750;
  const H = 1100;

  // 1. 羊皮纸底色
  ctx.save();
  ctx.setFillStyle('#FAF6ED');
  ctx.fillRect(0, 0, W, H);

  // 2. 双重古典雕版花边边框
  const pad = 44;
  ctx.setStrokeStyle('#7A5835');
  ctx.setLineWidth(4);
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  ctx.setStrokeStyle('#B8976C');
  ctx.setLineWidth(1.5);
  ctx.strokeRect(pad + 12, pad + 12, W - (pad + 12) * 2, H - (pad + 12) * 2);

  // 四角花饰角落
  const cornerSize = 24;
  const corners = [
    [pad + 12, pad + 12],
    [W - pad - 12, pad + 12],
    [pad + 12, H - pad - 12],
    [W - pad - 12, H - pad - 12],
  ];
  ctx.setFillStyle('#7A5835');
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx - 4, cy - 4, 8, 8);
  });

  // 3. 顶部古典排印
  ctx.setFillStyle('#7A5835');
  ctx.setFontSize(22);
  ctx.setTextAlign('center');
  ctx.fillText('— EX LIBRIS // BIBLIOTHECA READTRACE —', W / 2, pad + 60);

  ctx.setFillStyle('#A88455');
  ctx.setFontSize(18);
  ctx.fillText('PRIVATE COLLECTION · CURATOR ARCHIVE', W / 2, pad + 90);

  // 4. 中央铜版画微缩封面
  const coverW = 280;
  const coverH = 390;
  const coverX = (W - coverW) / 2;
  const coverY = pad + 125;

  if (localCoverPath) {
    ctx.drawImage(localCoverPath, coverX, coverY, coverW, coverH);
  } else {
    ctx.setFillStyle('#EFE6CE');
    ctx.fillRect(coverX, coverY, coverW, coverH);
    ctx.setFillStyle('#7A5835');
    ctx.setFontSize(60);
    ctx.fillText('📖', W / 2, coverY + coverH / 2 + 20);
  }

  // 封面古典雕刻木框
  ctx.setStrokeStyle('#7A5835');
  ctx.setLineWidth(3);
  ctx.strokeRect(coverX, coverY, coverW, coverH);

  // 5. 3D 浮雕火漆封蜡印章 (Wax Seal)
  const sealX = W / 2;
  const sealY = coverY + coverH + 90;
  const sealR = 56;

  // 火漆阴影与暗红主体
  ctx.save();
  ctx.setFillStyle('#8B0000');
  ctx.beginPath();
  ctx.arc(sealX + 3, sealY + 4, sealR, 0, Math.PI * 2);
  ctx.fill();

  ctx.setFillStyle('#B22222');
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fill();

  // 火漆内凹同心圆环
  ctx.setStrokeStyle('rgba(255, 215, 0, 0.45)');
  ctx.setLineWidth(2);
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 10, 0, Math.PI * 2);
  ctx.stroke();

  // 印泥铭文「阅痕」
  ctx.setFillStyle('#FFD700');
  ctx.setFontSize(28);
  ctx.setTextAlign('center');
  ctx.fillText('阅痕', sealX, sealY + 10);
  ctx.restore();

  // 6. 藏书作品大标题与作者
  let textY = sealY + sealR + 64;
  ctx.setFillStyle('#3D2B1F');
  ctx.setFontSize(36);
  ctx.setTextAlign('center');
  ctx.fillText(`《${book.title}》`, W / 2, textY);

  textY += 40;
  ctx.setFillStyle('#7A5835');
  ctx.setFontSize(22);
  ctx.fillText(`著者：${book.author || '未知'}`, W / 2, textY);

  // 7. 藏书铭言
  textY += 46;
  ctx.setFillStyle('#5C4632');
  ctx.setFontSize(20);
  const motto = book.shortComment || '“时间摧毁一切，唯独留下了爱过的痕迹。”';
  ctx.fillText(`“${motto}”`, W / 2, textY);

  // 8. 底部防伪编码
  ctx.setFillStyle('#B8976C');
  ctx.setFontSize(18);
  ctx.fillText('#EXL-2026-88019 · NO. 042 / CERTIFIED', W / 2, H - pad - 30);

  ctx.restore();
}

/**
 * 绘制羊皮纸金句随想卡 (Parchment Quote Card)
 * 尺寸：750 x 960
 */
export async function drawQuotePoster(
  ctx: UniApp.CanvasContext,
  book: Book,
  customQuote?: string,
): Promise<void> {
  const W = 750;
  const H = 960;

  ctx.save();
  // 温暖羊皮纸背景
  ctx.setFillStyle('#F5EFE6');
  ctx.fillRect(0, 0, W, H);

  // 纸张微倾斜视觉边框
  const pad = 50;
  ctx.setStrokeStyle('#D8CFBF');
  ctx.setLineWidth(2);
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  // 顶部便签纸眉标
  ctx.setFillStyle('#9E7638');
  ctx.setFontSize(20);
  ctx.setTextAlign('left');
  ctx.fillText('MEMOIR QUOTE // 灵感随想便笺', pad + 30, pad + 60);

  ctx.setFillStyle('#B4AA99');
  ctx.setFontSize(18);
  ctx.setTextAlign('right');
  ctx.fillText(new Date().toLocaleDateString(), W - pad - 30, pad + 60);

  // 引号装饰
  ctx.setFillStyle('rgba(158, 118, 56, 0.25)');
  ctx.setFontSize(120);
  ctx.setTextAlign('left');
  ctx.fillText('“', pad + 20, pad + 200);

  // 金句主体
  const quote = customQuote || book.shortComment || '在繁星熄灭之前，我们曾如此真实地活过、爱过与凝望过。';
  ctx.setFillStyle('#2C2A26');
  ctx.setFontSize(32);
  ctx.setTextAlign('center');
  drawWrappedText(ctx, quote, W / 2, pad + 250, W - pad * 2 - 80, 52, 5);

  // 来源题记
  ctx.setFillStyle('#9E7638');
  ctx.setFontSize(24);
  ctx.setTextAlign('right');
  ctx.fillText(`—— 《${book.title}》· ${book.author || '佚名'}`, W - pad - 50, H - pad - 120);

  // 底部策展印章
  ctx.setFillStyle('#A64B2A');
  ctx.setFontSize(22);
  ctx.setTextAlign('left');
  ctx.fillText('💮 阅痕精神档案 · 留存印记', pad + 30, H - pad - 40);

  ctx.restore();
}

/**
 * 统一执行海报生成并导出临时文件路径
 */
export async function generatePosterImage(
  canvasId: string,
  componentContext: any,
  options: PosterOptions,
): Promise<string> {
  let localCover: string | undefined = undefined;
  if (options.book.coverUrl) {
    try {
      localCover = await getLocalImagePath(options.book.coverUrl);
    } catch {
      localCover = undefined;
    }
  }

  const ctx = uni.createCanvasContext(canvasId, componentContext);

  if (options.type === 'ticket') {
    await drawMovieTicketPoster(ctx, options.book, localCover);
  } else if (options.type === 'exlibris') {
    await drawExLibrisPoster(ctx, options.book, localCover);
  } else {
    await drawQuotePoster(ctx, options.book, options.customQuote);
  }

  return new Promise((resolve, reject) => {
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvasId,
            destWidth: options.type === 'ticket' ? 1500 : options.type === 'exlibris' ? 1500 : 1500,
            destHeight: options.type === 'ticket' ? 2668 : options.type === 'exlibris' ? 2200 : 1920,
            fileType: 'png',
            quality: 1.0,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err),
          },
          componentContext,
        );
      }, 150);
    });
  });
}

/**
 * 保存图片到系统相册（带自动授权引导）
 */
export function savePosterToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({ title: '已保存至手机相册', icon: 'success' });
        resolve();
      },
      fail: (err) => {
        if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
          uni.showModal({
            title: '授权提示',
            content: '保存海报需要您授权访问相册权限，请前往设置开启',
            confirmText: '去开启',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting();
              }
            },
          });
        } else {
          uni.showToast({ title: '保存失败: ' + (err.errMsg || ''), icon: 'none' });
        }
        reject(err);
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 📜 藏库宣纸长卷（对齐 Android LibraryScrollPreviewActivity）
// 竖向长图：宣纸底 + 题签 + 藏品清单（封面/标题/作者/评分）+ 卷尾铭文
// ═══════════════════════════════════════════════════════════

/** 长卷单页最多收录条数（Canvas 高度上限保护） */
export const SCROLL_MAX_WORKS = 16;

/** 计算长卷画布高度（页面据此设置 canvas 元素尺寸） */
export function computeScrollHeight(worksCount: number): number {
  const count = Math.min(worksCount, SCROLL_MAX_WORKS);
  return 300 + count * 190 + 160;
}

/**
 * 绘制宣纸长卷内容（旧版 Canvas API，与既有海报一致）
 */
function drawLibraryScrollPoster(
  ctx: UniApp.CanvasContext,
  works: Book[],
  coverPaths: Map<number, string | undefined>,
): void {
  const W = 750;
  const list = works.slice(0, SCROLL_MAX_WORKS);
  const HEADER_H = 300;
  const ROW_H = 190;
  const FOOTER_H = 160;
  const H = computeScrollHeight(works.length);

  // 1. 宣纸底 + 轻微暖调渐变
  ctx.setFillStyle('#F6F1E8');
  ctx.fillRect(0, 0, W, H);
  ctx.setFillStyle('rgba(158, 118, 56, 0.045)');
  ctx.fillRect(0, 0, W, HEADER_H);

  // 2. 题签区
  ctx.setFillStyle('#9E7638');
  ctx.fillRect(60, 56, 96, 6); // 顶部金线
  ctx.setFontSize(22);
  ctx.setFillStyle('#8C887B');
  ctx.setTextAlign('left');
  ctx.fillText('READTRACE · LIBRARY SCROLL', 60, 108);
  ctx.setFontSize(52);
  ctx.setFillStyle('#1A1C19');
  ctx.fillText('精 神 藏 库 · 长 卷', 60, 178);
  ctx.setFontSize(24);
  ctx.setFillStyle('#686E64');
  ctx.fillText(`共收录 ${works.length} 部跨界藏品 · ${new Date().toISOString().slice(0, 10)}`, 60, 226);
  ctx.setFillStyle('#9E7638');
  ctx.fillRect(60, 258, W - 120, 3);

  // 3. 藏品行
  list.forEach((b, i) => {
    const rowY = HEADER_H + i * ROW_H;

    // 序号刊号
    ctx.setFontSize(26);
    ctx.setFillStyle('#9E7638');
    ctx.fillText(String(i + 1).padStart(2, '0'), 60, rowY + 108);

    // 封面
    const cover = coverPaths.get(b.id);
    const cx = 130;
    const cy = rowY + 20;
    const cw = 108;
    const ch = 150;
    if (cover) {
      ctx.drawImage(cover, cx, cy, cw, ch);
    } else {
      ctx.setFillStyle('#EAE2D5');
      ctx.fillRect(cx, cy, cw, ch);
      ctx.setFontSize(40);
      ctx.setTextAlign('center');
      ctx.fillText('📖', cx + cw / 2, cy + ch / 2 + 14);
      ctx.setTextAlign('left');
    }
    ctx.setStrokeStyle('rgba(0, 0, 0, 0.08)');
    ctx.setLineWidth(1);
    ctx.strokeRect(cx, cy, cw, ch);

    // 文本区
    const tx = 270;
    const title = b.title.length > 13 ? b.title.slice(0, 12) + '…' : b.title;
    ctx.setFontSize(32);
    ctx.setFillStyle('#1A1C19');
    ctx.fillText(`《${title}》`, tx, rowY + 62);

    const meta = [b.author || '未知作者', b.category].filter(Boolean).join(' · ');
    ctx.setFontSize(23);
    ctx.setFillStyle('#686E64');
    ctx.fillText(meta.length > 18 ? meta.slice(0, 17) + '…' : meta, tx, rowY + 102);

    if (b.rating) {
      ctx.setFontSize(24);
      ctx.setFillStyle('#9E7638');
      ctx.fillText(`★ ${b.rating.toFixed(1)}`, tx, rowY + 142);
    }
    if (b.shortComment) {
      const c = b.shortComment.length > 12 ? b.shortComment.slice(0, 11) + '…' : b.shortComment;
      ctx.setFontSize(22);
      ctx.setFillStyle('#8C887B');
      ctx.fillText(`“${c}”`, tx + 120, rowY + 142);
    }

    // 行分隔线
    ctx.setStrokeStyle('rgba(0, 0, 0, 0.06)');
    ctx.beginPath();
    ctx.moveTo(60, rowY + ROW_H - 6);
    ctx.lineTo(W - 60, rowY + ROW_H - 6);
    ctx.stroke();
  });

  // 4. 卷尾铭文
  const footY = H - 90;
  ctx.setTextAlign('center');
  ctx.setFillStyle('#9E7638');
  ctx.fillRect(W / 2 - 60, footY - 44, 120, 2);
  ctx.setFontSize(24);
  ctx.setFillStyle('#5C584E');
  ctx.fillText('— 记录看过的作品，也记录当时的自己 —', W / 2, footY);
  ctx.setFontSize(19);
  ctx.setFillStyle('#8C887B');
  ctx.fillText('READTRACE CURATOR ARCHIVE · VOL. I', W / 2, footY + 38);
  ctx.setTextAlign('left');
}

/**
 * 生成藏库长卷临时文件（离屏 Canvas → PNG 长图）
 * 页面需提供尺寸为 750 x computeScrollHeight(works.length) px 的 canvas 元素
 */
export async function generateLibraryScroll(
  canvasId: string,
  componentContext: any,
  works: Book[],
): Promise<string> {
  const list = works.slice(0, SCROLL_MAX_WORKS);

  // 封面预下载（尽力而为，失败回退占位）
  const coverPaths = new Map<number, string | undefined>();
  for (const w of list) {
    if (w.coverUrl) {
      try {
        coverPaths.set(w.id, await getLocalImagePath(w.coverUrl));
      } catch {
        coverPaths.set(w.id, undefined);
      }
    }
  }

  const ctx = uni.createCanvasContext(canvasId, componentContext);
  drawLibraryScrollPoster(ctx, works, coverPaths);
  const H = computeScrollHeight(works.length);

  return new Promise((resolve, reject) => {
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvasId,
            width: 750,
            height: H,
            destWidth: 1500,
            destHeight: H * 2,
            fileType: 'png',
            quality: 1.0,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err),
          },
          componentContext,
        );
      }, 200);
    });
  });
}
