export type ID = number;

export interface User {
  id: ID;
  email: string;
  full_name: string;
  phone?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  parent_id?: ID | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  product_img?: string | null;
  product_img_alt?: string | null;
  product_img_title?: string | null;
  has_images: boolean;
  brand?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  price?: {
    min: number;
    max: number;
    compare_min?: number | null;
    compare_max?: number | null;
    has_discount: boolean;
  } | null;
}

export interface ProductVariant {
  id: ID;
  product_id: ID;
  variant_sku?: string | null;
  color?: string | null;
  size?: string | null;
  price: number; // decimal(12,2)
  compare_price?: number | null;
  weight?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: ID;
  product_id: ID;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Inventory {
  id: ID;
  variant_id: ID;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface Cart {
  id: ID;
  user_id?: ID | null;
  session_id?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface CartItem {
  id: ID;
  cart_id: ID;
  variant_id: ID;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Order {
  id: ID;
  user_id?: ID | null;
  code: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  currency: string; // e.g. VND
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  shipping_status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  placed_at?: string | null;
  created_at: string;
  updated_at: string;
  note?: string | null;
  shipping_address_json?: string | null;
}

export interface OrderItem {
  id: ID;
  order_id: ID;
  product_id: ID;
  variant_id?: ID | null;
  name_snapshot: string;
  sku_snapshot?: string | null;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface OrderItemWithDetails extends OrderItem {
  product_name?: string;
  product_image?: string;
  variant_color?: string;
  variant_size?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  message: string;
} 