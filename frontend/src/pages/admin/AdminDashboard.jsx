import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { API_BASE } from '../../config/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        users: 1
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [prodRes, catRes, orderRes] = await Promise.all([
                    fetch(`${API_BASE}/admin/products`, { headers }),
                    fetch(`${API_BASE}/admin/categories`, { headers }),
                    fetch(`${API_BASE}/admin/orders`, { headers })
                ]);

                const products = prodRes.ok ? await prodRes.json() : [];
                const categories = catRes.ok ? await catRes.json() : [];
                const orders = orderRes.ok ? await orderRes.json() : [];

                setStats({
                    products: Array.isArray(products) ? products.length : 0,
                    categories: Array.isArray(categories) ? categories.length : 0,
                    orders: Array.isArray(orders) ? orders.length : 0,
                    users: 1
                });

                // Get last 5 orders
                setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.products}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="Categories"
                    value={stats.categories}
                    icon={Tag}
                    color="purple"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingBag}
                    color="green"
                />
                <StatCard
                    title="Active Admins"
                    value={stats.users}
                    icon={Users}
                    color="indigo"
                />
            </div>

            {/* Recent Activity / Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800">Recent Orders</h3>
                        <TrendingUp size={20} className="text-gray-400" />
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-10">No recent activity.</p>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.order_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Order #{order.order_id}</p>
                                            <p className="text-xs text-gray-500">{order.customer_name || 'Guest'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <Link to="/admin/orders" className="block text-center text-sm text-blue-600 hover:underline pt-2">View All Orders</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800">Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/products" className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium flex flex-col items-center justify-center gap-2 text-center group">
                            <Package size={24} className="text-gray-400 group-hover:text-blue-600" />
                            Manage Products
                        </Link>
                        <Link to="/admin/categories" className="p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors text-sm font-medium flex flex-col items-center justify-center gap-2 text-center group">
                            <Tag size={24} className="text-gray-400 group-hover:text-purple-600" />
                            Manage Categories
                        </Link>
                        <Link to="/admin/orders" className="p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors text-sm font-medium flex flex-col items-center justify-center gap-2 text-center group">
                            <ShoppingBag size={24} className="text-gray-400 group-hover:text-green-600" />
                            View Orders
                        </Link>
                        <button className="p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-sm font-medium flex flex-col items-center justify-center gap-2 text-center group opacity-50 cursor-not-allowed">
                            <Users size={24} className="text-gray-400 group-hover:text-indigo-600" />
                            Manage Admins (Soon)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        green: "bg-green-100 text-green-600",
        indigo: "bg-indigo-100 text-indigo-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default AdminDashboard;
