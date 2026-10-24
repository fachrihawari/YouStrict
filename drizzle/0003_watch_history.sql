CREATE TABLE `watch_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`title` text NOT NULL,
	`channel_name` text NOT NULL,
	`started_at` integer NOT NULL,
	`watched_seconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `watch_history_started_at_index` ON `watch_history` (`started_at`);