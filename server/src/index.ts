import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createSpendingEntryInputSchema, 
  categorySchema,
  type SpendingEntry,
  type SpendingSummary,
  type CategorySummary 
} from './schema';
import { createSpendingEntry } from './handlers/create_spending_entry';
import { getSpendingEntries } from './handlers/get_spending_entries';
import { getSpendingSummary } from './handlers/get_spending_summary';
import { getCategorySummary } from './handlers/get_category_summary';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new spending entry
  createSpendingEntry: publicProcedure
    .input(createSpendingEntryInputSchema)
    .mutation(({ input }) => createSpendingEntry(input)),
  
  // Get all spending entries
  getSpendingEntries: publicProcedure
    .query(() => getSpendingEntries()),
  
  // Get overall spending summary with user type determination
  getSpendingSummary: publicProcedure
    .query(() => getSpendingSummary()),
  
  // Get summary for a specific category (Beer or Gym)
  getCategorySummary: publicProcedure
    .input(categorySchema)
    .query(({ input }) => getCategorySummary(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();