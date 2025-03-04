'use server';

import { Asset, AssetType } from '@/lib/db/temp-schema/assets.types';

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: 1,
    name: 'Primary Residence',
    type: 'property',
    description: 'Family home in suburban area',
    value: 750000,
    purchaseDate: new Date('2020-06-15'),
    purchasePrice: 650000,
    location: '123 Main St, Anytown, USA',
    notes: '3 bedrooms, 2 bathrooms, 2,500 sq ft',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Tesla Model 3',
    type: 'vehicle',
    description: 'Electric vehicle for daily commute',
    value: 45000,
    purchaseDate: new Date('2023-03-20'),
    purchasePrice: 48000,
    location: 'Garage at home',
    notes: 'Autopilot enabled, premium interior',
    teamId: 1,
    userId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export async function getAssets() {
  // For now, just return mock data
  return { assets: mockAssets };
}

export async function createAsset(data: FormData) {
  const value = parseFloat(data.get('value') as string);
  if (isNaN(value)) {
    return { error: 'Value must be a valid number' };
  }

  const purchasePrice = data.get('purchasePrice') as string;
  const purchasePriceValue = purchasePrice ? parseFloat(purchasePrice) : undefined;
  if (purchasePrice && isNaN(purchasePriceValue!)) {
    return { error: 'Purchase price must be a valid number' };
  }

  const purchaseDate = data.get('purchaseDate') as string;
  const purchaseDateValue = purchaseDate ? new Date(purchaseDate) : undefined;
  if (purchaseDate && isNaN(purchaseDateValue!.getTime())) {
    return { error: 'Purchase date must be a valid date' };
  }

  const newAsset: Asset = {
    id: mockAssets.length + 1,
    name: data.get('name') as string,
    type: data.get('type') as AssetType,
    description: data.get('description') as string,
    value,
    purchaseDate: purchaseDateValue,
    purchasePrice: purchasePriceValue,
    location: data.get('location') as string || undefined,
    notes: data.get('notes') as string || undefined,
    teamId: 1, // Mock team ID
    userId: 1, // Mock user ID
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Validate required fields
  if (!newAsset.name || !newAsset.type || !newAsset.description) {
    return { error: 'Missing required fields' };
  }

  mockAssets.push(newAsset);
  return { data: newAsset };
}

export async function deleteAsset(data: FormData) {
  const id = Number(data.get('id'));
  const index = mockAssets.findIndex(asset => asset.id === id);
  
  if (index === -1) {
    return { error: 'Asset not found' };
  }

  mockAssets.splice(index, 1);
  return { success: true };
} 