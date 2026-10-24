// Shared between scripts/build-catalog.ts (Bun) and the app (React Native).
// Keep this file free of runtime-specific imports.

export type ChannelConfig = {
  handle: string;
  limit?: number;
};

export type CatalogVideo = {
  id: string;
  title: string;
  duration: number;
  timestamp: number; // unix seconds; approximate upload time
};

export type CatalogChannelFile = {
  id: string;
  handle: string;
  name: string;
  videos: CatalogVideo[];
};

export type CatalogChannel = {
  id: string;
  handle: string;
  name: string;
  videoCount: number;
  hash: string;
  file: string; // relative to index.json
};

export type CatalogIndex = {
  schema: 1;
  version: string;
  generatedAt: string;
  channels: CatalogChannel[];
};

export const HANDLE_PATTERN = /^[A-Za-z0-9._-]{3,100}$/;
const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

export function isValidVideo(v: any): v is CatalogVideo {
  return (
    v != null &&
    typeof v.id === 'string' && VIDEO_ID_PATTERN.test(v.id) &&
    typeof v.title === 'string' && v.title.length > 0 &&
    Number.isFinite(v.duration) && v.duration > 0 &&
    Number.isFinite(v.timestamp) && v.timestamp > 0
  );
}

export function isValidIndex(v: any): v is CatalogIndex {
  return (
    v != null &&
    v.schema === 1 &&
    typeof v.version === 'string' &&
    Array.isArray(v.channels) &&
    v.channels.every((c: any) =>
      typeof c.id === 'string' &&
      typeof c.handle === 'string' &&
      typeof c.name === 'string' &&
      typeof c.hash === 'string' &&
      typeof c.file === 'string' &&
      Number.isFinite(c.videoCount)
    )
  );
}

export function thumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
