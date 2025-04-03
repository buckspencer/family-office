import { z } from 'zod';
import crypto from 'crypto';
import { and, eq, isNull, desc, asc, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { familyTasks, familyEvents } from '@/lib/db/schema';
import { logger } from '@/lib/ai/logger';

// Encryption key management
const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex, authTagHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export const PendingActionSchema = z.object({
  type: z.string(),
  action: z.any(),
  requiresConfirmation: z.boolean().default(true),
  createdAt: z.date(),
  expiresAt: z.date(),
  confirmed: z.boolean().default(false),
  executed: z.boolean().default(false),
  description: z.string().optional(),
});

export type PendingAction = z.infer<typeof PendingActionSchema>;

export const MessageHistorySchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.object({
    action: z.string().optional(),
    requires_confirmation: z.boolean().optional(),
    tokensUsed: z.number().optional()
  }).optional()
});

export type MessageHistory = z.infer<typeof MessageHistorySchema>;

export const ConversationContextSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  conversationId: z.string(),
  lastInteraction: z.date(),
  messageCount: z.number().default(0),
  totalTokens: z.number().default(0),
  messages: z.array(MessageHistorySchema).default([]),
  pendingAction: PendingActionSchema.optional(),
  recentTasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    status: z.string(),
    dueDate: z.date().optional(),
  })).optional(),
  importantDates: z.array(z.object({
    date: z.date(),
    description: z.string(),
    type: z.enum(['event', 'task', 'reminder']),
  })).optional(),
});

export type ConversationContext = z.infer<typeof ConversationContextSchema>;

export const RATE_LIMIT = {
  maxTokensPerRequest: 4000,
  maxTokensPerMinute: 10000,
  requestsPerMinute: 60,
  maxConversationLength: 50
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ConversationContextManager {
  private static instance: ConversationContextManager;
  private contexts: Map<string, ConversationContext> = new Map();
  private lastReset: Map<string, number> = new Map();
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = ENCRYPTION_KEY;
  }

  static getInstance(): ConversationContextManager {
    if (!ConversationContextManager.instance) {
      ConversationContextManager.instance = new ConversationContextManager();
    }
    return ConversationContextManager.instance;
  }

  async getContext(userId: string, teamId: string): Promise<ConversationContext> {
    const key = `${userId}:${teamId}`;
    let context = this.contexts.get(key);

    if (!context) {
      context = {
        userId,
        teamId,
        conversationId: crypto.randomUUID(),
        lastInteraction: new Date(),
        messageCount: 0,
        totalTokens: 0,
        messages: []
      };
      this.contexts.set(key, context);
    }

    // Update context with recent data
    await this.enrichContext(context);

    // Clean up expired pending actions
    if (context.pendingAction && context.pendingAction.expiresAt < new Date()) {
      delete context.pendingAction;
    }

    return context;
  }

  async updateContext(context: ConversationContext, tokensUsed: number = 0): Promise<void> {
    // Update the context with the latest interaction
    context.lastInteraction = new Date();
    context.messageCount += 1;
    context.totalTokens += tokensUsed;

    // Update the context in the map
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);
  }

  async addMessage(context: ConversationContext, role: 'user' | 'assistant', content: string): Promise<void> {
    if (!context.messages) {
      context.messages = [];
    }

    // Add the new message
    context.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Keep only the last 10 messages
    if (context.messages.length > 10) {
      context.messages = context.messages.slice(-10);
    }

    // Update the context
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);
  }

  async setPendingAction(context: ConversationContext, type: string, action: any, description?: string): Promise<void> {
    // Create a new pending action
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // Expires in 5 minutes

    logger.info('Setting pending action:', {
      type,
      description,
      expiresAt: expiresAt.toISOString(),
      userId: context.userId,
      teamId: context.teamId
    });

    context.pendingAction = {
      type,
      action,
      requiresConfirmation: true,
      createdAt: now,
      expiresAt,
      confirmed: false,
      executed: false,
      description
    };

    // Update the context
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);
  }

  async confirmPendingAction(context: ConversationContext): Promise<PendingAction | null> {
    if (!context.pendingAction) {
      logger.info('No pending action found to confirm');
      return null;
    }

    // Check if the action has expired
    if (context.pendingAction.expiresAt < new Date()) {
      logger.info('Pending action has expired');
      delete context.pendingAction;
      return null;
    }

    logger.info('Confirming pending action:', {
      type: context.pendingAction.type,
      description: context.pendingAction.description
    });

    // Mark the action as confirmed
    context.pendingAction.confirmed = true;

    // Update the context
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);

    return context.pendingAction;
  }

  async markPendingActionExecuted(context: ConversationContext): Promise<void> {
    if (!context.pendingAction) {
      logger.info('No pending action to mark as executed');
      return;
    }

    logger.info('Marking pending action as executed:', {
      type: context.pendingAction.type,
      description: context.pendingAction.description
    });

    // Mark the action as executed
    context.pendingAction.executed = true;

    // Update the context
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);
  }

  async clearPendingAction(context: ConversationContext): Promise<void> {
    if (!context.pendingAction) {
      logger.info('No pending action to clear');
      return;
    }

    logger.info('Clearing pending action:', {
      type: context.pendingAction.type,
      description: context.pendingAction.description
    });

    delete context.pendingAction;

    // Update the context
    const key = `${context.userId}:${context.teamId}`;
    this.contexts.set(key, context);
  }

  private async enrichContext(context: ConversationContext): Promise<void> {
    try {
      // Get recent tasks
      const recentTasks = await db
        .select({
          id: familyTasks.id,
          title: familyTasks.title,
          status: familyTasks.status,
          dueDate: familyTasks.dueDate
        })
        .from(familyTasks)
        .where(
          and(
            eq(familyTasks.teamId, context.teamId),
            eq(familyTasks.createdBy, context.userId),
            isNull(familyTasks.deletedAt)
          )
        )
        .orderBy(desc(familyTasks.createdAt))
        .limit(5);

      context.recentTasks = recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate || undefined
      }));

      // Get important dates
      const dates = await db
        .select({
          date: familyEvents.startDate,
          description: familyEvents.title,
          type: sql`'event'`.as('type')
        })
        .from(familyEvents)
        .where(
          and(
            eq(familyEvents.teamId, context.teamId),
            gte(familyEvents.startDate, new Date())
          )
        )
        .orderBy(asc(familyEvents.startDate))
        .limit(5);

      context.importantDates = dates.map(date => ({
        date: date.date,
        description: date.description,
        type: 'event' as const
      }));

      // Encrypt sensitive data
      if (context.encryptedData) {
        context.encryptedData = encrypt(context.encryptedData);
      }

      this.contexts.set(`${context.userId}:${context.teamId}`, context);
    } catch (error) {
      console.error('Error enriching context:', error);
    }
  }

  async updateContext(context: ConversationContext, tokensUsed: number): Promise<void> {
    const key = `${context.userId}:${context.teamId}`;

    // Check rate limits
    await this.checkRateLimits(context, tokensUsed);

    // Update context
    context.messageCount++;
    context.totalTokens += tokensUsed;
    context.lastInteraction = new Date();

    // Encrypt sensitive data if present
    if (context.encryptedData) {
      context.encryptedData = encrypt(context.encryptedData);
    }

    this.contexts.set(key, context);
  }

  private async checkRateLimits(context: ConversationContext, tokensUsed: number): Promise<void> {
    const key = `${context.userId}:${context.teamId}`;
    const now = Date.now();
    const lastReset = this.lastReset.get(key) || 0;

    // Reset counters if a minute has passed
    if (now - lastReset >= 60000) {
      context.messageCount = 0;
      context.totalTokens = 0;
      this.lastReset.set(key, now);
    }

    // Check rate limits
    if (context.messageCount >= RATE_LIMIT.requestsPerMinute) {
      throw new RateLimitError('Rate limit exceeded: Too many requests per minute');
    }

    if (tokensUsed > RATE_LIMIT.maxTokensPerRequest) {
      throw new RateLimitError('Rate limit exceeded: Request too large');
    }

    if (context.totalTokens + tokensUsed > RATE_LIMIT.maxTokensPerMinute) {
      throw new RateLimitError('Rate limit exceeded: Too many tokens per minute');
    }

    if (context.messageCount >= RATE_LIMIT.maxConversationLength) {
      throw new RateLimitError('Rate limit exceeded: Conversation too long');
    }
  }

  async clearContext(userId: string, teamId: string): Promise<void> {
    const key = `${userId}:${teamId}`;
    this.contexts.delete(key);
    this.lastReset.delete(key);
  }

  async setEncryptedData(context: ConversationContext, data: string): Promise<void> {
    const key = `${context.userId}:${context.teamId}`;
    context.encryptedData = encrypt(data);
    this.contexts.set(key, context);
  }

  async getEncryptedData(context: ConversationContext): Promise<string | null> {
    if (!context.encryptedData) return null;
    return decrypt(context.encryptedData);
  }
}

export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML-like tags
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .replace(/[\\/]/g, '') // Remove path traversal characters
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove SQL injection characters
    .trim();
}

export function validateUserInput(input: string): boolean {
  // Check for minimum and maximum length
  if (input.length < 1 || input.length > 1000) return false;

  // Check for common attack patterns
  const attackPatterns = [
    /<script>/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i,
    /alert\s*\(/i,
    /eval\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i
  ];

  return !attackPatterns.some(pattern => pattern.test(input));
}

// Add rate limiting per IP
export class IPRateLimiter {
  private static instance: IPRateLimiter;
  private ipRequests: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly MAX_REQUESTS_PER_IP = 100;
  private readonly WINDOW_MS = 60000; // 1 minute

  private constructor() {}

  static getInstance(): IPRateLimiter {
    if (!IPRateLimiter.instance) {
      IPRateLimiter.instance = new IPRateLimiter();
    }
    return IPRateLimiter.instance;
  }

  async checkIPLimit(ip: string): Promise<boolean> {
    const now = Date.now();
    const requestData = this.ipRequests.get(ip);

    if (!requestData) {
      this.ipRequests.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (now - requestData.timestamp > this.WINDOW_MS) {
      this.ipRequests.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (requestData.count >= this.MAX_REQUESTS_PER_IP) {
      return false;
    }

    requestData.count++;
    return true;
  }

  clearIP(ip: string): void {
    this.ipRequests.delete(ip);
  }
}
