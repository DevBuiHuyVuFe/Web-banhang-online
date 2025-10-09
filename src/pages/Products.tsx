import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductService } from '../assets/api/productService';
import { CategoryService } from '../assets/api/categoryService';
import type { Product, ProductVariant, ProductImage, Category } from '../assets/api/types';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    setSelectedCategory(category || '');
    setPage(1);
    loadProducts(1, category);
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const response = await CategoryService.list();
      setCategories(response.data || []);
    } catch (e: any) {
      console.error('Load categories error:', e);
    }
  };

  const loadProducts = async (pageNum = 1, categorySlug?: string | null) => {
    setLoading(true);
    setError('');
    try {
      const res = await ProductService.getList(pageNum, pageSize);
      let filteredProducts = res.data;
      
      // Debug: Log dữ liệu sản phẩm để kiểm tra ảnh
      console.log('Products loaded:', filteredProducts);
      filteredProducts.forEach(product => {
        console.log(`Product ${product.id}:`, {
          name: product.name,
          product_img: product.product_img,
          product_img_alt: product.product_img_alt,
          has_images: product.has_images
        });
      });
      
      // Lọc theo danh mục nếu có
      if (categorySlug) {
        const category = categories.find(c => c.slug === categorySlug);
        if (category) {
          // TODO: Implement category filtering in backend API
          // For now, just show all products
          console.log('Filtering by category:', category.name);
        }
      }
      
      setProducts(filteredProducts);
      setTotal(res.total);
      setPage(res.page);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === '') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categorySlug });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {currentCategory ? currentCategory.name : 'Sản phẩm'}
          </h1>
          {currentCategory && (
            <p className="text-gray-600">
              Danh mục: {currentCategory.name}
            </p>
          )}
        </div>
        
        {/* Category filter */}
        <div className="mt-4 md:mt-0">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentCategory && (
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{currentCategory.name}</span>
        </nav>
      )}

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.product_img ? (
                  <img
                    src={product.product_img}
                    alt={product.product_img_alt || product.name}
                    title={product.product_img_title || product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback về placeholder local khi ảnh lỗi
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.display = 'none';
                      const fallback = imgElement.parentElement?.querySelector('.fallback-placeholder');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                
                {/* Fallback placeholder khi không có ảnh hoặc ảnh lỗi */}
                <div className={`fallback-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${
                  product.product_img ? 'hidden' : ''
                }`}>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm text-gray-600 font-medium px-2">
                      {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="p-4">
              <Link to={`/products/${product.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {product.brand && (
                <p className="text-sm text-gray-600 mb-2">Thương hiệu: {product.brand}</p>
              )}
              
              {product.sku && (
                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {product.price ? (
                    <div>
                      <span>{formatCurrency(product.price.min)}</span>
                      {product.price.has_discount && product.price.compare_min && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.price.compare_min)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">Liên hệ</span>
                  )}
                </div>
                <Link
                  to={`/products/${product.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => loadProducts(page - 1, selectedCategory)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Trước
          </button>
          
          <span className="px-4 py-2">
            Trang {page} / {totalPages}
          </span>
          
          <button
            disabled={page >= totalPages}
            onClick={() => loadProducts(page + 1, selectedCategory)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Sau
          </button>
        </div>
      )}

      {/* Thống kê */}
      <div className="mt-8 text-center text-gray-600">
        Hiển thị {products.length} sản phẩm trong tổng số {total}
        {currentCategory && ` thuộc danh mục "${currentCategory.name}"`}
      </div>
    </div>
  );
};

export default Products; 