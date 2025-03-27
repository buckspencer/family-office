import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Avatar, AvatarFallback } from './avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatMessage, Task } from '@/lib/types/chat';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onConfirmTask?: (taskData: Task) => void;
  isLoading?: boolean;
  taskToConfirm?: Task | null;
}

export function Chat({ messages, onSendMessage, onConfirmTask, isLoading = false, taskToConfirm }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleConfirmTask = () => {
    if (onConfirmTask && taskToConfirm) {
      onConfirmTask(taskToConfirm);
    }
  };

  const handleCancelTask = () => {
    // Task cancellation is handled by the parent component
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 mb-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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

      <Dialog open={!!taskToConfirm} onOpenChange={() => handleCancelTask()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Would you like to create this task?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{taskToConfirm?.title}</p>
            {taskToConfirm?.description && (
              <p className="text-sm text-muted-foreground mt-1">{taskToConfirm.description}</p>
            )}
            {taskToConfirm?.dueDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Due: {new Date(taskToConfirm.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelTask}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 