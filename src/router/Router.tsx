import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Checkout from '../pages/Checkout';
import NotFound from '../pages/NotFound';
import Orders from '../pages/Orders';
import About from '../pages/About';
import Contact from '../pages/Contact';

import Layout from '../component/Layout';
import AdminLayout from '../component/AdminLayout';
import ProtectedRoute from '../component/ProtectedRoute';
import AdminProductList from '../pages/admin/AdminProductList';
import AdminProductCreate from '../pages/admin/AdminProductCreate';
import AdminProductImages from '../pages/admin/AdminProductImages';
import AdminCategoryList from '../pages/admin/AdminCategoryList';
import AdminCategoryCreate from '../pages/admin/AdminCategoryCreate';
import AdminUserList from '../pages/admin/AdminUserList';
import AdminOrderList from '../pages/admin/AdminOrderList';
import AdminVoucherList from '../pages/admin/AdminVoucherList';
import AdminReviewList from '../pages/admin/AdminReviewList';
import AdminInventoryList from '../pages/admin/AdminInventoryList';
import AdminProductVariantList from '../pages/admin/AdminProductVariantList';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin routes - được bảo vệ bởi ProtectedRoute */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true} redirectTo="/login">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="categories" element={<AdminCategoryList />} />
          <Route path="categories/new" element={<AdminCategoryCreate />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/new" element={<AdminProductCreate />} />
          <Route path="products/:id/images" element={<AdminProductImages />} />
          <Route path="users" element={<AdminUserList />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="vouchers" element={<AdminVoucherList />} />
          <Route path="reviews" element={<AdminReviewList />} />
          <Route path="inventory" element={<AdminInventoryList />} />
          <Route path="variants" element={<AdminProductVariantList />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
