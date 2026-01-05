import React, { useState, useEffect } from 'react';

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
  is_approved: boolean;
  user: {
    full_name: string;
    email: string;
  };
  product: {
    name: string;
    image_url?: string;
  };
  title?: string;
  content?: string;
}

const AdminReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/reviews?admin=1', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      } else {
        console.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}/approve?admin=1`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Duyệt đánh giá thành công!');
      } else {
        alert('Duyệt đánh giá thất bại!');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Duyệt đánh giá thất bại!');
    }
  };

  const rejectReview = async (reviewId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}/reject?admin=1`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Từ chối đánh giá thành công!');
      } else {
        alert('Từ chối đánh giá thất bại!');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Từ chối đánh giá thất bại!');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}?admin=1`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Xóa đánh giá thành công!');
      } else {
        alert('Xóa đánh giá thất bại!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Xóa đánh giá thất bại!');
    }
  };

  const getFilteredReviews = () => {
    switch (filter) {
      case 'pending':
        return reviews.filter(review => !review.is_approved);
      case 'approved':
        return reviews.filter(review => review.is_approved);
      case 'rejected':
        return reviews.filter(review => !review.is_approved);
      default:
        return reviews;
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đánh giá</h1>
          <p className="mt-2 text-gray-600">Duyệt và quản lý đánh giá sản phẩm</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tất cả ({reviews.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chờ duyệt ({reviews.filter(r => !r.is_approved).length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'approved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã duyệt ({reviews.filter(r => r.is_approved).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Danh sách Đánh giá</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {getFilteredReviews().map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {review.user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.user.full_name}</p>
                        <p className="text-sm text-gray-500">{review.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">({review.rating}/5)</span>
                      </div>
                      {review.title && (
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      <p className="text-sm text-gray-700">{review.content || review.comment}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Sản phẩm: {review.product.name}</span>
                      <span></span>
                      <span>{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(review.is_approved)}
                    <div className="flex space-x-1">
                      {!review.is_approved && (
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        onClick={() => rejectReview(review.id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {getFilteredReviews().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Không có đánh giá nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewList;
