import { Badge } from '@/components/ui/badge';
// Using type-only import for better TypeScript compliance
import type { SpendingEntry } from '../../../server/src/schema';

interface SpendingEntryCardProps {
  entry: SpendingEntry;
}

export function SpendingEntryCard({ entry }: SpendingEntryCardProps) {
  const getCategoryIcon = (category: 'Beer' | 'Gym') => {
    return category === 'Beer' ? '🍺' : '💪';
  };

  const getCategoryColors = (category: 'Beer' | 'Gym') => {
    return category === 'Beer'
      ? 'border-l-amber-400 bg-amber-50 hover:bg-amber-100'
      : 'border-l-green-400 bg-green-50 hover:bg-green-100';
  };

  return (
    <div 
      className={`entry-item p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${getCategoryColors(entry.category)}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="emoji text-xl">
              {getCategoryIcon(entry.category)}
            </span>
            <span className="font-semibold text-gray-800">
              {entry.category}
            </span>
            <Badge variant="secondary" className="font-medium">
              ${entry.amount.toFixed(2)}
            </Badge>
          </div>
          {entry.description && (
            <p className="text-gray-600 text-sm mb-2">
              {entry.description}
            </p>
          )}
          <div className="flex gap-4 text-xs text-gray-500">
            <span>
              <span className="emoji">📅</span> {entry.date.toLocaleDateString()}
            </span>
            <span>
              <span className="emoji">🕒</span> {entry.created_at.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}