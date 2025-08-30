CREATE TABLE "attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"external_user_id" uuid NOT NULL,
	"attendee_id" text,
	"join_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meeting_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meeting_host_id" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "external_meeting_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "media_region" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "primary_meeting_id" text;--> statement-breakpoint
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_external_user_id_participants_id_fk" FOREIGN KEY ("external_user_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "meeting_url";