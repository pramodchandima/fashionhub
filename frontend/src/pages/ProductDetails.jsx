import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Share2 } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config/api';
import PublicLayout from '../components/layout/PublicLayout';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const sizes = ["S", "M", "L", "XL", "XXL"];
    const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "94789933967";

    // Order Form State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        name: '',
        phone: '',
        address: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API_BASE}/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                }
            } else {
                console.error("Product not found");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQ = quantity + delta;
        if (newQ >= 1 && newQ <= (product?.stock_quantity || 10)) {
            setQuantity(newQ);
        }
    };

    const openOrderModal = () => {
        if (!product) return;
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            alert("Please select a color");
            return;
        }
        if (!selectedSize) {
            alert("Please select a size");
            return;
        }
        setShowOrderModal(true);
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const price = product.base_price || product.price;
        const colorName = selectedColor ? (selectedColor.color_name || selectedColor.name) : "Standard";

        try {
            const orderData = {
                customerName: orderDetails.name,
                customerPhone: orderDetails.phone,
                customerEmail: orderDetails.email,
                shippingAddress: orderDetails.address,
                totalAmount: price * quantity,
                items: [{
                    productId: product.product_id,
                    color: colorName,
                    size: selectedSize,
                    quantity: quantity,
                    price: price
                }]
            };

            const response = await fetch(`${API_BASE}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!result.success) {
                alert("Order Failed: " + (result.error || "Unknown error"));
                setIsSubmitting(false);
                return;
            }

            // WhatsApp Message
            const message = `👋 *Hi FashionHub!* I would like to confirm my order.
--------------------------------
👤 *Customer:* ${orderDetails.name}
📞 *Phone:* ${orderDetails.phone}
📍 *Address:* ${orderDetails.address}
--------------------------------
🛒 *ORDER SUMMARY*
🆔 *Order No:* #${result.orderId}
👗 *Item:* ${product.product_name}
📏 *Size:* ${selectedSize}
🎨 *Color:* ${colorName}
🔢 *Quantity:* ${quantity}
🏷️ *Unit Price:* Rs. ${price.toLocaleString()}
--------------------------------
💰 *GRAND TOTAL: Rs. ${(price * quantity).toLocaleString()}*
--------------------------------`;

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");

            setShowOrderModal(false);
            alert("Order placed successfully! Redirecting to WhatsApp...");
            navigate('/shop');

        } catch (error) {
            console.error("Order error:", error);
            alert("Could not connect to server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <PublicLayout>
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        </PublicLayout>
    );

    if (!product) return (
        <PublicLayout>
            <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
                <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Shop</button>
            </div>
        </PublicLayout>
    );

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen relative">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative h-[700px]">
                        <img
                            src={getImageUrl(product.image_path)}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=No+Image"; }}
                        />
                        {/* Status Badge */}
                        {product.stock_quantity <= 0 && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h2 className="text-sm font-bold text-blue-600 tracking-wide uppercase mb-2">{product.category_name || 'Collection'}</h2>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 lh-tight">{product.product_name}</h1>
                            <p className="text-3xl font-bold text-gray-900">Rs. {product.base_price?.toLocaleString()}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{product.description || "No description available."}</p>
                        </div>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Select Color: <span className="text-gray-500 font-normal">{selectedColor?.color_name || selectedColor?.name}</span></h3>
                                <div className="flex gap-3">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all transform hover:scale-110 ${selectedColor === color ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}
                                            title={color.color_name || color.name}
                                            style={{ backgroundColor: color.color_code || color.code }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-800 mb-3">Select Size:</h3>
                            <div className="flex flex-wrap gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 rounded-lg font-medium transition-all ${selectedSize === size ? 'bg-black text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white w-max">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="px-3 py-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-l-lg transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="px-3 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="px-3 py-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-r-lg transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <button
                                onClick={openOrderModal}
                                disabled={product.stock_quantity <= 0}
                                className={`flex-1 py-4 px-8 rounded-lg font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                                    ${product.stock_quantity > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                            >
                                <ShoppingBag size={20} />
                                {product.stock_quantity > 0 ? "Place Order" : "Out of Stock"}
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Truck size={20} className="text-blue-600" />
                                <span>Free islandwide delivery on orders over Rs. 5000</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <ShieldCheck size={20} className="text-green-600" />
                                <span>Secure payment & Money back guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Modal */}
                {showOrderModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <Minus size={24} className="rotate-45" />
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Details</h2>

                            <form onSubmit={handleConfirmOrder} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={orderDetails.name}
                                        onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={orderDetails.phone}
                                        onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                                        placeholder="077xxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={orderDetails.email}
                                        onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        value={orderDetails.address}
                                        onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
                                        placeholder="Your delivery address"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Order via WhatsApp'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default ProductDetails;
