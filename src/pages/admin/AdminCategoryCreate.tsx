import React, { useEffect, useState } from 'react';
import { CategoryService } from '../../assets/api/categoryService';
import type { CategoryDTO } from '../../assets/api/categoryService';

const AdminCategoryCreate: React.FC = () => {
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '' as string, sort_order: 0 });
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    CategoryService.list().then(r => setCats(r.data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const parentId = form.parent_id ? Number(form.parent_id) : undefined;
      const res = await CategoryService.create({ name: form.name, slug: form.slug, parent_id: parentId, sort_order: form.sort_order });
      setMsg(`Táº¡o danh má»¥c thÃ nh cÃ´ng ID: ${res.id}`);
      setForm({ name: '', slug: '', parent_id: '', sort_order: 0 });
    } catch (e: any) {
      setErr(e.message || 'Táº¡o danh má»¥c tháº¥t báº¡i');
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Táº¡o danh má»¥c</h1>
      {msg && <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{msg}</div>}
      {err && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">TÃªn *</label>
          <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input className="w-full border rounded px-3 py-2" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Parent</label>
          <select className="w-full border rounded px-3 py-2" value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
            <option value="">-- KhÃ´ng --</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thá»© tá»±</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
        <button className="px-4 py-2 rounded bg-blue-600 text-white">Táº¡o</button>
      </form>
    </div>
  );
};

export default AdminCategoryCreate; 
