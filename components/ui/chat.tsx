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
}

export function Chat({ messages, onSendMessage, onConfirmTask, isLoading = false }: ChatProps) {
  const [input, setInput] = useState('');
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);
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
      setTaskToConfirm(null);
    }
  };

  const handleCancelTask = () => {
    setTaskToConfirm(null);
  };

  useEffect(() => {
    // Check the last message for task creation action
    const lastMessage = messages[messages.length - 1];
    console.log('Chat component - Last message:', lastMessage);
    
    if (!lastMessage?.action) {
      console.log('Chat component - No action in last message');
      return;
    }

    console.log('Chat component - Processing action:', lastMessage.action);

    if (lastMessage.action.type === 'create_task') {
      console.log('Chat component - Setting task to confirm:', lastMessage.action.data);
      setTaskToConfirm(lastMessage.action.data as Task);
    } else if (lastMessage.action.type === 'confirm_action') {
      console.log('Chat component - Processing confirm_action:', lastMessage.action);
      // Handle confirmation action with task data
      const taskData = lastMessage.action.data as Task;
      console.log('Chat component - Task data from confirm_action:', taskData);
      
      if (taskData?.title) {
        console.log('Chat component - Found valid task data, calling onConfirmTask');
        // Automatically confirm the task
        if (onConfirmTask) {
          console.log('Chat component - Calling onConfirmTask with data:', taskData);
          const formattedTaskData: Task = {
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate,
            priority: taskData.priority || 'medium',
            status: 'pending'
          };
          console.log('Chat component - Formatted task data:', formattedTaskData);
          onConfirmTask(formattedTaskData);
          setTaskToConfirm(null);
        } else {
          console.log('Chat component - onConfirmTask is not defined');
        }
      } else {
        console.log('Chat component - No valid task data found in confirm_action');
      }
    }
  }, [messages, onConfirmTask]);

  return (
    <>
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
      </Card>

      <Dialog open={!!taskToConfirm} onOpenChange={() => setTaskToConfirm(null)}>
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
    </>
  );
} 