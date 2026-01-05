import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartService } from '../assets/api/cartService';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const MomoReturn: React.FC = () => {
  const q = useQuery();
  const navigate = useNavigate();

  const orderId = q.get('orderId') || q.get('order_id') || '';
  const resultCode = q.get('resultCode') || q.get('result_code') || '';
  const message = q.get('message') || q.get('localMessage') || '';
  const [cleared, setCleared] = useState(false);

  const isSuccess = String(resultCode) === '0';

  useEffect(() => {
    // Nếu thanh toán thành công thì clear cart
    if (isSuccess && !cleared) {
      CartService.clearCart()
        .then(() => setCleared(true))
        .catch(() => setCleared(true));
    }
  }, [isSuccess, cleared]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Kết quả thanh toán MoMo</h1>

        <div className={`mt-4 p-4 rounded border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công'}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            {message ? `Thông báo: ${message}` : 'Bạn có thể kiểm tra trạng thái đơn hàng trong trang hồ sơ/đơn hàng.'}
          </div>
          {orderId && (
            <div className="text-sm text-gray-700 mt-2">
              Mã đơn (MoMo orderId): <span className="font-mono font-semibold">{orderId}</span>
            </div>
          )}
          {isSuccess && (
            <div className="text-xs text-gray-600 mt-2">
              {cleared ? 'Đã xoá giỏ hàng sau thanh toán.' : 'Đang xoá giỏ hàng...'}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </button>
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-600">Xem chi tiết (query params)</summary>
          <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
{JSON.stringify(Object.fromEntries(q.entries()), null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default MomoReturn;


