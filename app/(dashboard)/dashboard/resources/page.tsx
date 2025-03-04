import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FamilyManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Family Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Documents Section */}
        <Link href="/dashboard/resources/documents">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Manage important family documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Store and organize passports, insurance policies, and other important papers.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Contacts Section */}
        <Link href="/dashboard/resources/contacts">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Family and service contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of doctors, emergency contacts, and service providers.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Assets Section */}
        <Link href="/dashboard/resources/assets">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Track family properties and belongings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage homes, vehicles, and valuable possessions.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Subscriptions Section */}
        <Link href="/dashboard/resources/subscriptions">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage recurring services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track streaming services, memberships, and utilities.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Events Section */}
        <Link href="/dashboard/resources/events">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Family calendar and scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage appointments, activities, and important dates.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 