import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetCard } from '@/components/ui/asset-card';
import { Asset } from '@/lib/db/schema';
import { BackButton } from '@/components/ui/back-button';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const metadata = {
  title: 'Assets | Family Office',
  description: 'Manage your assets and properties',
};

export default async function AssetsPage() {
  const session = await getSession();
  
  // Use type assertion to help TypeScript understand the structure
  type SessionUser = {
    id: string | number;
    email: string;
    name: string;
    teamId?: number;
  };
  
  const user = session?.user as SessionUser | undefined;
  const teamId = user?.teamId ?? 1; // Default to 1 if not available
  
  // Fetch assets directly using Drizzle
  let assetsList: Asset[] = [];
  try {
    const result = await db.query.assets.findMany({
      where: and(
        eq(assets.teamId, teamId),
        eq(assets.isArchived, false)
      ),
      orderBy: assets.createdAt,
    });
    
    // Ensure result is not undefined
    assetsList = result || [];
  } catch (error) {
    console.error('Error fetching assets:', error);
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources" 
        label="Back to Resources Dashboard"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assets</h1>
        <Link href="/dashboard/resources/assets/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Asset
          </Button>
        </Link>
      </div>

      {assetsList.length === 0 ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>No Assets Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't added any assets yet. Click the button above to add your first asset.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetsList.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
} 