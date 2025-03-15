import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  FileText,
  FileEdit,
  FileX,
  Archive,
  RefreshCw,
  Trash,
  Calendar,
  CalendarPlus,
  CalendarX,
  CreditCard,
  DollarSign,
  Home,
  Car,
  Briefcase,
  Paperclip,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/actions/activity';

// Use Partial<Record> to allow for missing keys
const iconMap: Partial<Record<ActivityType, LucideIcon>> = {
  // Auth activities
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: Lock,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: UserCog,
  
  // Team activities
  [ActivityType.CREATE_TEAM]: Users,
  [ActivityType.UPDATE_TEAM]: Users,
  [ActivityType.DELETE_TEAM]: Trash,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  
  // Document activities
  [ActivityType.GET_DOCUMENTS]: FileText,
  [ActivityType.GET_DOCUMENT_BY_ID]: FileText,
  [ActivityType.CREATE_DOCUMENT]: FileText,
  [ActivityType.UPDATE_DOCUMENT]: FileEdit,
  [ActivityType.DELETE_DOCUMENT]: FileX,
  [ActivityType.ARCHIVE_DOCUMENT]: Archive,
  [ActivityType.RESTORE_DOCUMENT]: RefreshCw,
  [ActivityType.BATCH_DELETE_DOCUMENTS]: Trash,
  [ActivityType.BATCH_ARCHIVE_DOCUMENTS]: Archive,
  [ActivityType.GET_SIGNED_DOCUMENT_URL]: FileText,
  
  // Contact activities
  [ActivityType.CREATE_CONTACT]: UserPlus,
  [ActivityType.UPDATE_CONTACT]: UserCog,
  [ActivityType.DELETE_CONTACT]: UserMinus,
  [ActivityType.ARCHIVE_CONTACT]: Archive,
  [ActivityType.RESTORE_CONTACT]: RefreshCw,
  
  // Event activities
  [ActivityType.CREATE_EVENT]: CalendarPlus,
  [ActivityType.UPDATE_EVENT]: Calendar,
  [ActivityType.DELETE_EVENT]: CalendarX,
  [ActivityType.ARCHIVE_EVENT]: Archive,
  [ActivityType.RESTORE_EVENT]: RefreshCw,
  
  // Subscription activities
  [ActivityType.CREATE_SUBSCRIPTION]: CreditCard,
  [ActivityType.UPDATE_SUBSCRIPTION]: CreditCard,
  [ActivityType.DELETE_SUBSCRIPTION]: CreditCard,
  [ActivityType.ARCHIVE_SUBSCRIPTION]: Archive,
  [ActivityType.RESTORE_SUBSCRIPTION]: RefreshCw,
  [ActivityType.RENEW_SUBSCRIPTION]: RefreshCw,
  [ActivityType.CANCEL_SUBSCRIPTION]: CreditCard,
  
  // Asset activities
  [ActivityType.CREATE_ASSET]: Home,
  [ActivityType.UPDATE_ASSET]: Home,
  [ActivityType.DELETE_ASSET]: Trash,
  [ActivityType.ARCHIVE_ASSET]: Archive,
  [ActivityType.RESTORE_ASSET]: RefreshCw,
  
  // Attachment activities
  [ActivityType.UPLOAD_ATTACHMENT]: Upload,
  [ActivityType.DELETE_ATTACHMENT]: Trash,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  // Helper function to convert enum values to readable text
  const formatEnumValue = (value: string) => {
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle specific cases with custom messages
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new family';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a family member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a family member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    case ActivityType.CREATE_DOCUMENT:
      return 'You created a new document';
    case ActivityType.UPDATE_DOCUMENT:
      return 'You updated a document';
    case ActivityType.DELETE_DOCUMENT:
      return 'You deleted a document';
    
    // For other actions, generate a readable message from the enum value
    default:
      return `You ${formatEnumValue(action).toLowerCase()}`;
  }
}

// Define the type for activity logs
type ActivityLog = {
  id: number;
  action: string;
  timestamp: Date;
  ipAddress: string | null;
  userName: string | null;
};

export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function ActivityPage() {
  let logs: ActivityLog[] = [];
  
  try {
    logs = await getActivityLogs();
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    // Continue with empty logs array
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.action as ActivityType
                );

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
