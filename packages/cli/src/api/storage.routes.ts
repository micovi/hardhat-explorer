import { Hono } from 'hono';
import type { SQLiteService } from '../db/sqlite.service';

export function createStorageRoutes(sqliteService: SQLiteService): Hono {
  const app = new Hono();

  // Metrics endpoints
  app.get('/metrics/:key', async (c) => {
    try {
      const data = sqliteService.loadMetric(c.req.param('key'));
      return c.json({ data });
    } catch (error) {
      return c.json({ error: 'Failed to load metric' }, 500);
    }
  });

  app.post('/metrics/:key', async (c) => {
    try {
      const body = await c.req.json();
      sqliteService.saveMetric(c.req.param('key'), body.data);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to save metric' }, 500);
    }
  });

  // ABI endpoints
  app.get('/abis/:address', async (c) => {
    try {
      const data = sqliteService.getAbiData(c.req.param('address'));
      if (!data) {
        return c.json({ error: 'ABI not found' }, 404);
      }
      return c.json(data);
    } catch (error) {
      return c.json({ error: 'Failed to load ABI' }, 500);
    }
  });

  app.post('/abis/:address', async (c) => {
    try {
      const { abi, name } = await c.req.json();
      sqliteService.saveABI(c.req.param('address'), abi, name);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to save ABI' }, 500);
    }
  });

  // Get all verified contracts
  app.get('/contracts/verified', async (c) => {
    try {
      const contracts = sqliteService.getAllVerifiedContracts();
      return c.json(contracts);
    } catch (error) {
      return c.json({ error: 'Failed to load verified contracts' }, 500);
    }
  });

  // Contract source code endpoints
  app.get('/contracts/:address', async (c) => {
    try {
      const data = sqliteService.loadContract(c.req.param('address'));
      if (!data) {
        return c.json({ error: 'Contract not found' }, 404);
      }
      return c.json(data);
    } catch (error) {
      return c.json({ error: 'Failed to load contract' }, 500);
    }
  });

  app.post('/contracts/:address', async (c) => {
    try {
      const contractData = await c.req.json();
      sqliteService.saveContract(c.req.param('address'), contractData);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to save contract' }, 500);
    }
  });

  // Clear all data
  app.post('/clear', async (c) => {
    try {
      sqliteService.clearAll();
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to clear database' }, 500);
    }
  });

  return app;
}