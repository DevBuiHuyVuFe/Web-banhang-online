import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';
import { BoxIcon, LabelIcon, ListIcon, VoucherIcon, StarIcon, SettingsIcon, UserIcon } from '../components/Icons';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      const user = AuthService.getUser();
      
      if (!user) {
        // Không có user, redirect về login với thông báo và đường dẫn dự định
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Vui lòng đăng nhập để truy cập trang admin',
            intendedPath: location.pathname
          }
        });
        return;
      }

      if (user.role !== 'admin') {
        // User không phải admin, redirect về trang chủ
        alert('Bạn không có quyền truy cập trang admin!');
        navigate('/', { replace: true });
        return;
      }

      // User là admin, cho phép truy cập
      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [navigate, location.pathname]);

  const menuItems = [
    { path: '/admin/products', label: 'Sản phẩm', icon: BoxIcon },
    { path: '/admin/categories', label: 'Danh mục', icon: LabelIcon },
    { path: '/admin/users', label: 'Users', icon: UserIcon },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ListIcon },
    { path: '/admin/vouchers', label: 'Vouchers', icon: VoucherIcon },
    { path: '/admin/reviews', label: 'Đánh giá', icon: StarIcon },
    { path: '/admin/inventory', label: 'Kho hàng', icon: ListIcon },
    { path: '/admin/variants', label: 'Biến thể SP', icon: SettingsIcon },
  ];

  // Hiển thị loading khi đang kiểm tra quyền
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị admin layout nếu user là admin
  if (!isAdmin) {
    return null; // Sẽ redirect trong useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Xin chào, {AuthService.getUser()?.full_name || 'Admin'}
              </span>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      isActive
                        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    {React.createElement(item.icon, { className: "mr-3 w-5 h-5" })}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 