import { LucideIcon } from 'lucide-react';

interface ResourceHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function ResourceHeader({ title, description, icon: Icon }: ResourceHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {Icon && <Icon className="h-8 w-8 text-muted-foreground" />}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
} 