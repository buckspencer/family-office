import { pgTable, foreignKey, serial, uuid, varchar, jsonb, timestamp, text, unique, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("activity_type", ['SIGN_IN', 'SIGN_OUT', 'SIGN_UP', 'CREATE_TEAM', 'ACCEPT_INVITATION', 'UPDATE_PROFILE', 'UPDATE_PASSWORD', 'VERIFY_EMAIL', 'RESET_PASSWORD', 'DELETE_ACCOUNT', 'REMOVE_TEAM_MEMBER', 'INVITE_TEAM_MEMBER', 'UPDATE_ACCOUNT'])
export const documentStatus = pgEnum("document_status", ['draft', 'active', 'archived', 'deleted'])
export const eventStatus = pgEnum("event_status", ['scheduled', 'in_progress', 'completed', 'cancelled'])
export const taskPriority = pgEnum("task_priority", ['low', 'medium', 'high', 'urgent'])
export const taskStatus = pgEnum("task_status", ['pending', 'in_progress', 'completed', 'cancelled'])
export const userRole = pgEnum("user_role", ['owner', 'admin', 'member', 'guest'])


export const actionLogs = pgTable("action_logs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	actionType: varchar("action_type", { length: 50 }).notNull(),
	actionData: jsonb("action_data").notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	executedAt: timestamp("executed_at", { mode: 'string' }),
	error: text(),
	metadata: jsonb(),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "action_logs_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "action_logs_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const teamMembers = pgTable("team_members", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "team_members_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_members_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "team_members_updated_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "team_members_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().default('member').notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	verificationToken: text("verification_token"),
	verificationTokenExpiry: timestamp("verification_token_expiry", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [table.id],
			name: "users_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [table.id],
			name: "users_updated_by_users_id_fk"
		}),
	unique("users_email_unique").on(table.email),
]);

export const familyInformation = pgTable("family_information", {
	id: serial().primaryKey().notNull(),
	category: varchar({ length: 50 }).notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_information_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_information_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_information_updated_by_users_id_fk"
		}),
]);

export const familyDocuments = pgTable("family_documents", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	status: text().default('draft').notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_documents_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_documents_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_documents_updated_by_users_id_fk"
		}),
]);

export const familyMemories = pgTable("family_memories", {
	id: serial().primaryKey().notNull(),
	category: varchar({ length: 50 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	context: text(),
	lastAccessed: timestamp("last_accessed", { mode: 'string' }).defaultNow().notNull(),
	importance: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	metadata: jsonb(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_memories_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_memories_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_memories_updated_by_users_id_fk"
		}),
]);

export const familySubscriptions = pgTable("family_subscriptions", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	url: text(),
	monthlyCost: numeric("monthly_cost", { precision: 10, scale:  2 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_subscriptions_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_subscriptions_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_subscriptions_updated_by_users_id_fk"
		}),
]);

export const familyTasks = pgTable("family_tasks", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: text().default('pending').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assignedTo: uuid("assigned_to").notNull(),
	priority: text().default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "family_tasks_assigned_to_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_tasks_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_tasks_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_tasks_updated_by_users_id_fk"
		}),
]);

export const familyDates = pgTable("family_dates", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	recurring: boolean().default(false).notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_dates_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_dates_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_dates_updated_by_users_id_fk"
		}),
]);

export const teams = pgTable("teams", {
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeProductId: text("stripe_product_id"),
	planName: varchar("plan_name", { length: 50 }),
	subscriptionStatus: varchar("subscription_status", { length: 20 }),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	subscriptionEndsAt: timestamp("subscription_ends_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "teams_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "teams_updated_by_users_id_fk"
		}),
	unique("teams_stripe_customer_id_unique").on(table.stripeCustomerId),
	unique("teams_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
]);

export const familyEvents = pgTable("family_events", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	description: text(),
	status: text().default('scheduled').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by"),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "family_events_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_events_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "family_events_updated_by_users_id_fk"
		}),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	action: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	metadata: jsonb(),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "activity_logs_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const familyAiChats = pgTable("family_ai_chats", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	message: text().notNull(),
	role: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	action: jsonb(),
	response: text(),
	status: text().default('pending'),
	error: text(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "family_ai_chats_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "family_ai_chats_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const invitations = pgTable("invitations", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: text().notNull(),
	invitedBy: uuid("invited_by").notNull(),
	invitedAt: timestamp("invited_at", { mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	teamId: uuid("team_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "invitations_invited_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitations_team_id_fkey"
		}).onDelete("cascade"),
]);
