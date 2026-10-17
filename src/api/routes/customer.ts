import express from 'express';
import {
  getFeaturedPublicProducts,
  getNewArrivalPublicProducts,
  getPublicCategories,
  getPublicProduct,
  getPublicStore,
  listPublicProducts,
  listPublicStores,
  listNearbyStores,
  type PublicProductQuery,
} from '../catalog';
import { listNearbyMapPlaces } from '../places';

const router = express.Router();

// The public discovery surface intentionally uses the same catalog service as
// the Vercel function. This keeps local previews and production previews
// visually identical in either explicit demo or Mongo mode.

function query(request: express.Request): PublicProductQuery {
  return {
    page: request.query.page as string | undefined,
    limit: request.query.limit as string | undefined,
    search: request.query.search as string | undefined,
    category: request.query.category as string | undefined,
    status: request.query.status as string | undefined,
    sort: request.query.sort as string | undefined,
    storeId: request.query.storeId as string | undefined,
  };
}

router.get('/products', async (req, res) => {
  try {
    const result = await listPublicProducts(query(req));
    res.json({ ...result, updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/featured-products', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    res.json({ data: await getFeaturedPublicProducts(limit), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 15;
    res.json({ data: await getNewArrivalPublicProducts(limit), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    res.json({ data: await getPublicCategories(), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await getPublicProduct(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ data: product, updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/shops', async (_req, res) => {
  try {
    res.json({ data: await listPublicStores(), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/shops/nearby', async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = Number(req.query.radius) || 25_000;
    res.json({ data: await listNearbyStores(latitude, longitude, radius), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load nearby stores';
    res.status(status || 500).json({ error: { code, message } });
  }
});

router.get('/places/nearby', async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = Number(req.query.radius) || 5_000;
    res.json({ data: await listNearbyMapPlaces(latitude, longitude, radius), updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 502;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'MAP_PROVIDER_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load nearby map places';
    res.status(status || 502).json({ error: { code, message } });
  }
});

router.get('/shops/:id', async (req, res) => {
  try {
    const details = await getPublicStore(req.params.id);
    if (!details) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }
    res.json({ ...details, data: details, updatedAt: new Date().toISOString() });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: number }).status) : 500;
    const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Unable to load the customer catalog';
    res.status(status || 500).json({ error: { code, message } });
  }
});

export default router;
