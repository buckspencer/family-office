import { getSubscriptions } from './actions';
import { SubscriptionsClient } from './subscriptions-client';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const result = await getSubscriptions();
  const subscriptions = result.subscriptions || [];

  return <SubscriptionsClient initialSubscriptions={subscriptions} />;
} 