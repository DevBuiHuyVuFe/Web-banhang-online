// Sửa lỗi frontend - thêm ?admin=1 vào các request
// Dùng base URL động để chạy được cả trên localhost và domain (Vercel)
const API_BASE =
  (window && window.location && window.location.origin
    ? window.location.origin + '/api'
    : 'http://localhost:3000/api');

const approveReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE}/reviews/approve?admin=1`, {
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

const rejectReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE}/reviews/reject?admin=1`, {
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

const deleteReview = async (reviewId) => {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/reviews?admin=1`, {
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
