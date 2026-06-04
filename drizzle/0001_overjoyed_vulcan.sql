CREATE TABLE `euro_million_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`number1` int NOT NULL,
	`number2` int NOT NULL,
	`number3` int NOT NULL,
	`number4` int NOT NULL,
	`number5` int NOT NULL,
	`star1` int NOT NULL,
	`star2` int NOT NULL,
	`hasWinner` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `euro_million_draws_id` PRIMARY KEY(`id`),
	CONSTRAINT `euro_million_draws_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `toto_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`number1` int NOT NULL,
	`number2` int NOT NULL,
	`number3` int NOT NULL,
	`number4` int NOT NULL,
	`number5` int NOT NULL,
	`number6` int NOT NULL,
	`luckyNumber` int NOT NULL,
	`hasWinner` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toto_draws_id` PRIMARY KEY(`id`),
	CONSTRAINT `toto_draws_date_unique` UNIQUE(`date`)
);
