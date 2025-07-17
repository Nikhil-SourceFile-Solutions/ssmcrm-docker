import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { crmToken } = useAuth();
    return crmToken ? <>{children}</> : <Navigate to="/login" />;
};

export default AuthGuard;