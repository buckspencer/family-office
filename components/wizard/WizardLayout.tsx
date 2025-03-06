import { ReactNode } from 'react';
import { useWizardState } from '@/hooks/useWizardState';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface WizardLayoutProps {
  children: ReactNode;
  steps: string[];
}

export function WizardLayout({ children, steps }: WizardLayoutProps) {
  const router = useRouter();
  const { currentStep, totalSteps, isDirty, setStep, reset } = useWizardState();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        reset();
        router.push('/dashboard');
      }
    } else {
      reset();
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="w-full bg-muted/50 p-4 border-b">
        <div className="flex justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
              >
                {index + 1}
              </div>
              <span className="ml-2">{step}</span>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6">
        <div className="max-w-3xl mx-auto">{children}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 