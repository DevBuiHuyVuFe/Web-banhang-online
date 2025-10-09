import React, { useEffect, useState } from 'react';
import { AdminService } from '../../assets/api/adminService';
import type { Category } from '../../assets/api/types';

const AdminCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: null as number | null,
    sort_order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getCategories();
      setCategories(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tạo slug từ tên danh mục
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd') // Thay đ/Đ thành d
      .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ cái, số, khoảng trắng, dấu gạch
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch
      .replace(/-+/g, '-') // Loại bỏ dấu gạch liên tiếp
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      alert('Vui lòng điền tên và slug danh mục');
      return;
    }

    try {
      if (editingCategory) {
        // Update category
        await AdminService.updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id,
          sort_order: formData.sort_order
        });
        alert('Cập nhật danh mục thành công!');
      } else {
        // Create new category
        await AdminService.createCategory({
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id,
          sort_order: formData.sort_order
        });
        alert('Tạo danh mục thành công!');
      }
      
      // Reset form and reload
      resetForm();
      loadCategories();
    } catch (e: any) {
      alert('Thao tác thất bại: ' + e.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || null,
      sort_order: category.sort_order
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
      await AdminService.deleteCategory(categoryId);
      alert('Xóa danh mục thành công!');
      loadCategories();
    } catch (e: any) {
      alert('Xóa danh mục thất bại: ' + e.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      parent_id: null,
      sort_order: 0
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const getParentName = (parentId: number | null | undefined) => {
    if (!parentId) return 'Danh mục gốc';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Không xác định';
  };

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + Thêm Danh mục
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Form thêm/sửa danh mục */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục Mới'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Điện thoại di động"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tên hiển thị cho người dùng
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="dien-thoai-di-dong"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version, tự động tạo từ tên
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục cha</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Danh mục gốc</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Để trống nếu là danh mục cấp cao nhất
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số càng nhỏ càng hiển thị trước
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách danh mục */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục cha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thứ tự
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {category.slug}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getParentName(category.parent_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.sort_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có danh mục nào
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryList; 
