import { Asset } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  // Helper function to format currency with N/A fallback
  const formatValue = (value: string | number | null | undefined) => {
    if (!value || value === '0' || isNaN(parseFloat(value.toString()))) {
      return 'N/A';
    }
    return formatCurrency(parseFloat(value.toString()));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{asset.name}</span>
          <span className="text-sm font-normal text-muted-foreground capitalize">
            {asset.type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-muted-foreground">{asset.description || 'N/A'}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Value:</span>
            <span className="text-sm">{formatValue(asset.value)}</span>
          </div>
          {asset.purchaseDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Purchase Date:</span>
              <span className="text-sm">
                {new Date(asset.purchaseDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {asset.purchasePrice && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Purchase Price:</span>
              <span className="text-sm">{formatValue(asset.purchasePrice)}</span>
            </div>
          )}
          {asset.location && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Location:</span>
              <span className="text-sm">{asset.location}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Link href={`/dashboard/resources/assets/${asset.id}`}>
            <Button variant="ghost" className="w-full justify-between">
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 