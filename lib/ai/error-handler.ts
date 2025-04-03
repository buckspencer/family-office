import { logger } from './logger';

// Define error types
export enum AIErrorType {
  PARSING_ERROR = 'PARSING_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Define error class
export class AIError extends Error {
  type: AIErrorType;
  details?: any;
  
  constructor(message: string, type: AIErrorType, details?: any) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.details = details;
    
    // Log the error
    logger.error(`AI Error [${type}]: ${message}`, { details });
  }
  
  // Get a user-friendly message
  getUserMessage(): string {
    switch (this.type) {
      case AIErrorType.PARSING_ERROR:
        return "I couldn't understand the AI's response. Let me try a different approach.";
      case AIErrorType.EXECUTION_ERROR:
        return "I had trouble executing that operation. Could you try rephrasing your request?";
      case AIErrorType.VALIDATION_ERROR:
        return "Some information seems to be missing or invalid. Could you provide more details?";
      case AIErrorType.NETWORK_ERROR:
        return "I'm having trouble connecting to the AI service. Please try again in a moment.";
      case AIErrorType.AUTHORIZATION_ERROR:
        return "You don't have permission to perform this action.";
      default:
        return "Something went wrong. Let's try a different approach.";
    }
  }
}

// Helper functions for common errors
export function createParsingError(message: string, details?: any): AIError {
  return new AIError(
    message || "Failed to parse AI response",
    AIErrorType.PARSING_ERROR,
    details
  );
}

export function createExecutionError(message: string, details?: any): AIError {
  return new AIError(
    message || "Failed to execute AI action",
    AIErrorType.EXECUTION_ERROR,
    details
  );
}

export function createValidationError(message: string, details?: any): AIError {
  return new AIError(
    message || "Failed to validate AI request or response",
    AIErrorType.VALIDATION_ERROR,
    details
  );
}

// Error handler function
export function handleAIError(error: any): { message: string, success: false, error: string } {
  let aiError: AIError;
  
  if (error instanceof AIError) {
    aiError = error;
  } else {
    // Convert generic error to AIError
    aiError = new AIError(
      error.message || "An unknown error occurred",
      AIErrorType.UNKNOWN_ERROR,
      error
    );
  }
  
  return {
    message: aiError.getUserMessage(),
    success: false,
    error: aiError.message
  };
}
