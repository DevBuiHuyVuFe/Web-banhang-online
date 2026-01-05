import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../assets/api/authService';

interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

const AdminVoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    id: 0,
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 1,
    valid_from: '',
    valid_until: '',
    is_active: true
  });
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 1,
    valid_from: '',
    valid_until: '',
    is_active: true
  });
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    voucher_id: '',
    assign_to_all: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadVouchers();
    loadUsers();
  }, [navigate]);

  const loadVouchers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/vouchers?admin=1', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users?admin=1', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        alert('Tạo voucher thành công!');
        setShowCreateForm(false);
        setCreateForm({
          code: '',
          name: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 0,
          min_order_amount: 0,
          max_discount: 0,
          usage_limit: 1,
          valid_from: '',
          valid_until: '',
          is_active: true
        });
        loadVouchers();
      } else {
        const error = await response.json();
        alert('Tạo voucher thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('Tạo voucher thất bại');
    }
  };

  const handleEditVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/vouchers/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert('Cập nhật voucher thành công!');
        setShowEditForm(false);
        setEditForm({
          id: 0,
          code: '',
          name: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 0,
          min_order_amount: 0,
          max_discount: 0,
          usage_limit: 1,
          valid_from: '',
          valid_until: '',
          is_active: true
        });
        loadVouchers();
      } else {
        const error = await response.json();
        alert('Cập nhật voucher thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      alert('Cập nhật voucher thất bại');
    }
  };

  const openEditForm = (voucher: Voucher) => {
    setEditForm({
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_amount: voucher.min_order_amount,
      max_discount: voucher.max_discount || 0,
      usage_limit: voucher.usage_limit,
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      is_active: voucher.is_active
    });
    setShowEditForm(true);
  };

  const handleAssignVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/user-vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(assignForm)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Gán voucher thành công!');
        setShowAssignForm(false);
        setAssignForm({
          user_id: '',
          voucher_id: '',
          assign_to_all: false
        });
      } else {
        const error = await response.json();
        alert('Gán voucher thất bại: ' + (error.error || error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error assigning voucher:', error);
      alert('Gán voucher thất bại');
    }
  };

  const toggleVoucherStatus = async (voucherId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/vouchers/${voucherId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        loadVouchers();
      } else {
        alert('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const deleteVoucher = async (voucherId: number) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/vouchers/${voucherId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Xóa voucher thành công!');
        loadVouchers();
      } else {
        alert('Xóa voucher thất bại');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Xóa voucher thất bại');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Voucher</h1>
          <p className="mt-2 text-gray-600">Tạo và quản lý voucher cho khách hàng</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Voucher
          </button>
          <button
            onClick={() => setShowAssignForm(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Gán Voucher
          </button>
        </div>

        {/* Vouchers List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Danh sách Voucher</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điều kiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hạn sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{voucher.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{voucher.name}</div>
                      {voucher.description && (
                        <div className="text-sm text-gray-500">{voucher.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatCurrency(voucher.discount_value)}
                      </div>
                      {voucher.max_discount && voucher.discount_type === 'percentage' && (
                        <div className="text-xs text-gray-500">Tối đa: {formatCurrency(voucher.max_discount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Đơn hàng tối thiểu: {formatCurrency(voucher.min_order_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {voucher.used_count}/{voucher.usage_limit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Từ: {formatDate(voucher.valid_from)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Đến: {formatDate(voucher.valid_until)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        voucher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {voucher.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleVoucherStatus(voucher.id, voucher.is_active)}
                        className={`mr-2 px-3 py-1 rounded text-xs ${
                          voucher.is_active 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {voucher.is_active ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => openEditForm(voucher)}
                        className="px-3 py-1 rounded text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteVoucher(voucher.id)}
                        className="px-3 py-1 rounded text-xs bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Voucher Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm Voucher Mới</h3>
                <form onSubmit={handleCreateVoucher} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.code}
                      onChange={(e) => setCreateForm({...createForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VOUCHER123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Giảm giá 20%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Mô tả chi tiết về voucher"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={createForm.discount_type}
                        onChange={(e) => setCreateForm({...createForm, discount_type: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá trị giảm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={createForm.discount_value}
                        onChange={(e) => setCreateForm({...createForm, discount_value: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={createForm.discount_type === 'percentage' ? '20' : '50000'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn hàng tối thiểu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={createForm.min_order_amount}
                      onChange={(e) => setCreateForm({...createForm, min_order_amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100000"
                    />
                  </div>
                  
                  {createForm.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm giá tối đa
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={createForm.max_discount}
                        onChange={(e) => setCreateForm({...createForm, max_discount: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100000"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới hạn sử dụng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.usage_limit}
                      onChange={(e) => setCreateForm({...createForm, usage_limit: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Có hiệu lực từ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.valid_from}
                        onChange={(e) => setCreateForm({...createForm, valid_from: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Có hiệu lực đến <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.valid_until}
                        onChange={(e) => setCreateForm({...createForm, valid_until: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={createForm.is_active}
                      onChange={(e) => setCreateForm({...createForm, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Kích hoạt ngay
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Tạo Voucher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Voucher Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sửa Voucher</h3>
                <form onSubmit={handleEditVoucher} className="space-y-4">
                  <input type="hidden" value={editForm.id} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VOUCHER123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Voucher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Giảm giá 20%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Mô tả chi tiết về voucher"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={editForm.discount_type}
                        onChange={(e) => setEditForm({...editForm, discount_type: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá trị giảm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editForm.discount_value}
                        onChange={(e) => setEditForm({...editForm, discount_value: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editForm.discount_type === 'percentage' ? '20' : '50000'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn hàng tối thiểu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.min_order_amount}
                      onChange={(e) => setEditForm({...editForm, min_order_amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100000"
                    />
                  </div>
                  
                  {editForm.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm giá tối đa
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.max_discount}
                        onChange={(e) => setEditForm({...editForm, max_discount: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100000"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới hạn sử dụng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editForm.usage_limit}
                      onChange={(e) => setEditForm({...editForm, usage_limit: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Có hiệu lực từ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.valid_from}
                        onChange={(e) => setEditForm({...editForm, valid_from: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Có hiệu lực đến <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.valid_until}
                        onChange={(e) => setEditForm({...editForm, valid_until: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Kích hoạt ngay
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Lưu Sửa
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Voucher Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gán Voucher cho Người dùng</h3>
                <form onSubmit={handleAssignVoucher} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn Voucher <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={assignForm.voucher_id}
                      onChange={(e) => setAssignForm({...assignForm, voucher_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn voucher</option>
                      {vouchers.filter(v => v.is_active).map(voucher => (
                        <option key={voucher.id} value={voucher.id}>
                          {voucher.code} - {voucher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn Người dùng
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="assign_specific_user"
                          name="assign_type"
                          value="specific"
                          checked={assignForm.user_id !== ''}
                          onChange={() => setAssignForm({...assignForm, user_id: '', assign_to_all: false})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="assign_specific_user" className="ml-2 block text-sm text-gray-900">
                          Gán cho người dùng cụ thể
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="assign_all_users"
                          name="assign_type"
                          value="all"
                          checked={assignForm.assign_to_all}
                          onChange={() => setAssignForm({...assignForm, user_id: '', assign_to_all: true})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="assign_all_users" className="ml-2 block text-sm text-gray-900">
                          Gán cho tất cả người dùng
                        </label>
                      </div>
                    </div>
                    
                    {assignForm.user_id !== '' && (
                      <select
                        required
                        value={assignForm.user_id}
                        onChange={(e) => setAssignForm({...assignForm, user_id: e.target.value, assign_to_all: false})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                      >
                        <option value="">Chọn người dùng</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {assignForm.assign_to_all && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                           Voucher sẽ được gán cho TẤT CẢ người dùng đang hoạt động!
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAssignForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!assignForm.voucher_id || (!assignForm.user_id && !assignForm.assign_to_all)}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gán Voucher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVoucherList;
