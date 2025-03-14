import { getSubscriptionById } from '@/lib/db/actions/subscriptions';
import { SubscriptionForm } from '../../components/subscription-form';
import { notFound } from 'next/navigation';

interface EditSubscriptionPageProps {
  params: {
    id: string;
  };
}

export default async function EditSubscriptionPage({ params }: EditSubscriptionPageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);
  
  if (isNaN(id)) {
    notFound();
  }
  
  const response = await getSubscriptionById(id);
  
  if (!response.success || !response.data) {
    notFound();
  }
  
  return <SubscriptionForm subscription={response.data} mode="edit" />;
} 