import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import DashboardContent from './dashboard-content';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const userWithTeam = await getUserWithTeam(user.id);
  const teamData = userWithTeam?.team ? {
    id: userWithTeam.team.id,
    name: userWithTeam.team.name,
    subscriptionStatus: userWithTeam.team.subscriptionStatus,
    planName: userWithTeam.team.planName,
  } : null;

  return <DashboardContent team={teamData} />;
}
