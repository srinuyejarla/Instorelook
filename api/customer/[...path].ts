import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  errorResponse,
  getFeaturedPublicProducts,
  getNewArrivalPublicProducts,
  getPublicCategories,
  getPublicProduct,
  getPublicStore,
  listPublicProducts,
  listPublicStores,
  listNearbyStores,
  type PublicProductQuery,
} from '../../src/api/catalog';
import { listNearbyMapPlaces } from '../../src/api/places';

type QueryValue = string | string[] | undefined;

interface CustomerRequest extends IncomingMessage {
  query?: Record<string, QueryValue>;
}

interface JsonResponse {
  data?: unknown;
  [key: string]: unknown;
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res: ServerResponse, statusCode: number, payload: JsonResponse): void {
  const body = JSON.stringify({
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function queryValue(
  url: URL,
  request: CustomerRequest,
  key: string,
): string | undefined {
  const fromUrl = url.searchParams.get(key);
  if (fromUrl !== null) return fromUrl;

  const fromQuery = request.query?.[key];
  return Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
}

function pathSegments(url: URL, request: CustomerRequest): string[] {
  const prefix = '/api/customer';
  const pathname = url.pathname;
  const pathFromQuery = request.query?.path;
  const queryPath = Array.isArray(pathFromQuery) ? pathFromQuery.join('/') : pathFromQuery;
  const path =
    pathname === prefix
      ? ''
      : pathname.startsWith(`${prefix}/`)
        ? pathname.slice(prefix.length)
        : queryPath
          ? `/${queryPath}`
          : pathname;

  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function productQuery(url: URL, request: CustomerRequest): PublicProductQuery {
  return {
    page: queryValue(url, request, 'page'),
    limit: queryValue(url, request, 'limit'),
    search: queryValue(url, request, 'search'),
    category: queryValue(url, request, 'category'),
    status: queryValue(url, request, 'status'),
    sort: queryValue(url, request, 'sort'),
    storeId: queryValue(url, request, 'storeId'),
  };
}

export default async function handler(req: CustomerRequest, res: ServerResponse): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let url: URL;
  try {
    url = new URL(req.url || '/api/customer', 'http://localhost');
  } catch {
    sendJson(res, 400, { error: 'Invalid request URL' });
    return;
  }

  try {
    const segments = pathSegments(url, req);
    const resource = segments[0];
    const id = segments[1];

    if (resource === 'products' && !id && segments.length === 1) {
      const result = await listPublicProducts(productQuery(url, req));
      sendJson(res, 200, {
        data: result.data,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
      return;
    }

    if (resource === 'products' && id && segments.length === 2) {
      const product = await getPublicProduct(id);
      if (!product) {
        sendJson(res, 404, { error: 'Product not found' });
        return;
      }
      sendJson(res, 200, { data: product });
      return;
    }

    if (resource === 'featured-products' && segments.length === 1) {
      const limit = Number(queryValue(url, req, 'limit')) || 10;
      sendJson(res, 200, { data: await getFeaturedPublicProducts(limit) });
      return;
    }

    if (resource === 'new-arrivals' && segments.length === 1) {
      const limit = Number(queryValue(url, req, 'limit')) || 15;
      sendJson(res, 200, { data: await getNewArrivalPublicProducts(limit) });
      return;
    }

    if (resource === 'categories' && segments.length === 1) {
      sendJson(res, 200, { data: await getPublicCategories() });
      return;
    }

    if (resource === 'shops' && !id && segments.length === 1) {
      sendJson(res, 200, { data: await listPublicStores() });
      return;
    }

    if (resource === 'shops' && id === 'nearby' && segments.length === 2) {
      const latitude = Number(queryValue(url, req, 'latitude'));
      const longitude = Number(queryValue(url, req, 'longitude'));
      const radius = Number(queryValue(url, req, 'radius')) || 25_000;
      sendJson(res, 200, { data: await listNearbyStores(latitude, longitude, radius) });
      return;
    }

    if (resource === 'places' && id === 'nearby' && segments.length === 2) {
      const latitude = Number(queryValue(url, req, 'latitude'));
      const longitude = Number(queryValue(url, req, 'longitude'));
      const radius = Number(queryValue(url, req, 'radius')) || 5_000;
      sendJson(res, 200, { data: await listNearbyMapPlaces(latitude, longitude, radius) });
      return;
    }

    if (resource === 'shops' && id && segments.length === 2) {
      const details = await getPublicStore(id);
      if (!details) {
        sendJson(res, 404, { error: 'Shop not found' });
        return;
      }

      // Keep the legacy customerApi shape while also exposing a conventional data field.
      sendJson(res, 200, {
        data: details,
        shop: details.shop,
        products: details.products,
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    if (error instanceof URIError) {
      sendJson(res, 400, { error: 'Invalid path' });
      return;
    }

    const normalized = errorResponse(error);
    sendJson(res, normalized.status, normalized.body);
  }
}
