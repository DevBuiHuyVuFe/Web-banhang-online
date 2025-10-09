import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/login' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const user = AuthService.getUser();
      
      if (!user) {
        // Không có user, không được phép truy cập
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      if (requireAdmin && user.role !== 'admin') {
        // Yêu cầu admin nhưng user không phải admin
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // User được phép truy cập
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAdmin]);

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

  if (!isAuthorized) {
    // Redirect với thông báo và đường dẫn dự định
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          message: requireAdmin 
            ? 'Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.'
            : 'Vui lòng đăng nhập để truy cập trang này.',
          intendedPath: location.pathname
        }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 