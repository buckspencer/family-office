import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  uuid,
  pgEnum,
  primaryKey,
  foreignKey,
  unique,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Enums for standardized values
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const documentStatusEnum = pgEnum('document_status', ['draft', 'active', 'archived', 'deleted']);
export const eventStatusEnum = pgEnum('event_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member', 'guest']);
export const activityTypeEnum = pgEnum('activity_type', [
  'SIGN_IN',
  'SIGN_OUT',
  'SIGN_UP',
  'CREATE_TEAM',
  'ACCEPT_INVITATION',
  'UPDATE_PROFILE',
  'UPDATE_PASSWORD',
  'VERIFY_EMAIL',
  'RESET_PASSWORD',
  'DELETE_ACCOUNT',
  'REMOVE_TEAM_MEMBER',
  'INVITE_TEAM_MEMBER',
  'UPDATE_ACCOUNT'
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('member'),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references((): any => users.id),
  updatedBy: uuid('updated_by').references((): any => users.id),
});

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  trialEndsAt: timestamp('trial_ends_at', { mode: 'string' }),
  subscriptionEndsAt: timestamp('subscription_ends_at', { mode: 'string' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'teams_created_by_users_id_fk'
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'teams_updated_by_users_id_fk'
  }),
  unique('teams_stripe_customer_id_unique').on(table.stripeCustomerId),
  unique('teams_stripe_subscription_id_unique').on(table.stripeSubscriptionId),
]);

export const teamMembers = pgTable('team_members', {
  id: serial().primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  teamId: uuid('team_id').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'team_members_created_by_users_id_fk'
  }),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'team_members_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'team_members_updated_by_users_id_fk'
  }),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'team_members_user_id_users_id_fk'
  }).onDelete('cascade'),
]);

export const activityLogs = pgTable('activity_logs', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  userId: uuid('user_id').notNull(),
  action: text('action').notNull(),
  timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: jsonb(),
}, (table) => [
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'activity_logs_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'activity_logs_user_id_users_id_fk'
  }).onDelete('cascade'),
]);

export const invitations = pgTable('invitations', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: text('role').notNull(),
  invitedBy: uuid('invited_by').notNull(),
  invitedAt: timestamp('invited_at', { mode: 'string' }).defaultNow().notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.invitedBy],
    foreignColumns: [users.id],
    name: 'invitations_invited_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'invitations_team_id_teams_id_fk'
  }).onDelete('cascade'),
]);

export const familySubscriptions = pgTable('family_subscriptions', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  monthlyCost: numeric('monthly_cost', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'family_subscriptions_created_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_subscriptions_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'family_subscriptions_updated_by_users_id_fk'
  }),
]);

export const familyAIChats = pgTable('family_ai_chats', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  userId: uuid('user_id').notNull(),
  message: text('message').notNull(),
  role: text('role').notNull(),
  timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
  action: jsonb(),
  response: text('response'),
  status: text('status').default('pending'),
  error: text('error'),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_ai_chats_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'family_ai_chats_user_id_users_id_fk'
  }).onDelete('cascade'),
]);

export const familyMemories = pgTable('family_memories', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  context: text('context'),
  lastAccessed: timestamp('last_accessed', { mode: 'string' }).defaultNow().notNull(),
  importance: integer('importance').default(1).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
  metadata: jsonb(),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'family_memories_created_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_memories_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'family_memories_updated_by_users_id_fk'
  }),
]);

export const familyInformation = pgTable('family_information', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'family_information_created_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_information_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'family_information_updated_by_users_id_fk'
  }),
]);

export const familyDates = pgTable('family_dates', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp({ mode: 'string' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  recurring: boolean('recurring').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'family_dates_created_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_dates_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'family_dates_updated_by_users_id_fk'
  }),
]);

export const familyTasks = pgTable('family_tasks', {
  id: serial().primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: text('status').default('pending').notNull(),
  priority: text('priority').default('medium').notNull(),
  dueDate: timestamp('due_date', { mode: 'string' }),
  assignedTo: uuid('assigned_to').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
}, (table) => [
  foreignKey({
    columns: [table.assignedTo],
    foreignColumns: [users.id],
    name: 'family_tasks_assigned_to_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
    name: 'family_tasks_created_by_users_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'family_tasks_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
    name: 'family_tasks_updated_by_users_id_fk'
  }),
]);

export const familyDocuments = pgTable('family_documents', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const familyEvents = pgTable('family_events', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const actionLogs = pgTable('action_logs', {
  id: serial('id').primaryKey().notNull(),
  teamId: uuid('team_id').notNull(),
  userId: uuid('user_id').notNull(),
  actionType: varchar('action_type', { length: 50 }).notNull(),
  actionData: jsonb('action_data').notNull(),
  status: varchar({ length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  executedAt: timestamp('executed_at', { mode: 'string' }),
  error: text(),
  metadata: jsonb(),
}, (table) => [
  foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: 'action_logs_team_id_teams_id_fk'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'action_logs_user_id_users_id_fk'
  }).onDelete('cascade'),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  createdTasks: many(familyTasks, { relationName: 'createdTasks' }),
  assignedTasks: many(familyTasks, { relationName: 'assignedTasks' }),
  createdDocuments: many(familyDocuments),
  createdEvents: many(familyEvents),
  createdMemories: many(familyMemories),
  createdInformation: many(familyInformation),
  createdDates: many(familyDates),
  createdSubscriptions: many(familySubscriptions),
  createdAIChats: many(familyAIChats),
  createdTeams: many(teams, { relationName: 'createdTeams' }),
  updatedTeams: many(teams, { relationName: 'updatedTeams' }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  tasks: many(familyTasks),
  documents: many(familyDocuments),
  events: many(familyEvents),
  memories: many(familyMemories),
  information: many(familyInformation),
  dates: many(familyDates),
  subscriptions: many(familySubscriptions),
  aiChats: many(familyAIChats),
  createdBy: many(users, { relationName: 'createdTeams' }),
  updatedBy: many(users, { relationName: 'updatedTeams' }),
}));

export const actionLogsRelations = relations(actionLogs, ({ one }) => ({
  team: one(teams, {
    fields: [actionLogs.teamId],
    references: [teams.id]
  }),
  user: one(users, {
    fields: [actionLogs.userId],
    references: [users.id]
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type FamilyTask = typeof familyTasks.$inferSelect;
export type NewFamilyTask = typeof familyTasks.$inferInsert;
export type FamilyDocument = typeof familyDocuments.$inferSelect;
export type NewFamilyDocument = typeof familyDocuments.$inferInsert;
export type FamilyEvent = typeof familyEvents.$inferSelect;
export type NewFamilyEvent = typeof familyEvents.$inferInsert;
export type FamilyMemory = typeof familyMemories.$inferSelect;
export type NewFamilyMemory = typeof familyMemories.$inferInsert;
export type FamilyInformation = typeof familyInformation.$inferSelect;
export type NewFamilyInformation = typeof familyInformation.$inferInsert;
export type FamilyDate = typeof familyDates.$inferSelect;
export type NewFamilyDate = typeof familyDates.$inferInsert;
export type FamilySubscription = typeof familySubscriptions.$inferSelect;
export type NewFamilySubscription = typeof familySubscriptions.$inferInsert;
export type FamilyAIChat = typeof familyAIChats.$inferSelect;
export type NewFamilyAIChat = typeof familyAIChats.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type ActivityType = typeof activityTypeEnum.enumValues[number];
export type ActionLog = typeof actionLogs.$inferSelect;
export type NewActionLog = typeof actionLogs.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};
