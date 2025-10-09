import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartService } from '../assets/api/cartService';
import type { CartItem, ProductVariant, Product } from '../assets/api/types';

interface CartItemWithDetails extends CartItem {
  variant?: ProductVariant;
  product?: Product;
  // Các trường từ backend API
  variant_sku?: string | null;
  color?: string | null;
  size?: string | null;
  variant_price?: number;
  product_name?: string;
  product_img?: string | null;
  product_img_alt?: string | null;
  product_img_title?: string | null;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await CartService.getCart();
      setCartItems(cart.items);
    } catch (e: any) {
      setError(e.message || 'Tải giỏ hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      await CartService.updateQuantity(itemId, newQuantity);
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (e: any) {
      alert('Cập nhật số lượng thất bại: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await CartService.removeItem(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (e: any) {
      alert('Xóa sản phẩm thất bại: ' + e.message);
    }
  };

  const clearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    
    try {
      await CartService.clearCart();
      setCartItems([]);
    } catch (e: any) {
      alert('Xóa giỏ hàng thất bại: ' + e.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = CartService.calculateTotal(cartItems);
  const totalQuantity = CartService.calculateTotalQuantity(cartItems);

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải giỏ hàng...</div>;

  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sản phẩm ({cartItems.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center space-x-4">
                  {/* Ảnh sản phẩm */}
                  <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                    {item.product_img ? (
                      <img
                        src={item.product_img}
                        alt={item.product_img_alt || item.product_name || 'Product'}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.product_name || `Sản phẩm #${item.variant_id}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      SKU: {item.variant_sku || 'N/A'}
                    </p>
                    {item.color && (
                      <p className="text-sm text-gray-500">
                        Màu: {item.color}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-sm text-gray-500">
                        Size: {item.size}
                      </p>
                    )}
                  </div>

                  {/* Số lượng */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Giá */}
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.unit_price)} / sản phẩm
                    </div>
                  </div>

                  {/* Xóa */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế</span>
                <span>0đ</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
            >
              Tiến hành thanh toán
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 
