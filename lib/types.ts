import { teams, teamMembers, users } from "./db/schema";

export type TeamDataWithMembers = typeof teams.$inferSelect & {
  members: (typeof teamMembers.$inferSelect & {
    user: Pick<typeof users.$inferSelect, 'id' | 'name' | 'email'>;
  })[];
}; 