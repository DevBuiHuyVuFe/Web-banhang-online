import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../assets/api/orderService';
import { AuthService } from '../assets/api/authService';
import type { Order, OrderItemWithDetails } from '../assets/api/types';
import { BoxIcon } from '../components/Icons';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    note: '',
    shipping_address: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      ward: '',
      district: ''
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders(user.id);
  }, [navigate]);

  const loadOrders = async (userId: number) => {
    try {
      console.log('Loading orders for user:', userId);
      const response = await OrderService.getUserOrders(userId);
      console.log('Orders response:', response);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadOrderItems = async (orderId: number) => {
    try {
      console.log('Loading order items for order:', orderId);
      const items = await OrderService.getOrderItemsWithDetails(orderId);
      console.log('Order items with details:', items);
      setOrderItems(items);
    } catch (error) {
      console.error('Error loading order items:', error);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    loadOrderItems(order.id);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    try {
      const shippingAddress = order.shipping_address_json ? JSON.parse(order.shipping_address_json) : {};
      setEditForm({
        note: order.note || '',
        shipping_address: {
          fullName: shippingAddress.full_name || shippingAddress.fullName || '',
          phone: shippingAddress.phone || '',
          email: shippingAddress.email || '',
          address: shippingAddress.address || '',
          city: shippingAddress.city || '',
          ward: shippingAddress.ward || '',
          district: shippingAddress.district || ''
        }
      });
    } catch (error) {
      console.error('Error parsing shipping address:', error);
    }
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;

    try {
      // Chuyển đổi format để đồng bộ với backend (fullName -> full_name)
      const shippingAddress = {
        full_name: editForm.shipping_address.fullName,
        phone: editForm.shipping_address.phone,
        email: editForm.shipping_address.email,
        address: editForm.shipping_address.address,
        city: editForm.shipping_address.city,
        ward: editForm.shipping_address.ward,
        district: editForm.shipping_address.district
      };
      
      const updatedOrder = {
        ...editingOrder,
        note: editForm.note,
        shipping_address_json: JSON.stringify(shippingAddress)
      };

      await OrderService.updateOrder(editingOrder.id, updatedOrder);
      
      // Cập nhật danh sách đơn hàng
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ));
      
      if (selectedOrder?.id === editingOrder.id) {
        setSelectedOrder(updatedOrder);
      }
      
      setEditingOrder(null);
      setEditForm({
        note: '',
        shipping_address: {
          fullName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          ward: '',
          district: ''
        }
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditForm({
      note: '',
      shipping_address: {
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        ward: '',
        district: ''
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã gửi hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return paymentStatus;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount));
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Danh sách đơn hàng</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Mua sắm ngay
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Đơn hàng #{order.code}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      Chi tiết đơn hàng #{selectedOrder.code}
                    </h2>
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleEditOrder(selectedOrder)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4">
                  {/* Thông tin đơn hàng */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái đơn hàng</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái thanh toán</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {getPaymentStatusText(selectedOrder.payment_status)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày đặt hàng</h3>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng tiền</h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedOrder.total)}
                      </p>
                    </div>
                  </div>

                  {/* Form chỉnh sửa */}
                  {editingOrder && editingOrder.id === selectedOrder.id ? (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa đơn hàng</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                          </label>
                          <textarea
                            value={editForm.note}
                            onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            value={editForm.shipping_address.fullName}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, fullName: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={editForm.shipping_address.phone}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, phone: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editForm.shipping_address.email}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, email: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                          </label>
                          <input
                            type="text"
                            value={editForm.shipping_address.address}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, address: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thành phố
                          </label>
                          <input
                            type="text"
                            value={editForm.shipping_address.city}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, city: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quận/Huyện
                          </label>
                          <input
                            type="text"
                            value={editForm.shipping_address.district}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, district: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phường/Xã
                          </label>
                          <input
                            type="text"
                            value={editForm.shipping_address.ward}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              shipping_address: {...editForm.shipping_address, ward: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveOrder}
                          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Thông tin giao hàng */
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giao hàng</h3>
                      {(() => {
                        try {
                          // Xử lý shipping_address_json - có thể là string hoặc object
                          let address: any = null;
                          
                          if (selectedOrder.shipping_address_json) {
                            if (typeof selectedOrder.shipping_address_json === 'string') {
                              // Nếu là string, parse nó
                              address = JSON.parse(selectedOrder.shipping_address_json);
                            } else if (typeof selectedOrder.shipping_address_json === 'object') {
                              // Nếu đã là object (MySQL driver đã parse), dùng trực tiếp
                              address = selectedOrder.shipping_address_json;
                            }
                          }

                          if (!address) {
                            return <p className="text-sm text-gray-500">Không có thông tin địa chỉ</p>;
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Họ tên</p>
                                <p className="text-sm text-gray-900">{address.full_name || address.fullName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="text-sm text-gray-900">{address.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-sm text-gray-900">{address.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                <p className="text-sm text-gray-900">{address.address || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Thành phố</p>
                                <p className="text-sm text-gray-900">{address.city || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Quận/Huyện</p>
                                <p className="text-sm text-gray-900">{address.district || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phường/Xã</p>
                                <p className="text-sm text-gray-900">{address.ward || 'N/A'}</p>
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error('Error parsing shipping address:', error, selectedOrder.shipping_address_json);
                          return (
                            <div>
                              <p className="text-sm text-red-500 mb-2">Không thể hiển thị thông tin địa chỉ</p>
                              <p className="text-xs text-gray-400">Raw data: {JSON.stringify(selectedOrder.shipping_address_json)}</p>
                            </div>
                          );
                        }
                      })()}
                      
                      {selectedOrder.note && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Ghi chú</p>
                          <p className="text-sm text-gray-900">{selectedOrder.note}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Danh sách sản phẩm */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h3>
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          {/* Ảnh sản phẩm */}
                          <div className="flex-shrink-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name || 'Sản phẩm'}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500" style={{ display: item.product_image ? 'none' : 'flex' }}>
                              <BoxIcon className="w-8 h-8" />
                            </div>
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.product_name || item.name_snapshot}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.sku_snapshot}
                            </div>
                            <div className="text-sm text-gray-500">
                              Số lượng: {item.quantity}
                            </div>
                            {item.variant_color && (
                              <div className="text-sm text-gray-500">
                                Màu: {item.variant_color}
                              </div>
                            )}
                            {item.variant_size && (
                              <div className="text-sm text-gray-500">
                                Kích thước: {item.variant_size}
                              </div>
                            )}
                          </div>

                          {/* Giá */}
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(item.unit_price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tổng: {formatCurrency(item.total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tổng tiền */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn đơn hàng để xem chi tiết</h3>
                <p className="text-gray-500">Chọn một đơn hàng từ danh sách bên trái để xem thông tin chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders; 