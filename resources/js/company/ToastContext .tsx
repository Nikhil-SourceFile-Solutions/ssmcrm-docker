import React, { createContext, useContext, useState } from 'react';
// import { X } from 'lucide-react';

const ToastContext = createContext();

const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
};

export const ToastProvider = ({ children, position = 'top-right' }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const Alert = ({
        variant = 'news',
        message,
        description,
        time,
        title,
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
                bgColor: 'bg-success',
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
                bgColor: 'bg-[#ff0000]',
                icon: '○'
            }
        };

        return (
            <div className={`${variants[variant].bgColor} rounded-xl w-full max-w-md overflow-hidden shadow-lg animate-in fade-in duration-300`}>
                <div className="p-4">
                    {variant === 'news' ? (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-blue-400 text-xs font-medium">NEWS</span>
                                <button
                                    onClick={onClose}
                                    className="text-white"
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
                                <span className="text-white text-sm">{title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* <span className="text-gray-500 text-xs">{time}</span> */}
                                <button
                                    onClick={onClose}
                                    className="text-white ml-2"
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

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 min-w-[320px]`}>
                {toasts.map((toast) => (
                    <Alert
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Custom hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};