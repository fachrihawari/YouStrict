import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  duration: int("duration").notNull(),
  views: int("views").notNull(),
  thumbnail: text("thumbnail").notNull(),
  timestamp: int("timestamp").notNull(),
  channelId: text("channel_id").notNull(),
  channelName: text("channel_name").notNull(),
}, (t) => [
  index("videos_channel_id_index").on(t.channelId),
]);

export type Video = typeof videos.$inferSelect;

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  totalVideos: int("total_videos").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(), // keys: lastUpdatedAt, ...
  value: text("value").notNull(),
});

export const schema = {
  videos,
  channels,
  settings,
}
