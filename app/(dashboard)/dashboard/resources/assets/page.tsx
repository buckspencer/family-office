'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetCard } from '@/components/ui/asset-card';
import { Asset } from '@/lib/db/temp-schema/assets.types';
import { getAssets } from './actions';

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);

  React.useEffect(() => {
    async function fetchAssets() {
      try {
        const result = await getAssets();
        if ('assets' in result) {
          setAssets(result.assets);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    }
    fetchAssets();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/family">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Family Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assets</h1>
        <Link href="/dashboard/family/assets/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Asset
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
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
          assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))
        )}
      </div>
    </div>
  );
} 