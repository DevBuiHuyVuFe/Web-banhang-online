import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../assets/api/authService';
import { CartService } from '../assets/api/cartService';
import { CategoryService } from '../assets/api/categoryService';
import type { User, Category } from '../assets/api/types';
import { ChevronDownIcon, ShoppingCartIcon } from '../components/Icons';

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

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
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    AuthService.clearUser();
    setUser(null);
    setCartItemCount(0);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
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

          {/* User actions */}
          <div className="flex items-center space-x-4">
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
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <span>{user.full_name}</span>
                  <ChevronDownIcon />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
