import React from 'react'
import { useAuth } from '../../AuthContext';
import BdeDashboard from './Bde/Index';
import LeaderDashboard from './Team Leader/Index';
import ManagerDashboard from './Manager/Index';
import LeadDashboard from './Leads/Index';
import AnalystDashboard from './Analyst/Index';
import AccountDashboard from './AccountDashboard';
// import HrDashboard from './Hr/HrDashboard';
import HrDashboard from './Hr/Index';
export default function MainDashboard() {
    const { logout, crmToken, authUser, apiUrl } = useAuth();
    return (
        <>
            {authUser.user_type == "BDE" ? <BdeDashboard /> :
                authUser.user_type == "Team Leader" ? <LeaderDashboard /> :
                    authUser.user_type == "Manager" ? <ManagerDashboard /> :
                        authUser.user_type == "Admin" ? <LeadDashboard /> :
                        authUser.user_type == "Floor Manager" ? <LeadDashboard /> :
                        authUser.user_type == "Analyst" ? <AnalystDashboard /> :
                        authUser.user_type == "Accounts" ? <AccountDashboard /> :
                        authUser.user_type == "HR" ? <HrDashboard /> :
                        authUser.user_type == "Networking" ? <HrDashboard /> :
                        authUser.user_type == "Complaince" ? <HrDashboard /> :
                        null}
        </>
    )
}
