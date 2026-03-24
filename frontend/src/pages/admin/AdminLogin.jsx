import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import toast, { Toaster } from 'react-hot-toast';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                toast.success('Login Successful');

                // Allow toast to show
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000);
            } else {
                toast.error(data.error || 'Invalid credentials');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection failed. Check if backend is running.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Toaster position="top-right" />

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row h-[600px]">
                {/* Left Side - Image/Brand */}
                <div className="bg-blue-600 text-white p-12 flex flex-col justify-between w-full md:w-1/2 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="bg-white/20 p-3 rounded-xl w-max mb-6 backdrop-blur-sm">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">FashionHub Admin</h1>
                        <p className="text-blue-100 text-lg">Manage your products, categories, and orders from one secure dashboard.</p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm text-blue-200">Version 2.0.0</p>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* Right Side - Form */}
                <div className="p-12 w-full md:w-1/2 flex flex-col justify-center bg-white">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-gray-500 mb-8">Please login to your account.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing In...' : (
                                <>
                                    Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
