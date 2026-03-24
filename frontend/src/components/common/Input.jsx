import React from 'react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    name,
    className = ''
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                className={`
                    w-full px-4 py-2 rounded-lg border 
                    focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all
                    ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                `}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
