import { z } from 'zod';

export const MCPConfigSchema = z.object({
  // Database connection settings
  database: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
  }),

  // AI model settings
  ai: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().min(1),
  }),

  // Safety settings
  safety: z.object({
    maxQueryLength: z.number().min(1),
    allowedOperations: z.array(z.string()),
    blockedPatterns: z.array(z.string()),
  }),

  // Logging settings
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    format: z.enum(['json', 'text']),
  }),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;

export const defaultConfig: MCPConfig = {
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'family_office',
  },
  ai: {
    model: 'deepseek-coder',
    temperature: 0.7,
    maxTokens: 1000,
  },
  safety: {
    maxQueryLength: 10000,
    allowedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    blockedPatterns: [
      'DROP TABLE',
      'TRUNCATE TABLE',
      'ALTER TABLE',
      'CREATE TABLE',
      'GRANT',
      'REVOKE',
      'UNION ALL',
      'UNION SELECT',
      ';',
      '--',
      '/*',
      'xp_cmdshell',
      'exec(',
      'eval(',
      'system(',
      'shell(',
    ],
  },
  logging: {
    level: 'info',
    format: 'text',
  },
}; 