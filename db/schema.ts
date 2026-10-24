import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Local cache of the published catalog (see catalog/schema.ts), plus
// parent choices (`enabled`, `hidden`) that survive catalog syncs.

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  handle: text("handle").notNull(),
  name: text("name").notNull(),
  videoCount: int("video_count").notNull(),
  hash: text("hash").notNull(),
  enabled: int("enabled", { mode: "boolean" }).notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
});

export type Channel = typeof channels.$inferSelect;

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  duration: int("duration").notNull(),
  timestamp: int("timestamp").notNull(),
  hidden: int("hidden", { mode: "boolean" }).notNull().default(false),
}, (t) => [
  index("videos_channel_timestamp_index").on(t.channelId, t.timestamp),
  index("videos_timestamp_index").on(t.timestamp, t.id),
]);

export type Video = typeof videos.$inferSelect;

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(), // keys: catalogVersion, lastSyncAt, lastSyncError
  value: text("value").notNull(),
});

// What the child watched, for the parent's History screen. Title and channel
// name are copied (no foreign keys) so entries outlive catalog changes.
export const watchHistory = sqliteTable("watch_history", {
  id: int("id").primaryKey({ autoIncrement: true }),
  videoId: text("video_id").notNull(),
  channelId: text("channel_id").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  startedAt: int("started_at").notNull(), // epoch ms
  watchedSeconds: int("watched_seconds").notNull().default(0),
}, (t) => [
  index("watch_history_started_at_index").on(t.startedAt),
]);

export type WatchHistoryEntry = typeof watchHistory.$inferSelect;

export const schema = {
  videos,
  channels,
  settings,
  watchHistory,
}
