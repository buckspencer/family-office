'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { documents, type Document, ActivityType } from '../schema';
import { z } from 'zod';
import { supabase, deleteFile, getS3SignedUrl } from '@/lib/supabase';
import { withActivityLog } from './activity';
import { getUser } from './users';
import { getSession } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase-server';

// Define NewDocument type based on Document
type NewDocument = {
  name: string;
  category: string;
  expiryDate?: Date | null;
  notes?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
  isEncrypted?: boolean;
  lastAccessed?: Date | null;
  isArchived?: boolean;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  teamId: number;
  userId: string;
};

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Operations
async function createDocumentQuery(data: NewDocument) {
  return db.insert(documents).values(data).returning();
}

async function getDocumentsQuery(teamId: number, options?: { 
  limit?: number; 
  offset?: number; 
  orderBy?: string; 
  orderDir?: 'asc' | 'desc';
  isArchived?: boolean;
}) {
  const { limit = 100, offset = 0, orderBy = 'createdAt', orderDir = 'desc', isArchived = false } = options || {};
  
  const orderColumn = documents[orderBy as keyof typeof documents] as any;
  const orderDirection = orderDir === 'asc' ? sql`asc` : sql`desc`;
  
  return db.select()
    .from(documents)
    .where(
      and(
        eq(documents.teamId, teamId),
        eq(documents.isArchived, isArchived)
      )
    )
    .orderBy(sql`${orderColumn} ${orderDirection}`)
    .limit(limit)
    .offset(offset);
}

async function getDocumentByIdQuery(id: number) {
  return db.select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
}

async function updateDocumentQuery(id: number, data: Partial<Document>) {
  return db.update(documents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
}

async function deleteDocumentQuery(id: number) {
  return db.delete(documents)
    .where(eq(documents.id, id))
    .returning();
}

// Input validation schemas
const createDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  expiryDate: z.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  fileUrl: z.string().min(1, "File URL is required"),
  fileSize: z.number().nullable().optional(),
  fileType: z.string().nullable().optional(),
  isEncrypted: z.boolean().optional().default(false),
  lastAccessed: z.date().nullable().optional(),
  isArchived: z.boolean().optional().default(false),
  tags: z.array(z.string()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  teamId: z.number(),
  userId: z.string()
});

const updateDocumentSchema = createDocumentSchema.partial();

// Server Actions
export async function createDocument(data: NewDocument): Promise<ActionResponse<Document>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.CREATE_DOCUMENT,
    userId: user.id,
    teamId: data.teamId,
    resourceType: 'document',
    operation: async () => {
      try {
        // Validate input
        const validatedData = createDocumentSchema.parse(data);
        
        // Ensure null values for optional fields that might be undefined
        const documentData = {
          ...validatedData,
          expiryDate: validatedData.expiryDate ?? null,
          notes: validatedData.notes ?? null,
          fileSize: validatedData.fileSize ?? null,
          fileType: validatedData.fileType ?? null,
          lastAccessed: validatedData.lastAccessed ?? null,
          tags: validatedData.tags ?? null,
          metadata: validatedData.metadata ?? null,
        };
        
        const [document] = await createDocumentQuery(documentData);
        revalidatePath('/dashboard/resources/documents');
        return { success: true, data: document };
      } catch (error) {
        console.error('Error creating document:', error);
        if (error instanceof z.ZodError) {
          return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Failed to create document' };
      }
    },
  });
}

export async function getDocuments(teamId: number, options?: { 
  limit?: number; 
  offset?: number; 
  orderBy?: string; 
  orderDir?: 'asc' | 'desc';
  isArchived?: boolean;
}): Promise<ActionResponse<Document[]>> {
  const session = await getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  return withActivityLog({
    action: ActivityType.GET_DOCUMENTS,
    userId: session.user.id,
    teamId: teamId,
    resourceType: 'document',
    operation: async () => {
      try {
        const documents = await getDocumentsQuery(teamId, options);
        return { success: true, data: documents };
      } catch (error) {
        console.error('Error fetching documents:', error);
        return { success: false, error: 'Failed to fetch documents' };
      }
    },
  });
}

export async function getDocumentById(id: number): Promise<ActionResponse<Document | null>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.GET_DOCUMENT_BY_ID,
    userId: user.id,
    teamId: await getDocumentByIdQuery(id).then(result => result[0]?.teamId),
    resourceType: 'document',
    resourceId: id,
    operation: async () => {
      try {
        const [document] = await getDocumentByIdQuery(id);
        if (!document) {
          return { success: false, error: 'Document not found' };
        }
        return { success: true, data: document };
      } catch (error) {
        console.error('Error fetching document:', error);
        return { success: false, error: 'Failed to fetch document' };
      }
    },
  });
}

export async function updateDocument(id: number, data: Partial<Document>): Promise<ActionResponse<Document>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const [existingDoc] = await db.select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!existingDoc) throw new Error('Document not found');
  if (existingDoc.teamId !== data.teamId) throw new Error('Unauthorized');

  return withActivityLog({
    action: ActivityType.UPDATE_DOCUMENT,
    userId: user.id,
    teamId: existingDoc.teamId,
    resourceType: 'document',
    resourceId: id,
    metadata: {
      previousName: existingDoc.name,
      newName: data.name,
      changedFields: Object.keys(data),
    },
    operation: async () => {
      try {
        // Validate input
        const validatedData = updateDocumentSchema.parse(data);
        
        const [document] = await updateDocumentQuery(id, validatedData);
        if (!document) {
          return { success: false, error: 'Document not found' };
        }
        revalidatePath('/dashboard/resources/documents');
        return { success: true, data: document };
      } catch (error) {
        console.error('Error updating document:', error);
        if (error instanceof z.ZodError) {
          return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Failed to update document' };
      }
    },
  });
}

export async function deleteDocument(id: number): Promise<ActionResponse<Document>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.DELETE_DOCUMENT,
    userId: user.id,
    teamId: await getDocumentByIdQuery(id).then(result => result[0]?.teamId),
    resourceType: 'document',
    resourceId: id,
    metadata: {
      documentName: await getDocumentByIdQuery(id).then(result => result[0]?.name),
      documentCategory: await getDocumentByIdQuery(id).then(result => result[0]?.category),
    },
    operation: async () => {
      try {
        // First, get the document to retrieve the file URL
        const [document] = await getDocumentByIdQuery(id);
        
        if (!document) {
          return { success: false, error: 'Document not found' };
        }
        
        // Try to delete the file from storage if it exists
        if (document.fileUrl && !document.fileUrl.includes('404') && !document.fileUrl.includes('Bucket not found')) {
          try {
            // Use the deleteFile helper function
            const { success, error } = await deleteFile(document.fileUrl);
            
            if (!success) {
              // Log the error but continue with document deletion
              console.error('Error deleting file from storage:', error);
            }
          } catch (storageError) {
            // Log the error but continue with document deletion
            console.error('Error processing file deletion:', storageError);
          }
        }
        
        // Delete the document from the database
        const [deletedDocument] = await deleteDocumentQuery(id);
        
        if (!deletedDocument) {
          return { success: false, error: 'Failed to delete document record' };
        }
        
        revalidatePath('/dashboard/resources/documents');
        return { success: true, data: deletedDocument };
      } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: 'Failed to delete document' };
      }
    },
  });
}

// Archive/Unarchive document
export async function toggleDocumentArchiveStatus(id: number, isArchived: boolean): Promise<ActionResponse<Document>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const [existingDoc] = await db.select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!existingDoc) throw new Error('Document not found');

  return withActivityLog({
    action: ActivityType.ARCHIVE_DOCUMENT,
    userId: user.id,
    teamId: existingDoc.teamId,
    resourceType: 'document',
    resourceId: id,
    metadata: {
      documentName: existingDoc.name,
      documentCategory: existingDoc.category,
    },
    operation: async () => {
      const [document] = await db.update(documents)
        .set({
          isArchived: isArchived,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id))
        .returning();
      revalidatePath('/dashboard/resources/documents');
      return { success: true, data: document };
    },
  });
}

// Batch operations
export async function batchDeleteDocuments(ids: number[]): Promise<ActionResponse<{ count: number }>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.BATCH_DELETE_DOCUMENTS,
    userId: user.id,
    teamId: await getDocumentsQuery(await getDocumentsQuery(0, { limit: 1 }).then(result => result[0]?.teamId), { isArchived: true }).then(result => result[0]?.teamId),
    resourceType: 'document',
    operation: async () => {
      try {
        const result = await db.delete(documents)
          .where(sql`${documents.id} IN (${ids.join(',')})`)
          .returning();
        
        revalidatePath('/dashboard/resources/documents');
        return { success: true, data: { count: result.length } };
      } catch (error) {
        console.error('Error batch deleting documents:', error);
        return { success: false, error: 'Failed to delete documents' };
      }
    },
  });
}

export async function batchArchiveDocuments(ids: number[], isArchived: boolean): Promise<ActionResponse<{ count: number }>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.BATCH_ARCHIVE_DOCUMENTS,
    userId: user.id,
    teamId: await getDocumentsQuery(0, { limit: 1 }).then(result => result[0]?.teamId),
    resourceType: 'document',
    operation: async () => {
      try {
        const result = await db.update(documents)
          .set({ isArchived, updatedAt: new Date() })
          .where(sql`${documents.id} IN (${ids.join(',')})`)
          .returning();
        
        revalidatePath('/dashboard/resources/documents');
        return { success: true, data: { count: result.length } };
      } catch (error) {
        console.error('Error batch archiving documents:', error);
        return { success: false, error: 'Failed to archive documents' };
      }
    },
  });
}

// Generate a signed URL for a document file
export async function getSignedDocumentUrl(fileUrl: string, expiresIn: number = 3600): Promise<ActionResponse<string>> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return withActivityLog({
    action: ActivityType.GET_SIGNED_DOCUMENT_URL,
    userId: user.id,
    teamId: await getDocumentsQuery(0, { limit: 1 }).then(result => result[0]?.teamId),
    resourceType: 'document',
    operation: async () => {
      try {
        console.log('Original fileUrl:', fileUrl);
        
        // Check if the URL is a placeholder or error URL
        if (fileUrl.includes('404') || fileUrl.includes('Bucket not found')) {
          return { 
            success: false, 
            error: 'The file storage bucket does not exist or the file is missing.' 
          };
        }

        // Extract the path from the URL
        if (!fileUrl.includes('/storage/v1/object/public/')) {
          console.log('URL does not match expected format, using original URL:', fileUrl);
          return { success: true, data: fileUrl };
        }
        
        const urlParts = fileUrl.split('/storage/v1/object/public/');
        if (urlParts.length < 2) {
          console.log('URL split resulted in unexpected format, using original URL:', fileUrl);
          return { success: true, data: fileUrl };
        }
        
        const pathParts = urlParts[1].split('/');
        if (pathParts.length < 2) {
          console.log('Path parts insufficient, using original URL:', fileUrl);
          return { success: true, data: fileUrl };
        }
        
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        
        console.log('Attempting to generate S3 signed URL for:', { bucket, filePath });
        
        // Try the new S3 client approach
        const { url, error } = await getS3SignedUrl(bucket, filePath, expiresIn);
        
        if (error || !url) {
          console.error('Error generating S3 signed URL, falling back to public URL:', error);
          
          // Fall back to public URL
          const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          
          if (publicUrlData && publicUrlData.publicUrl) {
            console.log('Using public URL as fallback');
            return { success: true, data: publicUrlData.publicUrl };
          }
          
          return { 
            success: false, 
            error: 'Failed to generate URL for the document. The file may not exist or you may not have permission to access it.' 
          };
        }
        
        console.log('Successfully generated S3 signed URL');
        return { success: true, data: url };
      } catch (error) {
        console.error('Error in getSignedDocumentUrl:', error);
        
        // Always try to return something useful rather than an error
        try {
          const urlParts = fileUrl.split('/storage/v1/object/public/');
          if (urlParts.length >= 2) {
            const pathParts = urlParts[1].split('/');
            const bucket = pathParts[0];
            const filePath = pathParts.slice(1).join('/');
            
            // Fall back to public URL
            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            
            if (publicUrlData && publicUrlData.publicUrl) {
              console.log('Using public URL after error');
              return { success: true, data: publicUrlData.publicUrl };
            }
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
        }
        
        return { success: false, error: 'Failed to generate URL' };
      }
    },
  });
}