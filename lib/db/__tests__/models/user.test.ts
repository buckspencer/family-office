import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { db, setupTestDatabase, clearDatabase, cleanupTestDatabase, createTestUser } from '../setup';
import { users } from '../../schema';
import { eq, and } from 'drizzle-orm';

describe('User Model', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'member',
    };

    const [user] = await db.insert(users).values(userData).returning();

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.role).toBe(userData.role);
  });

  it('should read a user', async () => {
    const createdUser = await createTestUser();

    const [foundUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, createdUser.id));

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(createdUser.id);
    expect(foundUser.email).toBe(createdUser.email);
  });

  it('should update a user', async () => {
    const createdUser = await createTestUser();
    const newName = 'Updated Name';

    const [updatedUser] = await db
      .update(users)
      .set({ name: newName })
      .where(eq(users.id, createdUser.id))
      .returning();

    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe(newName);
  });

  it('should soft delete a user', async () => {
    const createdUser = await createTestUser();

    const [deletedUser] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, createdUser.id))
      .returning();

    expect(deletedUser).toBeDefined();
    expect(deletedUser.deletedAt).toBeDefined();

    // Verify the user is not returned in normal queries
    const [foundUser] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, createdUser.id),
        eq(users.deletedAt, null)
      ));

    expect(foundUser).toBeUndefined();
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'unique@example.com',
      name: 'Test User',
      role: 'member',
    };

    await createTestUser(userData);

    // Attempt to create another user with the same email
    await expect(createTestUser(userData)).rejects.toThrow();
  });

  it('should validate user role', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'invalid_role' as any,
    };

    // This should fail because 'invalid_role' is not a valid role
    await expect(createTestUser(userData)).rejects.toThrow();
  });
}); 