import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, FacebookIcon, PinterestIcon, LocationIcon, PhoneIcon, EmailIcon } from '../components/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold">Web Bán Hàng</span>
            </div>
            <p className="text-gray-300 mb-4">
              Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả hợp lý. 
              Đảm bảo sự hài lòng của khách hàng là ưu tiên hàng đầu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <PinterestIcon />
              </a>
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <LocationIcon />
                123 Đường ABC, Quận 1, TP.HCM
              </li>
              <li className="flex items-center">
                <PhoneIcon />
                0123 456 789
              </li>
              <li className="flex items-center">
                <EmailIcon />
                contact@webbanhang.com
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Web Bán Hàng. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
