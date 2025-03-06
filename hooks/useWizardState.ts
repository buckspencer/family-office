import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DataType = 'documents' | 'contacts' | 'events' | 'subscriptions';
export type InputMethod = 'manual' | 'document' | 'voice' | 'api';

interface WizardState {
  currentStep: number;
  totalSteps: number;
  selectedDataType: DataType | null;
  selectedInputMethod: InputMethod | null;
  formData: Record<string, any>;
  isDirty: boolean;
  setStep: (step: number) => void;
  setDataType: (type: DataType) => void;
  setInputMethod: (method: InputMethod) => void;
  updateFormData: (data: Record<string, any>) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

export const useWizardState = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 0,
      totalSteps: 4, // Will be updated based on selected input method
      selectedDataType: null,
      selectedInputMethod: null,
      formData: {},
      isDirty: false,
      setStep: (step) => set({ currentStep: step }),
      setDataType: (type) => set({ selectedDataType: type }),
      setInputMethod: (method) => set({ selectedInputMethod: method }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
        })),
      setDirty: (dirty) => set({ isDirty: dirty }),
      reset: () =>
        set({
          currentStep: 0,
          selectedDataType: null,
          selectedInputMethod: null,
          formData: {},
          isDirty: false,
        }),
    }),
    {
      name: 'wizard-storage',
    }
  )
); 