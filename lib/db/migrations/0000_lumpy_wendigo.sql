CREATE TABLE `instruments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`value_per_point` real DEFAULT 1 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instruments_symbol_unique` ON `instruments` (`symbol`);--> statement-breakpoint
CREATE TABLE `mistake_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mistake_tags_name_unique` ON `mistake_tags` (`name`);--> statement-breakpoint
CREATE TABLE `trade_mistakes` (
	`trade_id` integer NOT NULL,
	`mistake_tag_id` integer NOT NULL,
	FOREIGN KEY (`trade_id`) REFERENCES `trades`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mistake_tag_id`) REFERENCES `mistake_tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`instrument_id` integer NOT NULL,
	`direction` text NOT NULL,
	`trade_date` text NOT NULL,
	`entry_time` text,
	`entry_price` real NOT NULL,
	`exit_time` text,
	`exit_price` real NOT NULL,
	`lot_size` real NOT NULL,
	`stop_loss` real,
	`take_profit` real,
	`fees` real DEFAULT 0 NOT NULL,
	`setup` text,
	`followed_plan` integer DEFAULT false NOT NULL,
	`pre_emotion` text NOT NULL,
	`confidence` integer DEFAULT 3 NOT NULL,
	`reflection` text,
	`notes` text,
	`screenshot_path` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON UPDATE no action ON DELETE no action
);
