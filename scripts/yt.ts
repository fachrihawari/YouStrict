import type { CatalogVideo } from '../catalog/schema';
import { isValidVideo } from '../catalog/schema';

const MIN_DURATION_SECONDS = 60;

export type ChannelFetchResult = {
  id: string;
  name: string;
  videos: CatalogVideo[];
  dropped: number;
};

// One yt-dlp call per channel: the flat /videos tab already carries title,
// duration and (approximate) upload time, so no per-video requests.
export async function fetchChannel(handle: string, limit?: number): Promise<ChannelFetchResult> {
  const args = [
    'yt-dlp',
    '--flat-playlist',
    '--dump-single-json',
    '--no-warnings',
    '--extractor-args', 'youtubetab:approximate_date',
  ];
  if (limit) args.push('--playlist-end', String(limit));
  args.push(`https://www.youtube.com/@${handle}/videos`);

  const proc = Bun.spawn(args, { stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(`yt-dlp exited with ${exitCode}: ${stderr.trim().split('\n').pop()}`);
  }

  const data = JSON.parse(stdout);
  if (typeof data.channel_id !== 'string') {
    throw new Error('yt-dlp returned no channel_id');
  }

  const seen = new Set<string>();
  const videos: CatalogVideo[] = [];
  let dropped = 0;
  for (const e of data.entries ?? []) {
    const video = {
      id: e.id,
      title: e.title,
      duration: e.duration,
      timestamp: e.timestamp,
    };
    const isLive = e.live_status === 'is_live' || e.live_status === 'is_upcoming';
    if (!isValidVideo(video) || isLive || video.duration < MIN_DURATION_SECONDS || seen.has(video.id)) {
      dropped++;
      continue;
    }
    seen.add(video.id);
    videos.push(video);
  }

  return { id: data.channel_id, name: data.channel ?? handle, videos, dropped };
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < attempts - 1) await Bun.sleep(2000 * 2 ** i);
    }
  }
  throw lastError;
}
