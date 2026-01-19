import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();
  
  if (user) {
    // Redirect authenticated users to their dashboard
    redirect(`/${user.role}/dashboard`);
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
