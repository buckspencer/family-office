import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export function WizardCard() {
  return (
    <Link href="/wizard">
      <Card className="p-6 cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <PlusCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Add New Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use our wizard to add documents, contacts, events, or subscriptions
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
} 