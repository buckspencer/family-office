import { getAssetById } from '../actions';
import { getAttachments } from '@/lib/db/actions/attachments';
import AssetDetails from './asset-details';
import { Attachment } from '@/lib/db/schema';

export default async function AssetPage({ params }: { params: { id: string } }) {
  const assetId = parseInt(params.id);
  
  // Fetch asset details
  const assetResult = await getAssetById(assetId);
  if ('error' in assetResult) {
    throw new Error(assetResult.error);
  }

  // Fetch attachments
  let attachments: Attachment[] = [];
  try {
    const attachmentsResult = await getAttachments('asset', assetId);
    if (!('error' in attachmentsResult)) {
      attachments = attachmentsResult.attachments;
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
  }

  return <AssetDetails asset={assetResult.asset} initialAttachments={attachments} />;
} 