// Sửa file AdminReviewList.tsx để thêm ?admin=1 vào tất cả các request
import React, { useState, useEffect } from 'react';
import { AuthService } from '../../assets/api/authService';

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
        const errorData = await response.json();
        console.error('Failed to load reviews:', errorData);
        alert('Lỗi tải danh sách đánh giá: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      alert('Lỗi tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch(http://localhost:3000/api/reviews//approve?admin=1, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Duyệt đánh giá thành công!');
      } else {
        const errorData = await response.json();
        console.error('Approve error:', errorData);
        alert('Duyệt đánh giá thất bại: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Duyệt đánh giá thất bại!');
    }
  };

  const rejectReview = async (reviewId: number) => {
    try {
      const response = await fetch(http://localhost:3000/api/reviews//reject?admin=1, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Từ chối đánh giá thành công!');
      } else {
        const errorData = await response.json();
        console.error('Reject error:', errorData);
        alert('Từ chối đánh giá thất bại: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Từ chối đánh giá thất bại!');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      const response = await fetch(http://localhost:3000/api/reviews/?admin=1, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadReviews();
        alert('Xóa đánh giá thành công!');
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        alert('Xóa đánh giá thất bại: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Xóa đánh giá thất bại!');
    }
  };
