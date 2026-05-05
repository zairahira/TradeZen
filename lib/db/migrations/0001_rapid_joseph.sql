CREATE TABLE `trading_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trading_models_name_unique` ON `trading_models` (`name`);--> statement-breakpoint
ALTER TABLE `trades` ADD `model_id` integer REFERENCES trading_models(id);