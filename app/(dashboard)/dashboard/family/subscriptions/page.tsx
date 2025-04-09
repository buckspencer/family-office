'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateSubscriptionModal } from '@/components/family/subscriptions/CreateSubscriptionModal';
import { EditSubscriptionModal } from '@/components/family/subscriptions/EditSubscriptionModal';
import { useEffect, useState } from 'react';
import { listSubscriptions } from '@/lib/actions/familySubscriptions';
import { FamilySubscription } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { deleteSubscription } from '@/lib/actions/familySubscriptions';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<FamilySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<number | null>(null);
  const router = useRouter();

  const fetchSubscriptions = async () => {
    const result = await listSubscriptions();
    if (result.success) {
      setSubscriptions(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await deleteSubscription({ id });
    if (result.success) {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    }
  };

  const handleEditSuccess = () => {
    fetchSubscriptions();
  };

  const handleCreateSuccess = () => {
    fetchSubscriptions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <CreateSubscriptionModal onSuccess={handleCreateSuccess} />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No subscriptions found. Add your first subscription to get started.</p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{subscription.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ${subscription.monthlyCost} per month
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSubscriptionId(subscription.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subscription.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscription.description && (
                  <p className="text-sm text-muted-foreground">
                    {subscription.description}
                  </p>
                )}
                {subscription.url && (
                  <a
                    href={subscription.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {subscription.url}
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {editingSubscriptionId && (
        <EditSubscriptionModal
          subscriptionId={editingSubscriptionId}
          isOpen={true}
          onClose={() => setEditingSubscriptionId(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
} 