import { SmartTvProduct } from '@shared/types/catalog';
import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

const ajv = new Ajv();

describe('Catalog Validation', () => {
  const catalogPath = path.join(process.cwd(), '..', 'catalog', 'smart_tvs_v1.json');
  const schemaPath = path.join(process.cwd(), '..', 'catalog', 'catalog_schema.json');

  test('catalog should match schema', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    const validate = ajv.compile(schema);
    const valid = validate(catalog);

    if (!valid) {
      console.error('Schema errors:', validate.errors);
    }

    expect(valid).toBe(true);
  });

  test('catalog should have at least 50 items', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog.length).toBeGreaterThanOrEqual(50);
  });

  test('every product should have a valid ASIN', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const asinRegex = /^B[0-9A-Z]{9}$/;
    catalog.forEach((product: SmartTvProduct) => {
      expect(product.asin).toMatch(asinRegex);
    });
  });
});
