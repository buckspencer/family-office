'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSignedDocumentUrl } from '@/lib/db/actions/documents';
import { Loader2, Download, FileWarning } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadDocumentButtonProps {
  fileUrl: string;
  fileName: string;
}

export default function DownloadDocumentButton({ fileUrl, fileName }: DownloadDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadDocument = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the URL indicates a missing file
      if (fileUrl.includes('404') || fileUrl.includes('Bucket not found')) {
        setError('The file storage bucket does not exist or the file is missing.');
        toast.error('Error', {
          description: 'The file storage bucket does not exist or the file is missing.'
        });
        return;
      }
      
      const response = await getSignedDocumentUrl(fileUrl);
      
      if (response.success && response.data) {
        try {
          // Fetch the file content
          const fetchResponse = await fetch(response.data);
          
          if (!fetchResponse.ok) {
            throw new Error(`Failed to download file: ${fetchResponse.status} ${fetchResponse.statusText}`);
          }
          
          // Get the blob from the response
          const blob = await fetchResponse.blob();
          
          // Create a URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary link element to trigger the download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          
          toast.success('Download started', {
            description: `Downloading ${fileName}`
          });
        } catch (fetchError) {
          console.error('Error fetching file:', fetchError);
          
          // Fallback to opening in a new tab if fetch fails
          window.open(response.data, '_blank');
          
          toast.info('Opening in browser', {
            description: `The file will open in a new tab instead of downloading directly.`
          });
        }
      } else {
        setError(response.error || 'Failed to generate download link');
        toast.error('Error', {
          description: response.error || 'Failed to generate download link'
        });
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('An unexpected error occurred');
      toast.error('Error', {
        description: 'An unexpected error occurred while trying to download the document'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleDownloadDocument} 
        disabled={isLoading}
        variant="default"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing Download...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download
          </>
        )}
      </Button>
      
      {error && (
        <div className="absolute mt-2 p-2 bg-destructive/10 rounded text-destructive text-xs max-w-[200px]">
          {error}
        </div>
      )}
    </div>
  );
} 