import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductService } from '../assets/api/productService';
import { CategoryService } from '../assets/api/categoryService';
import type { Product, ProductVariant, ProductImage, Category } from '../assets/api/types';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
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
    // Đợi categories load xong trước khi load products với category filter
    if (categoriesLoading) return;
    
    const category = searchParams.get('category');
    setSelectedCategory(category || '');
    setPage(1);
    loadProducts(1, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categoriesLoading]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await CategoryService.list();
      const loadedCategories = response.data || [];
      setCategories(loadedCategories);
      console.log('Categories loaded:', loadedCategories);
    } catch (e: any) {
      console.error('Load categories error:', e);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async (pageNum = 1, categorySlug?: string | null) => {
    setLoading(true);
    setError('');
    try {
      // Gửi category slug đến backend để lọc sản phẩm
      const res = await ProductService.getList(pageNum, pageSize, categorySlug || null);
      let filteredProducts = res.data;
      
      // Debug: Log dữ liệu sản phẩm để kiểm tra ảnh
      console.log('Products loaded:', filteredProducts);
      if (categorySlug) {
        console.log('Filtering by category slug:', categorySlug);
        const category = categories.find(c => c.slug === categorySlug);
        if (category) {
          console.log('Category found:', category.name);
        } else {
          console.warn('Category not found in local cache:', categorySlug);
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

  if (loading || categoriesLoading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // So sánh slug không phân biệt hoa thường và loại bỏ khoảng trắng
  const currentCategory = categories.find(c => 
    c.slug?.toLowerCase().trim() === selectedCategory?.toLowerCase().trim()
  );
  
  // Debug log
  if (selectedCategory) {
    console.log('Selected category slug:', selectedCategory);
    console.log('Available categories:', categories.map(c => ({ name: c.name, slug: c.slug })));
    console.log('Current category found:', currentCategory);
  }

  // Nếu không tìm thấy category chính xác, thử tìm gần đúng (loại bỏ ký tự lặp lại ở cuối)
  let matchedCategory = currentCategory;
  if (!matchedCategory && selectedCategory) {
    const normalizedSlug = selectedCategory.toLowerCase().trim();
    // Thử tìm category có slug tương tự (ví dụ: dien-thoaii -> dien-thoai)
    matchedCategory = categories.find(c => {
      const catSlug = c.slug?.toLowerCase().trim() || '';
      // So sánh chính xác
      if (catSlug === normalizedSlug) return true;
      // So sánh loại bỏ ký tự lặp lại ở cuối (ví dụ: dien-thoaii vs dien-thoai)
      const normalizedCatSlug = catSlug.replace(/(.)\1+$/, '$1');
      const normalizedSelectedSlug = normalizedSlug.replace(/(.)\1+$/, '$1');
      return normalizedCatSlug === normalizedSelectedSlug;
    });
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {matchedCategory ? matchedCategory.name : selectedCategory ? `Danh mục: ${selectedCategory}` : 'Sản phẩm'}
          </h1>
          {matchedCategory ? (
            <p className="text-gray-600">
              Danh mục: {matchedCategory.name}
            </p>
          ) : selectedCategory ? (
            <p className="text-gray-500 text-sm">
              Không tìm thấy danh mục với slug: {selectedCategory}
            </p>
          ) : null}
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
      {selectedCategory && (
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{matchedCategory ? matchedCategory.name : selectedCategory}</span>
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
        {matchedCategory && ` thuộc danh mục "${matchedCategory.name}"`}
      </div>
    </div>
  );
};

export default Products; 