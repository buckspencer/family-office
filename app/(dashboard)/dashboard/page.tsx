import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import DashboardContent from './dashboard-content';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const userWithTeam = await getUserWithTeam(user.id);
  const team = userWithTeam?.team;

  return <DashboardContent team={team} />;
}
