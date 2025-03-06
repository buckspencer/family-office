// These types will be generated from the schema once it's created
export interface DocumentCreate {
  name: string;
  category: string;
  expiryDate?: Date;
  notes?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  isEncrypted?: boolean;
  lastAccessed?: Date;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  teamId: number;
  userId: number;
}

export interface DocumentUpdate {
  name?: string;
  category?: string;
  expiryDate?: Date;
  notes?: string;
  fileSize?: number;
  fileType?: string;
  isEncrypted?: boolean;
  lastAccessed?: Date;
  isArchived?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

// This will be generated from the schema
export interface Document extends DocumentCreate {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
} 