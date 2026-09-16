CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(120) NOT NULL,
	`entity` varchar(120) NOT NULL,
	`entityId` varchar(120),
	`previousValue` json,
	`newValue` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_sources` (
	`id` varchar(64) NOT NULL,
	`name` varchar(180) NOT NULL,
	`organization` varchar(180) NOT NULL,
	`url` text NOT NULL,
	`coverage` text NOT NULL,
	`variables` text NOT NULL,
	`frequency` varchar(160),
	`lastRetrievedAt` timestamp,
	`status` varchar(80) NOT NULL,
	`dataType` enum('public source','synthetic') NOT NULL,
	CONSTRAINT `data_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disaster_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regionId` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`hazardType` varchar(80) NOT NULL,
	`severity` double NOT NULL,
	`status` varchar(40) NOT NULL,
	`synthetic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disaster_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospitals` (
	`id` varchar(64) NOT NULL,
	`name` varchar(180) NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(120) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`totalBeds` int NOT NULL,
	`availableBeds` int NOT NULL,
	`icuBeds` int NOT NULL,
	`emergencyBeds` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`phone` varchar(40),
	`syntheticCapacity` boolean NOT NULL DEFAULT true,
	CONSTRAINT `hospitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `model_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(80) NOT NULL,
	`weights` json NOT NULL,
	`thresholds` json NOT NULL,
	`tankerConfig` json NOT NULL,
	`active` boolean NOT NULL DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `model_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regionId` varchar(64) NOT NULL,
	`hazardType` enum('flood','flash_flood','landslide','water_deficiency') NOT NULL,
	`riskScore` double NOT NULL,
	`riskCategory` varchar(40) NOT NULL,
	`contributions` json NOT NULL,
	`modelVersion` varchar(80) NOT NULL,
	`weightVersion` varchar(80) NOT NULL,
	`inputDataTimestamp` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`country` varchar(80) NOT NULL,
	`state` varchar(120) NOT NULL,
	`basin` varchar(160) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`population` int NOT NULL,
	`dataType` enum('public','synthetic','mixed') NOT NULL DEFAULT 'mixed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_resources` (
	`id` varchar(64) NOT NULL,
	`regionId` varchar(64) NOT NULL,
	`availableMld` double NOT NULL,
	`demandMld` double NOT NULL,
	`groundwaterIndex` double NOT NULL,
	`rainfallMm` double NOT NULL,
	`dataType` enum('public','synthetic','mixed') NOT NULL DEFAULT 'mixed',
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `water_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','DBA','DISASTER_MANAGER','WATER_MANAGER','HOSPITAL_MANAGER') NOT NULL DEFAULT 'user';