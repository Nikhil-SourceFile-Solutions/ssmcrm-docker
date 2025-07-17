import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from './store'; // Make sure this path is correct
import { setAuthUser, setCrmToken, setSettingToggleData } from './store/themeConfigSlice';
// Import your logout action
// Adjust the import as necessary

// Define a type for your AuthContext
interface AuthContextType {
    crmToken: string;
    logout: () => void;
    authUser: any;
    settingData: any;
    apiUrl: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();

    const crmToken = useSelector((state: IRootState) => state.themeConfig.crmToken);
    const authUser = useSelector((state: IRootState) => state.themeConfig.authUser);
    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);
    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const logout = () => {

        dispatch(setCrmToken(''));
        dispatch(setAuthUser(''));
        dispatch(setSettingToggleData(''));
        localStorage.clear();
        window.location = "/login"
        // <Navigate to="/login" />


    };

    return (
        <AuthContext.Provider value={{ crmToken, logout, authUser, settingData, apiUrl }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
