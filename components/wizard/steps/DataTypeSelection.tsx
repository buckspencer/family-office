import { useWizardState, DataType } from '@/hooks/useWizardState';
import { Card } from '@/components/ui/card';
import { FileText, Users, Calendar, CreditCard } from 'lucide-react';

const dataTypes = [
  {
    id: 'documents' as DataType,
    title: 'Documents',
    description: 'Upload and manage important documents',
    icon: FileText,
  },
  {
    id: 'contacts' as DataType,
    title: 'Contacts',
    description: 'Add and organize family contacts',
    icon: Users,
  },
  {
    id: 'events' as DataType,
    title: 'Events',
    description: 'Schedule and track family events',
    icon: Calendar,
  },
  {
    id: 'subscriptions' as DataType,
    title: 'Subscriptions',
    description: 'Manage recurring payments and subscriptions',
    icon: CreditCard,
  },
];

export function DataTypeSelection() {
  const { setDataType, setStep } = useWizardState();

  const handleSelect = (type: DataType) => {
    setDataType(type);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Select Data Type</h1>
        <p className="text-muted-foreground mt-2">
          Choose what type of information you want to add
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelect(type.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{type.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 