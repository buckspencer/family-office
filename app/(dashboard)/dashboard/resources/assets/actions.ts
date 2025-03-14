'use server';

import { db } from '@/lib/db';
import { assets, Asset, AssetInsert } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

// Define a type for the session user
type SessionUser = {
  id: number;
  email: string;
  name: string;
  teamId?: number;
};

export async function getAssets(teamId?: number) {
  try {
    // Get session for user and team info
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const resolvedTeamId = teamId ?? user?.teamId ?? 1; // Fallback to 1 for development

    const result = await db.query.assets.findMany({
      where: and(
        eq(assets.teamId, resolvedTeamId),
        eq(assets.isArchived, false)
      ),
      orderBy: assets.createdAt,
    });

    return { assets: result };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { error: 'Failed to fetch assets' };
  }
}

export async function createAsset(formData: FormData) {
  try {
    // Get session for user and team info
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? 1; // Fallback to 1 for development
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development

    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || ''; // Provide default empty string
    const type = formData.get('type') as string;
    const valueStr = formData.get('value') as string;
    const purchaseDate = formData.get('purchaseDate') as string;
    const purchasePriceStr = formData.get('purchasePrice') as string;
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;
    const metadataStr = formData.get('metadata') as string;
    let metadata = undefined;
    
    // Parse metadata if it exists
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }

    // Validate required fields
    if (!name || !type) {
      return { error: 'Name and type are required' };
    }

    // Handle numeric values - convert empty strings to '0'
    const value = valueStr === '' ? '0' : parseFloat(valueStr).toString();
    const purchasePrice = purchasePriceStr === '' ? '0' : parseFloat(purchasePriceStr).toString();

    const newAsset: AssetInsert = {
      name,
      description, // Now guaranteed to be a string
      type: type as any, // Type assertion needed for enum
      value, // Already a string
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      purchasePrice, // Already a string
      location: location || undefined,
      notes: notes || undefined,
      metadata,
      teamId,
      userId: userId.toString(), // Ensure this is a string
      isArchived: false,
    };

    const [result] = await db.insert(assets).values(newAsset).returning();

    // Revalidate the assets list page
    revalidatePath('/dashboard/resources/assets');
    return { data: result };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { error: 'Failed to create asset' };
  }
}

export async function deleteAsset(id: number) {
  try {
    // Get session for user and team info
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development

    // Check if asset exists and belongs to the team
    const existingAsset = await db.query.assets.findFirst({
      where: and(
        eq(assets.id, id),
        eq(assets.teamId, teamId)
      ),
    });

    if (!existingAsset) {
      return { error: 'Asset not found' };
    }

    // Soft delete by setting isArchived to true
    await db
      .update(assets)
      .set({ isArchived: true })
      .where(eq(assets.id, id));
    
    revalidatePath('/dashboard/resources/assets');
    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { error: 'Failed to delete asset' };
  }
}

export async function getAssetById(id: number) {
  try {
    // Get session for user and team info
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development

    const result = await db.query.assets.findFirst({
      where: and(
        eq(assets.id, id),
        eq(assets.teamId, teamId)
      ),
    });

    if (!result) {
      return { error: 'Asset not found' };
    }

    return { asset: result };
  } catch (error) {
    console.error('Error fetching asset:', error);
    return { error: 'Failed to fetch asset' };
  }
}

export async function updateAsset(id: number, formData: FormData) {
  try {
    // Get session for user and team info
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const teamId = user?.teamId ?? 1; // Fallback to 1 for development

    // Check if asset exists and belongs to the team
    const existingAsset = await db.query.assets.findFirst({
      where: and(
        eq(assets.id, id),
        eq(assets.teamId, teamId)
      ),
    });

    if (!existingAsset) {
      return { error: 'Asset not found' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const valueStr = formData.get('value') as string;
    const purchaseDate = formData.get('purchaseDate') as string;
    const purchasePriceStr = formData.get('purchasePrice') as string;
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;
    const metadataStr = formData.get('metadata') as string;
    let metadata = undefined;
    
    // Parse metadata if it exists
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }

    // Validate required fields
    if (!name || !type) {
      return { error: 'Name and type are required' };
    }

    // Handle numeric values - convert empty strings to undefined
    const value = valueStr === '' ? undefined : parseFloat(valueStr);
    const purchasePrice = purchasePriceStr === '' ? undefined : parseFloat(purchasePriceStr);

    const updatedAsset = {
      name,
      description,
      type: type as any, // Type assertion needed for enum
      value: value?.toString() || undefined, // Convert to string for database with undefined fallback
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      purchasePrice: purchasePrice?.toString() || undefined, // Convert to string for database with undefined fallback
      location: location || undefined,
      notes: notes || undefined,
      metadata,
    };

    const [result] = await db
      .update(assets)
      .set(updatedAsset)
      .where(eq(assets.id, id))
      .returning();

    // Revalidate the assets list page and the asset detail page
    revalidatePath('/dashboard/resources/assets');
    revalidatePath(`/dashboard/resources/assets/${id}`);
    return { data: result };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { error: 'Failed to update asset' };
  }
} 