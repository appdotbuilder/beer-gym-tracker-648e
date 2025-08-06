import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Using type-only import for better TypeScript compliance
import type { SpendingSummary } from '../../../server/src/schema';

interface SpendingSummaryCardsProps {
  summary: SpendingSummary;
}

export function SpendingSummaryCards({ summary }: SpendingSummaryCardsProps) {
  // Helper function to get user type display info
  const getUserTypeInfo = (userType: SpendingSummary['user_type']) => {
    switch (userType) {
      case 'beer_enthusiast':
        return { emoji: '🍺', text: 'Beer Enthusiast', color: 'bg-amber-100 text-amber-800' };
      case 'fitness_enthusiast':
        return { emoji: '💪', text: 'Fitness Enthusiast', color: 'bg-green-100 text-green-800' };
      default:
        return { emoji: '⚖️', text: 'Balanced Lifestyle', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="spending-card border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <span className="emoji text-2xl">🍺</span> Beer Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-900">
            ${summary.beer_total.toFixed(2)}
          </div>
          <p className="text-sm text-amber-600 mt-1">
            {summary.beer_count} entries
          </p>
        </CardContent>
      </Card>

      <Card className="spending-card border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <span className="emoji text-2xl">💪</span> Gym Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">
            ${summary.gym_total.toFixed(2)}
          </div>
          <p className="text-sm text-green-600 mt-1">
            {summary.gym_count} entries
          </p>
        </CardContent>
      </Card>

      <Card className="spending-card border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-800">Your Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={getUserTypeInfo(summary.user_type).color + ' text-lg px-3 py-1 pulse-badge'}>
            <span className="emoji">{getUserTypeInfo(summary.user_type).emoji}</span> {getUserTypeInfo(summary.user_type).text}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}