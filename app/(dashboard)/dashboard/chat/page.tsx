'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/ui/chat';
import { useState, useEffect, useRef } from 'react';
import type { FamilyAIChat } from '@/lib/db/schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ChatMessage } from '@/lib/types/chat';
import { toast } from 'sonner';
import { MessageController } from '@/lib/controllers/message-controller';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { teamId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageController = useRef<MessageController | null>(null);

  useEffect(() => {
    if (teamId && !messageController.current) {
      messageController.current = new MessageController(Number(teamId));
    }
  }, [teamId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat/history');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

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

  const mappedMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    action: msg.action ? {
      type: (msg.action as any).type,
      data: (msg.action as any).data?.data || (msg.action as any).data
    } : undefined
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
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  );
} 