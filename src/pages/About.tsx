import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Về Shop Điện thoại VIP
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Nền tảng mua sắm trực tuyến hàng đầu Việt Nam
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Company Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Câu Chuyện Của Chúng Tôi
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                ShopOnline được thành lập với tầm nhìn mang đến trải nghiệm mua sắm trực tuyến 
                tốt nhất cho người dân Việt Nam. Chúng tôi tin rằng mọi người đều xứng đáng 
                được tiếp cận với những sản phẩm chất lượng cao.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Từ những ngày đầu tiên với chỉ vài sản phẩm, đến nay chúng tôi đã phục vụ 
                hàng nghìn khách hàng với hàng trăm sản phẩm đa dạng từ các thương hiệu uy tín.
              </p>
              <p className="text-lg text-gray-600">
                Chúng tôi cam kết không ngừng cải tiến để mang đến dịch vụ tốt nhất cho khách hàng.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-2">Thành Lập 2024</h3>
                  <p className="text-blue-100">Bắt đầu hành trình phục vụ khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sứ Mệnh & Tầm Nhìn
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những giá trị thiết thực cho khách hàng và cộng đồng
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh</h3>
              <p className="text-gray-600">
                Cung cấp nền tảng mua sắm trực tuyến an toàn, tiện lợi và đáng tin cậy, 
                giúp khách hàng tiết kiệm thời gian và chi phí trong việc mua sắm hàng ngày.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tầm Nhìn</h3>
              <p className="text-gray-600">
                Trở thành nền tảng thương mại điện tử hàng đầu, được yêu thích và tin tưởng 
                bởi hàng triệu người dùng Việt Nam.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc không thay đổi trong mọi hoạt động của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl">💎</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chất Lượng</h3>
              <p className="text-gray-600">
                Cam kết cung cấp sản phẩm chất lượng cao, đảm bảo sự hài lòng của khách hàng
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl">🤝</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tin Cậy</h3>
              <p className="text-gray-600">
                Xây dựng mối quan hệ dài hạn dựa trên sự tin tưởng và minh bạch
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl">🚀</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Đổi Mới</h3>
              <p className="text-gray-600">
                Không ngừng cải tiến công nghệ và dịch vụ để mang đến trải nghiệm tốt nhất
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn ShopOnline?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đa Dạng Sản Phẩm</h3>
              <p className="text-gray-600 text-sm">
                Hàng trăm sản phẩm từ các thương hiệu uy tín
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Giao Hàng Nhanh</h3>
              <p className="text-gray-600 text-sm">
                Giao hàng trong 1-3 ngày làm việc
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Giá Cả Hợp Lý</h3>
              <p className="text-gray-600 text-sm">
                Giá tốt nhất với nhiều ưu đãi hấp dẫn
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bảo Mật Tuyệt Đối</h3>
              <p className="text-gray-600 text-sm">
                Thông tin cá nhân được bảo vệ an toàn
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thành Tựu Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Những con số ấn tượng phản ánh sự tin tưởng của khách hàng
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1K+</div>
              <p className="text-gray-600">Khách hàng</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600">Sản phẩm</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
              <p className="text-gray-600">Hài lòng</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600">Hỗ trợ</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn Sàng Trải Nghiệm?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Khám phá ngay hàng nghìn sản phẩm chất lượng cao với giá cả hợp lý
            </p>
            <div className="space-x-4">
              <a
                href="/products"
                className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Mua sắm ngay
              </a>
              <a
                href="/contact"
                className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Liên hệ chúng tôi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 