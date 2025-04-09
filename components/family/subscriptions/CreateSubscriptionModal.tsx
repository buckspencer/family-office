'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ResourceForm } from '@/components/family/forms/ResourceForm';
import { createSubscription } from '@/lib/actions/familySubscriptions';
import { useRouter } from 'next/navigation';

const subscriptionFields = [
  {
    name: 'name',
    label: 'Subscription Name',
    type: 'text' as const,
    required: true,
  },
  {
    name: 'monthlyCost',
    label: 'Monthly Cost',
    type: 'number' as const,
    required: true,
  },
  {
    name: 'url',
    label: 'URL (Optional)',
    type: 'text' as const,
  },
  {
    name: 'description',
    label: 'Description (Optional)',
    type: 'textarea' as const,
  },
];

interface CreateSubscriptionModalProps {
  onSuccess?: () => void;
}

export function CreateSubscriptionModal({ onSuccess }: CreateSubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setError(null);

    const result = await createSubscription({
      name: formData.name,
      monthlyCost: formData.monthlyCost,
      url: formData.url,
      description: formData.description,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
      router.refresh();
      onSuccess?.();
    } else {
      setError(result.message || 'Failed to create subscription.');
    }
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
        <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Subscription</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          {error && (
            <div className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <ResourceForm
            fields={subscriptionFields}
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? 'Saving...' : 'Create Subscription'}
          />
        </div>
      </div>
    );
  }

  return (
    <Button onClick={() => setIsOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Subscription
    </Button>
  );
} 