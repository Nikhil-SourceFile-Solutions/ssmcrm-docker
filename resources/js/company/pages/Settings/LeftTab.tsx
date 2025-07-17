import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowRightCircle } from 'react-icons/fi';
import { TbCircleLetterD, TbCircleLetterE, TbCircleLetterG, TbCircleLetterP, TbCircleLetterL, TbCircleLetterI, TbCircleLetterW } from 'react-icons/tb';
import { FaRupeeSign, FaFileInvoice } from "react-icons/fa";
import { MdSms, MdEmail } from "react-icons/md";
import { IRootState } from '../../store';
import { FaAws } from "react-icons/fa6";
const NavItem = ({ to, icon, title, subtitle, isActive }) => (
    <NavLink to={to} className='w-full'>
        <div className={`py-2 px-4 mb-2 rounded ${isActive ? 'bg-dark text-white' : 'bg-primary-light'}`}>
            <div className="flex justify-between">
                <div className="flex items-center w-max flex-none">
                    <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-2">
                        {icon}
                    </div>
                    <div className="ltr:ml-2 rtl:mr-2">
                        <div className="font-semibold">{title}</div>
                        <div className="text-sx text-white-dark">{subtitle}</div>
                    </div>
                </div>
                <div className="p-2">
                    <FiArrowRightCircle className="w-4.5 h-4.5" />
                </div>
            </div>
        </div>
    </NavLink>
);

export default function LeftTab() {


    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);
    const path = location.pathname;



    const navItems = [

        {
            to: '/settings',
            icon: <TbCircleLetterG className="w-4.5 h-4.5" />,
            title: 'General',
            subtitle: 'Settings',
        },
        {
            to: '/settings/permissions',
            icon: <TbCircleLetterG className="w-4.5 h-4.5" />,
            title: 'Permissions',
            subtitle: 'Verifications',
        },
        {
            condition: settingData?.branch_no > 1,
            to: '/settings/branches',
            icon: <TbCircleLetterG className="w-4.5 h-4.5" />,
            title: 'Branches',
            subtitle: 'Settings',
        },
        {
            to: '/settings/authentication-phones',
            icon: <TbCircleLetterG className="w-4.5 h-4.5" />,
            title: 'Authentication',
            subtitle: 'Phones',
        },
        // {

        //     to: '/settings/invoice',
        //     icon: <FaFileInvoice className="w-4.5 h-4.5" />,
        //     title: 'Invoice',
        //     subtitle: 'Settings',
        // },

        {
            condition: settingData?.company_type == 1,
            to: '/settings/aws',
            icon: <FaAws className="w-5 h-5" />,
            title: 'AWS',
            subtitle: 'Amazon Web Services',
        },

        {
            condition: settingData?.company_type == 1,
            to: '/settings/sebi',
            icon: <TbCircleLetterE className="w-4.5 h-4.5" />,
            title: 'SEBI',
            subtitle: 'Registered Details',
        },
        {
            to: '/settings/employees',
            icon: <TbCircleLetterE className="w-4.5 h-4.5" />,
            title: 'Employee',
            subtitle: 'Add, Edit, Delete',
        },
        {
            to: '/settings/dropdowns',
            icon: <TbCircleLetterD className="w-4.5 h-4.5" />,
            title: 'Dropdown',
            subtitle: 'Fields',
        },
        {
            to: '/settings/products',
            icon: <TbCircleLetterP className="w-4.5 h-4.5" />,
            title: 'Products',
            subtitle: 'Add, Edit, Delete',
        },
        // {
        //     condition: settingData?.lead_automation_enabled == 1,
        //     to: '/settings/lead-automations',
        //     icon: <TbCircleLetterL className="w-4.5 h-4.5" />,
        //     title: 'Lead Automation',
        //     subtitle: 'AI',
        // },
        {
            condition: settingData?.company_type == 1 && settingData?.whatsapp_enabled == 1,
            to: '/settings/whatsapp',
            icon: <TbCircleLetterW className="w-4.5 h-4.5" />,
            title: 'WhatsApp',
            subtitle: 'Template Integration',
        },
        {
            condition: settingData?.company_type == 1 && settingData?.sms_enabled == 1,
            to: '/settings/sms',
            icon: <MdSms className="w-4.5 h-4.5" />,
            title: 'SMS',
            subtitle: 'Template Integration',
        },
        {
            condition: settingData?.email_enabled == 1,
            to: '/settings/emails',
            icon: <MdEmail className="w-4.5 h-4.5" />,
            title: 'Email',
            subtitle: 'SMTP Integration',
        },
        {
            condition: settingData?.payment_permission == 1,
            to: '/settings/payments',
            icon: <FaRupeeSign className="w-4.5 h-4.5" />,
            title: 'Payments',
            subtitle: 'Bank Gateway',
        },


        {
            condition: settingData?.company_type == 1 && settingData?.riskprofile_enabled,
            to: '/settings/risk-profile',
            icon: <TbCircleLetterP className="w-4.5 h-4.5" />,
            title: 'Risk Profile',
            subtitle: 'Settings',
        },
        {
            to: '/settings/ip-traking',
            icon: <TbCircleLetterI className="w-4.5 h-4.5" />,
            title: 'IP Tracking',
            subtitle: 'Last Login\'s',
        },
    ];

    return (
        <div className="space-y-1">
            {navItems.map((item) =>

                item.condition != false || item.condition == true ? (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        title={item.title}
                        subtitle={item.subtitle}
                        isActive={path == item.to}
                    />
                ) : null
            )}
        </div>
    );
}
