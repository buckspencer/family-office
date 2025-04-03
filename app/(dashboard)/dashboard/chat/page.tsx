'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/ui/chat';
import { useState, useEffect, useRef } from 'react';
import type { FamilyAIChat } from '@/lib/db/schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ChatMessage, ChatAction } from '@/lib/types/chat';
import { toast } from 'sonner';
import { MessageController } from '@/lib/controllers/message-controller';
import { useParams } from 'next/navigation';
import { confirmAction } from '@/app/(dashboard)/dashboard/actions';

export default function ChatPage() {
  const { teamId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskToConfirm, setTaskToConfirm] = useState<ChatAction | null>(null);
  const messageController = useRef<MessageController | null>(null);

  useEffect(() => {
    if (teamId && !messageController.current) {
      messageController.current = new MessageController(teamId as string);
    }
  }, [teamId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history?teamId=${teamId}`);
      const data = await response.json();
      setMessages(data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.message || msg.content,
        timestamp: new Date(msg.timestamp),
        display_data: msg.action
      })));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  useEffect(() => {
    if (teamId) {
      loadChatHistory();
    }
  }, [teamId]);

  const handleSendMessage = async (content: string) => {
    if (!messageController.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await messageController.current.processMessage(content);
      const state = messageController.current.getState();
      setMessages(state.messages);

      if (!result.success) {
        setError(result.error?.message || 'Failed to process message');
        toast.error('Failed to process message');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError(error instanceof Error ? error.message : 'Failed to process message');
      toast.error('Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTask = async (task: ChatAction) => {
    try {
      if (!task.data.title || !task.data.assignedTo || !task.data.teamId) {
        throw new Error('Missing required task fields');
      }

      const result = await confirmAction(task.id!);
      if (!result.success) {
        setError(result.error || 'Failed to confirm task');
        toast.error('Failed to confirm task');
      } else {
        toast.success('Task confirmed successfully');
        setTaskToConfirm(null);
        loadChatHistory(); // Reload chat history to show updated task status
      }
    } catch (error) {
      console.error('Error confirming task:', error);
      setError(error instanceof Error ? error.message : 'Failed to confirm task');
      toast.error('Failed to confirm task');
    }
  };

  const handleCancelTask = () => {
    setTaskToConfirm(null);
  };

  const mappedMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    action: msg.display_data
  }));

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="rounded-lg border bg-white shadow-sm p-4">
        <Card className="h-full">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Chat
            messages={mappedMessages}
            onSendMessage={handleSendMessage}
            onConfirmTask={handleConfirmTask}
            onCancelTask={handleCancelTask}
            taskToConfirm={taskToConfirm}
          />
        </Card>
      </div>
    </div>
  );
} 