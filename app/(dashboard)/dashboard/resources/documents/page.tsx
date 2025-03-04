import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Temporary mock data until we implement the database
const documents = [
  {
    id: 1,
    name: "Home Insurance Policy",
    category: "insurance",
    expiryDate: "2025-05-15",
    status: "active",
  },
  {
    id: 2,
    name: "Passport - John Doe",
    category: "identity",
    expiryDate: "2028-03-20",
    status: "active",
  },
];

export default function DocumentsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/resources">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources Dashboard
          </Button>
        </Link>
      </div>

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
                <TableCell>{doc.expiryDate}</TableCell>
                <TableCell>
                  <Badge 
                    variant={doc.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 