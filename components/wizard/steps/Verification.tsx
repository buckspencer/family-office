import { useWizardState } from '@/hooks/useWizardState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function Verification() {
  const { selectedDataType, formData, reset } = useWizardState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // TODO: Add final submission logic here
    // This will be implemented when we connect to the database
    
    setIsSubmitting(false);
    reset(); // Reset the wizard state after successful submission
  };

  const renderVerificationContent = () => {
    switch (selectedDataType) {
      case 'documents':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Document Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Title:</span> {formData.title}</p>
              <p><span className="font-medium">Description:</span> {formData.description}</p>
              <p><span className="font-medium">File:</span> {formData.file?.name}</p>
            </div>
          </>
        );
      case 'contacts':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {formData.name}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            </div>
          </>
        );
      case 'events':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Event Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Title:</span> {formData.title}</p>
              <p><span className="font-medium">Date:</span> {formData.date}</p>
              <p><span className="font-medium">Description:</span> {formData.description}</p>
            </div>
          </>
        );
      case 'subscriptions':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Service:</span> {formData.serviceName}</p>
              <p><span className="font-medium">Monthly Cost:</span> ${formData.cost}</p>
              <p><span className="font-medium">Renewal Date:</span> {formData.renewalDate}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Verify Information</h2>
          <p className="text-muted-foreground">
            Please review the information below before submitting.
          </p>
        </div>
        
        {renderVerificationContent()}
        
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 