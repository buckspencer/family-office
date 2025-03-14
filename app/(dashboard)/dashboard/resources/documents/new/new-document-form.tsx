'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { createDocument } from '@/lib/db/actions/documents';
import { toast } from 'sonner';
import { uploadFile, supabase } from '@/lib/supabase';

const documentCategories = [
  { value: 'identity', label: 'Identity Documents' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'financial', label: 'Financial' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'property', label: 'Property' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
];

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  file: z.any().optional(), // Use z.any() for file input
});

type FormValues = z.infer<typeof formSchema>;

export default function NewDocumentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Get the current authenticated user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to upload documents');
        setIsSubmitting(false);
        return;
      }
      
      if (!fileUpload) {
        toast.error('Please select a file to upload');
        setIsSubmitting(false);
        return;
      }
      
      // Upload the file to Supabase Storage
      const result = await uploadFile(fileUpload, 'resources', 'documents', user.id);
      
      if (result.error) {
        console.error('Upload error:', result.error);
        toast.error(`Failed to upload file: ${result.error.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // Create the document in the database
      const response = await createDocument({
        name: values.name,
        category: values.category,
        notes: values.description || null,
        fileUrl: result.url,
        teamId: 1, // Default team ID
        userId: user.id, // Use Supabase user ID directly
      });
      
      if (!response.success) {
        toast.error(response.error || 'Failed to create document');
      } else {
        toast.success('Document created successfully');
        form.reset();
        router.push('/dashboard/resources/documents');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      setFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Document</h1>
          <p className="text-muted-foreground mt-2">
            Add a new document to your family records
          </p>
        </div>
        <Link href="/dashboard/resources/documents">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your document a clear, descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a category that best describes this document
                    </FormDescription>
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
                      <Textarea
                        placeholder="Add any additional notes about this document"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Upload Document</FormLabel>
                <Input 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <FormDescription>
                  Upload a scanned copy or photo of your document
                </FormDescription>
                {uploadError && (
                  <p className="text-sm font-medium text-destructive">{uploadError}</p>
                )}
                {fileUpload && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {fileUpload.name} ({Math.round(fileUpload.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/resources/documents">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Document'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 