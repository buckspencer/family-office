import { relations } from "drizzle-orm/relations";
import { teams, actionLogs, users, teamMembers, familyInformation, familyDocuments, familyMemories, familySubscriptions, familyTasks, familyDates, familyEvents, activityLogs, familyAiChats, invitations } from "./schema";

export const actionLogsRelations = relations(actionLogs, ({one}) => ({
	team: one(teams, {
		fields: [actionLogs.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [actionLogs.userId],
		references: [users.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	actionLogs: many(actionLogs),
	teamMembers: many(teamMembers),
	familyInformations: many(familyInformation),
	familyDocuments: many(familyDocuments),
	familyMemories: many(familyMemories),
	familySubscriptions: many(familySubscriptions),
	familyTasks: many(familyTasks),
	familyDates: many(familyDates),
	user_createdBy: one(users, {
		fields: [teams.createdBy],
		references: [users.id],
		relationName: "teams_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [teams.updatedBy],
		references: [users.id],
		relationName: "teams_updatedBy_users_id"
	}),
	familyEvents: many(familyEvents),
	activityLogs: many(activityLogs),
	familyAiChats: many(familyAiChats),
	invitations: many(invitations),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	actionLogs: many(actionLogs),
	teamMembers_createdBy: many(teamMembers, {
		relationName: "teamMembers_createdBy_users_id"
	}),
	teamMembers_updatedBy: many(teamMembers, {
		relationName: "teamMembers_updatedBy_users_id"
	}),
	teamMembers_userId: many(teamMembers, {
		relationName: "teamMembers_userId_users_id"
	}),
	user_createdBy: one(users, {
		fields: [users.createdBy],
		references: [users.id],
		relationName: "users_createdBy_users_id"
	}),
	users_createdBy: many(users, {
		relationName: "users_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [users.updatedBy],
		references: [users.id],
		relationName: "users_updatedBy_users_id"
	}),
	users_updatedBy: many(users, {
		relationName: "users_updatedBy_users_id"
	}),
	familyInformations_createdBy: many(familyInformation, {
		relationName: "familyInformation_createdBy_users_id"
	}),
	familyInformations_updatedBy: many(familyInformation, {
		relationName: "familyInformation_updatedBy_users_id"
	}),
	familyDocuments_createdBy: many(familyDocuments, {
		relationName: "familyDocuments_createdBy_users_id"
	}),
	familyDocuments_updatedBy: many(familyDocuments, {
		relationName: "familyDocuments_updatedBy_users_id"
	}),
	familyMemories_createdBy: many(familyMemories, {
		relationName: "familyMemories_createdBy_users_id"
	}),
	familyMemories_updatedBy: many(familyMemories, {
		relationName: "familyMemories_updatedBy_users_id"
	}),
	familySubscriptions_createdBy: many(familySubscriptions, {
		relationName: "familySubscriptions_createdBy_users_id"
	}),
	familySubscriptions_updatedBy: many(familySubscriptions, {
		relationName: "familySubscriptions_updatedBy_users_id"
	}),
	familyTasks_assignedTo: many(familyTasks, {
		relationName: "familyTasks_assignedTo_users_id"
	}),
	familyTasks_createdBy: many(familyTasks, {
		relationName: "familyTasks_createdBy_users_id"
	}),
	familyTasks_updatedBy: many(familyTasks, {
		relationName: "familyTasks_updatedBy_users_id"
	}),
	familyDates_createdBy: many(familyDates, {
		relationName: "familyDates_createdBy_users_id"
	}),
	familyDates_updatedBy: many(familyDates, {
		relationName: "familyDates_updatedBy_users_id"
	}),
	teams_createdBy: many(teams, {
		relationName: "teams_createdBy_users_id"
	}),
	teams_updatedBy: many(teams, {
		relationName: "teams_updatedBy_users_id"
	}),
	familyEvents_createdBy: many(familyEvents, {
		relationName: "familyEvents_createdBy_users_id"
	}),
	familyEvents_updatedBy: many(familyEvents, {
		relationName: "familyEvents_updatedBy_users_id"
	}),
	activityLogs: many(activityLogs),
	familyAiChats: many(familyAiChats),
	invitations: many(invitations),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	user_createdBy: one(users, {
		fields: [teamMembers.createdBy],
		references: [users.id],
		relationName: "teamMembers_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [teamMembers.updatedBy],
		references: [users.id],
		relationName: "teamMembers_updatedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [teamMembers.userId],
		references: [users.id],
		relationName: "teamMembers_userId_users_id"
	}),
}));

export const familyInformationRelations = relations(familyInformation, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familyInformation.createdBy],
		references: [users.id],
		relationName: "familyInformation_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyInformation.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyInformation.updatedBy],
		references: [users.id],
		relationName: "familyInformation_updatedBy_users_id"
	}),
}));

export const familyDocumentsRelations = relations(familyDocuments, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familyDocuments.createdBy],
		references: [users.id],
		relationName: "familyDocuments_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyDocuments.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyDocuments.updatedBy],
		references: [users.id],
		relationName: "familyDocuments_updatedBy_users_id"
	}),
}));

export const familyMemoriesRelations = relations(familyMemories, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familyMemories.createdBy],
		references: [users.id],
		relationName: "familyMemories_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyMemories.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyMemories.updatedBy],
		references: [users.id],
		relationName: "familyMemories_updatedBy_users_id"
	}),
}));

export const familySubscriptionsRelations = relations(familySubscriptions, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familySubscriptions.createdBy],
		references: [users.id],
		relationName: "familySubscriptions_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familySubscriptions.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familySubscriptions.updatedBy],
		references: [users.id],
		relationName: "familySubscriptions_updatedBy_users_id"
	}),
}));

export const familyTasksRelations = relations(familyTasks, ({one}) => ({
	user_assignedTo: one(users, {
		fields: [familyTasks.assignedTo],
		references: [users.id],
		relationName: "familyTasks_assignedTo_users_id"
	}),
	user_createdBy: one(users, {
		fields: [familyTasks.createdBy],
		references: [users.id],
		relationName: "familyTasks_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyTasks.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyTasks.updatedBy],
		references: [users.id],
		relationName: "familyTasks_updatedBy_users_id"
	}),
}));

export const familyDatesRelations = relations(familyDates, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familyDates.createdBy],
		references: [users.id],
		relationName: "familyDates_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyDates.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyDates.updatedBy],
		references: [users.id],
		relationName: "familyDates_updatedBy_users_id"
	}),
}));

export const familyEventsRelations = relations(familyEvents, ({one}) => ({
	user_createdBy: one(users, {
		fields: [familyEvents.createdBy],
		references: [users.id],
		relationName: "familyEvents_createdBy_users_id"
	}),
	team: one(teams, {
		fields: [familyEvents.teamId],
		references: [teams.id]
	}),
	user_updatedBy: one(users, {
		fields: [familyEvents.updatedBy],
		references: [users.id],
		relationName: "familyEvents_updatedBy_users_id"
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	team: one(teams, {
		fields: [activityLogs.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const familyAiChatsRelations = relations(familyAiChats, ({one}) => ({
	team: one(teams, {
		fields: [familyAiChats.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [familyAiChats.userId],
		references: [users.id]
	}),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	user: one(users, {
		fields: [invitations.invitedBy],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [invitations.teamId],
		references: [teams.id]
	}),
}));