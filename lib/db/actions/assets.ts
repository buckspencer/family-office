'use server';

import { db } from '@/lib/db';
import { assets, Asset, AssetInsert } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

// Define the session type based on what getSession returns
type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    teamId: number;
  }
};

export async function getAssets() {
  try {
    const session = await getSession() as Session | null;
    if (!session || !session.user.teamId) {
      return { error: 'Unauthorized' };
    }

    const teamId = session.user.teamId;
    const result = await db.query.assets.findMany({
      where: and(
        eq(assets.teamId, teamId),
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

export async function getAssetById(id: number) {
  try {
    const session = await getSession() as Session | null;
    if (!session || !session.user.teamId) {
      return { error: 'Unauthorized' };
    }

    const teamId = session.user.teamId;
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

export async function createAsset(formData: FormData) {
  try {
    const session = await getSession() as Session | null;
    if (!session || !session.user.teamId) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const valueStr = formData.get('value') as string;
    const value = parseFloat(valueStr);

    // Validate required fields
    if (!name || !type || !description || isNaN(value)) {
      return { error: 'Missing or invalid required fields' };
    }

    // Optional fields
    const purchaseDateStr = formData.get('purchaseDate') as string;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : undefined;
    
    const purchasePriceStr = formData.get('purchasePrice') as string;
    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : undefined;
    
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;

    const newAsset: AssetInsert = {
      name,
      type: type as any, // Type assertion needed for enum
      description,
      value: value.toString(), // Convert to string for database
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice?.toString(), // Convert to string for database
      location: location || undefined,
      notes: notes || undefined,
      teamId: session.user.teamId,
      userId: parseInt(session.user.id), // Convert string ID to number
    };

    const [result] = await db.insert(assets).values(newAsset).returning();
    
    revalidatePath('/dashboard/resources/assets');
    return { data: result };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { error: 'Failed to create asset' };
  }
}

export async function updateAsset(id: number, formData: FormData) {
  try {
    const session = await getSession() as Session | null;
    if (!session || !session.user.teamId) {
      return { error: 'Unauthorized' };
    }

    // Check if asset exists and belongs to the team
    const existingAsset = await db.query.assets.findFirst({
      where: and(
        eq(assets.id, id),
        eq(assets.teamId, session.user.teamId)
      ),
    });

    if (!existingAsset) {
      return { error: 'Asset not found' };
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const valueStr = formData.get('value') as string;
    const value = parseFloat(valueStr);

    // Validate required fields
    if (!name || !type || !description || isNaN(value)) {
      return { error: 'Missing or invalid required fields' };
    }

    // Optional fields
    const purchaseDateStr = formData.get('purchaseDate') as string;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : null;
    
    const purchasePriceStr = formData.get('purchasePrice') as string;
    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null;
    
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;

    const updatedAsset = {
      name,
      type: type as any, // Type assertion needed for enum
      description,
      value: value.toString(), // Convert to string for database
      purchaseDate,
      purchasePrice: purchasePrice !== null ? purchasePrice.toString() : null, // Convert to string for database
      location: location || null,
      notes: notes || null,
    };

    const [result] = await db
      .update(assets)
      .set(updatedAsset)
      .where(eq(assets.id, id))
      .returning();
    
    revalidatePath('/dashboard/resources/assets');
    return { data: result };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { error: 'Failed to update asset' };
  }
}

export async function deleteAsset(id: number) {
  try {
    const session = await getSession() as Session | null;
    if (!session || !session.user.teamId) {
      return { error: 'Unauthorized' };
    }

    // Check if asset exists and belongs to the team
    const existingAsset = await db.query.assets.findFirst({
      where: and(
        eq(assets.id, id),
        eq(assets.teamId, session.user.teamId)
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