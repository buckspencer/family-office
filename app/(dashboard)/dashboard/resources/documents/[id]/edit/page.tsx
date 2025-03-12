import React from 'react';
import { notFound } from 'next/navigation';
import { getDocumentById } from '@/lib/db/actions/documents';
import EditDocumentForm from './edit-document-form';

interface EditDocumentPageProps {
  params: {
    id: string;
  };
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);
  
  if (isNaN(id)) {
    notFound();
  }
  
  const response = await getDocumentById(id);
  
  if (!response.success || !response.data) {
    notFound();
  }
  
  return <EditDocumentForm document={response.data} />;
} 