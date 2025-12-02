import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../assets/api/productService';
import type { Product } from '../assets/api/types';
import { 
  FlameIcon, 
  NewIcon, 
  StarIcon, 
  PhoneDeviceIcon, 
  LaptopIcon, 
  TabletIcon, 
  HeadphoneIcon, 
  PlugIcon, 
  HomeIcon 
} from '../components/Icons';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Load featured products (using getList for now)
        const featuredResponse = await ProductService.getList(1, 8);
        setFeaturedProducts(featuredResponse.data || []);

        // Load new products
        const newResponse = await ProductService.getList(1, 8);
        setNewProducts(newResponse.data || []);

        // Load top rated products
        const topRatedResponse = await ProductService.getList(1, 8);
        setTopRatedProducts(topRatedResponse.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { name: 'Hot Deals', icon: <FlameIcon className="w-5 h-5 text-orange-600" />, link: '/products?hot=true' },
    { name: 'Sản phẩm mới', icon: <NewIcon className="w-5 h-5 text-blue-600" />, link: '/products?new=true' },
    { name: 'Đánh giá cao', icon: <StarIcon className="w-5 h-5 text-yellow-600" />, link: '/products?rating=4' },
    { name: 'Điện thoại', icon: <PhoneDeviceIcon className="w-5 h-5" />, link: '/products?category=phone' },
    { name: 'Laptop', icon: <LaptopIcon className="w-5 h-5" />, link: '/products?category=laptop' },
    { name: 'Tablet', icon: <TabletIcon className="w-5 h-5" />, link: '/products?category=tablet' },
    { name: 'Tai nghe', icon: <HeadphoneIcon className="w-5 h-5" />, link: '/products?category=headphone' },
    { name: 'Phụ kiện', icon: <PlugIcon className="w-5 h-5" />, link: '/products?category=accessories' },
    { name: 'Tất cả', icon: <HomeIcon className="w-5 h-5" />, link: '/products' },
  ];

  const formatPrice = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getProductImage = (product: Product) => {
    // Ảnh đã được backend trả về full URL; nếu không có ảnh thì dùng logo mặc định
    // Lưu ý: '/vite.svg' luôn tồn tại trong thư mục public nên sẽ không bị lỗi 404
    return product.product_img || '/vite.svg';
  };

  const getProductPrice = (product: Product) => {
    if (product.price && product.price.min != null) {
      return Number(product.price.min);
    }
    return 0;
  };

  const getOriginalPrice = (product: Product) => {
    if (product.price?.compare_min != null) {
      return Number(product.price.compare_min);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Chào mừng đến với ShopOnline</h1>
          <p className="text-xl mb-8">Khám phá những sản phẩm công nghệ tốt nhất với giá cả hợp lý</p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Mua sắm ngay
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
              <Link to="/products?featured=true" className="text-blue-600 hover:text-blue-800 font-medium">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return; // tránh loop vô hạn
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Sản phẩm mới</h2>
              <Link to="/products?new=true" className="text-blue-600 hover:text-blue-800 font-medium">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return;
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Products */}
      {topRatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Sản phẩm đánh giá cao</h2>
              <Link to="/products?rating=4" className="text-blue-600 hover:text-blue-800 font-medium">
                Xem tất cả 
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRatedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.endsWith('/vite.svg')) return;
                          img.src = '/vite.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(getProductPrice(product))}
                        </span>
                        {getOriginalPrice(product) && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(getOriginalPrice(product)!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng mua sắm?</h2>
          <p className="text-xl mb-8">Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả tốt nhất</p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
