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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for standardized values
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const documentStatusEnum = pgEnum('document_status', ['draft', 'active', 'archived', 'deleted']);
export const eventStatusEnum = pgEnum('event_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member', 'guest']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: jsonb('metadata'),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const familySubscriptions = pgTable('family_subscriptions', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  monthlyCost: decimal('monthly_cost', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const familyAIChats = pgTable('family_ai_chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  response: text('response'),
  role: text('role').notNull(),
  action: jsonb('action'),
  status: text('status').default('pending'),
  error: text('error'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const familyMemories = pgTable('family_memories', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  context: text('context'),
  lastAccessed: timestamp('last_accessed').notNull().defaultNow(),
  importance: integer('importance').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
  metadata: jsonb('metadata'),
});

export const familyInformation = pgTable('family_information', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const familyDates = pgTable('family_dates', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  recurring: boolean('recurring').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const familyTasks = pgTable('family_tasks', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  priority: taskPriorityEnum('priority'),
  category: varchar('category', { length: 50 }),
  assignedTo: uuid('assigned_to')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

export const familyDocuments = pgTable('family_documents', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content'),
  tags: text('tags').array(),
  status: documentStatusEnum('status').notNull().default('draft'),
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
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  description: text('description'),
  location: text('location'),
  attendees: text('attendees').array(),
  status: eventStatusEnum('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').references(() => users.id),
});

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
