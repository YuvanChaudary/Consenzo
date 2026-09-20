import { APIGatewayProxyEvent } from 'aws-lambda';
import { catalogService } from '../services/catalogService';
import { productRepository } from '../repositories/productRepository';
import { successResponse, errorResponse } from '../utils/response';
import { CorrelationContext } from '../middleware/correlation';

export class CatalogHandler {
  /**
   * GET /api/v2/products
   * List or filter products across any category with search & sort
   */
  async listProducts(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const query = event.queryStringParameters || {};
    const category = query.category;
    const brand = query.brand;
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
    const minRating = query.minRating ? Number(query.minRating) : undefined;
    const search = (query.q || query.search || '').toLowerCase().trim();
    const sort = query.sort || 'popularity';

    let products = category
      ? await productRepository.listByCategory(category)
      : catalogService.getAllNormalized();

    // In-memory filtering if needed
    if (brand) {
      products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (minPrice !== undefined) {
      products = products.filter((p) => p.priceInr >= minPrice);
    }
    if (maxPrice !== undefined) {
      products = products.filter((p) => p.priceInr <= maxPrice);
    }
    if (minRating !== undefined) {
      products = products.filter((p) => (p.rating || 0) >= minRating);
    }
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.specs.some((s) => String(s.value).toLowerCase().includes(search))
      );
    }

    // Sorting
    if (sort === 'price-asc') {
      products.sort((a, b) => a.priceInr - b.priceInr);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.priceInr - a.priceInr);
    } else if (sort === 'rating-desc') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return successResponse(
      {
        count: products.length,
        products,
      },
      200,
      {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * GET /api/v2/products/{id}
   * Get single product detail with full specs and related items
   */
  async getProduct(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const id = event.pathParameters?.id || event.pathParameters?.asin;
    if (!id) {
      return errorResponse('BAD_REQUEST', 'Product ID is required', 400);
    }

    const product = await productRepository.getProduct(id);
    if (!product) {
      return errorResponse('NOT_FOUND', `Product not found with id: ${id}`, 404);
    }

    // Get related products from the same category
    const related = (await productRepository.listByCategory(product.category))
      .filter((p) => p.id !== product.id && p.asin !== product.asin)
      .slice(0, 4);

    return successResponse(
      {
        product,
        related,
      },
      200,
      {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * GET /api/v2/categories
   * List all categories and their dynamic schemas
   */
  async listCategories(_event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const categories = catalogService.getCategories();
    const schemas = catalogService.getAllSchemas();

    return successResponse(
      {
        categories,
        schemas,
      },
      200,
      {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * GET /api/v2/categories/{category}/schema
   * Get schema definition for a specific category
   */
  async getCategorySchema(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const category = event.pathParameters?.category || 'smart_tvs';
    const schema = await productRepository.getCategorySchema(category);

    if (!schema) {
      return errorResponse('NOT_FOUND', `Schema not found for category: ${category}`, 404);
    }

    return successResponse(schema, 200, {
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}

export const catalogHandler = new CatalogHandler();
