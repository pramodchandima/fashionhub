import React, { useState, useEffect } from 'react';
import { Search, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE } from '../../config/api';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        messageId: null,
        newStatus: '',
        actionName: ''
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/admin/contact-messages`, { headers });
            if (res.ok) {
                const data = await res.json();
                setMessages(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const requestStatusUpdate = (id, newStatus, actionName) => {
        setConfirmModal({
            isOpen: true,
            messageId: id,
            newStatus,
            actionName
        });
    };

    const confirmStatusUpdate = async () => {
        const { messageId, newStatus } = confirmModal;
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/admin/contact-messages/${messageId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success('Status updated');
                fetchMessages();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredMessages = messages.filter(m =>
        (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in">
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                <button onClick={fetchMessages} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    Refresh List
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by Name, Email, or Subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Messages List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="text-center py-10">Loading messages...</div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No messages found</div>
                ) : (
                    filteredMessages.map(msg => (
                        <div key={msg.message_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{msg.subject}</h3>
                                        <p className="text-sm text-gray-500">{msg.name} ({msg.email})</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase
                                        ${msg.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                            msg.status === 'read' ? 'bg-gray-100 text-gray-700' :
                                                'bg-green-100 text-green-700'}`}>
                                        {msg.status === 'new' && <AlertCircle size={12} />}
                                        {msg.status === 'read' && <Clock size={12} />}
                                        {msg.status === 'replied' && <CheckCircle size={12} />}
                                        {msg.status}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap mb-4">
                                {msg.message}
                            </div>

                            <div className="flex justify-end gap-2">
                                {msg.status === 'new' && (
                                    <button
                                        onClick={() => requestStatusUpdate(msg.message_id, 'read', 'Mark as Read')}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                {msg.status !== 'replied' && (
                                    <button
                                        onClick={() => requestStatusUpdate(msg.message_id, 'replied', 'Mark as Replied')}
                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Mark as Replied
                                    </button>
                                )}
                                <a
                                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                    Reply via Email
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm transform scale-100 transition-transform">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to <strong>{confirmModal.actionName}</strong>?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
