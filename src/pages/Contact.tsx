import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Liên Hệ
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Gửi Tin Nhắn
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0123456789"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Thông tin chung</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="billing">Thanh toán</option>
                    <option value="shipping">Vận chuyển</option>
                    <option value="product">Sản phẩm</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Thông Tin Liên Hệ
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">📍</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Địa Chỉ</h4>
                    <p className="text-gray-600">
                      123 Đường Nguyễn Huệ, Quận 1<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">📞</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Điện Thoại</h4>
                    <p className="text-gray-600">
                      <a href="tel:+84123456789" className="hover:text-blue-600 transition-colors">
                        +84 28 1234 5678
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">✉️</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">
                      <a href="mailto:info@shoponline.vn" className="hover:text-blue-600 transition-colors">
                        info@shoponline.vn
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">🕒</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Giờ Làm Việc</h4>
                    <p className="text-gray-600">
                      Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                      Thứ 7: 8:00 - 12:00<br />
                      Chủ nhật: Nghỉ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Kết Nối Với Chúng Tôi
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-2xl">📘</div>
                  <span className="font-medium text-gray-900">Facebook</span>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                  <div className="text-2xl">📷</div>
                  <span className="font-medium text-gray-900">Instagram</span>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-2xl">🐦</div>
                  <span className="font-medium text-gray-900">Twitter</span>
                </a>
                
                <a href="#" className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="text-2xl">📺</div>
                  <span className="font-medium text-gray-900">YouTube</span>
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Câu Hỏi Thường Gặp
              </h3>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Làm thế nào để đặt hàng?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Bạn có thể đặt hàng trực tuyến thông qua website hoặc ứng dụng di động của chúng tôi.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thời gian giao hàng là bao lâu?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Thời gian giao hàng từ 1-3 ngày làm việc tùy thuộc vào địa điểm giao hàng.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Có thể đổi trả sản phẩm không?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Có, chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày mua hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Vị Trí Của Chúng Tôi
            </h3>
            
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg">Bản đồ sẽ được hiển thị ở đây</p>
                <p className="text-sm">Google Maps Integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 