/**
 * 🛡️ 阅痕 ReadTrace 数据主权引擎 (Backup & Data Sovereign)
 *
 * 与 Android 原生 BackupHelper.kt & WechatMinappSyncProtocol.kt 100% 同构：
 * 1. 兼容解析 Android 原生 Sovereign Backup (Schema v5 / v4 / v2) 与小程序同步包
 * 2. 导出与 Android 端完全互认的 readtrace_backup_*.json
 * 3. 导出 Markdown 笔记文集与 CSV 表格
 * 4. 回收站软删除/彻底删除/一键恢复闭环
 * 5. 账号数据清空物理擦除（二次确认防误触）
 * 6. 策展人最爱（Curator Favorites）管理
 */

import type { Book, Note, Mindprint, BookCharacter, BookOutline, ReadingSession, AudioTrackItem, MediaType } from './models';
import {
  loadLocalWorks,
  loadAllLocalWorks,
  saveLocalWorks,
  loadLocalNotes,
  loadAllLocalNotes,
  loadLocalMindprints,
} from './sync';

const STORAGE_KEYS = {
  works: 'rt_local_works',
  notes: 'rt_local_notes',
  mindprints: 'rt_local_mindprints',
};

export interface BackupSummary {
  app: string;
  schemaVersion: number;
  exportedAt: string;
  worksCount: number;
  notesCount: number;
}

/** 生成与 Android BackupHelper 100% 兼容的全量 JSON 备份包 */
export function exportJsonBackup(): string {
  const works = loadAllLocalWorks();
  const allNotes = loadAllLocalNotes();
  const allMindprints = loadLocalMindprints();

  const worksBackup = works.map((book) => {
    const bookNotes = allNotes.filter((n) => n.bookId === book.id && !n.isDeleted);
    const mindprint = allMindprints.find((m) => m.bookId === book.id);

    return {
      title: book.title,
      author: book.author || '',
      coverUrl: book.coverUrl || '',
      category: book.category || '',
      status: book.status,
      mediaType: book.mediaType,
      rating: book.rating,
      tags: book.tags || [],
      shortComment: book.shortComment || '',
      review: book.review || '',
      startDate: book.startDate || '',
      finishDate: book.finishDate || '',
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      sourceType: book.sourceType || '',
      sourceId: book.sourceId || '',
      description: book.description || '',
      remoteRating: book.remoteRating || null,
      isDeleted: !!book.isDeleted,
      deletedAt: book.deletedAt || '',
      isFavorite: !!book.isFavorite,
      favoriteReason: book.favoriteReason || '',
      favoriteOrder: book.favoriteOrder || 0,
      notes: bookNotes.map((n) => ({
        content: n.content,
        noteType: n.noteType,
        page: n.page || '',
        chapter: n.chapter || '',
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        isDeleted: !!n.isDeleted,
        deletedAt: n.deletedAt || '',
      })),
      characters: book.characters || [],
      outlines: book.outlines || [],
      sessions: book.sessions || [],
      audioTracks: book.audioTracks || [],
      mindprint: mindprint
        ? {
            depthScore: mindprint.depthScore,
            artistryScore: mindprint.artistryScore,
            emotionScore: mindprint.emotionScore,
            logicScore: mindprint.logicScore,
            difficultyScore: mindprint.difficultyScore,
            healingScore: mindprint.healingScore,
            updatedAt: mindprint.updatedAt,
          }
        : null,
    };
  });

  const root = {
    app: 'ReadTrace',
    version: '3.0',
    schemaVersion: 5,
    exportedAt: new Date().toISOString(),
    worksCount: worksBackup.length,
    notesCount: allNotes.filter((n) => !n.isDeleted).length,
    works: worksBackup,
  };

  return JSON.stringify(root, null, 2);
}

/** 生成 Markdown 格式读书笔记文集 */
export function exportMarkdownNotes(): string {
  const works = loadLocalWorks().filter((b) => !b.isDeleted);
  const notes = loadLocalNotes().filter((n) => !n.isDeleted);

  let md = `# 阅痕 ReadTrace · 精神印记与读书笔记文集\n\n`;
  md += `> 导出时间：${new Date().toLocaleString()}\n`;
  md += `> 馆藏总数：${works.length} 部 · 随感总数：${notes.length} 条\n\n---\n\n`;

  for (const book of works) {
    md += `## 《${book.title}》\n\n`;
    md += `- **创作者**：${book.author || '未知'}\n`;
    md += `- **媒介分类**：${book.mediaType} | 状态：${book.status}\n`;
    if (book.rating) md += `- **个人评分**：★ ${book.rating.toFixed(1)} / 10.0\n`;
    if (book.tags && book.tags.length > 0) md += `- **标签**：${book.tags.map((t) => '#' + t).join(' ')}\n`;
    if (book.shortComment) md += `\n> 题记金句：${book.shortComment}\n`;
    if (book.review) md += `\n### 深度长评\n\n${book.review}\n`;

    const bookNotes = notes.filter((n) => n.bookId === book.id);
    if (bookNotes.length > 0) {
      md += `\n### 心印随感 (${bookNotes.length})\n\n`;
      bookNotes.forEach((n, idx) => {
        md += `**[${idx + 1}]** ${n.noteType === 'quote' ? '『摘录』' : '『感悟』'}`;
        if (n.chapter) md += ` · ${n.chapter}`;
        if (n.page) md += ` (P.${n.page})`;
        md += `\n\n${n.content}\n\n*— 记于 ${n.createdAt.slice(0, 10)}*\n\n`;
      });
    }

    if (book.characters && book.characters.length > 0) {
      md += `\n### 登场角色谱\n\n`;
      book.characters.forEach((c) => {
        md += `- **${c.avatarEmoji || '👤'} ${c.name}**（${c.roleTitle || '人物'}）：${c.description || ''}\n`;
      });
      md += `\n`;
    }

    if (book.outlines && book.outlines.length > 0) {
      md += `\n### 分幕 / 章节大纲\n\n`;
      book.outlines.forEach((o) => {
        md += `${o.chapterOrder}. **${o.title}**\n   ${o.summary}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

/** 生成 CSV 格式典藏表格 */
export function exportCsvWorks(): string {
  const works = loadLocalWorks().filter((b) => !b.isDeleted);
  const headers = ['ID', '标题', '创作者', '媒介类型', '阅读状态', '评分', '标签', '简评', '录入时间'];
  const rows = works.map((b) => [
    b.id,
    `"${(b.title || '').replace(/"/g, '""')}"`,
    `"${(b.author || '').replace(/"/g, '""')}"`,
    b.mediaType,
    b.status,
    b.rating ?? '',
    `"${(b.tags || []).join('; ')}"`,
    `"${(b.shortComment || '').replace(/"/g, '""')}"`,
    b.createdAt,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/** 解析并导入备份 JSON（兼容 Android Sovereign Backup 与小程序格式） */
export function parseAndImportBackup(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge',
): { success: boolean; worksCount: number; notesCount: number; message: string } {
  try {
    const root = JSON.parse(jsonString);
    let rawWorks: any[] = [];

    // 分支 1：标准 Android BackupHelper 或小程序格式（根节点有 works[]）
    if (Array.isArray(root.works)) {
      rawWorks = root.works;
    }
    // 分支 2：直接是数组
    else if (Array.isArray(root)) {
      rawWorks = root;
    } else {
      return { success: false, worksCount: 0, notesCount: 0, message: '无效的 JSON 格式：未找到作品列表 (works)' };
    }

    const currentWorks = mode === 'replace' ? [] : loadAllLocalWorks();
    const currentNotes = mode === 'replace' ? [] : loadAllLocalNotes();
    const currentMindprints = mode === 'replace' ? [] : loadLocalMindprints();

    let maxBookId = currentWorks.reduce((max, b) => Math.max(max, b.id || 0), 0);
    let maxNoteId = currentNotes.reduce((max, n) => Math.max(max, n.id || 0), 0);

    let importedWorksCount = 0;
    let importedNotesCount = 0;

    for (const item of rawWorks) {
      const title = (item.title || '').trim();
      if (!title) continue;

      // 检查是否已存在同名作品
      let targetBook = currentWorks.find((b) => b.title.trim().toLowerCase() === title.toLowerCase());

      if (!targetBook) {
        maxBookId++;
        targetBook = {
          id: maxBookId,
          title,
          author: item.author || null,
          coverUrl: item.coverUrl || null,
          category: item.category || null,
          status: item.status || 'reading',
          mediaType: (item.mediaType || item.media_type || 'book') as MediaType,
          rating: item.rating !== undefined && item.rating !== null ? Number(item.rating) : null,
          tags: Array.isArray(item.tags) ? item.tags : [],
          shortComment: item.shortComment || item.short_comment || null,
          review: item.review || null,
          startDate: item.startDate || null,
          finishDate: item.finishDate || null,
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
          sourceType: item.sourceType || null,
          sourceId: item.sourceId || null,
          remoteRating: item.remoteRating ? Number(item.remoteRating) : null,
          description: item.description || null,
          isDeleted: !!item.isDeleted,
          deletedAt: item.deletedAt || null,
          isFavorite: !!item.isFavorite,
          favoriteReason: item.favoriteReason || null,
          favoriteOrder: item.favoriteOrder || 0,
          characters: Array.isArray(item.characters) ? item.characters : [],
          outlines: Array.isArray(item.outlines) ? item.outlines : [],
          sessions: Array.isArray(item.sessions) ? item.sessions : [],
          audioTracks: Array.isArray(item.audioTracks) ? item.audioTracks : [],
        };
        currentWorks.push(targetBook);
        importedWorksCount++;
      } else {
        // 合并更新已有作品的高阶字段
        if (item.characters && Array.isArray(item.characters) && item.characters.length > 0) {
          targetBook.characters = item.characters;
        }
        if (item.outlines && Array.isArray(item.outlines) && item.outlines.length > 0) {
          targetBook.outlines = item.outlines;
        }
        if (item.coverUrl && !targetBook.coverUrl) {
          targetBook.coverUrl = item.coverUrl;
        }
        if (item.isFavorite !== undefined) {
          targetBook.isFavorite = item.isFavorite;
        }
      }

      // 导入随感笔记
      const rawNotes = Array.isArray(item.notes) ? item.notes : [];
      for (const n of rawNotes) {
        const content = (n.content || '').trim();
        if (!content) continue;

        // 去重：同一作品下内容完全相同的笔记不再重复添加
        const exists = currentNotes.some((cn) => cn.bookId === targetBook!.id && cn.content.trim() === content);
        if (!exists) {
          maxNoteId++;
          currentNotes.push({
            id: maxNoteId,
            bookId: targetBook.id,
            content,
            noteType: n.noteType === 'quote' ? 'quote' : 'note',
            page: n.page || null,
            chapter: n.chapter || null,
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
            isDeleted: !!n.isDeleted,
            deletedAt: n.deletedAt || null,
          });
          importedNotesCount++;
        }
      }

      // 导入六维心智
      if (item.mindprint && typeof item.mindprint === 'object') {
        const mp = item.mindprint;
        const existsMpIndex = currentMindprints.findIndex((m) => m.bookId === targetBook!.id);
        const newMp: Mindprint = {
          bookId: targetBook.id,
          depthScore: Number(mp.depthScore || mp.depth || 5.0),
          artistryScore: Number(mp.artistryScore || mp.artistry || 5.0),
          emotionScore: Number(mp.emotionScore || mp.emotion || 5.0),
          logicScore: Number(mp.logicScore || mp.logic || 5.0),
          difficultyScore: Number(mp.difficultyScore || mp.difficulty || 5.0),
          healingScore: Number(mp.healingScore || mp.healing || 5.0),
          updatedAt: mp.updatedAt || new Date().toISOString(),
        };
        if (existsMpIndex >= 0) {
          currentMindprints[existsMpIndex] = newMp;
        } else {
          currentMindprints.push(newMp);
        }
      }
    }

    saveLocalWorks(currentWorks);
    uni.setStorageSync(STORAGE_KEYS.notes, currentNotes);
    uni.setStorageSync(STORAGE_KEYS.mindprints, currentMindprints);

    return {
      success: true,
      worksCount: importedWorksCount,
      notesCount: importedNotesCount,
      message: `成功导入 ${importedWorksCount} 部作品，${importedNotesCount} 条笔记随感`,
    };
  } catch (err: any) {
    return {
      success: false,
      worksCount: 0,
      notesCount: 0,
      message: `JSON 解析失败: ${err?.message || '未知错误'}`,
    };
  }
}

// ---------------------------------------------------------------- 回收站（Trash）

/** 获取回收站已归档作品 */
export function getArchivedWorks(): Book[] {
  return loadAllLocalWorks().filter((b) => !!b.isDeleted);
}

/** 获取回收站已归档笔记 */
export function getArchivedNotes(): (Note & { bookTitle?: string })[] {
  const works = loadAllLocalWorks();
  const notes = loadAllLocalNotes();
  const workMap = new Map(works.map((w) => [w.id, w.title]));

  return notes
    .filter((n) => !!n.isDeleted)
    .map((n) => ({
      ...n,
      bookTitle: workMap.get(n.bookId) || '未知作品',
    }));
}

/** 软删除作品 */
export function softDeleteWork(bookId: number) {
  const works = loadAllLocalWorks();
  const target = works.find((b) => b.id === bookId);
  if (target) {
    target.isDeleted = true;
    target.deletedAt = new Date().toISOString();
    saveLocalWorks(works);
  }
}

/** 从回收站恢复作品 */
export function restoreWork(bookId: number) {
  const works = loadAllLocalWorks();
  const target = works.find((b) => b.id === bookId);
  if (target) {
    target.isDeleted = false;
    target.deletedAt = null;
    saveLocalWorks(works);
  }
}

/** 彻底物理粉碎作品 */
export function purgeWork(bookId: number) {
  const works = loadAllLocalWorks().filter((b) => b.id !== bookId);
  saveLocalWorks(works);
  // 同步清理关联笔记与心智
  const notes = loadAllLocalNotes().filter((n) => n.bookId !== bookId);
  uni.setStorageSync(STORAGE_KEYS.notes, notes);
  const mindprints = loadLocalMindprints().filter((m) => m.bookId !== bookId);
  uni.setStorageSync(STORAGE_KEYS.mindprints, mindprints);
}

/** 从回收站恢复笔记 */
export function restoreNote(noteId: number) {
  const notes = loadAllLocalNotes();
  const target = notes.find((n) => n.id === noteId);
  if (target) {
    target.isDeleted = false;
    target.deletedAt = null;
    uni.setStorageSync(STORAGE_KEYS.notes, notes);
  }
}

/** 彻底物理粉碎笔记 */
export function purgeNote(noteId: number) {
  const notes = loadAllLocalNotes().filter((n) => n.id !== noteId);
  uni.setStorageSync(STORAGE_KEYS.notes, notes);
}

/** 清空回收站全部内容 */
export function purgeAllTrash() {
  const works = loadAllLocalWorks().filter((b) => !b.isDeleted);
  saveLocalWorks(works);
  const notes = loadAllLocalNotes().filter((n) => !n.isDeleted);
  uni.setStorageSync(STORAGE_KEYS.notes, notes);
}

// ---------------------------------------------------------------- 危险操作：清空账号数据

/** 清空账号所有数据（严格物理抹除） */
export function wipeAllAccountData() {
  uni.removeStorageSync(STORAGE_KEYS.works);
  uni.removeStorageSync(STORAGE_KEYS.notes);
  uni.removeStorageSync(STORAGE_KEYS.mindprints);
}

// ---------------------------------------------------------------- 策展人最爱（Curator Favorites）

/** 获取最爱列表 */
export function getFavorites(mediaType?: MediaType): Book[] {
  const works = loadAllLocalWorks().filter((b) => !b.isDeleted && !!b.isFavorite);
  if (mediaType) {
    return works.filter((b) => b.mediaType === mediaType).sort((a, b) => (a.favoriteOrder || 0) - (b.favoriteOrder || 0));
  }
  return works.sort((a, b) => (a.favoriteOrder || 0) - (b.favoriteOrder || 0));
}

/** 设置最爱状态与策展推荐语 */
export function toggleFavorite(bookId: number, isFav: boolean, reason?: string) {
  const works = loadAllLocalWorks();
  const target = works.find((b) => b.id === bookId);
  if (target) {
    target.isFavorite = isFav;
    if (reason !== undefined) target.favoriteReason = reason;
    if (isFav && !target.favoriteOrder) {
      const currentFavs = works.filter((b) => b.isFavorite && b.mediaType === target.mediaType);
      target.favoriteOrder = currentFavs.length + 1;
    }
    saveLocalWorks(works);
  }
}
