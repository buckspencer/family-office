import { getContactById } from '@/lib/db/actions/contacts';
import EditContactForm from './edit-contact-form';
import { notFound } from 'next/navigation';

export default async function EditContactPage({ searchParams }: { searchParams: { id?: string } }) {
  // Await searchParams before accessing its properties
  const params = await Promise.resolve(searchParams);
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