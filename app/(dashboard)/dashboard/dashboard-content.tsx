'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/ui/chat';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface DashboardContentProps {
  team: {
    id: number;
    name: string;
    subscriptionStatus: string | null;
    planName: string | null;
  } | null;
}

export default function DashboardContent({ team }: DashboardContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Simple Subscription Status */}
        <Card className="p-4 col-span-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-medium">
                  {team?.subscriptionStatus === 'active' ? 'Active Plan' : 'Free Plan'}
                </h2>
                <p className="text-sm text-gray-500">
                  {team?.planName || 'Basic Features'}
                </p>
              </div>
            </div>
            {team?.subscriptionStatus !== 'active' && (
              <Button>Upgrade Plan</Button>
            )}
          </div>
        </Card>

        {/* AI Chat Section - More Compact */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Family AI Assistant</h2>
          <div className="h-[400px]"> {/* Reduced height */}
            <Chat
              messages={[]}
              onSendMessage={(message) => {
                console.log('Message sent:', message);
              }}
            />
          </div>
        </div>

        {/* Important Dates & Events */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Important Dates & Events</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mom's Birthday</p>
                <p className="text-sm text-gray-500">March 15, 2024</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                2 days away
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Family Reunion</p>
                <p className="text-sm text-gray-500">April 1, 2024</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                2 weeks away
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Family Activities */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium">Sarah shared new photos</p>
                <p className="text-sm text-gray-500">Added 5 photos to Family Vacation 2024</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium">John updated family calendar</p>
                <p className="text-sm text-gray-500">Added dentist appointment</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks & Reminders */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Tasks & Reminders</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">Schedule annual checkups</p>
                <p className="text-sm text-gray-500">Due by March 20</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">Pay utility bills</p>
                <p className="text-sm text-gray-500">Due by March 25</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Family Documents */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Family Documents</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Insurance Policies</p>
                <p className="text-sm text-gray-500">Updated 2 weeks ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">View</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Medical Records</p>
                <p className="text-sm text-gray-500">Updated 1 month ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">View</button>
            </div>
          </div>
        </Card>

        {/* Family Memories */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Family Memories</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800">
            View All Memories
          </button>
        </Card>
      </div>
    </div>
  );
} 