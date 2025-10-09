// Sửa lỗi frontend - thêm ?admin=1 vào các request
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
