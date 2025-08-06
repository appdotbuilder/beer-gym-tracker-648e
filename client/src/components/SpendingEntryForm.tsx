import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
// Using type-only import for better TypeScript compliance
import type { CreateSpendingEntryInput } from '../../../server/src/schema';

interface SpendingEntryFormProps {
  onSubmit: (data: CreateSpendingEntryInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function SpendingEntryForm({ onSubmit, isSubmitting = false }: SpendingEntryFormProps) {
  // Form state with proper typing for nullable fields
  const [formData, setFormData] = useState<CreateSpendingEntryInput>({
    category: 'Beer',
    amount: 0,
    date: new Date(),
    description: null
  });

  // Format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;

    await onSubmit(formData);
    
    // Reset form after successful submission
    setFormData({
      category: 'Beer',
      amount: 0,
      date: new Date(),
      description: null
    });
  };

  return (
    <Card className="mb-8 shadow-lg spending-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="emoji text-xl">➕</span> Add New Spending Entry
        </CardTitle>
        <CardDescription>
          Record your latest beer or gym expense
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'Beer' | 'Gym') =>
                  setFormData((prev: CreateSpendingEntryInput) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beer"><span className="emoji">🍺</span> Beer</SelectItem>
                  <SelectItem value="Gym"><span className="emoji">💪</span> Gym</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateSpendingEntryInput) => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0 
                  }))
                }
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formatDateForInput(formData.date)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateSpendingEntryInput) => ({ 
                  ...prev, 
                  date: new Date(e.target.value) 
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What did you spend on? (e.g., Craft beer at brewery, Personal training session)"
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateSpendingEntryInput) => ({
                  ...prev,
                  description: e.target.value || null
                }))
              }
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || formData.amount <= 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 action-button"
          >
            {isSubmitting ? 'Adding Entry...' : <><span className="emoji">💰</span> Add Entry</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}