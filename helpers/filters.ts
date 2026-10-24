import { lte, sql, type SQL } from 'drizzle-orm';
import { videos } from '@/db/schema';

// Parent-defined rules that hide videos from the kid view on top of the
// per-video `hidden` flag. Applied at query time, so a change takes effect
// immediately without a catalog sync.
export type VideoFilters = {
  keywords: string[]; // matched as case-insensitive substrings of the title
  maxDurationMinutes: number | null;
};

export const NO_FILTERS: VideoFilters = { keywords: [], maxDurationMinutes: null };

export type BlockReason = 'keyword' | 'duration';

// SQLite's lower() only folds ASCII, so the JS side does the same; otherwise
// the parent view and the kid query could disagree about a title.
function asciiLower(s: string) {
  return s.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

export function normalizeKeyword(input: string) {
  return asciiLower(input.trim().replace(/\s+/g, ' '));
}

export function addKeyword(keywords: string[], input: string) {
  const keyword = normalizeKeyword(input);
  return keyword && !keywords.includes(keyword) ? [...keywords, keyword] : keywords;
}

export function blockedReason(video: { title: string; duration: number }, filters: VideoFilters): BlockReason | null {
  const title = asciiLower(video.title);
  if (filters.keywords.some((k) => title.includes(k))) return 'keyword';
  if (filters.maxDurationMinutes !== null && video.duration > filters.maxDurationMinutes * 60) return 'duration';
  return null;
}

// The SQL twin of blockedReason() === null.
export function filterConditions(filters: VideoFilters): SQL[] {
  const conditions = filters.keywords.map((k) => sql`instr(lower(${videos.title}), ${k}) = 0`);
  if (filters.maxDurationMinutes !== null) conditions.push(lte(videos.duration, filters.maxDurationMinutes * 60));
  return conditions;
}

export function parseFilters(keywordsJson: string | null, maxDuration: string | null): VideoFilters {
  let keywords: string[] = [];
  try {
    const parsed = JSON.parse(keywordsJson ?? '[]');
    if (Array.isArray(parsed)) keywords = parsed.filter((k): k is string => typeof k === 'string' && k.length > 0);
  } catch {}
  const minutes = Number(maxDuration);
  return { keywords, maxDurationMinutes: maxDuration && minutes > 0 ? minutes : null };
}
