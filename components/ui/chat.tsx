import { useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Avatar, AvatarFallback } from './avatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function Chat({ messages, onSendMessage, isLoading = false }: ChatProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {message.role === 'user' ? 'U' : 'A'}
              </AvatarFallback>
            </Avatar>
            <div
              className={`rounded-lg px-3 py-2 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="animate-pulse flex space-x-1">
                <div className="h-1.5 w-1.5 bg-current rounded-full" />
                <div className="h-1.5 w-1.5 bg-current rounded-full" />
                <div className="h-1.5 w-1.5 bg-current rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
} 