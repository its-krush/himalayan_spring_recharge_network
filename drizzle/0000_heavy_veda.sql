CREATE TYPE "public"."hazard_type" AS ENUM('flood', 'flash_flood', 'landslide', 'water_deficiency');--> statement-breakpoint
CREATE TYPE "public"."region_data_type" AS ENUM('public', 'synthetic', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."source_data_type" AS ENUM('public source', 'synthetic');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'DBA', 'DISASTER_MANAGER', 'WATER_MANAGER', 'HOSPITAL_MANAGER');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"action" varchar(120) NOT NULL,
	"entity" varchar(120) NOT NULL,
	"entityId" varchar(120),
	"previousValue" jsonb,
	"newValue" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"organization" varchar(180) NOT NULL,
	"url" text NOT NULL,
	"coverage" text NOT NULL,
	"variables" text NOT NULL,
	"frequency" varchar(160),
	"lastRetrievedAt" timestamp with time zone,
	"status" varchar(80) NOT NULL,
	"dataType" "source_data_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disaster_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"regionId" varchar(64) NOT NULL,
	"title" varchar(180) NOT NULL,
	"hazardType" varchar(80) NOT NULL,
	"severity" double precision NOT NULL,
	"status" varchar(40) NOT NULL,
	"synthetic" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(120) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"totalBeds" integer NOT NULL,
	"availableBeds" integer NOT NULL,
	"icuBeds" integer NOT NULL,
	"emergencyBeds" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"phone" varchar(40),
	"syntheticCapacity" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" varchar(80) NOT NULL,
	"weights" jsonb NOT NULL,
	"thresholds" jsonb NOT NULL,
	"tankerConfig" jsonb NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"createdBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"regionId" varchar(64) NOT NULL,
	"hazardType" "hazard_type" NOT NULL,
	"riskScore" double precision NOT NULL,
	"riskCategory" varchar(40) NOT NULL,
	"contributions" jsonb NOT NULL,
	"modelVersion" varchar(80) NOT NULL,
	"weightVersion" varchar(80) NOT NULL,
	"inputDataTimestamp" varchar(120) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"country" varchar(80) NOT NULL,
	"state" varchar(120) NOT NULL,
	"basin" varchar(160) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"population" integer NOT NULL,
	"dataType" "region_data_type" DEFAULT 'mixed' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "water_resources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"regionId" varchar(64) NOT NULL,
	"availableMld" double precision NOT NULL,
	"demandMld" double precision NOT NULL,
	"groundwaterIndex" double precision NOT NULL,
	"rainfallMm" double precision NOT NULL,
	"dataType" "region_data_type" DEFAULT 'mixed' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
