import { pgTable, uuid, text, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const meetings = pgTable("meetings", {
	id: uuid("id").primaryKey().defaultRandom(),
	meetingId: text("meeting_id").notNull(),
	meetingHostId: text("meeting_host_id"),
	externalMeetingId: text("external_meeting_id").notNull(),
	mediaRegion: text("media_region"),
	primaryMeetingId: text("primary_meeting_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const participants = pgTable("participants", {
	id: uuid("id").primaryKey().defaultRandom(),
	type: text("type").$type<"host" | "non-host">().notNull(),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendees = pgTable("attendees", {
	id: uuid("id").primaryKey().defaultRandom(),
	meetingId: uuid("meeting_id")
		.notNull()
		.references(() => meetings.id),
	externalUserId: uuid("external_user_id")
		.notNull()
		.references(() => participants.id),
	attendeeId: text("attendee_id"),
	joinToken: text("join_token"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const meetingsRelations = relations(meetings, ({ many }) => ({
	attendees: many(attendees),
}));

export const participantsRelations = relations(participants, ({ many }) => ({
	attendees: many(attendees),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
	meeting: one(meetings, {
		fields: [attendees.meetingId],
		references: [meetings.id],
	}),
	participant: one(participants, {
		fields: [attendees.externalUserId],
		references: [participants.id],
	}),
}));

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Attendee = typeof attendees.$inferSelect;
export type NewAttendee = typeof attendees.$inferInsert;
