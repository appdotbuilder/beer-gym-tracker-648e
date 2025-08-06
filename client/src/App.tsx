import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { SpendingEntryCard } from '@/components/SpendingEntryCard';
import { SpendingSummaryCards } from '@/components/SpendingSummaryCards';
import { SpendingEntryForm } from '@/components/SpendingEntryForm';
// Using type-only imports for TypeScript compliance
import type { SpendingEntry, CreateSpendingEntryInput, SpendingSummary } from '../../server/src/schema';
import './App.css';

function App() {
  // State management with proper typing
  const [entries, setEntries] = useState<SpendingEntry[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data functions with useCallback for useEffect dependencies
  const loadEntries = useCallback(async () => {
    try {
      setError(null);
      const result = await trpc.getSpendingEntries.query();
      setEntries(result);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setError('Failed to load spending entries. Please check your connection and try again.');
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const result = await trpc.getSpendingSummary.query();
      setSummary(result);
    } catch (error) {
      console.error('Failed to load summary:', error);
      setError('Failed to load spending summary. Please check your connection and try again.');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadEntries(), loadSummary()]).finally(() => {
      setIsLoading(false);
    });
  }, [loadEntries, loadSummary]);

  const handleSubmit = async (formData: CreateSpendingEntryInput) => {
    setIsSubmitting(true);
    try {
      setError(null);
      const response = await trpc.createSpendingEntry.mutate(formData);
      // Update entries list with new entry
      setEntries((prev: SpendingEntry[]) => [response, ...prev]);
      // Reload summary to get updated totals
      await loadSummary();
    } catch (error) {
      console.error('Failed to create entry:', error);
      setError('Failed to create spending entry. Please check your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍺 vs 💪 Spending Tracker
          </h1>
          <p className="text-gray-600">
            Track your spending and discover if you're more of a beer enthusiast or fitness fanatic!
          </p>
        </div>

        {/* Summary Cards */}
        <SpendingSummaryCards 
          summary={summary || {
            beer_total: 0,
            gym_total: 0,
            beer_count: 0,
            gym_count: 0,
            user_type: 'balanced'
          }} 
        />

        {/* Add Entry Form */}
        <SpendingEntryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        {/* Entries List */}
        <Card className="spending-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="emoji text-xl">📊</span> Recent Entries
            </CardTitle>
            <CardDescription>
              Your spending history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">
                <div className="text-6xl mb-4">❌</div>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Refresh Page
                </button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading entries...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4 emoji">🎯</div>
                <p>No entries yet! Add your first spending entry above.</p>
              </div>
            ) : (
              <div className="space-y-4 custom-scroll max-h-96 overflow-y-auto pr-2">
                {entries.map((entry: SpendingEntry) => (
                  <SpendingEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;