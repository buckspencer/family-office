export interface MCPConfig {
  safety: {
    maxQueryLength: number;
    allowedOperations: string[];
    blockedPatterns: string[];
  };
}

export const defaultConfig: MCPConfig = {
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
}; 