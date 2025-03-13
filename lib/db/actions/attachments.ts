'use server';

import { db } from '@/lib/db';
import { attachments, AttachmentInsert } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Get attachments for a specific resource
 */
export async function getAttachments(resourceType: string, resourceId: number) {
  try {
    // Get Supabase session
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { error: 'Unauthorized' };
    }

    const teamId = session.user.user_metadata?.teamId ?? 1; // Fallback to 1 for development

    const result = await db.query.attachments.findMany({
      where: and(
        eq(attachments.teamId, teamId),
        eq(attachments.resourceType, resourceType),
        eq(attachments.resourceId, resourceId),
        eq(attachments.isArchived, false)
      ),
      orderBy: attachments.createdAt,
    });

    return { attachments: result };
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return { error: 'Failed to fetch attachments' };
  }
}

/**
 * Create a new attachment
 * Note: This doesn't handle the actual file upload - that would be done separately
 * with a service like Supabase Storage, AWS S3, etc.
 */
export async function createAttachment(data: {
  name: string;
  fileUrl: string;
  resourceType: string;
  resourceId: number;
  fileSize?: number;
  fileType?: string;
  metadata?: unknown;
}) {
  try {
    // Get Supabase session
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { error: 'Unauthorized' };
    }

    const userId = parseInt(session.user.id);
    const teamId = session.user.user_metadata?.teamId ?? 1; // Fallback to 1 for development

    // Validate required fields
    if (!data.name || !data.fileUrl || !data.resourceType || !data.resourceId) {
      return { error: 'Missing or invalid required fields' };
    }

    const newAttachment: AttachmentInsert = {
      name: data.name,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileType: data.fileType,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata,
      teamId,
      userId,
      isArchived: false,
    };

    const [result] = await db.insert(attachments).values(newAttachment).returning();
    
    // Revalidate the path based on the resource type
    revalidatePath(`/dashboard/resources/${data.resourceType.toLowerCase()}s/${data.resourceId}`);
    return { data: result };
  } catch (error) {
    console.error('Error creating attachment:', error);
    return { error: 'Failed to create attachment' };
  }
}

/**
 * Delete an attachment (soft delete)
 */
export async function deleteAttachment(id: number) {
  try {
    // Get Supabase session
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { error: 'Unauthorized' };
    }

    const teamId = session.user.user_metadata?.teamId ?? 1; // Fallback to 1 for development

    // Check if attachment exists and belongs to the team
    const existingAttachment = await db.query.attachments.findFirst({
      where: and(
        eq(attachments.id, id),
        eq(attachments.teamId, teamId)
      ),
    });

    if (!existingAttachment) {
      return { error: 'Attachment not found' };
    }

    // Soft delete by setting isArchived to true
    await db
      .update(attachments)
      .set({ isArchived: true })
      .where(eq(attachments.id, id));
    
    // Revalidate the path based on the resource type
    revalidatePath(`/dashboard/resources/${existingAttachment.resourceType.toLowerCase()}s/${existingAttachment.resourceId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return { error: 'Failed to delete attachment' };
  }
} 