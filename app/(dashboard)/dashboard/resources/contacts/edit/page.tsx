import { getContactById } from '@/lib/db/actions/contacts';
import EditContactForm from './edit-contact-form';
import { notFound } from 'next/navigation';

interface EditContactPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function EditContactPage({ searchParams }: EditContactPageProps) {
  // Await searchParams before accessing its properties
  const params = await searchParams;
  const id = params.id ? parseInt(params.id, 10) : null;
  
  if (!id) {
    notFound();
  }
  
  const response = await getContactById(id);
  
  if (!response.success || !response.data) {
    notFound();
  }
  
  return <EditContactForm contact={response.data} />;
} 