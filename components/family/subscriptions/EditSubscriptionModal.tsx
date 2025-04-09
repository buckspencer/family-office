'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ResourceForm } from '@/components/family/forms/ResourceForm';
import { getSubscription, updateSubscription } from '@/lib/actions/familySubscriptions';
import { FamilySubscription } from '@/lib/db/schema';

const subscriptionFields = [
  {
    name: 'name',
    label: 'Subscription Name',
    type: 'text' as const,
    required: false,
  },
  {
    name: 'monthlyCost',
    label: 'Monthly Cost',
    type: 'number' as const,
    required: false,
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

interface EditSubscriptionModalProps {
  subscriptionId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSubscriptionModal({ subscriptionId, isOpen, onClose, onSuccess }: EditSubscriptionModalProps) {
  const [subscription, setSubscription] = useState<FamilySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      const result = await getSubscription({ id: subscriptionId });
      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        setError(result.message || 'Failed to load subscription.');
      }
      setLoading(false);
    };
    fetchSubscription();
  }, [subscriptionId, isOpen]);

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!subscription) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
        // Always include required fields
        const updateData: any = {
            id: subscription.id,
            name: formData.name?.trim() || subscription.name,
            monthlyCost: Number(subscription.monthlyCost) // Convert to number for validation
        };

        // Update monthlyCost if changed
        const newMonthlyCost = Number(formData.monthlyCost);
        const currentMonthlyCost = Number(subscription.monthlyCost);
        if (!isNaN(newMonthlyCost) && newMonthlyCost !== currentMonthlyCost && newMonthlyCost > 0) {
            updateData.monthlyCost = newMonthlyCost; // Keep as number for validation
        }

        // Handle optional fields - always include them if they've changed or are being set to null
        if (formData.url !== subscription.url || formData.url?.trim() === '') {
            const trimmedUrl = formData.url?.trim();
            if (trimmedUrl === '') {
                updateData.url = '';  // Use empty string instead of null for optional URL
            } else if (trimmedUrl) {
                try {
                    new URL(trimmedUrl);
                    updateData.url = trimmedUrl;
                } catch {
                    setError('Invalid URL format');
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        if (formData.description !== subscription.description || formData.description?.trim() === '') {
            const trimmedDesc = formData.description?.trim();
            updateData.description = trimmedDesc === '' ? '' : trimmedDesc;
        }

        // Ensure all required fields are present and valid
        if (!updateData.name || updateData.name.trim() === '') {
            setError('Name is required');
            setIsSubmitting(false);
            return;
        }

        if (!updateData.monthlyCost || isNaN(updateData.monthlyCost) || updateData.monthlyCost <= 0) {
            setError('Monthly cost must be a positive number');
            setIsSubmitting(false);
            return;
        }

        // Convert monthlyCost to string for the database
        updateData.monthlyCost = updateData.monthlyCost.toString();

        console.log('Update data:', updateData);

        const result = await updateSubscription(updateData);
        console.log('Update result:', result);

        if (result.success) {
            onSuccess();
            onClose();
        } else {
            console.error('Update failed:', {
                message: result.message,
                errors: result.errors,
                data: result.data
            });
            
            // Handle validation errors
            if (result.errors) {
                const errorMessages = Object.entries(result.errors.fieldErrors)
                    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
                setError(errorMessages || result.message || 'Failed to update subscription');
            } else {
                setError(result.message || 'Failed to update subscription');
            }
        }
    } catch (err) {
        console.error('Error updating subscription:', err);
        setError('An unexpected error occurred');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" />
        <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Subscription</h2>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" />
        <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Subscription</h2>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" />
        <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Subscription</h2>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div>Subscription not found.</div>
        </div>
      </div>
    );
  }

  // Prepare initial data, converting numeric cost back for the form
  const initialData = {
    ...subscription,
    monthlyCost: parseFloat(subscription.monthlyCost ?? '0'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Subscription</h2>
          <button
            onClick={onClose}
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
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting ? 'Saving...' : 'Update Subscription'}
        />
      </div>
    </div>
  );
} 