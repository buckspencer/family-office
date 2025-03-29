import {
  UserPlus,
  UserCog,
  LogOut,
  Settings,
  Mail,
  UserMinus,
  Users,
  UserCheck,
  Lock,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { activityTypeEnum } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<typeof activityTypeEnum.enumValues[number], LucideIcon> = {
  [activityTypeEnum.enumValues[0]]: UserPlus,
  [activityTypeEnum.enumValues[1]]: UserCog,
  [activityTypeEnum.enumValues[2]]: LogOut,
  [activityTypeEnum.enumValues[3]]: Users,
  [activityTypeEnum.enumValues[4]]: UserCheck,
  [activityTypeEnum.enumValues[5]]: Settings,
  [activityTypeEnum.enumValues[6]]: Lock,
  [activityTypeEnum.enumValues[7]]: Mail,
  [activityTypeEnum.enumValues[8]]: Mail,
  [activityTypeEnum.enumValues[9]]: UserMinus,
  [activityTypeEnum.enumValues[10]]: UserMinus,
  [activityTypeEnum.enumValues[11]]: Mail,
  [activityTypeEnum.enumValues[12]]: Settings,
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

function formatAction(action: typeof activityTypeEnum.enumValues[number]): string {
  switch (action) {
    case activityTypeEnum.enumValues[0]:
      return 'You signed up';
    case activityTypeEnum.enumValues[1]:
      return 'You signed in';
    case activityTypeEnum.enumValues[2]:
      return 'You signed out';
    case activityTypeEnum.enumValues[3]:
      return 'You created a new team';
    case activityTypeEnum.enumValues[4]:
      return 'You accepted an invitation';
    case activityTypeEnum.enumValues[5]:
      return 'You updated your account';
    case activityTypeEnum.enumValues[6]:
      return 'You changed your password';
    case activityTypeEnum.enumValues[7]:
      return 'You deleted your account';
    case activityTypeEnum.enumValues[8]:
      return 'You verified your email';
    case activityTypeEnum.enumValues[9]:
      return 'You invited a team member';
    case activityTypeEnum.enumValues[10]:
      return 'You removed a team member';
    case activityTypeEnum.enumValues[11]:
      return 'You invited a team member';
    case activityTypeEnum.enumValues[12]:
      return 'You invited a team member';
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
        <p className="text-muted-foreground">
          View all activity on your account.
        </p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => {
          // Safely get the icon component, fallback to AlertCircle if not found
          const Icon = log.action in iconMap ? iconMap[log.action as typeof activityTypeEnum.enumValues[number]] : AlertCircle;
          
          return (
            <div
              key={log.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Icon className="h-5 w-5 text-gray-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {formatAction(log.action as typeof activityTypeEnum.enumValues[number])}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
