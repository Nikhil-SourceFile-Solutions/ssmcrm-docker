import React, { useState } from 'react';
// import { X } from 'lucide-react';

const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
};

const Alert = ({
    variant = 'news',
    message,
    description,
    time,
    onClose
}) => {
    const variants = {
        news: {
            label: 'NEWS',
            labelColor: 'text-blue-400',
            icon: '•'
        },
        success: {
            label: 'Successfully Message',
            labelColor: 'text-green-400',
            icon: '✓'
        },
        alert: {
            label: 'Alert Message',
            labelColor: 'text-yellow-400',
            icon: '!'
        },
        error: {
            label: 'Error Message',
            labelColor: 'text-red-400',
            icon: '○'
        }
    };

    return (
        <div className="bg-[#1b254a] rounded-xl w-full max-w-md overflow-hidden shadow-lg animate-in fade-in duration-300">
            <div className="p-4">
                {variant === 'news' ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-blue-400 text-xs font-medium">NEWS</span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-300"
                            >
                                {/* <X className="w-4 h-4" /> */}
                                x
                            </button>
                        </div>
                        <h3 className="text-white text-sm font-medium mb-1">{message}</h3>
                        <p className="text-gray-400 text-sm mb-2">{description}</p>
                        <span className="text-gray-500 text-xs">{time}</span>
                    </>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className={`${variants[variant].labelColor} text-lg`}>
                                {variants[variant].icon}
                            </span>
                            <span className="text-white text-sm">{variants[variant].label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-xs">{time}</span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-300"
                            >
                                {/* <X className="w-4 h-4" /> */}
                                x
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ToastContainer = ({ position = 'top-right' }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };



    return (
        <>
            <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 min-w-[320px]`}>
                {toasts.map((toast) => (
                    <Alert
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </>
    );
};

export default ToastContainer;