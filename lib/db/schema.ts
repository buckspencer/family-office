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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const familySubscriptions = pgTable('family_subscriptions', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  monthlyCost: decimal('monthly_cost', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
});

export const familyAIChats = pgTable('family_ai_chats', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  message: text('message').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  action: jsonb('action'), // Structured action data
});

export const familyMemories = pgTable('family_memories', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  category: varchar('category', { length: 50 }).notNull(), // 'preference', 'relationship', 'history', etc.
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  context: text('context'), // Additional context about this memory
  lastAccessed: timestamp('last_accessed').notNull().defaultNow(),
  importance: integer('importance').notNull().default(1), // 1-5 scale for memory priority
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  metadata: jsonb('metadata'), // For additional structured data
});

export const familyInformation = pgTable('family_information', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
});

export const familyDates = pgTable('family_dates', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  recurring: boolean('recurring').notNull().default(false),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
});

export const familyDocuments = pgTable('family_documents', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
});

export const familyTasks = pgTable('family_tasks', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  dueDate: timestamp('due_date'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const familySubscriptionsRelations = relations(familySubscriptions, ({ one }) => ({
  team: one(teams, {
    fields: [familySubscriptions.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familySubscriptions.createdBy],
    references: [users.id],
  }),
}));

export const familyAIChatsRelations = relations(familyAIChats, ({ one }) => ({
  team: one(teams, {
    fields: [familyAIChats.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [familyAIChats.userId],
    references: [users.id],
  }),
}));

export const familyMemoriesRelations = relations(familyMemories, ({ one }) => ({
  team: one(teams, {
    fields: [familyMemories.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familyMemories.createdBy],
    references: [users.id],
  }),
}));

export const familyInformationRelations = relations(familyInformation, ({ one }) => ({
  team: one(teams, {
    fields: [familyInformation.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familyInformation.createdBy],
    references: [users.id],
  }),
}));

export const familyDatesRelations = relations(familyDates, ({ one }) => ({
  team: one(teams, {
    fields: [familyDates.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familyDates.createdBy],
    references: [users.id],
  }),
}));

export const familyDocumentsRelations = relations(familyDocuments, ({ one }) => ({
  team: one(teams, {
    fields: [familyDocuments.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familyDocuments.createdBy],
    references: [users.id],
  }),
}));

export const familyTasksRelations = relations(familyTasks, ({ one }) => ({
  team: one(teams, {
    fields: [familyTasks.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [familyTasks.createdBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [familyTasks.assignedTo],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export type FamilySubscription = typeof familySubscriptions.$inferSelect;
export type NewFamilySubscription = typeof familySubscriptions.$inferInsert;
export type FamilyAIChat = typeof familyAIChats.$inferSelect;
export type NewFamilyAIChat = typeof familyAIChats.$inferInsert;
export type FamilyMemory = typeof familyMemories.$inferSelect;
export type NewFamilyMemory = typeof familyMemories.$inferInsert;

export type FamilyInformation = typeof familyInformation.$inferSelect;
export type NewFamilyInformation = typeof familyInformation.$inferInsert;

export type FamilyDate = typeof familyDates.$inferSelect;
export type NewFamilyDate = typeof familyDates.$inferInsert;

export type FamilyDocument = typeof familyDocuments.$inferSelect;
export type NewFamilyDocument = typeof familyDocuments.$inferInsert;

export type FamilyTask = typeof familyTasks.$inferSelect;
export type NewFamilyTask = typeof familyTasks.$inferInsert;
