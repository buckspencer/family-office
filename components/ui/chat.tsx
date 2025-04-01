import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChatMessage, Task, ChatAction } from '@/lib/types/chat';
import { Plus, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, set, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onConfirmTask: (task: ChatAction) => void;
  onCancelTask: () => void;
  taskToConfirm: ChatAction | null;
}

export function Chat({ messages, onSendMessage, onConfirmTask, onCancelTask, taskToConfirm }: ChatProps) {
  const [input, setInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (taskToConfirm?.data?.dueDate) {
      return new Date(taskToConfirm.data.dueDate);
    }
    return startOfDay(new Date());
  });
  const [selectedPriority, setSelectedPriority] = useState<string>(taskToConfirm?.data?.priority || 'medium');
  const [taskTitle, setTaskTitle] = useState(taskToConfirm?.data?.title || '');
  const [taskDescription, setTaskDescription] = useState(taskToConfirm?.data?.description || '');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taskToConfirm) {
      setTaskTitle(taskToConfirm.data?.title || '');
      setTaskDescription(taskToConfirm.data?.description || '');
      setSelectedDate(taskToConfirm.data?.dueDate ? new Date(taskToConfirm.data.dueDate) : startOfDay(new Date()));
      setSelectedPriority(taskToConfirm.data?.priority || 'medium');
    }
  }, [taskToConfirm]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleConfirmTask = () => {
    if (!taskToConfirm) {
      console.log('No task to confirm in chat component');
      return;
    }
    
    console.log('Chat component: Starting task confirmation with data:', {
      taskToConfirm,
      taskTitle,
      taskDescription,
      selectedDate,
      selectedPriority,
      selectedTime
    });
    
    // Create a new task with the updated data
    const updatedTask: ChatAction = {
      type: 'create_task',
      data: {
        title: taskTitle,
        description: taskDescription,
        dueDate: selectedDate ? selectedDate.toISOString() : taskToConfirm.data?.dueDate,
        priority: selectedPriority || taskToConfirm.data?.priority,
        requiresConfirmation: true
      }
    };

    console.log('Chat component: Created updated task:', updatedTask);
    onConfirmTask(updatedTask);
    onCancelTask();
    setTaskTitle('');
    setTaskDescription('');
    setSelectedDate(startOfDay(new Date()));
    setSelectedPriority('medium');
  };

  const handleCancelTask = () => {
    onCancelTask();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.action && message.action.type === 'create_task' && (
                <Dialog open={!!taskToConfirm} onOpenChange={() => handleCancelTask()}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                        Fill in the task details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <div className="col-span-3 flex flex-col gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <input
                              type="time"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCancelTask}>Cancel</Button>
                      <Button type="button" onClick={handleConfirmTask}>Create Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
} 