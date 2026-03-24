import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">FashionHub</h3>
                        <p className="text-gray-400">
                            Your number one source for all things fashion. We're dedicated to giving you the very best of clothing.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Shop</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Customer Care</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                            <li><Link to="/shipping" className="hover:text-blue-400 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="hover:text-blue-400 transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-blue-400 transition-colors"><Facebook /></a>
                            <a href="#" className="hover:text-pink-400 transition-colors"><Instagram /></a>
                            <a href="#" className="hover:text-blue-300 transition-colors"><Twitter /></a>
                            <a href="#" className="hover:text-green-400 transition-colors"><MessageCircle /></a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} FashionHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
