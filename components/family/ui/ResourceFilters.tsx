import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResourceFiltersProps {
  resource: string;
  filters: {
    id: string;
    label: string;
    type: 'text' | 'select';
    options?: { value: string; label: string; }[];
  }[];
}

export function ResourceFilters({ resource, filters }: ResourceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/family/${resource}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      {filters.map((filter) => (
        <div key={filter.id} className="w-[200px]">
          {filter.type === 'text' ? (
            <Input
              placeholder={`Filter by ${filter.label.toLowerCase()}`}
              value={searchParams.get(filter.id) || ''}
              onChange={(e) => updateFilter(filter.id, e.target.value)}
            />
          ) : filter.type === 'select' && filter.options ? (
            <Select
              value={searchParams.get(filter.id) || ''}
              onValueChange={(value) => updateFilter(filter.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      ))}
    </div>
  );
} 