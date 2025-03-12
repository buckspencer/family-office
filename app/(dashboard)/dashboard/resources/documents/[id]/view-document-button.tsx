'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSignedDocumentUrl } from '@/lib/db/actions/documents';
import { Loader2, FileWarning, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ViewDocumentButtonProps {
  fileUrl: string;
}

export default function ViewDocumentButton({ fileUrl }: ViewDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewDocument = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getSignedDocumentUrl(fileUrl);
      
      if (response.success && response.data) {
        // Open the document in a new tab
        window.open(response.data, '_blank');
      } else {
        setError(response.error || 'Failed to generate signed URL');
        toast.error('Error', {
          description: response.error || 'Failed to generate signed URL'
        });
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      setError('An unexpected error occurred');
      toast.error('Error', {
        description: 'An unexpected error occurred while trying to view the document'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (fileUrl.includes('404') || fileUrl.includes('Bucket not found')) {
    return (
      <div className="flex flex-col items-center">
        <FileWarning className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-red-500 mb-4 text-center">
          Error: The file storage bucket does not exist or the file is missing.
        </p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Please create a "resources" bucket in your Supabase dashboard.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Try View Document Anyway
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Button 
        onClick={handleViewDocument} 
        disabled={isLoading}
        className="mb-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Link...
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Document
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-red-500 mt-2 text-sm text-center">
          {error}
        </p>
      )}
    </div>
  );
} 