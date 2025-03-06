export type EventType = 'birthday' | 'anniversary' | 'holiday' | 'reminder' | 'other';

export interface Event {
  id: number;
  title: string;
  type: EventType;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminderBefore?: number;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventCreate {
  title: string;
  type: EventType;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminderBefore?: number;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId: number;
  userId: number;
}

export interface EventUpdate {
  title?: string;
  type?: EventType;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminderBefore?: number;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Temp data
export const events: Event[] = [
  {
    id: 1,
    title: 'Family Reunion',
    type: 'holiday',
    description: 'Annual family reunion at the beach house',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-20'),
    location: 'Beach House, Malibu',
    notes: 'Bring sunscreen and beach gear',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    reminderBefore: 7 * 24 * 60, // 7 days in minutes
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: 'Mom\'s Birthday',
    type: 'birthday',
    description: 'Mom\'s 60th birthday celebration',
    startDate: new Date('2024-05-10'),
    location: 'Home',
    notes: 'Order cake and decorations',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    reminderBefore: 2 * 24 * 60, // 2 days in minutes
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: 'Wedding Anniversary',
    type: 'anniversary',
    description: 'Parents\' wedding anniversary',
    startDate: new Date('2024-08-25'),
    location: 'Restaurant',
    notes: 'Make dinner reservations',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY',
    reminderBefore: 3 * 24 * 60, // 3 days in minutes
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    title: 'Doctor Appointment',
    type: 'reminder',
    description: 'Annual check-up',
    startDate: new Date('2024-06-15T10:00:00'),
    location: 'Medical Center',
    notes: 'Bring insurance card',
    isRecurring: false,
    reminderBefore: 60, // 1 hour in minutes
    teamId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 