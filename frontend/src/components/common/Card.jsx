import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
