import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE, getImageUrl } from '../../config/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/admin/orders`, { headers });
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Order #${orderId} marked as ${newStatus}`);
                fetchOrders(); // Refresh list
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleViewDetails = async (order) => {
        setSelectedOrder(order);
        setIsDetailsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/admin/orders/${order.order_id}/items`, { headers });
            if (res.ok) {
                const data = await res.json();
                setOrderItems(data);
            }
        } catch (error) {
            toast.error("Failed to load order details");
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.order_id && o.order_id.toString().includes(searchTerm)) ||
        (o.customer_phone && o.customer_phone.includes(searchTerm))
    );

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                <button onClick={fetchOrders} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    Refresh List
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by Name, Order ID, or Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Customer Info</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Total</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">No orders found</td></tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.order_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-600">#{order.order_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{order.customer_name || 'Guest'}</div>
                                        <div className="text-sm text-gray-500">{order.customer_phone || 'No Phone'}</div>
                                        {/* <div className="text-xs text-gray-400">{order.customer_email}</div> */}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">Rs. {parseFloat(order.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status || 'pending'}
                                            onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border-none focus:ring-2 focus:ring-blue-100 cursor-pointer
                                                ${order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.order_date || order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                                        >
                                            <Eye size={18} /> Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative animate-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Order #{selectedOrder.order_id}</h2>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-6 ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {selectedOrder.status}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Customer Details</h3>
                                <p className="text-sm mb-1"><span className="font-semibold">Name:</span> {selectedOrder.customer_name}</p>
                                <p className="text-sm mb-1"><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                                <p className="text-sm mb-1"><span className="font-semibold">Email:</span> {selectedOrder.customer_email || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Shipping Info</h3>
                                <p className="text-sm whitespace-pre-wrap">{selectedOrder.shipping_address || 'No address provided (WhatsApp Order)'}</p>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>
                        {isDetailsLoading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div></div>
                        ) : (
                            <div className="space-y-4">
                                {orderItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                            {item.image_path ? (
                                                <img src={getImageUrl(item.image_path)} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                                            <div className="text-sm text-gray-500">
                                                Color: {item.color_name} | Qty: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">Rs. {parseFloat(item.unit_price * item.quantity).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Rs. {parseFloat(item.unit_price).toLocaleString()} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 pt-4 border-t flex justify-between items-center">
                            <span className="text-gray-500">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">Rs. {parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
