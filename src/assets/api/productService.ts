import type { Paginated, Product, ProductImage, ProductVariant, ID } from './types';
import { httpGet } from './http';

export const ProductService = {
  async getList(page = 1, pageSize = 12): Promise<Paginated<Product>> {
    return httpGet<Paginated<Product>>('/products', { page, pageSize });
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