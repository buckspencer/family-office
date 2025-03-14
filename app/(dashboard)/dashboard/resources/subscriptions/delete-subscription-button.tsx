'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteSubscription } from './actions';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

interface DeleteSubscriptionButtonProps {
  subscriptionId: number;
  subscriptionName: string;
}

export default function DeleteSubscriptionButton({ subscriptionId, subscriptionName }: DeleteSubscriptionButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteSubscription(subscriptionId);

      if (!result.success) {
        toast.error(result.error || 'Failed to delete subscription');
        return;
      }

      toast.success('Subscription deleted successfully');
      setIsOpen(false);
      
      // If we're on the detail page of the deleted subscription, redirect to the list
      if (pathname.includes(`/subscriptions/${subscriptionId}`)) {
        router.push('/dashboard/resources/subscriptions');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete "{subscriptionName}". This action cannot be undone.
            The subscription will be moved to the archive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 