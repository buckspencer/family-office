import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  Calendar,
  Bell,
  DollarSign,
  Users,
  AlertCircle,
  Plus,
  Search,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
export default function Dashboard() {
  // Mock data - in a real app this would come from your backend
  const subscriptions = [
    {
      name: "Netflix",
      cost: "$19.99",
      renewalDate: "Apr 15, 2024",
      status: "Active",
    },
    {
      name: "Amazon Prime",
      cost: "$14.99",
      renewalDate: "May 1, 2024",
      status: "Active",
    },
    {
      name: "Spotify Family",
      cost: "$16.99",
      renewalDate: "Apr 22, 2024",
      status: "Active",
    },
  ];

  const recentActivity = [
    {
      action: "Password Updated",
      account: "Home WiFi",
      date: "2 hours ago",
      user: "Mom",
    },
    {
      action: "New Account Added",
      account: "Disney+",
      date: "Yesterday",
      user: "Dad",
    },
    {
      action: "Subscription Renewed",
      account: "iCloud Storage",
      date: "2 days ago",
      user: "System",
    },
  ];

  const upcomingDates = [
    {
      event: "Car Insurance Renewal",
      date: "April 30, 2024",
      type: "Insurance",
    },
    {
      event: "Netflix Plan Renewal",
      date: "April 15, 2024",
      type: "Subscription",
    },
    {
      event: "Home Warranty Expiration",
      date: "May 5, 2024",
      type: "Warranty",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
          <p className="text-gray-500">Welcome back, Spencer Family</p>
        </div>
        <div className="flex space-x-4">
          {/* <Button variant="outline" className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button> */}
          <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Link href="/wizard">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Data
                </Link>
              </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                <p className="text-2xl font-bold">$247.50</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Family Members</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Track your family's current subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-gray-500">Renews {sub.renewalDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{sub.cost}</p>
                    <span className="text-sm text-green-600">{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your family</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.account}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{activity.date}</p>
                    <p className="text-sm text-gray-500">{activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Important Dates</CardTitle>
          <CardDescription>Don't miss these important renewals and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDates.map((date, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">{date.type}</span>
                </div>
                <p className="font-medium">{date.event}</p>
                <p className="text-sm text-gray-500">{date.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 