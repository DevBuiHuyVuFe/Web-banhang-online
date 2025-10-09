import React, { useState } from 'react';
import { AdminService } from '../../assets/api/adminService';
import { CategoryService } from '../../assets/api/categoryService';
import type { Category, ProductImage } from '../../assets/api/types';

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
  // State cho áº£nh chÃ­nh
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

  // Tá»± Ä‘á»™ng táº¡o slug tá»« tÃªn sáº£n pháº©m
  const generateSlug = (name: string): string => {
    if (!name.trim()) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bá» dáº¥u tiáº¿ng Viá»‡t
      .replace(/[Ä‘Ä]/g, 'd') // Thay Ä‘/Ä thÃ nh d
      .replace(/[^a-z0-9\s-]/g, '') // Chá»‰ giá»¯ chá»¯ cÃ¡i, sá»‘, khoáº£ng tráº¯ng, dáº¥u gáº¡ch
      .replace(/\s+/g, '-') // Thay khoáº£ng tráº¯ng báº±ng dáº¥u gáº¡ch
      .replace(/-+/g, '-') // Loáº¡i bá» dáº¥u gáº¡ch liÃªn tiáº¿p
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

  // Xá»­ lÃ½ upload áº£nh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setForm(prev => ({
        ...prev,
        product_img: URL.createObjectURL(file),
        has_images: true
      }));
    } else {
      alert('Vui lÃ²ng chá»n file áº£nh há»£p lá»‡');
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

  // Quáº£n lÃ½ áº£nh con
  const addProductImage = async () => {
    if (imageMode === 'url' && !newImage.url.trim()) {
      alert('Vui lÃ²ng nháº­p URL áº£nh');
      return;
    }
    
    if (imageMode === 'file' && !newImage.file) {
      alert('Vui lÃ²ng chá»n file áº£nh');
      return;
    }

    try {
      let imageUrl = newImage.url;
      
      if (newImage.file) {
        // Upload file thá»±c táº¿ lÃªn server
        const uploadResult = await AdminService.uploadImage(newImage.file);
        
        // KhÃ´ng cáº§n thÃªm http://localhost:3000 vÃ¬ backend Ä‘Ã£ thÃªm rá»“i
        imageUrl = uploadResult.url;
      }

      // ThÃªm áº£nh con vÃ o danh sÃ¡ch
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
      
      // Reset vá» mode URL
      setImageMode('url');
      
      alert('ThÃªm áº£nh con thÃ nh cÃ´ng!');
    } catch (e: any) {
      alert('ThÃªm áº£nh con tháº¥t báº¡i: ' + e.message);
    }
  };

  const removeProductImage = (index: number) => {
    const removedImage = productImages[index];
    
    // Náº¿u xÃ³a áº£nh chÃ­nh, cáº­p nháº­t áº£nh cha
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
    
    // Cáº­p nháº­t áº£nh cha náº¿u Ä‘áº·t áº£nh chÃ­nh
    if (isPrimary) {
      setForm(prev => ({
        ...prev,
        product_img: productImages[index].url,
        has_images: true
      }));
    }
  };

  // Xá»­ lÃ½ upload file cho áº£nh con
  const handleImageFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setNewImage(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file) // Táº¡o URL táº¡m thá»i Ä‘á»ƒ preview
      }));
    } else {
      alert('Vui lÃ²ng chá»n file áº£nh há»£p lá»‡');
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
        setError('TÃªn vÃ  slug lÃ  báº¯t buá»™c');
        setLoading(false);
        return;
      }

      // Validate SKU khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng
      if (!form.sku.trim()) {
        setError('SKU khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
        setLoading(false);
        return;
      }

      // Validate slug khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng
      if (!form.slug.trim()) {
        setError('Slug khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
        setLoading(false);
        return;
      }

      // Náº¿u cÃ³ file áº£nh má»›i, upload áº£nh trÆ°á»›c
      let imageUrl = form.product_img;
      
      if (selectedFile) {
        // Upload file thá»±c táº¿ lÃªn server
        const uploadResult = await AdminService.uploadImage(selectedFile);
        imageUrl = uploadResult.url;
        
        // KhÃ´ng cáº§n thÃªm http://localhost:3000 vÃ¬ backend Ä‘Ã£ thÃªm rá»“i
        // Cáº­p nháº­t state Ä‘á»ƒ hiá»ƒn thá»‹ preview
        setForm(prev => ({
          ...prev,
          product_img: imageUrl
        }));
      } else if (!form.product_img.trim()) {
        // Náº¿u khÃ´ng cÃ³ file vÃ  khÃ´ng cÃ³ URL
        setError('Vui lÃ²ng chá»n áº£nh hoáº·c nháº­p URL áº£nh');
        setLoading(false);
        return;
      }

      // Táº¡o sáº£n pháº©m trÆ°á»›c
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
      });
      
      // Sau khi táº¡o sáº£n pháº©m thÃ nh cÃ´ng, thÃªm áº£nh con
      if (res.success && productImages.length > 0) {
        for (const image of productImages) {
          try {
            if (image.file) {
              // Upload file thá»±c táº¿ lÃªn server
              const uploadResult = await AdminService.uploadImage(image.file);
              
              // KhÃ´ng cáº§n thÃªm http://localhost:3000 vÃ¬ backend Ä‘Ã£ thÃªm rá»“i
              let imageUrl = uploadResult.url;
              
              // Táº¡o áº£nh con vá»›i URL Ä‘Ã£ upload
              await AdminService.createProductImage(res.id, {
                url: imageUrl,
                is_primary: image.is_primary,
                sort_order: image.sort_order
              });
            } else {
              // Sá»­ dá»¥ng URL
              await AdminService.createProductImage(res.id, {
                url: image.url,
                is_primary: image.is_primary,
                sort_order: image.sort_order
              });
            }
          } catch (e: any) {
            console.error('Error adding product image:', e);
            // Tiáº¿p tá»¥c vá»›i áº£nh tiáº¿p theo náº¿u cÃ³ lá»—i
          }
        }
      }
      
      setMessage(`Táº¡o sáº£n pháº©m thÃ nh cÃ´ng. ID: ${res.id}`);
      
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
      // Xá»­ lÃ½ lá»—i cá»¥ thá»ƒ
      if (err.message && err.message.includes('Duplicate entry')) {
        if (err.message.includes('sku')) {
          setError('SKU Ä‘Ã£ tá»“n táº¡i, vui lÃ²ng chá»n SKU khÃ¡c');
        } else if (err.message.includes('slug')) {
          setError('Slug Ä‘Ã£ tá»“n táº¡i, vui lÃ²ng chá»n tÃªn khÃ¡c');
        } else {
          setError('Dá»¯ liá»‡u Ä‘Ã£ tá»“n táº¡i, vui lÃ²ng kiá»ƒm tra láº¡i');
        }
      } else {
        setError(err.message || 'Táº¡o sáº£n pháº©m tháº¥t báº¡i');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Táº¡o sáº£n pháº©m má»›i</h1>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
          âœ… {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          âŒ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ThÃ´ng tin cÆ¡ báº£n */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">ThÃ´ng tin cÆ¡ báº£n</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                TÃªn sáº£n pháº©m <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nháº­p tÃªn sáº£n pháº©m"
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
                URL-friendly version, tá»± Ä‘á»™ng táº¡o tá»« tÃªn
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
                placeholder="MÃ£ sáº£n pháº©m duy nháº¥t"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                MÃ£ sáº£n pháº©m pháº£i lÃ  duy nháº¥t. VÃ­ dá»¥: IPHONE15-128GB-BLACK
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ThÆ°Æ¡ng hiá»‡u</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="TÃªn thÆ°Æ¡ng hiá»‡u"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">MÃ´ táº£</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="MÃ´ táº£ chi tiáº¿t sáº£n pháº©m"
            />
          </div>
        </div>

        {/* Upload áº£nh */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">áº¢nh sáº£n pháº©m</h2>
          
          {/* Tab buttons Ä‘á»ƒ chá»n phÆ°Æ¡ng thá»©c */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chá»n phÆ°Æ¡ng thá»©c:</label>
            
            {/* Tab buttons */}
            <div className="flex space-x-1 mb-4">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-4 py-2 text-sm rounded ${
                  imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                ðŸ“ Nháº­p URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`px-4 py-2 text-sm rounded ${
                  imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                ðŸ“ Upload File
              </button>
            </div>
          </div>

          {/* PhÆ°Æ¡ng thá»©c nháº­p URL */}
          {imageMode === 'url' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Nháº­p URL áº£nh:</label>
              <input
                type="url"
                name="product_img"
                value={form.product_img}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nháº­p Ä‘Æ°á»ng dáº«n áº£nh tá»« internet
              </p>
            </div>
          )}

          {/* PhÆ°Æ¡ng thá»©c upload file */}
          {imageMode === 'file' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Upload áº£nh tá»« file:</label>
              
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
                      <span>Chá»n áº£nh</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleFileInput}
                      />
                    </label>
                    <span className="text-gray-500"> hoáº·c kÃ©o tháº£ áº£nh vÃ o Ä‘Ã¢y</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF tá»‘i Ä‘a 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview áº£nh Ä‘Ã£ chá»n */}
          {(form.product_img || selectedFile) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">áº¢nh Ä‘Ã£ chá»n:</span>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  ðŸ—‘ï¸ XÃ³a áº£nh
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
                    File má»›i
                  </div>
                )}
              </div>
              {selectedFile && (
                <p className="text-xs text-green-600 mt-2">
                  ðŸ“ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Alt text vÃ  Title cho áº£nh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alt text cho áº£nh</label>
              <input
                type="text"
                name="product_img_alt"
                value={form.product_img_alt}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MÃ´ táº£ áº£nh cho SEO"
              />
              <p className="text-xs text-gray-500 mt-1">
                MÃ´ táº£ áº£nh cho ngÆ°á»i dÃ¹ng khiáº¿m thá»‹ vÃ  SEO
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Title cho áº£nh</label>
              <input
                type="text"
                name="product_img_title"
                value={form.product_img_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tooltip khi hover áº£nh"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tooltip hiá»ƒn thá»‹ khi hover chuá»™t vÃ o áº£nh
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
              Sáº£n pháº©m cÃ³ áº£nh
            </label>
            <p className="text-xs text-gray-500 ml-2">
              ÄÃ¡nh dáº¥u náº¿u sáº£n pháº©m cÃ³ áº£nh Ä‘á»ƒ hiá»ƒn thá»‹
            </p>
          </div>
        </div>

        {/* Quáº£n lÃ½ áº£nh con */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quáº£n lÃ½ áº£nh con (Gallery)</h2>
          
          {/* Form thÃªm áº£nh con má»›i */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">ThÃªm áº£nh con má»›i</h3>
            
            {/* Upload file hoáº·c nháº­p URL */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Chá»n phÆ°Æ¡ng thá»©c:</label>
              
              {/* Tab buttons */}
              <div className="flex space-x-1 mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 text-sm rounded ${
                    imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ðŸ“ Nháº­p URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-3 py-1 text-sm rounded ${
                    imageMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ðŸ“ Upload File
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
                          <span>Chá»n áº£nh</span>
                          <input 
                            id="image-file-upload" 
                            name="image-file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={handleImageFileInput}
                          />
                        </label>
                        <span className="text-gray-500"> hoáº·c kÃ©o tháº£ áº£nh vÃ o Ä‘Ã¢y</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF tá»‘i Ä‘a 10MB
                      </p>
                    </div>
                  </div>
                  
                  {/* File preview */}
                  {newImage.file && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">File Ä‘Ã£ chá»n:</span>
                        <button
                          type="button"
                          onClick={removeImageFile}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          ðŸ—‘ï¸ XÃ³a file
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
                <label className="block text-sm font-medium mb-1">Thá»© tá»±</label>
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
                  áº¢nh chÃ­nh
                </label>
              </div>
            </div>
            
            <button
              type="button"
              onClick={addProductImage}
              disabled={(imageMode === 'url' && !newImage.url.trim()) || (imageMode === 'file' && !newImage.file)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              âž• ThÃªm áº£nh con
            </button>
          </div>
          
          {/* Danh sÃ¡ch áº£nh con Ä‘Ã£ thÃªm */}
          <div>
            <h3 className="font-medium mb-3">áº¢nh con Ä‘Ã£ thÃªm ({productImages.length})</h3>
            
            {productImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>ChÆ°a cÃ³ áº£nh con nÃ o</p>
                <p className="text-sm">ThÃªm áº£nh con Ä‘á»ƒ táº¡o gallery cho sáº£n pháº©m</p>
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
                          {image.is_primary ? 'â­ ChÃ­nh' : 'â­ Äáº·t chÃ­nh'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeProductImage(index)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          ðŸ—‘ï¸ XÃ³a
                        </button>
                      </div>
                    </div>
                    
                    {/* Badge cho áº£nh chÃ­nh */}
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        â­ ChÃ­nh
                      </div>
                    )}
                    
                    {/* ThÃ´ng tin áº£nh */}
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Thá»© tá»±: {image.sort_order}</div>
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

        {/* CÃ i Ä‘áº·t khÃ¡c */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">CÃ i Ä‘áº·t khÃ¡c</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Danh má»¥c</label>
              <select
                name="category_id"
                value={form.category_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chá»n danh má»¥c</option>
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
                KÃ­ch hoáº¡t sáº£n pháº©m
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
            Há»§y
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {loading ? 'ðŸ”„ Äang táº¡o...' : 'âž• Táº¡o sáº£n pháº©m'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;
