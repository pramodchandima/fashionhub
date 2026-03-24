import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE, getImageUrl } from '../../config/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', image: null, hoverImage: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/admin/categories`, { headers });
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? Deleting a category usually doesn't delete products but unlinks them.")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Category deleted");
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
            if (form.image) formData.append('image', form.image);
            if (form.hoverImage) formData.append('hoverImage', form.hoverImage);

            const url = editingItem
                ? `${API_BASE}/admin/categories/${editingItem.category_id}`
                : `${API_BASE}/admin/categories`;

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            toast.dismiss(loadingToast);

            if (data.success) {
                toast.success(editingItem ? "Category updated" : "Category created");
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
                name: item.category_name,
                description: item.description || '',
                image: null,
                hoverImage: null
            });
        } else {
            setForm({ name: '', description: '', image: null, hoverImage: null });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const filteredCategories = categories.filter(c =>
        c.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={20} /> Add Category
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-8">Loading...</div>
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">No categories found</div>
                ) : (
                    filteredCategories.map(c => (
                        <div key={c.category_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={getImageUrl(c.image_path)}
                                    alt={c.category_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=No+Image"; }}
                                />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(c)} className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white shadow-sm"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(c.category_id)} className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white shadow-sm"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{c.category_name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2">{c.description || 'No description'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"></textarea>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
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

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
