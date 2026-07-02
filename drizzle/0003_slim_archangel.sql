CREATE TABLE `hit_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameType` enum('euroMillion','toto') NOT NULL,
	`strategy` enum('hot','cold','balanced') NOT NULL,
	`totalSuggestions` int NOT NULL DEFAULT 0,
	`totalHits` int NOT NULL DEFAULT 0,
	`accuracyRate` varchar(10) NOT NULL DEFAULT '0%',
	`avgMatchedNumbers` varchar(10) NOT NULL DEFAULT '0',
	`avgMatchedStars` varchar(10),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hit_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestion_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameType` enum('euroMillion','toto') NOT NULL,
	`strategy` enum('hot','cold','balanced') NOT NULL,
	`numbers` text NOT NULL,
	`stars` text,
	`luckyNumber` int,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`drawDate` varchar(10),
	`matchedNumbers` int NOT NULL DEFAULT 0,
	`matchedStars` int DEFAULT 0,
	`matchedLucky` int DEFAULT 0,
	`isHit` int NOT NULL DEFAULT 0,
	`hitType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suggestion_history_id` PRIMARY KEY(`id`)
);
