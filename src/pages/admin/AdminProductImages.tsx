import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  EditIcon, 
  DeleteIcon, 
  PlusIcon, 
  MinusIcon,
  TrashIcon,
  ImageIcon, 
  AdminIcon, 
  EmptyBoxIcon,
  CheckIcon,
  XIcon,
  SuccessIcon,
  ErrorIcon
} from '../../components/Icons';
import { ProductService } from '../../assets/api/productService';
import { AdminService } from '../../assets/api/adminService';
import type { Product, ProductImage } from '../../assets/api/types';

interface NewImageData {
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File | null;
}

const AdminProductImages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newImage, setNewImage] = useState<NewImageData>({ 
    url: '', 
    is_primary: false, 
    sort_order: 0,
    file: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProduct = async () => {
    if (!productId) return;
    try {
      const detail = await ProductService.getDetail(productId);
      setProduct(detail.product);
      setImages(detail.images);
    } catch (e: any) {
      setError(e.message || 'Táº£i thÃ´ng tin sáº£n pháº©m tháº¥t báº¡i');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Xá»­ lÃ½ upload áº£nh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setNewImage(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file)
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

  const removeSelectedFile = () => {
    setNewImage(prev => ({
      ...prev,
      file: null,
      url: ''
    }));
  };

  const handleAddImage = async () => {
    if (!newImage.url.trim() && !newImage.file) return;
    
    setUploading(true);
    try {
      if (newImage.file) {
        // TODO: Implement file upload to server
        console.log('Uploading file:', newImage.file.name);
        // const uploadedUrl = await uploadImage(newImage.file);
        // await AdminService.createProductImage(productId, {
        //   url: uploadedUrl,
        //   is_primary: newImage.is_primary,
        //   sort_order: newImage.sort_order
        // });
        alert('Chá»©c nÄƒng upload file sáº½ Ä‘Æ°á»£c implement sau!');
      } else {
        // Sá»­ dá»¥ng URL
        await AdminService.createProductImage(productId, {
          url: newImage.url,
          is_primary: newImage.is_primary,
          sort_order: newImage.sort_order
        });
      }
      
      setNewImage({ url: '', is_primary: false, sort_order: 0, file: null });
      loadProduct(); // Reload Ä‘á»ƒ láº¥y áº£nh má»›i
    } catch (e: any) {
      setError(e.message || 'ThÃªm áº£nh tháº¥t báº¡i');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a áº£nh nÃ y?')) return;
    try {
      await AdminService.deleteProductImage(productId, imageId);
      loadProduct();
    } catch (e: any) {
      setError(e.message || 'XÃ³a áº£nh tháº¥t báº¡i');
    }
  };

  if (loading) return <div>Äang táº£i...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!product) return <div>Sáº£n pháº©m khÃ´ng tá»“n táº¡i</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quáº£n lÃ½ áº£nh: {product.name}</h1>
        <button onClick={() => loadProduct()} className="px-3 py-2 bg-gray-200 rounded">
          LÃ m má»›i
        </button>
      </div>

      {/* Form thÃªm áº£nh má»›i */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">ThÃªm áº£nh má»›i</h2>
        
        {/* Upload áº£nh tá»« file */}
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

        {/* Hoáº·c nháº­p URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-600">
            Hoáº·c nháº­p URL áº£nh:
          </label>
          <input
            type="url"
            value={newImage.url}
            onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Preview áº£nh Ä‘Ã£ chá»n */}
        {(newImage.url || newImage.file) && (
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
              {newImage.url && (
                <img
                  src={newImage.url}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                  }}
                />
              )}
              {newImage.file && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  File má»›i
                </div>
              )}
            </div>
            {newImage.file && (
              <p className="text-xs text-green-600 mt-2">
                ðŸ“ {newImage.file.name} ({(newImage.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* CÃ¡c tÃ¹y chá»n khÃ¡c */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Thá»© tá»±</label>
            <input
              type="number"
              value={newImage.sort_order}
              onChange={(e) => setNewImage({ ...newImage, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newImage.is_primary}
                onChange={(e) => setNewImage({ ...newImage, is_primary: e.target.checked })}
                className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">áº¢nh chÃ­nh</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddImage}
              disabled={uploading || (!newImage.url.trim() && !newImage.file)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'ðŸ”„ Äang xá»­ lÃ½...' : 'âž• ThÃªm áº£nh'}
            </button>
          </div>
        </div>
      </div>

      {/* Danh sÃ¡ch áº£nh */}
      <div className="bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold p-6 border-b border-gray-200">Danh sÃ¡ch áº£nh ({images.length})</h2>
        {images.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">ChÆ°a cÃ³ áº£nh nÃ o</p>
            <p className="text-sm">HÃ£y thÃªm áº£nh Ä‘áº§u tiÃªn cho sáº£n pháº©m nÃ y</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {images.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={image.url}
                    alt={`áº¢nh ${image.id}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ID: {image.id}</span>
                    <span className="text-xs text-gray-500">Thá»© tá»±: {image.sort_order}</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      image.is_primary 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {image.is_primary ? 'ðŸ–¼ï¸ áº¢nh chÃ­nh' : 'ðŸ“· áº¢nh phá»¥'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    ðŸ—‘ï¸ XÃ³a
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductImages; 
