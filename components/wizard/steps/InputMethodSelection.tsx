import { useWizardState, InputMethod } from '@/hooks/useWizardState';
import { Card } from '@/components/ui/card';
import { Keyboard, FileUp, Mic, Link } from 'lucide-react';

const inputMethods = [
  {
    id: 'manual' as InputMethod,
    title: 'Manual Entry',
    description: 'Type in your information manually',
    icon: Keyboard,
  },
  {
    id: 'document' as InputMethod,
    title: 'Document Upload',
    description: 'Upload or scan documents to extract data',
    icon: FileUp,
  },
  {
    id: 'voice' as InputMethod,
    title: 'Voice Input',
    description: 'Speak to enter your information',
    icon: Mic,
  },
  {
    id: 'api' as InputMethod,
    title: 'Connect Service',
    description: 'Import data from external services',
    icon: Link,
  },
];

export function InputMethodSelection() {
  const { setInputMethod, setStep } = useWizardState();

  const handleSelect = (method: InputMethod) => {
    setInputMethod(method);
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Choose Input Method</h1>
        <p className="text-muted-foreground mt-2">
          Select how you want to add your information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card
              key={method.id}
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelect(method.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
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