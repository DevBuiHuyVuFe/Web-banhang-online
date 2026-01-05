import React, { useState } from 'react';
import { AdminService } from '../../assets/api/adminService';
import { CategoryService } from '../../assets/api/categoryService';
import type { Category } from '../../assets/api/types';
import { TrashIcon, ClockIcon, CheckIcon, XIcon, FileIcon, PlusIcon, StarIcon } from '../../components/Icons';

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
}

interface ProductImageFormData {
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File | null;
}

const AdminProductCreate: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>({
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
  });
  const [productImages, setProductImages] = useState<ProductImageFormData[]>([]);
  const [newImage, setNewImage] = useState<ProductImageFormData>({
    url: '',
    is_primary: false,
    sort_order: 0
  });
  // State cho ảnh chính
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [imageDragActive, setImageDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load categories khi component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await CategoryService.list();
        setCategories(response.data || []);
      } catch (e: any) {
        console.error('Load categories error:', e);
      }
    };
    loadCategories();
  }, []);

  // Tự động tạo slug từ tên sản phẩm
  const generateSlug = (name: string): string => {
    if (!name.trim()) return '';
    
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
    const slug = generateSlug(name);
    setForm(prev => ({
      ...prev,
      name,
      slug: slug
    }));
  };

  // Xử lý upload ảnh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setForm(prev => ({
        ...prev,
        product_img: URL.createObjectURL(file),
        has_images: true
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

  // Quản lý ảnh con
  const addProductImage = async () => {
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
      }

      // Thêm ảnh con vào danh sách
      const newProductImage = {
        url: imageUrl,
        is_primary: newImage.is_primary,
        sort_order: newImage.sort_order,
        file: newImage.file
      };
      
      setProductImages(prev => [...prev, newProductImage]);
      
      // Reset form
      setNewImage({
        url: '',
        is_primary: false,
        sort_order: 0,
        file: null
      });
      
      // Reset về mode URL
      setImageMode('url');
      
      alert('Thêm ảnh con thành công!');
    } catch (e: any) {
      alert('Thêm ảnh con thất bại: ' + e.message);
    }
  };

  const removeProductImage = (index: number) => {
    const removedImage = productImages[index];
    
    // Nếu xóa ảnh chính, cập nhật ảnh cha
    if (removedImage.is_primary && form.product_img === removedImage.url) {
      setForm(prev => ({
        ...prev,
        product_img: '',
        has_images: productImages.length > 1
      }));
    }
    
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImagePrimary = (index: number, isPrimary: boolean) => {
    setProductImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index ? isPrimary : false
    })));
    
    // Cập nhật ảnh cha nếu đặt ảnh chính
    if (isPrimary) {
      setForm(prev => ({
        ...prev,
        product_img: productImages[index].url,
        has_images: true
      }));
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

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setForm(prev => ({
      ...prev,
      product_img: ''
    }));
    setImageMode('url');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      if (!form.name || !form.slug) {
        setError('Tên và slug là bắt buộc');
        setLoading(false);
        return;
      }

      // Validate SKU không được để trống
      if (!form.sku.trim()) {
        setError('SKU không được để trống');
        setLoading(false);
        return;
      }

      // Validate slug không được để trống
      if (!form.slug.trim()) {
        setError('Slug không được để trống');
        setLoading(false);
        return;
      }

      // Nếu có file ảnh mới, upload ảnh trước
      let imageUrl = form.product_img;
      
      if (selectedFile) {
        // Upload file thực tế lên server
        const uploadResult = await AdminService.uploadImage(selectedFile);
        imageUrl = uploadResult.url;
        
        // Không cần thêm http://localhost:3000 vì backend đã thêm rồi
        // Cập nhật state để hiển thị preview
        setForm(prev => ({
          ...prev,
          product_img: imageUrl
        }));
      } else if (!form.product_img.trim()) {
        // Nếu không có file và không có URL
        setError('Vui lòng chọn ảnh hoặc nhập URL ảnh');
        setLoading(false);
        return;
      }

      // Tạo sản phẩm trước
      const res = await AdminService.createProduct({
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        description: form.description?.trim() || undefined,
        product_img: imageUrl,
        product_img_alt: form.product_img_alt?.trim() || undefined,
        product_img_title: form.product_img_title?.trim() || undefined,
        has_images: form.has_images,
        brand: form.brand?.trim() || undefined,
        is_active: form.is_active,
        category_id: form.category_id || undefined,
      } as any);
      
      // Sau khi tạo sản phẩm thành công, thêm ảnh con
      if (res.success && productImages.length > 0) {
        for (const image of productImages) {
          try {
            if (image.file) {
              // Upload file thực tế lên server
              const uploadResult = await AdminService.uploadImage(image.file);
              
              // Không cần thêm http://localhost:3000 vì backend đã thêm rồi
              let imageUrl = uploadResult.url;
              
              // Tạo ảnh con với URL đã upload
              await AdminService.createProductImage(res.id, {
                url: imageUrl,
                is_primary: image.is_primary,
                sort_order: image.sort_order
              });
            } else {
              // Sử dụng URL
              await AdminService.createProductImage(res.id, {
                url: image.url,
                is_primary: image.is_primary,
                sort_order: image.sort_order
              });
            }
          } catch (e: any) {
            console.error('Error adding product image:', e);
            // Tiếp tục với ảnh tiếp theo nếu có lỗi
          }
        }
      }
      
      setMessage(`Tạo sản phẩm thành công. ID: ${res.id}`);
      
      // Reset form
      setForm({
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
      });
      setSelectedFile(null);
      setProductImages([]);
      setNewImage({
        url: '',
        is_primary: false,
        sort_order: 0
      });
      
    } catch (err: any) {
      // Xử lý lỗi cụ thể
      if (err.message && err.message.includes('Duplicate entry')) {
        if (err.message.includes('sku')) {
          setError('SKU đã tồn tại, vui lòng chọn SKU khác');
        } else if (err.message.includes('slug')) {
          setError('Slug đã tồn tại, vui lòng chọn tên khác');
        } else {
          setError('Dữ liệu đã tồn tại, vui lòng kiểm tra lại');
        }
      } else {
        setError(err.message || 'Tạo sản phẩm thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tạo sản phẩm mới</h1>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-center">
          <CheckIcon className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center">
          <XIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ten-san-pham"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version, tự động tạo từ tên
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mã sản phẩm duy nhất"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mã sản phẩm phải là duy nhất. Ví dụ: IPHONE15-128GB-BLACK
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Thương hiệu</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tên thương hiệu"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Mô tả chi tiết sản phẩm"
            />
          </div>
        </div>

        {/* Upload ảnh */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ảnh sản phẩm</h2>
          
          {/* Tab buttons để chọn phương thức */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chọn phương thức:</label>
            
            {/* Tab buttons */}
            <div className="flex space-x-1 mb-4">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-4 py-2 text-sm rounded ${
                  imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                🔗 Nhập URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`px-4 py-2 text-sm rounded ${
                  imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FileIcon className="w-4 h-4 mr-1 inline" />
                Upload File
              </button>
            </div>
          </div>

          {/* Phương thức nhập URL */}
          {imageMode === 'url' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Nhập URL ảnh:</label>
              <input
                type="url"
                name="product_img"
                value={form.product_img}
                onChange={handleChange}
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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Upload ảnh từ file:</label>
              
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Chọn ảnh</span>
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

          {/* Preview ảnh đã chọn */}
          {(form.product_img || selectedFile) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Ảnh đã chọn:</span>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-4 h-4 mr-1 inline" />
                  Xóa ảnh
                </button>
              </div>
              <div className="relative">
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : form.product_img}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                  }}
                />
                {selectedFile && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    File mới
                  </div>
                )}
              </div>
              {selectedFile && (
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <FileIcon className="w-3 h-3 mr-1" />
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Alt text và Title cho ảnh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alt text cho ảnh</label>
              <input
                type="text"
                name="product_img_alt"
                value={form.product_img_alt}
                onChange={handleChange}
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
                name="product_img_title"
                value={form.product_img_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tooltip khi hover ảnh"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tooltip hiển thị khi hover chuột vào ảnh
              </p>
            </div>
          </div>

          {/* Checkbox has_images */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="has_images"
              name="has_images"
              checked={form.has_images}
              onChange={(e) => setForm(prev => ({ ...prev, has_images: e.target.checked }))}
              className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="has_images" className="text-sm font-medium">
              Sản phẩm có ảnh
            </label>
            <p className="text-xs text-gray-500 ml-2">
              Đánh dấu nếu sản phẩm có ảnh để hiển thị
            </p>
          </div>
        </div>

        {/* Quản lý ảnh con */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quản lý ảnh con (Gallery)</h2>
          
          {/* Form thêm ảnh con mới */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Thêm ảnh con mới</h3>
            
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
                  🔗 Nhập URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-3 py-1 text-sm rounded ${
                    imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <FileIcon className="w-4 h-4 mr-1 inline" />
                  Upload File
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
                          <TrashIcon className="w-4 h-4 mr-1 inline" />
                          Xóa file
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Thêm ảnh con
            </button>
          </div>
          
          {/* Danh sách ảnh con đã thêm */}
          <div>
            <h3 className="font-medium mb-3">Ảnh con đã thêm ({productImages.length})</h3>
            
            {productImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Chưa có ảnh con nào</p>
                <p className="text-sm">Thêm ảnh con để tạo gallery cho sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Product image ${index + 1}`}
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
                          onClick={() => updateImagePrimary(index, !image.is_primary)}
                          className={`px-2 py-1 text-xs rounded ${
                            image.is_primary 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {image.is_primary ? (
                            <>
                              <StarIcon className="w-4 h-4 mr-1 inline" />
                              Chính
                            </>
                          ) : (
                            <>
                              <StarIcon className="w-4 h-4 mr-1 inline" />
                              Đặt chính
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeProductImage(index)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <TrashIcon className="w-4 h-4 mr-1 inline" />
                          Xóa
                        </button>
                      </div>
                    </div>
                    
                    {/* Badge cho ảnh chính */}
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Chính
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

        {/* Cài đặt khác */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Cài đặt khác</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                name="category_id"
                value={form.category_id || ''}
                onChange={handleChange}
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Kích hoạt sản phẩm
              </label>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {loading ? (
              <>
                <ClockIcon className="w-4 h-4 mr-1 inline" />
                Đang tạo...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-1 inline" />
                Tạo sản phẩm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;