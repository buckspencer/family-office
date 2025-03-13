'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { AttachmentUploader } from '@/components/ui/attachment-uploader';
import { Asset, Attachment } from '@/lib/db/schema';
import { BackButton } from '@/components/ui/back-button';
import { Edit } from 'lucide-react';
import DeleteAssetButton from './delete-asset-button';

interface AssetDetailsProps {
  asset: Asset;
  initialAttachments: Attachment[];
}

export default function AssetDetails({ asset, initialAttachments }: AssetDetailsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);

  // Helper function to format currency with N/A fallback
  const formatValue = (value: string | number | null | undefined) => {
    if (!value || value === '0' || isNaN(parseFloat(value.toString()))) {
      return 'N/A';
    }
    return formatCurrency(parseFloat(value.toString()));
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources/assets" 
        label="Back to Assets"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{asset.name}</h1>
        <div className="flex space-x-2">
          <Link href={`/dashboard/resources/assets/${asset.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{asset.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                  <p>{formatValue(asset.value)}</p>
                </div>
                {asset.purchaseDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                    <p>{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                  </div>
                )}
                {asset.purchasePrice && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                    <p>{formatValue(asset.purchasePrice)}</p>
                  </div>
                )}
                {asset.location && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{asset.location}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">{asset.description || 'N/A'}</p>
              </div>

              {asset.notes && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1">{asset.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload documents, images, and other files related to this asset.
              </p>
            </CardHeader>
            <CardContent>
              <AttachmentUploader 
                resourceType="asset"
                resourceId={asset.id}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 