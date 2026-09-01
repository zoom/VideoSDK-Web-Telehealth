import { relations, sql, type InferSelectModel } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const cuid = () => crypto.randomUUID();

export const roleEnum = pgEnum("Role", ["doctor", "patient", "null"]);
export type Role = (typeof roleEnum.enumValues)[number];

export const users = pgTable("User", {
  id: text("id").primaryKey().$defaultFn(cuid),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: roleEnum("role"),
  patientId: text("patientId").unique(),
  doctorId: text("doctorId").unique(),
});

export const patients = pgTable("Patient", {
  id: text("id").primaryKey().$defaultFn(cuid),
  height: doublePrecision("height"),
  weight: doublePrecision("weight"),
  bloodType: text("bloodType"),
  allergies: text("allergies"),
  medications: text("medications"),
  DOB: timestamp("DOB", { mode: "date" }),
  userId: text("userId").notNull().unique(),
});

export const doctors = pgTable("Doctor", {
  id: text("id").primaryKey().$defaultFn(cuid),
  userId: text("userId").notNull().unique(),
  department: text("department"),
  position: text("position"),
});

export const rooms = pgTable("Room", {
  id: text("id").primaryKey().$defaultFn(cuid),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  time: timestamp("time", { mode: "date" }).notNull(),
  duration: integer("duration").notNull(),
  createByUserId: text("createByUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  zoomSessionsIds: text("zoomSessionsIds")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

// Implicit Prisma M2M join table for Room.User_CreatedFor <-> User.
// Prisma's default implicit-many-to-many table is named `_<relation>` with columns A and B.
export const roomForUser = pgTable(
  "_RoomForUser",
  {
    A: text("A")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    B: text("B")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.A, t.B] }),
    abUniq: uniqueIndex("_RoomForUser_AB_unique").on(t.A, t.B),
  }),
);

export const notes = pgTable("Notes", {
  id: text("id").primaryKey().$defaultFn(cuid),
  contentS: text("contentS").notNull(),
  contentO: text("contentO").notNull(),
  contentA: text("contentA").notNull(),
  contentP: text("contentP").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  roomId: text("roomId")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
});

export const transcripts = pgTable("Transcript", {
  id: text("id").primaryKey().$defaultFn(cuid),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  roomId: text("roomId")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
});

export const files = pgTable("File", {
  id: text("id").primaryKey().$defaultFn(cuid),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // Vercel Blob object pathname (served via a Function); null for S3/R2, which
  // keys off `name` and presigns on demand.
  storageKey: text("storageKey"),
  patientId: text("patientId")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// NextAuth tables, shaped to match @auth/drizzle-adapter's expectations.
// Differences vs the original Prisma schema:
//   - Account: no `id`, composite primary key on (provider, providerAccountId)
//   - Session: no `id`, primary key on `sessionToken`
//   - VerificationToken: composite primary key on (identifier, token)
// Run `bun run db:push` after pulling these changes to apply them.
export const accounts = pgTable(
  "Account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("Session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
);

// ---- Relations ----

export const usersRelations = relations(users, ({ one, many }) => ({
  patient: one(patients, {
    fields: [users.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [users.doctorId],
    references: [doctors.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  roomsCreated: many(rooms, { relationName: "RoomByUser" }),
  roomsInvitedTo: many(roomForUser),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  files: many(files),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  User_CreatedBy: one(users, {
    fields: [rooms.createByUserId],
    references: [users.id],
    relationName: "RoomByUser",
  }),
  User_CreatedFor: many(roomForUser),
  Notes: many(notes),
  Transcripts: many(transcripts),
}));

export const roomForUserRelations = relations(roomForUser, ({ one }) => ({
  room: one(rooms, { fields: [roomForUser.A], references: [rooms.id] }),
  user: one(users, { fields: [roomForUser.B], references: [users.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  room: one(rooms, { fields: [notes.roomId], references: [rooms.id] }),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  room: one(rooms, { fields: [transcripts.roomId], references: [rooms.id] }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  patient: one(patients, {
    fields: [files.patientId],
    references: [patients.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ---- Type aliases (for use across the app) ----

export type User = InferSelectModel<typeof users>;
export type Room = InferSelectModel<typeof rooms>;
export type Patient = InferSelectModel<typeof patients>;
export type Doctor = InferSelectModel<typeof doctors>;
export type Note = InferSelectModel<typeof notes>;
export type Transcript = InferSelectModel<typeof transcripts>;
export type File = InferSelectModel<typeof files>;
