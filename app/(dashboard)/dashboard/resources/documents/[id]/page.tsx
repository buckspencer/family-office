import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { getDocumentById } from '@/lib/db/actions/documents';
import ViewDocumentButton from './view-document-button';
import DownloadDocumentButton from './download-document-button';
import DeleteDocumentButton from './delete-document-button';

// Helper function to format dates
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  // Await params to fix the warning
  const { id: idString } = await params;
  const id = parseInt(idString, 10);
  
  if (isNaN(id)) {
    notFound();
  }
  
  const response = await getDocumentById(id);
  
  if (!response.success || !response.data) {
    notFound();
  }
  
  const document = response.data;
  
  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources/documents" 
        label="Back to Documents"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{document.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline" className="capitalize">
              {document.category}
            </Badge>
            <Badge 
              variant={document.isArchived ? 'secondary' : 'default'}
              className="capitalize"
            >
              {document.isArchived ? 'archived' : 'active'}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/resources/documents/${id}/edit`}>
            <Button variant="outline">Edit Document</Button>
          </Link>
          <DownloadDocumentButton 
            fileUrl={document.fileUrl} 
            fileName={document.name + (document.fileType ? `.${document.fileType.split('/').pop()}` : '')} 
          />
          <DeleteDocumentButton 
            documentId={document.id} 
            documentName={document.name} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="mt-1">{document.name}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
              <p className="mt-1 capitalize">{document.category}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Expiry Date</h3>
              <p className="mt-1">{document.expiryDate ? formatDate(document.expiryDate) : 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
              <p className="mt-1">{document.notes || 'No notes provided'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">File Information</h3>
              <p className="mt-1">
                {document.fileType ? `Type: ${document.fileType}` : 'Type: Unknown'}<br />
                {document.fileSize ? `Size: ${Math.round(document.fileSize / 1024)} KB` : 'Size: Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Preview not available</p>
              <ViewDocumentButton fileUrl={document.fileUrl} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 