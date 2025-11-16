CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`total_videos` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`duration` integer NOT NULL,
	`views` integer NOT NULL,
	`thumbnail` text NOT NULL,
	`timestamp` integer NOT NULL,
	`channel_id` text NOT NULL,
	`channel_name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `videos_channel_id_index` ON `videos` (`channel_id`);