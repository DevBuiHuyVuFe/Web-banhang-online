import React, { useEffect, useState } from 'react';

interface InventoryItem {
  id: number;
  variant_id: number;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  variant_sku?: string;
  product_name?: string;
  color?: string;
  size?: string;
  price?: number;
}

const AdminInventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const loadInventory = async () => {
    try {
      // Mock data for now - will be replaced with API call
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          variant_id: 1,
          quantity: 50,
          low_stock_threshold: 10,
          updated_at: '2024-01-01T10:00:00Z',
          variant_sku: 'IP15P-128-BLACK',
          product_name: 'iPhone 15 Pro',
          color: 'Đen',
          size: '128GB',
          price: 1000000
        },
        {
          id: 2,
          variant_id: 2,
          quantity: 25,
          low_stock_threshold: 5,
          updated_at: '2024-01-01T10:00:00Z',
          variant_sku: 'IP15P-256-BLACK',
          product_name: 'iPhone 15 Pro',
          color: 'Đen',
          size: '256GB',
          price: 1200000
        },
        {
          id: 3,
          variant_id: 3,
          quantity: 5,
          low_stock_threshold: 10,
          updated_at: '2024-01-01T10:00:00Z',
          variant_sku: 'MBA-M2-8-256',
          product_name: 'MacBook Air M2',
          color: 'Bạc',
          size: '8GB/256GB',
          price: 25000000
        }
      ];
      setInventory(mockInventory);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách kho hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEditQuantity = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
  };

  const saveQuantity = async () => {
    if (!editingItem) return;
    
    try {
      // Mock API call - replace with actual API
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, quantity: editQuantity, updated_at: new Date().toISOString() }
          : item
      ));
      
      setEditingItem(null);
      setEditQuantity(0);
      alert('Cập nhật số lượng thành công!');
    } catch (e: any) {
      alert('Cập nhật số lượng thất bại: ' + e.message);
    }
  };

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: 'Hết hàng', color: 'bg-red-100 text-red-800' };
    if (quantity <= threshold) return { status: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Còn hàng', color: 'bg-green-100 text-green-800' };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Kho hàng</h1>
          <p className="mt-2 text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Danh sách Tồn kho</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biến thể
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.low_stock_threshold);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.variant_sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.color && <span className="mr-2">{item.color}</span>}
                          {item.size && <span>{item.size}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.price ? formatPrice(item.price) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingItem?.id === item.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(Number(e.target.value))}
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <button
                              onClick={saveQuantity}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditQuantity(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng sản phẩm</dt>
                    <dd className="text-lg font-medium text-gray-900">{inventory.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Còn hàng</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventory.filter(item => item.quantity > item.low_stock_threshold).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">S</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sắp hết</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventory.filter(item => item.quantity > 0 && item.quantity <= item.low_stock_threshold).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryList;
