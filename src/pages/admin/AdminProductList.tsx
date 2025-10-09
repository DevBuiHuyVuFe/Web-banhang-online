import React, { useEffect, useState } from 'react';
import { ProductService } from '../../assets/api/productService';
import { AdminService } from '../../assets/api/adminService';
import { CategoryService } from '../../assets/api/categoryService';
import type { Product, Category, ProductImage } from '../../assets/api/types';
import { Link } from 'react-router-dom';


interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description: string;
  product_img: string;
  product_img_alt: string;
  product_img_title: string;
  has_images: boolean;
  brand: string;
  category_id: number | null;
  is_active: boolean;
  primary_image_file: File | null;
}

interface ProductImageFormData {
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File | null;
}

const AdminProductList: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImage, setNewImage] = useState<ProductImageFormData>({
    url: '',
    is_primary: false,
    sort_order: 0
  });
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [dragActive, setDragActive] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    sku: '',
    description: '',
    product_img: '',
    product_img_alt: '',
    product_img_title: '',
    has_images: false,
    brand: '',
    category_id: null,
    is_active: true,
    primary_image_file: null
  });

  useEffect(() => {
    load(1);
    loadCategories();
  }, []);

  const load = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await ProductService.getList(p, pageSize);
      setItems(res.data);
      setTotal(res.total);
      setPage(res.page);
    } catch (e: any) {
      setError(e.message || 'Tải sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await CategoryService.list();
      setCategories(response.data || []);
    } catch (e: any) {
      console.error('Load categories error:', e);
    }
  };

  // Tự động tạo slug từ tên sản phẩm
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd') // Thay đ/Đ thành d
      .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ cái, số, khoảng trắng, dấu gạch
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch
      .replace(/-+/g, '-') // Loại bỏ dấu gạch liên tiếp
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku || '',
      description: product.description || '',
      product_img: product.product_img || '',
      product_img_alt: product.product_img_alt || '',
      product_img_title: product.product_img_title || '',
      has_images: product.has_images || false,
      brand: product.brand || '',
      category_id: null, // TODO: Load category_id from product_category table
      is_active: product.is_active,
      primary_image_file: null
    });
    
    // Set imageMode dựa trên product_img
    if (product.product_img && product.product_img.startsWith('http')) {
      setImageMode('url');
    } else {
      setImageMode('file');
    }
    
    // Load ảnh con từ product_images
    try {
      const detail = await ProductService.getDetail(product.id);
      setProductImages(detail.images || []);
    } catch (e: any) {
      console.error('Load product images error:', e);
      setProductImages([]);
    }
    
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      alert('Vui lòng điền tên và slug sản phẩm');
      return;
    }

    try {
      if (editingProduct) {
        // Nếu có file ảnh mới, upload ảnh trước
        let imageUrl = formData.product_img;
        
        if (formData.primary_image_file) {
          // Upload file thực tế lên server
          const uploadResult = await AdminService.uploadImage(formData.primary_image_file);
          imageUrl = uploadResult.url;
          
          // Không cần thêm http://localhost:3000 vì backend đã thêm rồi
        }

        await AdminService.updateProduct(editingProduct.id, {
          name: formData.name,
          slug: formData.slug,
          sku: formData.sku,
          description: formData.description,
          product_img: imageUrl,
          product_img_alt: formData.product_img_alt,
          product_img_title: formData.product_img_title,
          has_images: formData.has_images,
          brand: formData.brand,
          is_active: formData.is_active
        });
        
        alert('Cập nhật sản phẩm thành công!');
      }
      
      // Reset form and reload
      setShowEditModal(false);
      setEditingProduct(null);
      load(page);
    } catch (e: any) {
      alert('Thao tác thất bại: ' + e.message);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await AdminService.deleteProduct(productId);
      alert('Xóa sản phẩm thành công!');
      load(page);
    } catch (e: any) {
      alert('Xóa sản phẩm thất bại: ' + e.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      sku: '',
      description: '',
      product_img: '',
      product_img_alt: '',
      product_img_title: '',
      has_images: false,
      brand: '',
      category_id: null,
      is_active: true,
      primary_image_file: null
    });
    setEditingProduct(null);
    setProductImages([]);
    setNewImage({
      url: '',
      is_primary: false,
      sort_order: 0
    });
    setImageMode('url');
    setShowEditModal(false);
  };

  // Xử lý upload ảnh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        primary_image_file: file,
        primary_image_url: URL.createObjectURL(file)
      }));
    } else {
      alert('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      primary_image_file: null,
      product_img: ''
    }));
    setImageMode('url');
  };

  // Quản lý ảnh con
  const addProductImage = async () => {
    if (!editingProduct) {
      alert('Không tìm thấy sản phẩm để chỉnh sửa');
      return;
    }

    if (imageMode === 'url' && !newImage.url.trim()) {
      alert('Vui lòng nhập URL ảnh');
      return;
    }
    
    if (imageMode === 'file' && !newImage.file) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    try {
      let imageUrl = newImage.url;
      
      if (newImage.file) {
        // Upload file thực tế lên server
        const uploadResult = await AdminService.uploadImage(newImage.file);
        
        // Không cần thêm http://localhost:3000 vì backend đã thêm rồi
        imageUrl = uploadResult.url;
        
        // Tạo ảnh con với URL đã upload
        await AdminService.createProductImage(editingProduct.id, {
          url: imageUrl,
          is_primary: newImage.is_primary,
          sort_order: newImage.sort_order
        });
      } else {
        // Sử dụng URL
        await AdminService.createProductImage(editingProduct.id, {
          url: imageUrl,
          is_primary: newImage.is_primary,
          sort_order: newImage.sort_order
        });
      }

      // Reload ảnh con
      const detail = await ProductService.getDetail(editingProduct.id);
      setProductImages(detail.images || []);
      
      // Reset form
      setNewImage({
        url: '',
        is_primary: false,
        sort_order: 0
      });
      
      // Reset về mode URL
      setImageMode('url');
      
      alert('Thêm ảnh con thành công!');
    } catch (e: any) {
      alert('Thêm ảnh con thất bại: ' + e.message);
    }
  };

  const deleteProductImage = async (imageId: number) => {
    if (!editingProduct) return;
    
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    
    try {
      await AdminService.deleteProductImage(editingProduct.id, imageId);
      
      // Reload ảnh con
      const detail = await ProductService.getDetail(editingProduct.id);
      setProductImages(detail.images || []);
      
      alert('Xóa ảnh con thành công!');
    } catch (e: any) {
      alert('Xóa ảnh con thất bại: ' + e.message);
    }
  };

  const updateProductImagePrimary = async (imageId: number, isPrimary: boolean) => {
    if (!editingProduct) return;
    
    try {
      // Cập nhật trạng thái primary
      await AdminService.updateProductImage(imageId, {
        is_primary: isPrimary
      });
      
      // Reload ảnh con
      const detail = await ProductService.getDetail(editingProduct.id);
      setProductImages(detail.images || []);
      
      alert('Cập nhật ảnh chính thành công!');
    } catch (e: any) {
      alert('Cập nhật ảnh chính thất bại: ' + e.message);
    }
  };

  // Xử lý upload file cho ảnh con
  const handleImageFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setNewImage(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file) // Tạo URL tạm thời để preview
      }));
    } else {
      alert('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleImageDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImageDragActive(true);
    } else if (e.type === "dragleave") {
      setImageDragActive(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImageFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFileSelect(e.target.files[0]);
    }
  };

  const removeImageFile = () => {
    setNewImage(prev => ({
      ...prev,
      file: null,
      url: ''
    }));
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;
  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <div className="space-x-2">
          <Link 
            to="/admin/products/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Tạo sản phẩm
          </Link>
          <button 
            onClick={() => load(page)} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên & Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thương hiệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 object-cover rounded-lg border shadow-sm">
                      {product.product_img ? (
                        <img
                          src={product.product_img}
                          alt={`Product ${product.name}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {product.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.brand || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có sản phẩm nào
          </div>
        )}
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Trang {page}/{totalPages} - Tổng {total} sản phẩm
        </div>
        <div className="space-x-2">
          <button 
            disabled={page <= 1} 
            onClick={() => load(page - 1)} 
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            ← Trước
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => load(page + 1)} 
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Modal sửa sản phẩm */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Sửa sản phẩm: {editingProduct?.name}</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ten-san-pham"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL-friendly version, tự động tạo từ tên
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mã sản phẩm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tên thương hiệu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết sản phẩm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Danh mục</label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value ? Number(e.target.value) : null})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ảnh đại diện</label>
                  
                  {/* Tab buttons để chọn phương thức */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Chọn phương thức:</label>
                    
                    {/* Tab buttons */}
                    <div className="flex space-x-1 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode('url');
                          setFormData(prev => ({
                            ...prev,
                            primary_image_file: null
                          }));
                        }}
                        className={`px-4 py-2 text-sm rounded ${
                          imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        📝 Nhập URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode('file');
                          setFormData(prev => ({
                            ...prev,
                            product_img: ''
                          }));
                        }}
                        className={`px-4 py-2 text-sm rounded ${
                          imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        📁 Upload File
                      </button>
                    </div>
                  </div>

                  {/* Phương thức nhập URL */}
                  {imageMode === 'url' && (
                    <div className="mb-4">
                      <input
                        type="url"
                        value={formData.product_img}
                        onChange={(e) => setFormData({...formData, product_img: e.target.value})}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nhập đường dẫn ảnh từ internet
                      </p>
                    </div>
                  )}

                  {/* Phương thức upload file */}
                  {imageMode === 'file' && (
                    <div className="mb-4">
                      {/* Drag & Drop Zone */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload ảnh</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleFileInput}
                              />
                            </label>
                            <span className="text-gray-500"> hoặc kéo thả ảnh vào đây</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF tối đa 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Preview */}
                  {(formData.product_img || formData.primary_image_file) && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Ảnh đã chọn:</span>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          🗑️ Xóa ảnh
                        </button>
                      </div>
                      <div className="relative">
                        <img
                          src={formData.primary_image_file ? URL.createObjectURL(formData.primary_image_file) : formData.product_img}
                          alt="Preview"
                          className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                          }}
                        />
                        {formData.primary_image_file && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            File mới
                          </div>
                        )}
                      </div>
                      {formData.primary_image_file && (
                        <p className="text-xs text-green-600 mt-2">
                          📁 {formData.primary_image_file.name} ({(formData.primary_image_file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Alt text và Title cho ảnh */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Alt text cho ảnh</label>
                    <input
                      type="text"
                      value={formData.product_img_alt}
                      onChange={(e) => setFormData({...formData, product_img_alt: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả ảnh cho SEO"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mô tả ảnh cho người dùng khiếm thị và SEO
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Title cho ảnh</label>
                    <input
                      type="text"
                      value={formData.product_img_title}
                      onChange={(e) => setFormData({...formData, product_img_title: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tooltip khi hover ảnh"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tooltip hiển thị khi hover chuột vào ảnh
                    </p>
                  </div>
                </div>

                {/* Checkbox has_images */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_images"
                    checked={formData.has_images}
                    onChange={(e) => setFormData({...formData, has_images: e.target.checked})}
                    className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="has_images" className="text-sm font-medium">
                    Sản phẩm có ảnh
                  </label>
                  <p className="text-xs text-gray-500 ml-2">
                    Đánh dấu nếu sản phẩm có ảnh để hiển thị
                  </p>
                </div>

                {/* Quản lý ảnh con */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quản lý ảnh con (Gallery)</h3>
                  
                  {/* Form thêm ảnh con mới */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Thêm ảnh con mới</h4>
                    
                    {/* Upload file hoặc nhập URL */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-2">Chọn phương thức:</label>
                      
                      {/* Tab buttons */}
                      <div className="flex space-x-1 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageMode('url')}
                          className={`px-3 py-1 text-sm rounded ${
                            imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          📝 Nhập URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('file')}
                          className={`px-3 py-1 text-sm rounded ${
                            imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          📁 Upload File
                        </button>
                      </div>
                      
                      {/* URL Input */}
                      {imageMode === 'url' && (
                        <input
                          type="url"
                          value={newImage.url}
                          onChange={(e) => setNewImage({...newImage, url: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      )}
                      
                      {/* File Upload */}
                      {imageMode === 'file' && (
                        <div>
                          <div
                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                              imageDragActive 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleImageDrag}
                            onDragLeave={handleImageDrag}
                            onDragOver={handleImageDrag}
                            onDrop={handleImageDrop}
                          >
                            <div className="space-y-2">
                              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-sm text-gray-600">
                                <label htmlFor="image-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Chọn ảnh</span>
                                  <input 
                                    id="image-file-upload" 
                                    name="image-file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={handleImageFileInput}
                                  />
                                </label>
                                <span className="text-gray-500"> hoặc kéo thả ảnh vào đây</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF tối đa 10MB
                              </p>
                            </div>
                          </div>
                          
                          {/* File preview */}
                          {newImage.file && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">File đã chọn:</span>
                                <button
                                  type="button"
                                  onClick={removeImageFile}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  🗑️ Xóa file
                                </button>
                              </div>
                              <div className="flex items-center space-x-3">
                                {newImage.url && (
                                  <img
                                    src={newImage.url}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                )}
                                <div className="text-sm">
                                  <div className="font-medium">{newImage.file.name}</div>
                                  <div className="text-gray-500">
                                    {(newImage.file.size / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Thứ tự</label>
                        <input
                          type="number"
                          value={newImage.sort_order}
                          onChange={(e) => setNewImage({...newImage, sort_order: Number(e.target.value)})}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_primary"
                          checked={newImage.is_primary}
                          onChange={(e) => setNewImage({...newImage, is_primary: e.target.checked})}
                          className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="is_primary" className="text-sm font-medium">
                          Ảnh chính
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addProductImage}
                      disabled={(imageMode === 'url' && !newImage.url.trim()) || (imageMode === 'file' && !newImage.file)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ➕ Thêm ảnh con
                    </button>
                  </div>
                  
                  {/* Danh sách ảnh con hiện có */}
                  <div>
                    <h4 className="font-medium mb-3">Ảnh con hiện có ({productImages.length})</h4>
                    
                    {productImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Chưa có ảnh con nào</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={`Product image ${image.id}`}
                              className="w-full h-32 object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                              }}
                            />
                            
                            {/* Overlay controls */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => updateProductImagePrimary(image.id, !image.is_primary)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    image.is_primary 
                                      ? 'bg-yellow-600 text-white' 
                                      : 'bg-blue-600 text-white'
                                  }`}
                                >
                                  {image.is_primary ? '⭐ Chính' : '⭐ Đặt chính'}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => deleteProductImage(image.id)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                            
                            {/* Badge cho ảnh chính */}
                            {image.is_primary && (
                              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                ⭐ Chính
                              </div>
                            )}
                            
                            {/* Thông tin ảnh */}
                            <div className="mt-2 text-xs text-gray-600">
                              <div>Thứ tự: {image.sort_order}</div>
                              <div className="truncate" title={image.url}>
                                {image.url.length > 30 ? image.url.substring(0, 30) + '...' : image.url}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    💾 Cập nhật
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList; 

