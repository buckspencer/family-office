import { ConversationContext } from './context';

export class AILogger {
  private static instance: AILogger;
  private logs: Array<{
    timestamp: Date;
    type: 'info' | 'error' | 'debug';
    message: string;
    data?: any;
  }> = [];

  private constructor() {}

  static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  log(type: 'info' | 'error' | 'debug', message: string, data?: any) {
    const logEntry = {
      timestamp: new Date(),
      type,
      message,
      data
    };

    this.logs.push(logEntry);
    console.log(`[${logEntry.timestamp.toISOString()}] [${type.toUpperCase()}] ${message}`, data || '');

    // Keep only the last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = AILogger.getInstance(); 