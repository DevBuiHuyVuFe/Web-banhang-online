import { httpGet, httpPost } from './http';
import type { Product, Category, User, Order, ProductImage } from './types';

export const AdminService = {
  // Products
  async createProduct(data: Partial<Product>): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>('products?admin=1', data);
  },

  async getProducts(): Promise<{ data: Product[] }> {
    return httpGet<{ data: Product[] }>('products?admin=1');
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${id}?admin=1`, { ...data, _method: 'PUT' });
  },

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Categories
  async getCategories(): Promise<{ data: Category[] }> {
    return httpGet<{ data: Category[] }>('categories?admin=1');
  },

  async createCategory(data: Partial<Category>): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>('categories?admin=1', data);
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`categories/${id}?admin=1`, { ...data, _method: 'PUT' });
  },

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`categories/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Product Images
  async createProductImage(productId: number, data: Partial<ProductImage>): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>(`products/${productId}/images?admin=1`, data);
  },

  async updateProductImage(imageId: number, data: Partial<ProductImage>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-images/${imageId}?admin=1`, { ...data, _method: 'PUT' });
  },

  // Upload file ảnh
  async uploadImage(file: File): Promise<{ success: boolean; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload file thất bại');
    }
    
    return response.json();
  },

  // Upload multiple files
  async uploadMultipleImages(files: File[]): Promise<{ success: boolean; files: Array<{ url: string; filename: string }> }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch('/api/upload-multiple', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload files thất bại');
    }
    
    return response.json();
  },

  async deleteProductImage(productId: number, imageId: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${productId}/images/${imageId}?admin=1`, { _method: 'DELETE' });
  },

  // Users
  async getUsers(): Promise<{ data: User[] }> {
    return httpGet<{ data: User[] }>('users?admin=1');
  },

  async createUser(data: Partial<User> & { password: string }): Promise<{ success: boolean; id: number }> {
    const { password, ...userData } = data;
    return httpPost<{ success: boolean; id: number }>('users?admin=1', { ...userData, password_hash: password });
  },

  async updateUser(id: number, data: Partial<User>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`users/${id}?admin=1`, { ...data, _method: 'PUT' });
  },

  async deleteUser(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`users/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Orders
  async getOrders(): Promise<{ data: Order[] }> {
    return httpGet<{ data: Order[] }>('orders?admin=1');
  },

  async updateOrderStatus(id: number, status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/status?admin=1`, { status });
  },

  async updatePaymentStatus(id: number, payment_status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/payment-status?admin=1`, { payment_status });
  },

  async updateShippingStatus(id: number, shipping_status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/shipping-status?admin=1`, { shipping_status });
  },

  async deleteOrder(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Vouchers
  async createVoucher(data: any): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>('vouchers?admin=1', data);
  },

  async updateVoucher(id: number, data: any): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`vouchers/${id}?admin=1`, { ...data, _method: 'PUT' });
  },

  async deleteVoucher(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`vouchers/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Reviews
  async updateReviewStatus(id: number, status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`reviews/${id}/status?admin=1`, { status });
  },

  async deleteReview(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`reviews/${id}?admin=1`, { _method: 'DELETE' });
  },

  // Inventory
  async updateInventory(variantId: number, quantity: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`inventory/${variantId}?admin=1`, { quantity });
  },

  // Product Variants
  async getProductVariants(): Promise<{ data: any[] }> {
    return httpGet<{ data: any[] }>('product-variants?admin=1');
  },

  async createProductVariant(data: any): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>('product-variants?admin=1', data);
  },

  async updateProductVariant(id: number, data: any): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-variants/${id}?admin=1`, { ...data, _method: 'PUT' });
  },

  async deleteProductVariant(id: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-variants/${id}?admin=1`, { _method: 'DELETE' });
  },
}; 