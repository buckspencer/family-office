import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  decimal,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
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
  metadata: jsonb('metadata'),
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
  invitedBy: one(users, {
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
  // Auth activities
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  
  // Team activities
  CREATE_TEAM = 'CREATE_TEAM',
  UPDATE_TEAM = 'UPDATE_TEAM',
  DELETE_TEAM = 'DELETE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  
  // Document activities
  GET_DOCUMENTS = 'GET_DOCUMENTS',
  GET_DOCUMENT_BY_ID = 'GET_DOCUMENT_BY_ID',
  CREATE_DOCUMENT = 'CREATE_DOCUMENT',
  UPDATE_DOCUMENT = 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT = 'DELETE_DOCUMENT',
  ARCHIVE_DOCUMENT = 'ARCHIVE_DOCUMENT',
  RESTORE_DOCUMENT = 'RESTORE_DOCUMENT',
  BATCH_DELETE_DOCUMENTS = 'BATCH_DELETE_DOCUMENTS',
  BATCH_ARCHIVE_DOCUMENTS = 'BATCH_ARCHIVE_DOCUMENTS',
  GET_SIGNED_DOCUMENT_URL = 'GET_SIGNED_DOCUMENT_URL',
  
  // Contact activities
  CREATE_CONTACT = 'CREATE_CONTACT',
  UPDATE_CONTACT = 'UPDATE_CONTACT',
  DELETE_CONTACT = 'DELETE_CONTACT',
  ARCHIVE_CONTACT = 'ARCHIVE_CONTACT',
  RESTORE_CONTACT = 'RESTORE_CONTACT',
  
  // Event activities
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  ARCHIVE_EVENT = 'ARCHIVE_EVENT',
  RESTORE_EVENT = 'RESTORE_EVENT',
  
  // Subscription activities
  CREATE_SUBSCRIPTION = 'CREATE_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION = 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION = 'DELETE_SUBSCRIPTION',
  ARCHIVE_SUBSCRIPTION = 'ARCHIVE_SUBSCRIPTION',
  RESTORE_SUBSCRIPTION = 'RESTORE_SUBSCRIPTION',
  RENEW_SUBSCRIPTION = 'RENEW_SUBSCRIPTION',
  CANCEL_SUBSCRIPTION = 'CANCEL_SUBSCRIPTION',
  
  // Asset activities
  CREATE_ASSET = 'CREATE_ASSET',
  UPDATE_ASSET = 'UPDATE_ASSET',
  DELETE_ASSET = 'DELETE_ASSET',
  ARCHIVE_ASSET = 'ARCHIVE_ASSET',
  RESTORE_ASSET = 'RESTORE_ASSET',
  
  // Attachment activities
  UPLOAD_ATTACHMENT = 'UPLOAD_ATTACHMENT',
  DELETE_ATTACHMENT = 'DELETE_ATTACHMENT',
}

// Resource-related enums
export const contactType = pgEnum('contact_type', ['family', 'medical', 'financial', 'legal', 'service', 'other']);
export const eventType = pgEnum('event_type', ['birthday', 'anniversary', 'holiday', 'reminder', 'other']);
export const subscriptionType = pgEnum('subscription_type', ['service', 'membership', 'subscription', 'other']);
export const billingFrequency = pgEnum('billing_frequency', ['monthly', 'quarterly', 'yearly', 'one-time']);
export const subscriptionStatus = pgEnum('subscription_status', ['active', 'cancelled', 'pending', 'failed']);
export const assetType = pgEnum('asset_type', ['property', 'vehicle', 'investment', 'insurance', 'other']);

// Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  expiryDate: timestamp('expiry_date'),
  notes: text('notes'),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  fileType: varchar('file_type', { length: 100 }),
  isEncrypted: boolean('is_encrypted').default(false),
  lastAccessed: timestamp('last_accessed'),
  isArchived: boolean('is_archived').default(false),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Contacts table
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: contactType('type').notNull(),
  relationship: varchar('relationship', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  notes: text('notes'),
  isArchived: boolean('is_archived').default(false),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  type: eventType('type').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  notes: text('notes'),
  isRecurring: boolean('is_recurring').default(false),
  recurrenceRule: text('recurrence_rule'),
  reminderBefore: integer('reminder_before'),
  isArchived: boolean('is_archived').default(false),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: subscriptionType('type').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  billingFrequency: billingFrequency('billing_frequency').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(true),
  category: varchar('category', { length: 100 }),
  notes: text('notes'),
  paymentMethod: varchar('payment_method', { length: 100 }),
  lastBilled: timestamp('last_billed'),
  nextBilling: timestamp('next_billing'),
  status: subscriptionStatus('status').default('active').notNull(),
  isArchived: boolean('is_archived').default(false),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Assets table
export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: assetType('type').notNull(),
  description: text('description').notNull(),
  value: decimal('value', { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp('purchase_date'),
  purchasePrice: decimal('purchase_price', { precision: 15, scale: 2 }),
  location: text('location'),
  notes: text('notes'),
  isArchived: boolean('is_archived').default(false),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Attachments table for file uploads
export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  fileType: varchar('file_type', { length: 100 }),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: integer('resource_id').notNull(),
  isArchived: boolean('is_archived').default(false),
  metadata: jsonb('metadata'),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Zod schemas for validation
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

export const insertAssetSchema = createInsertSchema(assets);
export const selectAssetSchema = createSelectSchema(assets);

export const insertAttachmentSchema = createInsertSchema(attachments);
export const selectAttachmentSchema = createSelectSchema(attachments);

// Types
export type Document = typeof documents.$inferSelect;
export type DocumentInsert = typeof documents.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;

export type Event = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type AssetInsert = typeof assets.$inferInsert;

export type Attachment = typeof attachments.$inferSelect;
export type AttachmentInsert = typeof attachments.$inferInsert;
