'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { updateContact } from '../actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Define the Contact type
type Contact = {
  id: number;
  name: string;
  type: 'family' | 'medical' | 'financial' | 'legal' | 'service' | 'other';
  relationship: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isArchived?: boolean;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  teamId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

const contactTypes = [
  { value: 'family', label: 'Family Member' },
  { value: 'medical', label: 'Medical Provider' },
  { value: 'financial', label: 'Financial Advisor' },
  { value: 'legal', label: 'Legal Representative' },
  { value: 'service', label: 'Service Provider' },
  { value: 'other', label: 'Other' },
] as const;

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['family', 'medical', 'financial', 'legal', 'service', 'other'], {
    required_error: "Please select a contact type",
  }),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditContactForm({ contact }: { contact: Contact }) {
  const router = useRouter();
  
  // Initialize form with contact data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact.name,
      type: contact.type,
      relationship: contact.relationship,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      notes: contact.notes || '',
    },
  });
  
  async function onSubmit(values: FormValues) {
    try {
      // Create FormData manually and add all fields
      const formData = new FormData();
      
      // Add the contact ID
      formData.append('id', contact.id.toString());
      
      // Add all form values
      formData.append('name', values.name);
      formData.append('type', values.type);
      formData.append('relationship', values.relationship);
      formData.append('email', values.email || '');
      formData.append('phone', values.phone || '');
      formData.append('address', values.address || '');
      formData.append('notes', values.notes || '');
      
      console.log('Submitting form with values:', values);
      const result = await updateContact(formData);
      console.log('Update result:', result);
      
      if (result.data) {
        toast.success("Contact updated successfully");
        
        // Properly handle the redirect to resources path
        setTimeout(() => {
          // Use window.location for a full page refresh to ensure all data is updated
          window.location.href = '/dashboard/resources/contacts';
        }, 500);
      } else {
        toast.error(result.error || "Failed to update contact");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("An unexpected error occurred");
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Contact Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary Care Physician" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State, ZIP" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional information about this contact..." 
                        className="min-h-[120px]" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/resources/contacts">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit">Update Contact</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 