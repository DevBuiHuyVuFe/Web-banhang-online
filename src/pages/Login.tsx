import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra xem có thông báo từ redirect không
    if (location.state?.message) {
      setInfo(location.state.message);
      // Xóa state để không hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await AuthService.login(formData);
      if (response.success) {
        AuthService.setUser(response.user);
        
        // Kiểm tra xem user có phải admin không
        if (response.user.role === 'admin') {
          // Nếu là admin, có thể redirect về admin dashboard
          const intendedPath = location.state?.intendedPath || '/admin/products';
          navigate(intendedPath);
        } else {
          // Nếu không phải admin, về trang chủ
          navigate('/');
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              đăng ký tài khoản mới
            </Link>
          </p>
        </div>
        
        {/* Thông báo thông tin */}
        {info && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{info}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Thông báo lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 