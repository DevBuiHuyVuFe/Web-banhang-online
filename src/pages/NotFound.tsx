import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Trang không tồn tại</h2>
        <p className="text-gray-500 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </Link>
          
          <Link
            to="/products"
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 