import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/actions/users';
import { getTeamForUser } from '@/lib/db/actions/teams';
import { InviteFamilyMember } from '@/components/invite-family';
import { redirect } from 'next/navigation';

const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
  return user.name || user.email || 'Unknown User';
};

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  const teamData = await getTeamForUser(userId);

  if (!teamData) {
    throw new Error('Team not found');
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Family Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Plan: {teamData.planName || 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamData.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData.subscriptionStatus === 'trialing'
                    ? 'Trial period'
                    : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamData.teamMembers.length === 0 ? (
            <p className="text-muted-foreground">No family members yet.</p>
          ) : (
            <ul className="space-y-4">
              {teamData.teamMembers.map((member, index) => (
                <li key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`/placeholder.svg?height=32&width=32`}
                        alt={getUserDisplayName(member.user)}
                      />
                      <AvatarFallback>
                        {getUserDisplayName(member.user)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getUserDisplayName(member.user)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {index > 1 && (
                    <form action="/api/team/remove-member" method="POST">
                      <input type="hidden" name="memberId" value={member.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Remove
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <InviteFamilyMember />
    </div>
  );
}
