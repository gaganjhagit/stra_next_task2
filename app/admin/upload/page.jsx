import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import BulkUpload from '@/components/BulkUpload';

export default async function BulkUploadPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Bulk Upload Users</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <BulkUpload />
      </main>
    </div>
  );
}
