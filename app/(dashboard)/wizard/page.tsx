'use client';

import { useEffect } from 'react';
import { useWizardState } from '@/hooks/useWizardState';
import { WizardLayout } from '@/components/wizard/WizardLayout';
import { DataTypeSelection } from '@/components/wizard/steps/DataTypeSelection';
import { InputMethodSelection } from '@/components/wizard/steps/InputMethodSelection';
import { DataEntry } from '@/components/wizard/steps/DataEntry';
import { Verification } from '@/components/wizard/steps/Verification';
import { useRouter } from 'next/navigation';

const WIZARD_STEPS = [
  'Select Data Type',
  'Choose Input Method',
  'Enter Data',
  'Verify',
];

export default function WizardPage() {
  const router = useRouter();
  const { currentStep, selectedDataType, selectedInputMethod, setStep } = useWizardState();

  useEffect(() => {
    // Reset wizard state when component mounts
    if (!selectedDataType && currentStep > 0) {
      setStep(0);
    }
  }, [selectedDataType, currentStep, setStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DataTypeSelection />;
      case 1:
        return <InputMethodSelection />;
      case 2:
        return <DataEntry />;
      case 3:
        return <Verification />;
      default:
        return null;
    }
  };

  return (
    <WizardLayout steps={WIZARD_STEPS}>
      {renderStep()}
    </WizardLayout>
  );
} 