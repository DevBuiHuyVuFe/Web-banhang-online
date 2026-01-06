import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService } from '../assets/api/productService';
import { CartService } from '../assets/api/cartService';
import { AuthService } from '../assets/api/authService';
import type { Product, ProductVariant, ProductImage } from '../assets/api/types';
import { CheckIcon, WarningIcon, InfoIcon, XIcon, StarIcon, ShoppingCartIcon, CreditCardIcon, DocumentIcon } from '../components/Icons';

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const loadProduct = async () => {
      try {
        const detail = await ProductService.getDetail(productId);
        setProduct(detail.product);
        setVariants(detail.variants);
        setImages(detail.images);
        if (detail.variants.length > 0) {
          setSelectedVariant(detail.variants[0]);
        }
        // Reset image index khi load sản phẩm mới
        setCurrentImageIndex(0);
        
        // Debug logging
        console.log('ProductDetail loaded:', {
          product: detail.product,
          variants: detail.variants.length,
          images: detail.images.length,
          product_img: detail.product?.product_img
        });
      } catch (e: any) {
        setError(e.message || 'Tải thông tin sản phẩm thất bại');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      setReviewsLoading(true);
      const response = await fetch(`http://localhost:3000/api/products/${productId}/reviews`);
      
      if (response.ok) {
        const data = await response.json();
        // Chỉ hiển thị đánh giá đã được duyệt
        const approvedReviews = (data.data || []).filter((review: Review) => review.is_approved === true);
        setReviews(approvedReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    // Kiểm tra đăng nhập
    const currentUser = AuthService.getUser();
    console.log('[ProductDetail] Current user from AuthService:', currentUser);
    console.log('[ProductDetail] LocalStorage raw:', localStorage.getItem('user'));
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm');
      navigate('/login');
      return;
    }
    
    // Kiểm tra user có id không
    if (!currentUser.id && currentUser.id !== 0) {
      console.error('[ProductDetail] User object missing id:', currentUser);
      console.error('[ProductDetail] User keys:', Object.keys(currentUser));
      alert('Lỗi: Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
      AuthService.clearUser();
      navigate('/login');
      return;
    }

    // Đảm bảo user_id là number
    const userId = Number(currentUser.id);
    if (isNaN(userId) || userId <= 0) {
      console.error('[ProductDetail] Invalid user_id:', currentUser.id, 'Type:', typeof currentUser.id);
      alert('Lỗi: ID người dùng không hợp lệ. Vui lòng đăng nhập lại.');
      AuthService.clearUser();
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {

      const requestBody = {
        product_id: productId,
        user_id: userId,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim()
      };
      
      console.log('[ProductDetail] Current user object:', currentUser);
      console.log('[ProductDetail] Extracted user_id:', userId);
      console.log('[ProductDetail] Sending review request:', requestBody);
      console.log('[ProductDetail] Request body JSON:', JSON.stringify(requestBody));

      const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        alert('Cảm ơn bạn đã đánh giá! Đánh giá sẽ được duyệt trong thời gian sớm nhất.');
        setReviewForm({ rating: 5, title: '', content: '' });
        setShowReviewForm(false);
        // Reload reviews để hiển thị đánh giá mới
        loadReviews();
      } else {
        const error = await response.json();
        alert('Gửi đánh giá thất bại: ' + (error.error || error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    
    setAddingToCart(true);
    try {
      await CartService.addItem(selectedVariant.id, quantity, selectedVariant.price);
      
      // Hiển thị thông báo thành công
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setQuantity(1);
      
      // Trigger reload cart count in header (có thể cần context hoặc event)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (e: any) {
      alert('Thêm vào giỏ hàng thất bại: ' + e.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    
    // Thêm vào giỏ hàng trước, sau đó chuyển đến checkout
    handleAddToCart().then(() => {
      navigate('/checkout');
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'button'}
            onClick={() => interactive && onChange && onChange(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
        {!interactive && (
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        )}
      </div>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
  };

  const getRatingCount = (rating: number) => {
    return reviews.filter(review => review.rating === rating).length;
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  if (error) return <div className="max-w-7xl mx-auto p-4 text-red-600">{error}</div>;

  if (!product) return <div className="max-w-7xl mx-auto p-4">Không tìm thấy sản phẩm</div>;

  // Tạo mảng tất cả ảnh (ảnh chính + ảnh con)
  const allImages: Array<{ url: string; alt: string; title: string }> = [];
  if (product.product_img) {
    allImages.push({
      url: product.product_img,
      alt: product.product_img_alt || product.name,
      title: product.product_img_title || product.name
    });
  }
  images.forEach((image) => {
    allImages.push({
      url: image.url,
      alt: `${product.name} - Image ${image.id}`,
      title: `${product.name} - Image ${image.id}`
    });
  });

  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentImageIndex] || allImages[0];

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Debug logging
  console.log('ProductDetail render:', {
    product,
    variants: variants.length,
    selectedVariant,
    images: images.length,
    product_img: product.product_img,
    allImages: allImages.length,
    currentImageIndex
  });

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Thông báo thành công */}
      {showSuccess && (
        <div className="fixed top-4 right-2 sm:right-4 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg z-50 animate-bounce flex items-center text-sm sm:text-base">
          <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span>Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Ảnh sản phẩm */}
        <div className="space-y-4">
          {/* Slideshow - chỉ hiển thị khi có nhiều ảnh */}
          {hasMultipleImages ? (
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              {/* Ảnh chính */}
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt}
                  title={currentImage.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                    const fallback = imgElement.parentElement?.querySelector('.fallback-placeholder');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              
              {/* Nút Previous */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Ảnh trước"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Nút Next */}
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Ảnh tiếp theo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Chỉ số ảnh */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
              
              {/* Fallback placeholder khi không có ảnh hoặc ảnh lỗi */}
              <div className={`fallback-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${
                currentImage ? 'hidden' : ''
              }`}>
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-lg text-gray-600 font-medium">
                    {product.name}
                  </div>
                  <p className="text-sm text-gray-500">Chưa có ảnh</p>
                </div>
              </div>
            </div>
          ) : (
            // Hiển thị ảnh đơn giản khi chỉ có 1 ảnh
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt}
                  title={currentImage.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
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
                currentImage ? 'hidden' : ''
              }`}>
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-lg text-gray-600 font-medium">
                    {product.name}
                  </div>
                  <p className="text-sm text-gray-500">Chưa có ảnh</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Thumbnail ảnh - chỉ hiển thị khi có nhiều ảnh */}
          {hasMultipleImages && (
            <div className="flex space-x-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt}
                  title={image.title}
                  onClick={() => handleThumbnailClick(index)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-all ${
                    currentImageIndex === index
                      ? 'border-2 border-blue-500 ring-2 ring-blue-200'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex-1 px-0 sm:px-4 md:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Rating Summary */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              <div className="flex items-center space-x-2">
                {renderStars(getAverageRating())}
                <span className="text-lg font-semibold text-gray-900">
                  {getAverageRating()}
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {reviews.length} đánh giá
              </span>
              {reviews.length > 0 && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    {getRatingCount(5)} người đánh giá 5 sao
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

          {product.brand && (
            <p className="text-lg text-gray-600 mb-2">Thương hiệu: {product.brand}</p>
          )}
          {product.sku && (
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          )}
        </div>

          {/* Biến thể sản phẩm */}
          {variants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tùy chọn</h3>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {variant.color && <span className="mr-2">Màu: {variant.color}</span>}
                        {variant.size && <span className="mr-2">Size: {variant.size}</span>}
                        {variant.variant_sku && (
                          <span className="text-sm text-gray-500">({variant.variant_sku})</span>
                        )}
                      </div>
                      <div className="font-semibold text-lg text-blue-600">
                        {formatCurrency(variant.price)}
                      </div>
                    </div>
                    {variant.compare_price && variant.compare_price > variant.price && (
                      <div className="text-sm text-gray-500 line-through mt-1">
                        {formatCurrency(variant.compare_price)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Số lượng và thêm vào giỏ hàng - LUÔN HIỂN THỊ */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <label className="block text-sm font-medium mb-2">Số lượng</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-8 border rounded text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hiển thị giá nếu có biến thể được chọn */}
            {selectedVariant && (
              <div className="text-2xl font-bold text-blue-600">
                Tổng tiền: {formatCurrency(selectedVariant.price * quantity)}
              </div>
            )}

            {/* LUÔN HIỂN THỊ CÁC NÚT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant}
                className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {addingToCart ? 'Đang thêm...' : (
                  <>
                    <ShoppingCartIcon className="w-4 h-4 mr-1 inline" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={addingToCart || !selectedVariant}
                className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center"
              >
                {addingToCart ? 'Đang xử lý...' : (
                  <>
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Mua ngay
                  </>
                )}
              </button>
            </div>

            {/* Thông báo nếu chưa chọn biến thể */}
            {!selectedVariant && variants.length > 0 && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-start">
                <WarningIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div><strong>Vui lòng chọn biến thể sản phẩm</strong> (màu, size) trước khi thêm vào giỏ hàng</div>
              </div>
            )}

            {/* Thông báo nếu không có biến thể */}
            {variants.length === 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start">
                <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div><strong>Sản phẩm này chưa có biến thể.</strong> Vui lòng liên hệ admin để thêm biến thể.</div>
              </div>
            )}
          </div>

          {/* Thông tin bổ sung */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Trạng thái:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_active ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              <div>
                <span className="font-medium">Ngày tạo:</span>
                <span className="ml-2">{new Date(product.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {showReviewForm ? (
                <>
                  <XIcon className="w-4 h-4 mr-1 inline" />
                  Hủy
                </>
              ) : (
                <>
                  <StarIcon className="w-4 h-4 mr-1 inline" />
                  Viết đánh giá
                </>
              )}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                    <span className="text-sm text-gray-600 ml-2">
                      {reviewForm.rating}/5 sao
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề đánh giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tiêu đề đánh giá (tùy chọn)"
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung đánh giá <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewForm.content.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Average Rating */}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getAverageRating()}
              </div>
              <div className="mb-3">
                {renderStars(getAverageRating())}
              </div>
              <p className="text-sm text-gray-600">
                Dựa trên {reviews.length} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="col-span-2 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Phân bố đánh giá</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = getRatingCount(rating);
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm text-gray-600">{rating}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm text-gray-600">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đánh giá từ khách hàng ({reviews.length})
            </h3>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <DocumentIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm text-gray-400">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {(review as any).full_name ? String((review as any).full_name).charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {(review as any).full_name || `User ${review.user_id}`}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.title && (
                          <h5 className="font-medium text-gray-800 mb-2">{review.title}</h5>
                        )}
                        
                        <div className="text-gray-700">
                          {review.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 