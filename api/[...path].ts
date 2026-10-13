import express from 'express';
import cors from 'cors';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { mongoRouter } from '../src/api/mongoRoutes';

/**
 * Vercel entry point for auth, seller inventory, stores, and catalog aliases.
 * The more specific api/customer/[...path].ts function remains the only
 * serverless entry point for the legacy customer URL surface, so this catch-all
 * does not create a second customer catch-all.
 */
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', mongoRouter);

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  app(req, res);
}
