CREATE TYPE "public"."Role" AS ENUM('doctor', 'patient', 'null');--> statement-breakpoint
CREATE TABLE "Account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"refresh_token_expires_in" integer,
	CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "Doctor" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"department" text,
	"position" text,
	CONSTRAINT "Doctor_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "File" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"patientId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notes" (
	"id" text PRIMARY KEY NOT NULL,
	"contentS" text NOT NULL,
	"contentO" text NOT NULL,
	"contentA" text NOT NULL,
	"contentP" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"roomId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Patient" (
	"id" text PRIMARY KEY NOT NULL,
	"height" double precision,
	"weight" double precision,
	"bloodType" text,
	"allergies" text,
	"medications" text,
	"DOB" timestamp,
	"userId" text NOT NULL,
	CONSTRAINT "Patient_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "_RoomForUser" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_RoomForUser_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "Room" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"createByUserId" text NOT NULL,
	"zoomSessionsIds" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Transcript" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"roomId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"role" "Role",
	"patientId" text,
	"doctorId" text,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_patientId_unique" UNIQUE("patientId"),
	CONSTRAINT "User_doctorId_unique" UNIQUE("doctorId")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "File" ADD CONSTRAINT "File_patientId_Patient_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_RoomForUser" ADD CONSTRAINT "_RoomForUser_A_Room_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_RoomForUser" ADD CONSTRAINT "_RoomForUser_B_User_id_fk" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Room" ADD CONSTRAINT "Room_createByUserId_User_id_fk" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "_RoomForUser_AB_unique" ON "_RoomForUser" USING btree ("A","B");