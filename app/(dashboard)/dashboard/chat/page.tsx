'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/ui/chat';
import { useState, useEffect, useCallback } from 'react';
import { sendMessage, getChatHistory, createTask } from '../actions';
import type { FamilyAIChat } from '@/lib/db/schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ChatMessage, Task, ChatAction } from '@/lib/types/chat';

interface ChatPageProps {
  team: {
    id: number;
    name: string;
  };
}

export default function ChatPage({ team }: ChatPageProps) {
  const [messages, setMessages] = useState<FamilyAIChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadChatHistory = useCallback(async () => {
    try {
      setError(null);
      const history = await getChatHistory(team.id);
      console.log('Loaded chat history:', history);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history. Please try again.');
    }
  }, [team.id]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  async function handleSendMessage(message: string) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendMessage(team.id, message);
      await loadChatHistory();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmTask(taskData: Task) {
    try {
      console.log('handleConfirmTask called with data:', taskData);
      setError(null);
      setSuccess(null);
      
      const result = await createTask(team.id, taskData);
      console.log('Task creation result:', result);
      
      if (result.success) {
        setSuccess(`Task "${taskData.title}" has been created successfully.`);
        await loadChatHistory();
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  }

  const mappedMessages = messages.map(msg => {
    console.log('Raw message:', msg);
    const mappedMessage = {
      role: msg.role as 'user' | 'assistant',
      content: msg.message,
      timestamp: new Date(msg.timestamp),
      action: msg.action ? {
        type: (msg.action as any).type,
        data: (msg.action as any).data?.data || (msg.action as any).data // Handle both nested and direct data
      } : undefined
    };
    console.log('Mapped message:', mappedMessage);
    return mappedMessage;
  });

  console.log('Final mapped messages:', mappedMessages);

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="m-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Chat
          messages={mappedMessages}
          onSendMessage={handleSendMessage}
          onConfirmTask={handleConfirmTask}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
} 