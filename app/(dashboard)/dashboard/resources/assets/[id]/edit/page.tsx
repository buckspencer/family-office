import { getAssetById } from '../../actions';
import AssetForm from '../../components/asset-form';

interface EditAssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id: idString } = await params;
  const assetId = parseInt(idString, 10);
  
  if (isNaN(assetId)) {
    throw new Error("Invalid asset ID");
  }
  
  // Fetch asset details
  const assetResult = await getAssetById(assetId);
  if ('error' in assetResult) {
    throw new Error(assetResult.error);
  }

  return <AssetForm asset={assetResult.asset} mode="edit" />;
} 