import { useWizardState } from '@/hooks/useWizardState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function DataEntry() {
  const { selectedDataType, selectedInputMethod, updateFormData, formData } = useWizardState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Add data validation and submission logic here
    // This will be implemented when we connect to the database
    
    setIsSubmitting(false);
  };

  const renderFormFields = () => {
    switch (selectedDataType) {
      case 'documents':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter document title"
                value={formData.title || ''}
                onChange={(e) => updateFormData({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter document description"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => updateFormData({ file: e.target.files?.[0] })}
              />
            </div>
          </>
        );
      case 'contacts':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                placeholder="Enter contact name"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
              />
            </div>
          </>
        );
      case 'events':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input
                id="eventTitle"
                placeholder="Enter event title"
                value={formData.title || ''}
                onChange={(e) => updateFormData({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateFormData({ date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
              />
            </div>
          </>
        );
      case 'subscriptions':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={formData.serviceName || ''}
                onChange={(e) => updateFormData({ serviceName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Monthly Cost</Label>
              <Input
                id="cost"
                type="number"
                placeholder="Enter monthly cost"
                value={formData.cost || ''}
                onChange={(e) => updateFormData({ cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renewalDate">Renewal Date</Label>
              <Input
                id="renewalDate"
                type="date"
                value={formData.renewalDate || ''}
                onChange={(e) => updateFormData({ renewalDate: e.target.value })}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {renderFormFields()}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 