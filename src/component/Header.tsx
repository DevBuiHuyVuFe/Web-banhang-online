import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';
import { CartService } from '../assets/api/cartService';
import { CategoryService } from '../assets/api/categoryService';
import type { User, Category } from '../assets/api/types';
import { ChevronDownIcon, ShoppingCartIcon, MenuIcon, XIcon } from '../components/Icons';
import { API_BASE_URL } from '../assets/api/http';

// Helper function để build full URL cho avatar
const getAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  // Lấy base URL từ API_BASE_URL (bỏ /api ở cuối)
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${avatar}`;
};

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
    
    // Load cart item count
    const loadCartCount = async () => {
      try {
        const cart = await CartService.getCart();
        setCartItemCount(CartService.calculateTotalQuantity(cart.items));
      } catch (e) {
        console.error('Load cart count error:', e);
      }
    };
    loadCartCount();

    // Load categories
    const loadCategories = async () => {
      try {
        const response = await CategoryService.list();
        setCategories(response.data || []);
      } catch (e) {
        console.error('Load categories error:', e);
      }
    };
    loadCategories();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };
    
    // Listen for auth changes
    const handleAuthChange = () => {
      const currentUser = AuthService.getUser();
      setUser(currentUser);
      if (!currentUser) {
        setCartItemCount(0);
      } else {
        loadCartCount();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('authChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    AuthService.clearUser();
    setUser(null);
    setCartItemCount(0);
    // Reload để update toàn bộ UI
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            Shop Điện thoại VIP
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            
            {/* Danh mục dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Danh mục</span>
                <ChevronDownIcon />
              </button>
              
              {/* Categories dropdown */}
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.length > 0 ? (
                  <>
                    <Link
                      to="/products"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                    >
                       Tất cả sản phẩm
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Đang tải danh mục...
                  </div>
                )}
              </div>
            </div>
            
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Mobile menu button và tên user/login */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            {/* Hiển thị tên user hoặc login/signup trên mobile */}
            {user ? (
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate text-center justify-center flex">
                {user.full_name}
              </span>
            ) : (
              <div className="flex items-center space-x-1">
                <Link
                  to="/login"
                  className="text-xs px-2 py-1 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/register"
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCartIcon />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Hiển thị tên người dùng */}
                <span className="text-gray-700 font-medium hidden lg:block">
                  Xin chào, <span className="text-blue-600">{user.full_name}</span>
                </span>
                
                {/* Avatar hoặc icon */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    {user.avatar ? (
                      <img 
                        src={getAvatarUrl(user.avatar)}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          // Fallback về avatar mặc định nếu ảnh lỗi
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
                    >
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Hồ sơ
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/products"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Quản trị
                      </Link>
                    )}
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile cart button */}
          <Link to="/cart" className="md:hidden relative text-gray-700 hover:text-blue-600 transition-colors ml-2">
            <ShoppingCartIcon />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              
              {/* Mobile categories */}
              <div>
                <button
                  onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Danh mục</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${mobileCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCategoryOpen && (
                  <div className="pl-4 mt-2 space-y-2">
                    <Link
                      to="/products"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileCategoryOpen(false);
                      }}
                    >
                      Tất cả sản phẩm
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileCategoryOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                to="/products" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>

              {/* Mobile user menu */}
              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2 flex items-center space-x-3">
                    {user.avatar ? (
                      <img 
                        src={getAvatarUrl(user.avatar)}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          // Fallback về avatar mặc định nếu ảnh lỗi
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
                    >
                      <span className="text-blue-600 font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/products"
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  )}
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col space-y-2 px-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-gray-700 hover:text-blue-600 transition-colors border border-gray-300 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
