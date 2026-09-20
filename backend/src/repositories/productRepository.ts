import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { NexusProduct, CategorySchema } from '@shared/types/catalog';
import { catalogService } from '../services/catalogService';

export class ProductRepository {
  /**
   * Save a product in DynamoDB using single-table design:
   * PK: PRODUCT#<id>, SK: METADATA
   * GSI1_PK: PRODUCT#<category>, GSI1_SK: PRODUCT#<id>
   */
  async saveProduct(product: NexusProduct): Promise<void> {
    const item = {
      PK: `PRODUCT#${product.id}`,
      SK: 'METADATA',
      GSI1_PK: `PRODUCT#${product.category}`,
      GSI1_SK: `PRODUCT#${product.id}`,
      id: product.id,
      asin: product.asin || product.id,
      name: product.name || product.modelName,
      modelName: product.modelName || product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      priceInr: product.priceInr,
      originalPriceInr: product.originalPriceInr,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      primeEligible: product.primeEligible,
      specs: product.specs,
      tags: product.tags || [],
      badge: product.badge,
      createdAt: new Date().toISOString(),
    };

    await ddbDocClient.send({
      constructor: { name: 'PutCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        Item: item,
      },
    });
  }

  /**
   * Get product by ID or ASIN
   */
  async getProduct(productId: string): Promise<NexusProduct | null> {
    // 1. Try local memory/DynamoDB table
    try {
      const res = await ddbDocClient.send({
        constructor: { name: 'GetCommand' },
        input: {
          TableName: DYNAMODB_TABLE,
          Key: {
            PK: `PRODUCT#${productId}`,
            SK: 'METADATA',
          },
        },
      });

      if (res?.Item) {
        return res.Item as NexusProduct;
      }
    } catch {
      // Fallback to in-memory catalog
    }

    // 2. Fallback to CatalogService
    const fallback = catalogService.getById(productId);
    return fallback ? (catalogService.normalizeProduct(fallback) as NexusProduct) : null;
  }

  /**
   * List products by category
   */
  async listByCategory(category: string): Promise<NexusProduct[]> {
    try {
      const res = await ddbDocClient.send({
        constructor: { name: 'QueryCommand' },
        input: {
          TableName: DYNAMODB_TABLE,
          IndexName: 'GSI1',
          ExpressionAttributeValues: {
            ':pk': `PRODUCT#${category}`,
          },
        },
      });

      if (res?.Items && res.Items.length > 0) {
        return res.Items as NexusProduct[];
      }
    } catch {
      // Fallback to CatalogService
    }

    const items = catalogService.getAll(category);
    return items.map((p) => catalogService.normalizeProduct(p));
  }

  /**
   * Save category schema:
   * PK: CATEGORY#<categoryId>, SK: SCHEMA
   */
  async saveCategorySchema(schema: CategorySchema): Promise<void> {
    await ddbDocClient.send({
      constructor: { name: 'PutCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        Item: {
          PK: `CATEGORY#${schema.categoryId}`,
          SK: 'SCHEMA',
          ...schema,
        },
      },
    });
  }

  /**
   * Get category schema
   */
  async getCategorySchema(categoryId: string): Promise<CategorySchema | null> {
    try {
      const res = await ddbDocClient.send({
        constructor: { name: 'GetCommand' },
        input: {
          TableName: DYNAMODB_TABLE,
          Key: {
            PK: `CATEGORY#${categoryId}`,
            SK: 'SCHEMA',
          },
        },
      });

      if (res?.Item) {
        return res.Item as CategorySchema;
      }
    } catch {
      // Fallback to catalogService
    }

    return catalogService.getCategorySchema(categoryId) || null;
  }
}

export const productRepository = new ProductRepository();
