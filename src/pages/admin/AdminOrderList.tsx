import React, { useEffect, useState } from 'react';
import type { Order, OrderItem, OrderItemWithDetails } from '../../assets/api/types';
import { AdminService } from '../../assets/api/adminService';
import { OrderService } from '../../assets/api/orderService';
import { RefreshIcon } from '../../components/Icons';

interface OrderWithItems extends Order {
  items?: OrderItem[];
  user_name?: string;
  full_name?: string;
  email?: string;
}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API thật
      const response = await AdminService.getOrders();
      setOrders(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách orders thất bại');
      // Fallback to mock data if API fails
      const mockOrders: OrderWithItems[] = [
        {
          id: 1,
          user_id: 1,
          code: 'ORD001',
          status: 'pending',
          subtotal: 1000000,
          discount: 100000,
          shipping_fee: 50000,
          tax: 50000,
          total: 1000000,
          currency: 'VND',
          payment_status: 'pending',
          shipping_status: 'pending',
          placed_at: '2024-01-01T10:00:00Z',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          user_name: 'Nguyễn Văn A',
          items: [
            {
              id: 1,
              order_id: 1,
              product_id: 1,
              variant_id: 1,
              name_snapshot: 'iPhone 15 Pro',
              sku_snapshot: 'IP15P-128',
              unit_price: 1000000,
              quantity: 1,
              total: 1000000
            }
          ]
        },
        {
          id: 2,
          user_id: 2,
          code: 'ORD002',
          status: 'completed',
          subtotal: 2000000,
          discount: 0,
          shipping_fee: 50000,
          tax: 100000,
          total: 2150000,
          currency: 'VND',
          payment_status: 'success',
          shipping_status: 'delivered',
          placed_at: '2024-01-02T14:00:00Z',
          created_at: '2024-01-02T14:00:00Z',
          updated_at: '2024-01-02T16:00:00Z',
          user_name: 'Trần Thị B',
          items: [
            {
              id: 2,
              order_id: 2,
              product_id: 2,
              variant_id: 2,
              name_snapshot: 'MacBook Air M2',
              sku_snapshot: 'MBA-M2-256',
              unit_price: 2000000,
              quantity: 1,
              total: 2000000
            }
          ]
        }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await AdminService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (e: any) {
      setError(e.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handlePaymentStatusChange = async (orderId: number, newPaymentStatus: string) => {
    try {
      await AdminService.updatePaymentStatus(orderId, newPaymentStatus);
      loadOrders();
    } catch (e: any) {
      setError(e.message || 'Cập nhật trạng thái thanh toán thất bại');
    }
  };

  const handleShippingStatusChange = async (orderId: number, newShippingStatus: string) => {
    try {
      await AdminService.updateShippingStatus(orderId, newShippingStatus);
      loadOrders();
    } catch (e: any) {
      setError(e.message || 'Cập nhật trạng thái vận chuyển thất bại');
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!confirm('Bạn có chắc muốn xóa order này?')) return;
    try {
      await AdminService.deleteOrder(orderId);
      loadOrders();
    } catch (e: any) {
      setError(e.message || 'Xóa order thất bại');
    }
  };

  const loadOrderItems = async (orderId: number) => {
    try {
      setLoadingItems(true);
      const items = await OrderService.getOrderItemsWithDetails(orderId);
      setOrderItems(items);
    } catch (e: any) {
      console.error('Error loading order items:', e);
      setError(e.message || 'Tải chi tiết sản phẩm thất bại');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleOrderClick = (order: OrderWithItems) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setOrderItems([]);
    } else {
      setSelectedOrder(order);
      loadOrderItems(order.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'paid': return 'Đã thanh toán';
      case 'shipped': return 'Đã gửi hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Hoàn tiền';
      default: return status;
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Orders</h1>
        <button 
          onClick={loadOrders} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshIcon className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Danh sách orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vận chuyển
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="text-blue-600 hover:underline font-mono text-sm"
                    >
                      {order.code}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.full_name || order.user_name || `User #${order.user_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 rounded text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="shipped">Đã gửi hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="refunded">Hoàn tiền</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payment_status === 'success' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.payment_status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_status === 'success' ? 'Thành công' :
                         order.payment_status === 'pending' ? 'Chờ xử lý' :
                         order.payment_status === 'refunded' ? 'Đã hoàn tiền' :
                         'Thất bại'}
                      </span>
                      <select
                        value={order.payment_status}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 rounded text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="success">Thành công</option>
                        <option value="failed">Thất bại</option>
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.shipping_status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.shipping_status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        order.shipping_status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                        order.shipping_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.shipping_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.shipping_status === 'delivered' ? 'Đã giao' :
                         order.shipping_status === 'in_transit' ? 'Đang giao' :
                         order.shipping_status === 'picked_up' ? 'Đã lấy hàng' :
                         order.shipping_status === 'pending' ? 'Chờ xử lý' :
                         order.shipping_status === 'failed' ? 'Giao hàng thất bại' :
                         'Chưa xác định'}
                      </span>
                      <select
                        value={order.shipping_status}
                        onChange={(e) => handleShippingStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 rounded text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="picked_up">Đã lấy hàng</option>
                        <option value="in_transit">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="failed">Giao hàng thất bại</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.placed_at || order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có order nào
          </div>
        )}
      </div>

      {/* Chi tiết order */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết Order: {selectedOrder.code}</h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderItems([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                  <p><strong>Tên:</strong> {selectedOrder.full_name || selectedOrder.user_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.email || 'N/A'}</p>
                  <p><strong>ID:</strong> {selectedOrder.user_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
                  <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.placed_at || selectedOrder.created_at).toLocaleString('vi-VN')}</p>
                  <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Chi tiết sản phẩm</h3>
                {loadingItems ? (
                  <div className="text-center py-4 text-gray-500">Đang tải...</div>
                ) : orderItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Không có sản phẩm nào</div>
                ) : (
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left">Sản phẩm</th>
                        <th className="p-2 text-left">SKU</th>
                        <th className="p-2 text-right">Đơn giá</th>
                        <th className="p-2 text-center">Số lượng</th>
                        <th className="p-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{item.product_name || item.name_snapshot || 'N/A'}</td>
                          <td className="p-2">{item.sku_snapshot || 'N/A'}</td>
                          <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg">
                    <p><strong>Tổng cộng:</strong> {formatCurrency(selectedOrder.total)}</p>
                    <p className="text-sm text-gray-600">
                      Giá gốc: {formatCurrency(selectedOrder.subtotal)} | 
                      Giảm giá: {formatCurrency(selectedOrder.discount)} | 
                      Phí vận chuyển: {formatCurrency(selectedOrder.shipping_fee)} | 
                      Thuế: {formatCurrency(selectedOrder.tax)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList; 
