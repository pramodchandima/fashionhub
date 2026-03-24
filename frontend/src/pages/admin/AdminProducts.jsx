import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE, getImageUrl } from '../../config/api';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', price: '', categoryId: '', stock: '', image: null,
        colors: [{ name: '', code: '#000000' }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [prodRes, catRes] = await Promise.all([
                fetch(`${API_BASE}/admin/products`, { headers }),
                fetch(`${API_BASE}/admin/categories`, { headers })
            ]);

            if (prodRes.ok) setProducts(await prodRes.json());
            if (catRes.ok) setCategories(await catRes.json());
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Product deleted");
                fetchData();
            } else {
                toast.error(data.error || "Delete failed");
            }
        } catch (error) {
            toast.error("Server error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const loadingToast = toast.loading(editingItem ? 'Updating...' : 'Creating...');

        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('categoryId', form.categoryId);
            formData.append('stock', form.stock);
            formData.append('colors', JSON.stringify(form.colors));
            if (form.image) formData.append('image', form.image);

            const url = editingItem
                ? `${API_BASE}/admin/products/${editingItem.product_id}`
                : `${API_BASE}/admin/products`;

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
                body: formData
            });

            const data = await res.json();
            toast.dismiss(loadingToast);

            if (data.success) {
                toast.success(editingItem ? "Product updated" : "Product created");
                fetchData();
                closeModal();
            } else {
                toast.error(data.error || "Operation failed");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Server error");
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setForm({
                name: item.product_name,
                description: item.description || '',
                price: item.base_price,
                categoryId: item.category_id,
                stock: item.stock_quantity,
                image: null,
                colors: item.colors?.map(c => ({ name: c.color_name, code: c.color_code })) || [{ name: '', code: '#000000' }]
            });
        } else {
            setForm({
                name: '', description: '', price: '', categoryId: '', stock: '', image: null,
                colors: [{ name: '', code: '#000000' }]
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    // Form Helpers
    const addColor = () => setForm({ ...form, colors: [...form.colors, { name: '', code: '#000000' }] });
    const removeColor = (idx) => setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) });
    const updateColor = (idx, field, value) => {
        const newColors = [...form.colors];
        newColors[idx][field] = value;
        setForm({ ...form, colors: newColors });
    };

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Image</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">No products found</td></tr>
                        ) : (
                            filteredProducts.map(p => (
                                <tr key={p.product_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={getImageUrl(p.image_path)}
                                            alt={p.product_name}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.product_name}</td>
                                    <td className="px-6 py-4 text-gray-500">{p.category_name || '-'}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">Rs. {p.base_price?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(p.product_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">{editingItem ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none">
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"></textarea>
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                    <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {form.image ? (
                                        <p className="text-green-600 font-medium">{form.image.name}</p>
                                    ) : editingItem?.image_path ? (
                                        <img src={getImageUrl(editingItem.image_path)} alt="Preview" className="h-32 mx-auto object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <UploadCloud size={32} />
                                            <span className="mt-2 text-sm">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Colors</label>
                                    <button type="button" onClick={addColor} className="text-sm text-blue-600 hover:underline">+ Add Color</button>
                                </div>
                                <div className="space-y-2">
                                    {form.colors.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input placeholder="Color Name" value={c.name} onChange={e => updateColor(i, 'name', e.target.value)} className="flex-1 p-2 border rounded-lg" />
                                            <input type="color" value={c.code} onChange={e => updateColor(i, 'code', e.target.value)} className="h-10 w-12 border rounded-lg p-1" />
                                            <button type="button" onClick={() => removeColor(i)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
