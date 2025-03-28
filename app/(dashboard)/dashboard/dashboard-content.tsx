'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/ui/chat';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sendMessage, getChatHistory } from './actions';
import type { FamilyAIChat } from '@/lib/db/schema';

interface DashboardContentProps {
  team: {
    id: number;
    name: string;
    subscriptionStatus: string | null;
    planName: string | null;
  } | null;
}

export default function DashboardContent({ team }: DashboardContentProps) {
  const [messages, setMessages] = useState<FamilyAIChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (team) {
      loadChatHistory();
    }
  }, [team]);

  async function loadChatHistory() {
    if (!team) return;
    try {
      const history = await getChatHistory(team.id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  async function handleSendMessage(message: string) {
    if (!team) return;
    setIsLoading(true);
    try {
      await sendMessage(team.id, message);
      await loadChatHistory();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Simple Subscription Status */}
        <Card className="p-4 col-span-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-medium">
                  {team?.subscriptionStatus === 'active' ? 'Active Plan' : 'Free Plan'}
                </h2>
                <p className="text-sm text-gray-500">
                  {team?.planName || 'Basic Features'}
                </p>
              </div>
            </div>
            {team?.subscriptionStatus !== 'active' && (
              <Button>Upgrade Plan</Button>
            )}
          </div>
        </Card>

        {/* AI Chat Section - More Compact */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Family AI Assistant</h2>
          <div className="h-[400px]"> {/* Reduced height */}
            <Chat
              messages={messages.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.message,
                timestamp: new Date(msg.timestamp)
              }))}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Important Dates & Events */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Important Dates</h3>
          <p className="text-sm text-gray-500">No upcoming events</p>
        </Card>

        {/* Family Documents */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Family Documents</h3>
          <p className="text-sm text-gray-500">No documents uploaded</p>
        </Card>

        {/* Tasks & Reminders */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Tasks & Reminders</h3>
          <p className="text-sm text-gray-500">No pending tasks</p>
        </Card>

        {/* Family Memories */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Family Memories</h3>
          <p className="text-sm text-gray-500">No memories added</p>
        </Card>
      </div>
    </div>
  );
} 