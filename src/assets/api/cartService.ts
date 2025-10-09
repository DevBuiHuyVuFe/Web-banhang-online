import { httpGet, httpPost, API_BASE_URL } from './http';
import type { CartItem, Cart } from './types';

// Interface mở rộng để bao gồm items
interface CartWithItems extends Cart {
  items: CartItem[];
  total_amount: number;
}

export class CartService {
  // Lấy giỏ hàng hiện tại
  static async getCart(): Promise<CartWithItems> {
    try {
      const res = await httpGet<CartWithItems>('cart');
      return res;
    } catch (e: any) {
      // Nếu chưa có giỏ hàng, trả về giỏ hàng rỗng
      if (e?.message && String(e.message).includes('404')) {
        return {
          id: 0,
          user_id: 0,
          session_id: null,
          expires_at: null,
          items: [],
          total_amount: 0,
          created_at: new Date().toISOString()
        };
      }
      throw e;
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  static async addItem(variantId: number, quantity: number, price: number): Promise<CartItem> {
    try {
      const res = await httpPost<CartItem>('cart/items', {
        variant_id: variantId,
        quantity,
        unit_price: price
      });
      return res;
    } catch (e: any) {
      console.error('Add to cart error:', e);
      throw new Error(e.message || 'Thêm vào giỏ hàng thất bại');
    }
  }

  // Cập nhật số lượng sản phẩm
  static async updateQuantity(itemId: number, quantity: number): Promise<CartItem> {
    try {
      const res = await httpPost<CartItem>(`cart/items/${itemId}`, {
        quantity
      });
      return res;
    } catch (e: any) {
      console.error('Update quantity error:', e);
      throw new Error(e.message || 'Cập nhật số lượng thất bại');
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeItem(itemId: number): Promise<void> {
    try {
      // Sử dụng DELETE method thay vì POST với _method
      const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`DELETE failed: ${response.status}`);
      }
    } catch (e: any) {
      console.error('Remove item error:', e);
      throw new Error(e.message || 'Xóa sản phẩm thất bại');
    }
  }

  // Xóa toàn bộ giỏ hàng
  static async clearCart(): Promise<void> {
    try {
      // Sử dụng DELETE method
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DELETE failed: ${response.status} - ${errorText}`);
      }
    } catch (e: any) {
      console.error('Clear cart error:', e);
      throw new Error(e.message || 'Xóa giỏ hàng thất bại');
    }
  }

  // Tính tổng tiền
  static calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  }

  // Tính tổng số lượng
  static calculateTotalQuantity(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }
} 