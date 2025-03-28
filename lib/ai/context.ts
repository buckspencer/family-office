import { z } from 'zod';
import crypto from 'crypto';
import { and, eq, isNull, desc, asc, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { familyTasks, familyEvents } from '@/lib/db/schema';

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

export const ConversationContextSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  conversationId: z.string(),
  lastInteraction: z.date(),
  messageCount: z.number().default(0),
  totalTokens: z.number().default(0),
  encryptedData: z.string().optional(),
  recentTasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    status: z.string(),
    dueDate: z.date().optional(),
  })).optional(),
  budgetStatus: z.object({
    totalBudget: z.number(),
    spent: z.number(),
    remaining: z.number(),
  }).optional(),
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
        totalTokens: 0
      };
      this.contexts.set(key, context);
    }

    // Update context with recent data
    await this.enrichContext(context);

    return context;
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
            eq(familyTasks.teamId, parseInt(context.teamId)),
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
            eq(familyEvents.teamId, parseInt(context.teamId)),
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