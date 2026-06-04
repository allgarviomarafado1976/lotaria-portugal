CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`favoriteId` int NOT NULL,
	`gameType` enum('euroMillion','toto') NOT NULL,
	`drawDate` varchar(10) NOT NULL,
	`matchedNumbers` text NOT NULL,
	`matchedStars` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameType` enum('euroMillion','toto') NOT NULL,
	`numbers` text NOT NULL,
	`stars` text,
	`luckyNumber` int,
	`name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);
