import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setEditForm({
      full_name: currentUser.full_name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || ''
    });
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Cập nhật thông tin user
    const updatedUser = { ...user, ...editForm };
    setUser(updatedUser);
    setIsEditing(false);
    
    // Lưu vào localStorage (có thể cập nhật API sau)
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleCancel = () => {
    setEditForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  if (!user) {
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="mt-2 text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Họ và tên
                  </label>
                  <p className="text-sm text-gray-900">{user.full_name || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Số điện thoại
                  </label>
                  <p className="text-sm text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link đến đơn hàng */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý đơn hàng</h3>
              <p className="text-gray-600 mb-4">Xem và quản lý tất cả đơn hàng của bạn</p>
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Xem đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 