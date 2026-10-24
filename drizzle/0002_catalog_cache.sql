-- The local DB is only a cache of the published catalog: rebuild it from scratch.
DROP TABLE IF EXISTS `videos`;--> statement-breakpoint
DROP TABLE IF EXISTS `channels`;--> statement-breakpoint
DROP TABLE IF EXISTS `settings`;--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`name` text NOT NULL,
	`video_count` integer NOT NULL,
	`hash` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`title` text NOT NULL,
	`duration` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `videos_channel_timestamp_index` ON `videos` (`channel_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `videos_timestamp_index` ON `videos` (`timestamp`,`id`);