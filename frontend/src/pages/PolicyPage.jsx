import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Do you ship islandwide?",
            answer: "Yes, we deliver to any address in Sri Lanka. Our delivery partners ensure safe and timely delivery to your doorstep."
        },
        {
            question: "How long does delivery take?",
            answer: "Standard delivery takes 3-5 working days. You will receive a tracking number once your order has been dispatched."
        },
        {
            question: "Can I return an item?",
            answer: "Yes, we have a 7-day return policy for unused items with tags attached. Please check our Returns & Exchanges page for more details."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept Cash on Delivery (COD), Bank Transfers, and secure online card payments (Visa/Mastercard)."
        },
        {
            question: "How do I contact customer support?",
            answer: "You can reach us via the Contact page, email us at info@fashionhub.lk, or call our hotline at +94 77 123 4567."
        }
    ];

    return (
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <button
                        className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors text-left focus:outline-none"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="font-semibold text-gray-800 text-lg">{faq.question}</span>
                        {openIndex === index ?
                            <ChevronUp size={20} className="text-blue-600 transition-transform duration-300" /> :
                            <ChevronDown size={20} className="text-gray-400 transition-transform duration-300" />
                        }
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-5 pt-0 bg-white text-gray-600 leading-relaxed border-t border-gray-50">
                            {faq.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PolicyPage = ({ type }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const content = {
        faq: {
            title: "Frequently Asked Questions",
            body: <FAQSection />
        },
        shipping: {
            title: "Shipping Policy",
            body: (
                <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <p>We are committed to delivering your order accurately, in good condition, and always on time.</p>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <ul className="list-disc pl-5 space-y-3">
                            <li>We ship on all week days (Monday to Saturday), excluding public holidays.</li>
                            <li>To ensure that your order reaches you in the fastest time and in good condition, we only ship through reputed courier agencies.</li>
                            <li>While we strive to ship all items in your order together, this may not always be possible due to product characteristics, or availability.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        returns: {
            title: "Returns & Exchanges",
            body: (
                <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <p>We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.</p>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h4 className="font-bold text-green-800 mb-3">Eligibility Conditions:</h4>
                        <ul className="list-disc pl-5 space-y-2 text-green-700">
                            <li>Item must be in the same condition that you received it.</li>
                            <li>Unworn or unused, with tags, and in its original packaging.</li>
                            <li>Receipt or proof of purchase is required.</li>
                        </ul>
                    </div>
                    <p>To start a return, you can contact us at <a href="mailto:info@fashionhub.lk" className="text-blue-600 hover:underline">info@fashionhub.lk</a>.</p>
                </div>
            )
        },
        terms: {
            title: "Terms of Service",
            body: (
                <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                    <p>By visiting our site and/ or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>
                    <p>We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.</p>
                    <p>The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.</p>
                </div>
            )
        }
    };

    const pageContent = content[type] || { title: "Page Not Found", body: "The requested page does not exist." };

    return (
        <PublicLayout>
            <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b pb-4">
                            {pageContent.title}
                        </h1>
                        <div className="prose prose-blue max-w-none">
                            {pageContent.body}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PolicyPage;
