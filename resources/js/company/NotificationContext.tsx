import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [showFireworks, setShowFireworks] = useState(false);

    const triggerNotification = () => {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 4000); // Auto-reset after 4 seconds
    };

    return (
        <NotificationContext.Provider value={{ triggerNotification, showFireworks }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
