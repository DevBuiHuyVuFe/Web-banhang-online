import type { Paginated, Product, ProductImage, ProductVariant, ID } from './types';
import { httpGet } from './http';

export const ProductService = {
  async getList(page = 1, pageSize = 12, category?: string | null): Promise<Paginated<Product>> {
    const params: any = { page, pageSize };
    if (category) {
      params.category = category;
    }
    return httpGet<Paginated<Product>>('/products', params);
  },

  async getById(id: ID): Promise<Product | undefined> {
    const detail = await httpGet<{ product: Product; variants: ProductVariant[]; images: ProductImage[] }>(`/products/${id}`);
    return detail.product;
  },

  async getDetail(id: ID): Promise<{ product: Product; variants: ProductVariant[]; images: ProductImage[] }> {
    return httpGet<{ product: Product; variants: ProductVariant[]; images: ProductImage[] }>(`/products/${id}`);
  },

  async getVariants(productId: ID): Promise<ProductVariant[]> {
    const detail = await this.getDetail(productId);
    return detail.variants;
  },

  async getImages(productId: ID): Promise<ProductImage[]> {
    const detail = await this.getDetail(productId);
    return detail.images;
  },
}; 