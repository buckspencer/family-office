import { getAssetById } from '../../actions';
import AssetForm from '../../components/asset-form';

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const assetId = parseInt(params.id);
  
  // Fetch asset details
  const assetResult = await getAssetById(assetId);
  if ('error' in assetResult) {
    throw new Error(assetResult.error);
  }

  return <AssetForm asset={assetResult.asset} mode="edit" />;
} 