'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAsset, updateAsset } from '../actions';
import { Asset } from '@/lib/db/schema';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
  value: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

interface AssetFormProps {
  asset?: Asset; // Optional - if provided, we're in edit mode
  mode: 'create' | 'edit';
}

export default function AssetForm({ asset, mode }: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      type: asset?.type || '',
      value: asset?.value?.toString() || '',
      purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: asset?.purchasePrice?.toString() || '',
      location: asset?.location || '',
      notes: asset?.notes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      console.log('Submitting form with values:', values);

      // Convert form values to FormData
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        } else if (key === 'description') {
          // Ensure description is never empty
          formData.append(key, value || '');
        } else if (key === 'value') {
          // Ensure value is never empty or NaN
          formData.append(key, value || '0');
        }
      });

      const result = mode === 'create' 
        ? await createAsset(formData)
        : await updateAsset(asset!.id, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.data) {
        toast.error(`Failed to ${mode} asset: No data returned`);
        return;
      }

      toast.success(`Asset ${mode === 'create' ? 'created' : 'updated'} successfully`);
      
      // Add a small delay to ensure the database operation is complete
      setTimeout(() => {
        if (mode === 'create') {
          router.push('/dashboard/resources/assets');
        } else {
          router.push(`/dashboard/resources/assets/${asset!.id}`);
        }
        router.refresh();
      }, 500);
    } catch (error) {
      console.error(`Error ${mode}ing asset:`, error);
      toast.error(`Failed to ${mode} asset`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{mode === 'create' ? 'New Asset' : 'Edit Asset'}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter asset name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter asset description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="personal">Personal Property</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter asset value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter purchase price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter asset location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter additional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/resources/assets/${asset!.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Asset`}
            </Button>
          </div>
          
          {mode === 'create' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                After creating this asset, you'll be able to upload related files and documents from the asset details page.
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
} 