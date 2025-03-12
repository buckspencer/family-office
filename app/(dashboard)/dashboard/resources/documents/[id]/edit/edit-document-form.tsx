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
import { updateDocument } from '@/lib/db/actions/documents';
import { toast } from 'sonner';
import { uploadFile, deleteFile } from '@/lib/supabase';
import { Document } from '@/lib/db/schema';
import { supabase } from '@/lib/supabase';

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
  name: z.string().min(1, 'Document name is required'),
  category: z.string().min(1, 'Category is required'),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  // We'll handle file upload separately
});

type FormValues = z.infer<typeof formSchema>;

interface EditDocumentFormProps {
  document: Document;
}

export default function EditDocumentForm({ document }: EditDocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Format the expiry date for the form input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Initialize the form with existing document data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: document.name,
      category: document.category,
      expiryDate: formatDateForInput(document.expiryDate),
      notes: document.notes || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setUploadError(null);
      
      let fileUrl = document.fileUrl;
      
      // If a new file was uploaded, handle it
      if (fileUpload) {
        try {
          // Use the current authenticated user's ID for the file upload
          // instead of the document's userId, which might be different
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('You must be logged in to upload files');
          }
          
          const userId = user.id;
          console.log('Using current user ID for file upload:', userId);
          
          // Delete the old file if it's from Supabase (not a placeholder)
          if (document.fileUrl.includes('supabase')) {
            await deleteFile(document.fileUrl);
          }
          
          // Upload the new file
          const result = await uploadFile(fileUpload, 'resources', 'documents', userId);
          
          if (result.error) {
            console.error('Upload error:', result.error);
            
            // Check for specific error types
            if (result.error.message?.includes('row-level security policy')) {
              setUploadError('Permission denied. Please check the bucket permissions in Supabase.');
            } else if (result.error.message?.includes('does not exist')) {
              setUploadError('The storage bucket does not exist. Please create it in the Supabase dashboard.');
            } else {
              setUploadError(`Upload failed: ${result.error.message}`);
            }
            
            setIsSubmitting(false);
            return;
          }
          
          fileUrl = result.url;
          console.log('File uploaded successfully, URL:', fileUrl);
        } catch (error) {
          console.error('Error handling file:', error);
          setUploadError('Failed to upload file. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Update the document
      const documentData = {
        name: data.name,
        category: data.category,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes || null,
        fileUrl: fileUrl,
        fileSize: fileUpload ? fileUpload.size : document.fileSize,
        fileType: fileUpload ? fileUpload.type : document.fileType,
        updatedAt: new Date(),
      };
      
      const result = await updateDocument(document.id, documentData);
      
      if (result.success) {
        toast.success('Document updated', {
          description: 'Your document has been successfully updated.'
        });
        router.push('/dashboard/resources/documents');
        router.refresh(); // Force a refresh to show the updated document
      } else {
        throw new Error(result.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update document'
      });
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
          <h1 className="text-3xl font-bold">Edit Document</h1>
          <p className="text-muted-foreground mt-2">
            Update the details of your document
          </p>
        </div>
        <Link href={`/dashboard/resources/documents/${document.id}`}>
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
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When does this document expire? (Optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Document File</FormLabel>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                  >
                    View Current File
                  </Button>
                </div>
                <FormDescription>
                  Upload a new file only if you want to replace the current one
                </FormDescription>
                {uploadError && (
                  <p className="text-sm font-medium text-destructive">{uploadError}</p>
                )}
                {fileUpload && (
                  <p className="text-sm text-muted-foreground">
                    New file selected: {fileUpload.name} ({Math.round(fileUpload.size / 1024)} KB)
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
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

              <div className="flex justify-end space-x-4">
                <Link href={`/dashboard/resources/documents/${document.id}`}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 