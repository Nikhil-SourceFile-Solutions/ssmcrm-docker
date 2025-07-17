import React,{ lazy } from 'react';
import Notepad from '../pages/Notepad';
import AddLeads from '../pages/Leads/AddLeads';
import UploadLeads from '../pages/Leads/Bulkupload/Index';
import ViewLeads from '../pages/Leads/LeadView/Index';
import ViewLeadShow from '../pages/Leads/LeadView/Show/Show';
import ViewSalesShow from '../pages/Sales/Accounts/Show';
import ViewSales from '../pages/Sales/Index';
import GenerateReport from '../pages/Reports/Generate Report/Index';
import SalesDashboard from '../pages/Dashboard/Sales/Index';
import CustomDashboard from '../pages/Dashboard/CustomDashboard/Index';
import Settings from '../pages/Settings/Index';
import ListEmployee from '../pages/Settings/Employee/Index';
import AddEmployee from '../pages/Settings/Employee/AddEmployee';
import Dropdown from '../pages/Settings/Dropdown';
import ProductSales from '../pages/Settings/Product/Index';
import MainDashboard from '../pages/Dashboard/MainDashboard';
import Login from '../pages/Authentication/Login';
import NotificationReport from '../pages/Reports/NotificationReport';
import WhatsappReport from '../pages/Reports/WhatsappReport';
import SmsReport from '../pages/Reports/SmsReport';
import ActiveSale from '../pages/Analyst/Sale/ActiveSale/ActiveSale';
import Expiredservice from '../pages/Analyst/Sale/ExpiredSale';
import Invoice from '../pages/Documents/Invoice/Index';
import Chat from '../pages/Chat/Chat';
import Campaign from '../pages/Analyst/Campaign/Campaign';
import PausedService from '../pages/Analyst/Sale/PausedSale';
import Iptracking from '../pages/Settings/Iptracking';
import TeamLeaderDashboard from '../pages/Dashboard/TeamLeaderDashboard';
import AccountDashboard from '../pages/Dashboard/AccountDashboard';
import CreatePassword from '../pages/Authentication/CreatePassword';
import SearchLead from '../pages/Leads/LeadView/Show/SearchLead';
import Upgrade from '../pages/Upgrade/Growthlift/Index';
import CustomerKyc from '../pages/Development/Kyc/Index';
import GeneralSettings from '../pages/Settings/Settings';
import SettingsEmployees from '../pages/Settings/Employee/Index';
import SettingsPayroll from '../pages/Settings/Payroll/ListSalary';
import SettingsDropdowns from '../pages/Settings/Dropdown';
import SettingsLeadAutomation from '../pages/Settings/LeadAutomation';
import SettingsProducts from '../pages/Settings/Product/Index';
import SettingsPayments from '../pages/Settings/PaymentGateWay/Payments';
import SettingsIpTracking from '../pages/Settings/Iptracking';
import SettingsPermissions from '../pages/Settings/Permission';
import SettingsAuthenticationPhone from '../pages/Settings/AuthenticationPhone';
import RegisterdClient from '../pages/Leads/RegisterdClient';
import TeamLead from '../pages/Leads/TeamLeads/Index'
import TeamSales from '../pages/Sales/TeamSales/Index'
import InvoiceSetting from '../pages/Settings/InvoiceSetting/InvoiceSetting';
import FreeTrials from '../pages/Analyst/Free Trial/Index';
import FreeTrialCampaign from '../pages/Analyst/Free Trial/Campaign/Index';
import NotAuthorize from '../pages/Authentication/NotAuthorize';
import ProtectedRoute from './ProtectedRoute';
import MarketingSMSCampaign from '../pages/Analyst/marketing/sms/Index';
import MarketingWhatsappCampaign from '../pages/Analyst/marketing/whatsapp/Index';
import Migration from '../pages/migration/Index';
import Branches from '../pages/Settings/Branches/Branches';

const routes = [
    // dashboard
    {
        path: '/',
        element: <MainDashboard />,
        layout: 'default',
        protected: true
    },

    {
        path: '/migration',
        element: <Migration />,
        layout: 'blank',
        protected: true
    },

    {
        path: '/login',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/create-password',
        element: <CreatePassword />,
        layout: 'blank',
    },

    {
        path: '/settings',
        element: <ProtectedRoute element={<GeneralSettings />} allowed={['Admin', 'Branch Admin', 'Floor Manager']} />,
        protected: true,
    },




    // for public site


    {
        path: '/settings/authentication-phones',
        element: <ProtectedRoute element={<SettingsAuthenticationPhone />} allowed={['Admin', 'Branch Admin', 'Floor Manager']} />,
        protected: true,
    },

    {
        path: '/not-authorized',
        element: <NotAuthorize />,
        protected: true,
    },


    {
        path: '/settings/employees',
        // element: <SettingsEmployees />,
        element: <ProtectedRoute element={<SettingsEmployees />} allowed={['Admin', 'Branch Admin', 'Floor Manager', 'HR']} />,
        protected: true
    },

    {
        path: '/settings/permissions',
        // element: <SettingsEmployees />,
        element: <ProtectedRoute element={<SettingsPermissions />} allowed={['Admin', 'Branch Admin', 'Floor Manager', 'HR']} />,
        protected: true
    },

    {
        path: '/settings/payrolls',
        // element: <SettingsPayroll />,
        element: <ProtectedRoute element={<SettingsPayroll />} allowed={['Admin', 'Branch Admin', 'Floor Manager']} />,
        protected: true
    },

    {
        path: '/settings/dropdowns',
        // element: <SettingsDropdowns />,
        element: <ProtectedRoute element={<SettingsDropdowns />} allowed={['Admin', 'Floor Manager']} />,
        protected: true
    },

    {
        path: '/settings/lead-automations',
        // element: <SettingsLeadAutomation />,
        element: <ProtectedRoute element={<SettingsLeadAutomation />} allowed={['Admin', 'Floor Manager']} />,

        protected: true
    },

    {
        path: '/settings/products',
        // element: <SettingsProducts />,
        element: <ProtectedRoute element={<SettingsProducts />} allowed={['Admin', 'Floor Manager']} />,

        protected: true
    },

    {
        path: '/settings/payments',
        // element: <SettingsPayments />,
        element: <ProtectedRoute element={<SettingsPayments />} allowed={['Admin', 'Floor Manager']} />,

        protected: true
    },

    {
        path: '/settings/ip-traking',
        // element: <SettingsIpTracking />,
        element: <ProtectedRoute element={<SettingsIpTracking />} allowed={['Admin', 'Floor Manager', 'HR']} />,

        protected: true
    },

    // notepad
    {
        path: '/notepads',
        element: <Notepad />,
        protected: true
    },

    {
        path: '/upgrade',
        element: <Upgrade />,
        protected: true,
        layout: 'blank',
    },

    {
        path: '/search-leads',
        element: <SearchLead />,
        protected: true
    },

    {
        path: '/leads/addleads',
        // element: <AddLeads />,
        element: <ProtectedRoute element={<AddLeads />} allowed={["Admin", "Manager", 'Floor Manager', "Team Leader", "BDE"]} />,

        protected: true
    },

    {
        path: '/leads/uploadleads',
        // element: <UploadLeads />,
        element: <ProtectedRoute element={<UploadLeads />} allowed={['Admin', 'Floor Manager']} />,

        protected: true
    },

    {
        path: '/leads/viewleads',
        // element: <ViewLeads />,
        element: <ProtectedRoute element={<ViewLeads />} allowed={["Admin", "Manager", 'Floor Manager', "Team Leader", "BDE"]} />,

        protected: true
    },

    {
        path: '/registerdClient',
        element: <RegisterdClient />,
        protected: true
    },

    {
        path: '/leads/viewleads/show',
        element: <ViewLeadShow />,
        protected: true
    },

    {
        path: '/team-leads',
        // element: <TeamLead />,
        element: <ProtectedRoute element={<TeamLead />} allowed={["Manager", "Team Leader"]} />,
        protected: true
    },

    {
        path: '/sales',
        // element: <ViewSales />,
        element: <ProtectedRoute element={<ViewSales />} allowed={["Admin", "Accounts", "Manager", 'Floor Manager', "Team Leader", "BDE", 'HR', 'Complaince']} />,
        protected: true
    },

    {
        path: '/team-sales',
        // element: <TeamSales />,
        element: <ProtectedRoute element={<TeamSales />} allowed={["Manager", "Team Leader"]} />,
        protected: true
    },


    // Report
    {
        path: '/reports/generatereport',
        // element: <GenerateReport />,
        element: <ProtectedRoute element={<GenerateReport />} allowed={["Floor Manager", "Admin", "Accounts", 'Analyst']} />,

        protected: true
    },
    {
        path: '/reports/smsreport',
        // element: <SmsReport />,
        element: <ProtectedRoute element={<SmsReport />} allowed={["Floor Manager", "Admin", "Accounts", 'Analyst']} />,

        protected: true
    },
    {
        path: '/reports/whatsappreport',
        // element: <WhatsappReport />,
        element: <ProtectedRoute element={<WhatsappReport />} allowed={["Floor Manager", "Admin", "Accounts", 'Analyst']} />,

        protected: true
    },
    {
        path: '/reports/notificationreport',
        // element: <NotificationReport />,
        element: <ProtectedRoute element={<NotificationReport />} allowed={["Floor Manager", "Admin", "Accounts", 'Analyst']} />,

        protected: true
    },

    // Dashbaord

    {
        path: '/sales-dashboard',
        element: <SalesDashboard />,
        protected: true
    },
    {
        path: '/custom-dashboard',
        element: <CustomDashboard />,
        protected: true
    },

    {
        path: '/team-leader-dashboard',
        element: <TeamLeaderDashboard />,
        protected: true
    },
    // {
    //     path: '/analyst-dashboard',
    //     element: <AnalystDashboard />,
    //     protected: true
    // },

    {
        path: '/account-dashboard',
        element: <AccountDashboard />,
        protected: true
    },
    // Analyst
    {
        path: '/analyst/campaign',
        // element: <Campaign />,
        element: <ProtectedRoute element={<Campaign />} allowed={["Admin", "Floor Manager", 'Analyst']} />,

        protected: true
    },
    {
        path: '/analyst/saleservice',
        // element: <ActiveSale />,
        element: <ProtectedRoute element={<ActiveSale />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },

    {
        path: '/analyst/free-trial',
        // element: <FreeTrials />,
        element: <ProtectedRoute element={<FreeTrials />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },

    {
        path: '/analyst/free-trials/campaign',
        // element: <FreeTrialCampaign />,
        element: <ProtectedRoute element={<FreeTrialCampaign />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },

    {
        path: '/analyst/marketing/sms',
        // element: <FreeTrialCampaign />,
        element: <ProtectedRoute element={<MarketingSMSCampaign />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },

    {
        path: '/analyst/marketing/whatsapp',
        // element: <FreeTrialCampaign />,
        element: <ProtectedRoute element={<MarketingWhatsappCampaign />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },


    {
        path: '/analyst/expiredservice',
        // element: <Expiredservice />,
        element: <ProtectedRoute element={<Expiredservice />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },
    {
        path: '/analyst/pausedservice',
        // element: <PausedService />,
        element: <ProtectedRoute element={<PausedService />} allowed={["Admin", "Floor Manager", 'Analyst']} />,
        protected: true
    },
    // Documents

    {
        path: '/chat',
        element: <Chat />,
        protected: true
    },




    {
        path: '/documents/invoice',
        // element: <Invoice />,
        element: <ProtectedRoute element={<Invoice />} allowed={["Admin", "Floor Manager", 'Analyst', 'Accounts']} />,
        protected: true
    },



    // Settings
    {
        path: '/settings',
        element: <Settings />,
        protected: true
    },

    {
        path: '/settings/invoice',
        element: <InvoiceSetting />,
        protected: true
    },


    {
        path: '/settings/branches',
        element: <Branches />,
        protected: true
    },







    {
        path: '/settings/employee/listemployee',
        element: <ListEmployee />,
        protected: true
    },
    {
        path: '/settings/employee/addemployee',
        element: <AddEmployee />,
        protected: true
    },
    {
        path: '/settings/dropdown',
        element: <Dropdown />,
        protected: true
    },
    {
        path: '/settings/productsales',
        element: <ProductSales />,
        protected: true
    },
    {
        path: '/hr-iptracking',
        element: <Iptracking />,
        protected: true
    },
    {
        path: '/hr-employees',
        element: <ListEmployee />,
        protected: true
    },

    {
        path: '/sales/show',
        element: <ViewSalesShow />,
        protected: true
    },

    //TEMP TEMP TEMP

    {
        path: '/customer/kyc/:token',
        element: <CustomerKyc />,
        protected: true,
        layout: 'blank',
    },

];

export { routes };
