import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { getDocuments } from '@/lib/db/actions/documents';
import { cn } from '@/lib/utils';

// Helper function to format dates
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Remove mock data and use real data from the database

export default async function DocumentsPage() {
  // Fetch documents from the database
  // Using teamId 1 as a default for now - you might want to get this from auth context
  const response = await getDocuments(1);
  const documents = response.success ? response.data || [] : [];

  return (
    <div className="container mx-auto p-6">
      <BackButton 
        href="/dashboard/resources" 
        label="Back to Resources Dashboard"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Family Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage and organize your important family documents
          </p>
        </div>
        <Link href="/dashboard/resources/documents/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {documents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No documents found. Add your first document to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.expiryDate ? formatDate(doc.expiryDate) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={doc.isArchived ? 'secondary' : 'default'}
                      className="capitalize"
                    >
                      {doc.isArchived ? 'archived' : 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/resources/documents/${doc.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    <Link href={`/dashboard/resources/documents/${doc.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
} 