import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface CreateResourceButtonProps {
  resource: string;
}

export function CreateResourceButton({ resource }: CreateResourceButtonProps) {
  return (
    <Button asChild>
      <Link href={`/dashboard/family/${resource}/create/page`}>
        <Plus className="mr-2 h-4 w-4" />
        Create {resource.split('/').pop()}
      </Link>
    </Button>
  );
} 