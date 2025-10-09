import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await AuthService.register({ email, password, full_name: fullName, phone });
      if (res?.success && res.user) {
        AuthService.setUser(res.user);
        setSuccess('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => navigate('/profile'), 600);
      } else {
        setError(res?.message || 'Đăng ký thất bại');
      }
    } catch (e: any) {
      setError(e?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Đăng ký</h1>

        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-3 text-green-600 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="0123 456 789"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-4 text-center">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 