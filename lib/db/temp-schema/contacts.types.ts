// These types will be generated from the schema once it's created
export interface ContactCreate {
  name: string;
  type: 'family' | 'medical' | 'financial' | 'legal' | 'service' | 'other';
  relationship: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId: number;
  userId: number;
}

export interface ContactUpdate {
  name?: string;
  type?: 'family' | 'medical' | 'financial' | 'legal' | 'service' | 'other';
  relationship?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

// This will be generated from the schema
export interface Contact extends ContactCreate {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
} 