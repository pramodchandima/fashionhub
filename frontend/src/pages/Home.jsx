import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Leaf, ShieldCheck, MapPin, Phone, Mail, Send, Facebook, Instagram, Twitter, MessageCircle, Star } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config/api';
import PublicLayout from '../components/layout/PublicLayout';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const location = useLocation(); // Ensure useLocation is imported from react-router-dom

    useEffect(() => {
        if (location.pathname === '/about') {
            document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (location.pathname === '/contact') {
            document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [msgRes, catRes, prodRes] = await Promise.all([
                    // Ensure backend is awake (health check optional, skipping to specific endpoints)
                    Promise.resolve(true),
                    fetch(`${API_BASE}/categories`),
                    fetch(`${API_BASE}/products`)
                ]);

                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(Array.isArray(catData) ? catData : []);
                }

                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(Array.isArray(prodData) ? prodData : []);
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            }
        };

        fetchData();
    }, []);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactForm),
            });
            const result = await response.json();
            if (result.success) {
                alert("✅ Message Sent! We will contact you shortly.");
                setContactForm({ name: "", email: "", subject: "", message: "" });
            } else {
                alert(`❌ Failed to send: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Contact Form Error:", error);
            alert("⚠️ Server error. Check if Backend is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PublicLayout>
            <div className="animate-fade-in">
                {/* 1. HERO */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                            Define Your Style.
                            <br />
                            Embrace the Trend.
                        </h1>
                        <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto font-light">
                            Discover the latest collections curated just for you. Premium quality, sustainable fashion for the modern era.
                        </p>
                        <button
                            onClick={() => navigate("/shop")}
                            className="bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
                        >
                            Shop Collection
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* 2. FEATURES */}
                <div className="bg-white py-16 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <FeatureCard
                            icon={Truck}
                            title="Islandwide Delivery"
                            text="Fast & reliable delivery to your doorstep."
                            color="blue"
                        />
                        <FeatureCard
                            icon={Leaf}
                            title="Eco-Friendly"
                            text="Sustainable packaging & 100% organic."
                            color="green"
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Secure Payments"
                            text="Verified and 100% secure payment gateways."
                            color="purple"
                        />
                    </div>
                </div>

                {/* 3. CATEGORIES */}
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Shop by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.slice(0, 4).map((category) => (
                            <div
                                key={category.category_id || category.id}
                                onClick={() => navigate(`/shop?category=${category.category_id || category.id}`)}
                                className="cursor-pointer group relative overflow-hidden rounded-xl shadow-lg h-64"
                            >
                                <img
                                    src={getImageUrl(category.image_path || category.image)}
                                    alt={category.category_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Category"; }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                    <h4 className="text-2xl font-bold text-white tracking-wide border-b-2 border-transparent group-hover:border-white transition-all pb-1">
                                        {category.category_name || category.name}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. FEATURED PRODUCTS */}
                <div className="bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <h3 className="text-3xl font-bold text-gray-800">Trending Now</h3>
                            <button
                                onClick={() => navigate("/shop")}
                                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1"
                            >
                                View All &rarr;
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {products.slice(0, 4).map((product) => (
                                <div
                                    key={product.product_id || product.id}
                                    onClick={() => navigate(`/product/${product.product_id || product.id}`)}
                                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2 group"
                                >
                                    <div className="h-64 overflow-hidden relative bg-gray-100">
                                        <img
                                            src={getImageUrl(product.image_path || product.image)}
                                            alt={product.product_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Product"; }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-lg mb-1 truncate text-gray-800">{product.product_name || product.name}</h4>
                                        <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide font-medium">{product.category || "Collection"}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-900 font-bold text-lg">Rs. {(product.base_price || product.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. ABOUT US */}
                <div id="about-section" className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">Who We Are</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                            Welcome to <span className="font-bold text-blue-600">FashionHub</span>, your number one source for all things fashion. We're dedicated to giving you the very best of clothing, with a focus on quality, customer service, and uniqueness.
                        </p>
                        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                            Founded in 2024, FashionHub has come a long way from its beginnings. We now serve customers all over Sri Lanka and are thrilled to be a part of the eco-friendly wing of the fashion industry.
                        </p>
                    </div>
                </div>

                {/* 6. CONTACT US */}
                <div id="contact-section" className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Get In Touch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h4 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h4>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <MapPin className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900">Address</h5>
                                            <p className="text-gray-600">123 Fashion Street, Colombo 03, Sri Lanka</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <Phone className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900">Phone</h5>
                                            <p className="text-gray-600">+94 77 123 4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <Mail className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900">Email</h5>
                                            <p className="text-gray-600">info@fashionhub.lk</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <h5 className="font-semibold text-gray-900 mb-4">Follow Us</h5>
                                    <div className="flex gap-4">
                                        <SocialIcon Icon={Facebook} color="text-blue-600 hover:bg-blue-50" />
                                        <SocialIcon Icon={Instagram} color="text-pink-600 hover:bg-pink-50" />
                                        <SocialIcon Icon={Twitter} color="text-blue-400 hover:bg-blue-50" />
                                        <SocialIcon Icon={MessageCircle} color="text-green-500 hover:bg-green-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h4 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h4>
                                <form className="space-y-4" onSubmit={handleContactSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={contactForm.subject}
                                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                    <textarea
                                        placeholder="Message"
                                        rows="4"
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                        required
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

const FeatureCard = ({ icon: Icon, title, text, color }) => {
    const colorClasses = {
        blue: "text-blue-600 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white",
        green: "text-green-600 bg-green-100 group-hover:bg-green-600 group-hover:text-white",
        purple: "text-purple-600 bg-purple-100 group-hover:bg-purple-600 group-hover:text-white",
    };

    return (
        <div className="flex flex-col items-center group p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 bg-white">
            <div className={`p-4 rounded-full mb-6 transition-colors duration-300 ${colorClasses[color]}`}>
                <Icon size={32} />
            </div>
            <h4 className="font-bold text-xl text-gray-800 mb-2">{title}</h4>
            <p className="text-gray-500">{text}</p>
        </div>
    );
};

const SocialIcon = ({ Icon, color }) => (
    <div className={`p-3 rounded-full cursor-pointer transition-colors duration-300 bg-gray-100 ${color}`}>
        <Icon size={24} />
    </div>
);

export default Home;
