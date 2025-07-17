import React, { useEffect, useState, Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MdMenu, MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineContactPhone } from "react-icons/md";
import { GiDiamondTrophy } from "react-icons/gi";
import { TbReportAnalytics } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { IoDocumentLockOutline } from "react-icons/io5";
import { useAuth } from '../../AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { MdOutlinePublic } from "react-icons/md";

import axios from 'axios';
export default function Menu() {
    const { logout, crmToken, settingData, authUser, apiUrl } = useAuth();
    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [time, setTime] = useState(getCurrentTime());
    const location = useLocation();
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getCurrentTime());
        }, 30000);
        return () => clearInterval(interval);
    }, []);


    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu visibility

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [modal1, setModal1] = useState(false);



    return (
        <>
            <div className="flex justify-between items-center py-1 px-3 bg-white border-t border-[#ebedf2] dark:border-[#191e3a] dark:bg-black text-black dark:text-white-dark">
                <button
                    className="lg:hidden text-black dark:text-white-dark"
                    onClick={() => setModal1(true)}
                >
                    <MdMenu size={24} />
                </button>

                <ul style={{ boxShadow: "none" }} className="horizontal-menu  hidden  text-base font-semibold  lg:space-x-1.5 xl:space-x-2 rtl:space-x-reverse bg-white  dark:bg-black text-black dark:text-white-dark">
                    {(authUser?.user_type == "Admin" || authUser?.user_type == "Floor Manager" || authUser?.user_type == 'Branch Admin') ? (<li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <MdOutlineSpaceDashboard />
                                <NavLink to="/">
                                    <span className="px-1">Dashboard</span>
                                </NavLink>
                            </div>
                            <div className="right_arrow">
                                <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>
                        <ul className="sub-menu ">
                            <li>
                                <NavLink to="/">Leads Dashboard</NavLink>
                            </li>
                            <li>
                                <NavLink to="/sales-dashboard">Sales Dashboard</NavLink>
                            </li>
                            <li>
                                <NavLink to="/custom-dashboard">Custom Dashboard</NavLink>
                            </li>
                        </ul>
                    </li>) : (<li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <MdOutlineSpaceDashboard />
                                <NavLink to="/"><span className="px-1">Dashboard</span></NavLink>
                            </div>
                        </button>
                    </li>)}
                    {["Admin", "Manager", 'Branch Admin', 'Floor Manager', "Team Leader", "BDE"].includes(authUser?.user_type) ? (
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <MdOutlineContactPhone />
                                    <span className="px-1">Leads</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li>
                                    <NavLink to="/leads/viewleads">View Leads</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/leads/addleads">Add Leads</NavLink>
                                </li>

                                {(authUser?.user_type == "Admin" || authUser?.user_type == "Floor Manager" || authUser?.user_type == 'Branch Admin') && (
                                    <>
                                        <li>
                                            <NavLink to="/leads/uploadleads">Upload Leads</NavLink>
                                        </li>

                                    </>
                                )}
                            </ul>
                        </li>
                    ) : null}

                    {authUser?.user_type == "Manager" || authUser?.user_type == "Team Leader" ? (<li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <MdOutlineSpaceDashboard />
                                <NavLink to="/team-leads"><span className="px-1">Team Leads</span></NavLink>
                            </div>
                        </button>
                    </li>) : null}




                    {["Admin", 'Branch Admin', "Accounts", "Manager", 'Floor Manager', "Team Leader", "BDE", 'HR', 'Complaince'].includes(authUser?.user_type) ? (<li className="menu nav-item relative">
                        <NavLink to={{
                            pathname: "/sales",
                        }}
                            state={{ page: 1 }} >
                            <button type="button" className={`${location.pathname == '/sales' ? " bg-[#000]/[0.08] text-black" : ''} nav-link`}>
                                <div className="flex items-center">
                                    <GiDiamondTrophy />
                                    <span className="px-1">Sales</span>
                                </div>
                            </button>
                        </NavLink>
                    </li>) : null}


                    {authUser?.user_type == "Manager" || authUser?.user_type == "Team Leader" ? (<li className="menu nav-item relative">
                        <button type="button" className={`${location.pathname == '/team-sales' ? " bg-[#000]/[0.08] text-black" : ''} nav-link`}>
                            <div className="flex items-center">
                                <GiDiamondTrophy />
                                <NavLink
                                    to={{
                                        pathname: "/team-sales",
                                    }}
                                    state={{ page: 1 }}
                                >
                                    <span className="px-1">Team Sales</span>
                                </NavLink>
                            </div>
                        </button>
                    </li>) : null}


                    {authUser?.user_type == "HR" ? (
                        <>
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <MdOutlineSpaceDashboard />
                                    <NavLink to="/settings/employees"><span className="px-1">Employees</span></NavLink>
                                </div>
                            </button>

                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <MdOutlineSpaceDashboard />
                                    <NavLink to="/settings/ip-traking"><span className="px-1">Attendances</span></NavLink>
                                </div>
                            </button>
                        </>
                    ) : null}


                    {(authUser.user_type === "Admin" ||
                        authUser?.user_type == 'Branch Admin' ||
                        authUser?.user_type == "Floor Manager" ||
                        authUser.user_type === "Accounts" ||
                        authUser.user_type === "Analyst") ? (<li className="menu nav-item relative">
                            <button type="button" className={`${location.pathname == '/settings' ? " bg-[#000]/[0.08] text-black" : ''} nav-link`}>
                                <div className="flex items-center">
                                    <TbReportAnalytics />
                                    <NavLink to="/reports/generatereport"><span className="px-1">Reports</span></NavLink>
                                </div>
                            </button>
                        </li>) : null}


                    {(authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") ? (<li className="menu nav-item relative">
                        <button type="button" className={`${location.pathname == '/settings' ? " bg-[#000]/[0.08] text-black" : ''} nav-link`}>
                            <div className="flex items-center">
                                <IoSettingsOutline />
                                <NavLink to="/settings"><span className="px-1">Settings</span></NavLink>
                            </div>
                        </button>
                    </li>) : null}

                    {apiUrl == 'https://growthcrm.thefinsap.com' && (authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") ? (<li className="menu nav-item relative">
                        <button type="button" className={`${location.pathname == '/public-general' ? " bg-[#000]/[0.08] text-black" : ''} nav-link`}>
                            <div className="flex items-center">
                                <MdOutlinePublic />
                                <NavLink to="/public-general"><span className="px-1">Public Site </span></NavLink>
                            </div>
                        </button>
                    </li>) : null}

                </ul>
                <button className="btn btn-dark text-white btn-sm">{time}</button>
            </div>

            <div >

                <Transition appear show={modal1} as={Fragment}>
                    <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0" />
                        </Transition.Child>
                        <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                            <div className="flex items-start justify-start min-h-screen px-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel
                                        as="div"
                                        className="panel border-0 p-1 rounded-lg -m-5 overflow-hidden  w-[260px] h-[100vh] text-black dark:text-white-dark"
                                    >
                                        <div className="flex  dark:bg-[#121c2c] items-center justify-between px-5 pt-5">
                                            <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                                                {settingData?.logo ? (<NavLink to="/" className="main-logo flex items-center shrink-0">
                                                    <img className="w-[250px] ltr:-ml-1 rtl:-mr-1 inline max-w-[150px]" src={`${apiUrl}/storage/${settingData?.logo}`} alt={`${settingData?.crm_name}`} />
                                                </NavLink>) : <b className='text-[20px]'>{settingData?.crm_name}</b>}

                                            </div>
                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                                x
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-center  bg-white border-t border-[#ebedf2] dark:border-[#191e3a] dark:bg-black text-black dark:text-white-dark">
                                                <ul style={{ boxShadow: "none" }} className="horizontal-menu    text-base font-semibold  lg:space-x-1.5 xl:space-x-2 rtl:space-x-reverse bg-white  dark:bg-black text-black dark:text-white-dark">




                                                    {(authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") ? (<li className="menu nav-item relative ">
                                                        <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                            <div className="flex items-center">
                                                                <MdOutlineSpaceDashboard />
                                                                <NavLink to="/">
                                                                    <span className="px-1">Dashboard</span>
                                                                </NavLink>
                                                            </div>
                                                            <div className="right_arrow">
                                                                <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                        <ul className="sub-menu ">
                                                            <li>
                                                                <NavLink to="/">Leads Dashboard</NavLink>
                                                            </li>
                                                            <li>
                                                                <NavLink to="/sales-dashboard">Sales Dashboard</NavLink>
                                                            </li>
                                                            {/* <li>
            <NavLink to="/dashboard/customdashboard">Custom Dashboard</NavLink>
        </li> */}
                                                        </ul>
                                                    </li>) : (<li className="menu nav-item relative ">
                                                        <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                            <div className="flex items-center">
                                                                <MdOutlineSpaceDashboard />
                                                                <NavLink to="/"><span className="px-1">Dashboard</span></NavLink>
                                                            </div>
                                                        </button>
                                                    </li>)}






                                                    {["Admin", "Manager", 'Branch Admin', 'Floor Manager', "Team Leader", "BDE"].includes(authUser?.user_type) ? (
                                                        <li className="menu nav-item relative ">
                                                            <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                                <div className="flex items-center">
                                                                    <MdOutlineContactPhone />
                                                                    <span className="px-1">Leads</span>
                                                                </div>
                                                                <div className="right_arrow">
                                                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            </button>
                                                            <ul className="sub-menu">
                                                                <li  >
                                                                    <NavLink to="/leads/viewleads">View Leads</NavLink>
                                                                </li>
                                                                <li>
                                                                    <NavLink to="/leads/addleads">Add Leads</NavLink>
                                                                </li>
                                                                {(authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") && (
                                                                    <>
                                                                        <li>
                                                                            <NavLink to="/leads/uploadleads">Upload Leads</NavLink>
                                                                        </li>
                                                                        {settingData?.app_enabled === 1 && (
                                                                            <li>
                                                                                <NavLink to="/registerdClient">App Registerd Client</NavLink>
                                                                            </li>
                                                                        )}
                                                                    </>
                                                                )}

                                                            </ul>
                                                        </li>
                                                    ) : null}

                                                    {authUser?.user_type == "Manager" || authUser?.user_type == "Team Leader" ? (<li className="menu nav-item relative ">
                                                        <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                            <div className="flex items-center">
                                                                <MdOutlineSpaceDashboard />
                                                                <NavLink to="/team-leads"><span className="px-1">Team Leads</span></NavLink>
                                                            </div>
                                                        </button>
                                                    </li>) : null}




                                                    {["Admin", 'Branch Admin', "Accounts", "Manager", 'Floor Manager', "Team Leader", "BDE"].includes(authUser?.user_type) ? (<li className="menu nav-item relative ">
                                                        <NavLink to="/sales" >
                                                            <button type="button" className={`${location.pathname == '/sales' ? " bg-[#000]/[0.08] text-black" : ''} nav-link bg-[#f1faff] w-48 rounded mt-2`}>
                                                                <div className="flex items-center">
                                                                    <GiDiamondTrophy />
                                                                    <span className="px-1">Sales</span>
                                                                </div>
                                                            </button>
                                                        </NavLink>
                                                    </li>) : null}


                                                    {authUser?.user_type == "Manager" || authUser?.user_type == "Team Leader" ? (<li className="menu nav-item relative ">
                                                        <button type="button" className={`${location.pathname == '/team-sales' ? " bg-[#000]/[0.08] text-black" : ''} nav-link bg-[#f1faff] w-48 rounded mt-2`}>
                                                            <div className="flex items-center">
                                                                <GiDiamondTrophy />
                                                                <NavLink to="/team-sales"><span className="px-1">Team Sales</span></NavLink>
                                                            </div>
                                                        </button>
                                                    </li>) : null}





                                                    {(authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager" || authUser?.user_type == "Analyst")

                                                        ? (
                                                            <li className="menu nav-item relative ">
                                                                <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                                    <div className="flex items-center">
                                                                        <TbReportAnalytics />
                                                                        <span className="px-1">Analyst</span>
                                                                    </div>
                                                                    <div className="right_arrow">
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                                                            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                </button>
                                                                <ul className="sub-menu">
                                                                    <li><NavLink to="/analyst/campaign">Campaign</NavLink></li>
                                                                    <li><NavLink to="/analyst/saleservice">Sales Campaign</NavLink></li>
                                                                    <li><NavLink to="/analyst/expiredservice">Expired Service</NavLink></li>
                                                                    <li><NavLink to="/analyst/pausedservice">Paused Service</NavLink></li>
                                                                </ul>
                                                            </li>
                                                        ) : null
                                                    }



                                                    {(authUser.user_type === "Admin" ||
                                                        authUser?.user_type == 'Branch Admin' ||
                                                        authUser?.user_type == "Floor Manager" ||
                                                        authUser.user_type === "Accounts" ||
                                                        authUser.user_type === "Analyst") &&
                                                        (
                                                            <li className="menu nav-item relative ">
                                                                <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                                    <div className="flex items-center">
                                                                        <IoDocumentLockOutline />
                                                                        <span className="px-1">Documents</span>
                                                                    </div>
                                                                    <div className="right_arrow">
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                                                            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                </button>
                                                                <ul className="sub-menu">



                                                                    {settingData?.invoice_enabled === 1 && (
                                                                        <li>
                                                                            <NavLink to="/documents/invoice">Invoice</NavLink>
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </li>
                                                        )}





                                                    {authUser?.user_type == "HR" ? (
                                                        <>
                                                            <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                                <div className="flex items-center">
                                                                    <MdOutlineSpaceDashboard />
                                                                    <NavLink to="/settings/employees"><span className="px-1">Employees</span></NavLink>
                                                                </div>
                                                            </button>

                                                            <button type="button" className="nav-link bg-[#f1faff] w-48 rounded mt-2">
                                                                <div className="flex items-center">
                                                                    <MdOutlineSpaceDashboard />
                                                                    <NavLink to="/"><span className="px-1">Attendances</span></NavLink>
                                                                </div>
                                                            </button>
                                                        </>
                                                    ) : null}


                                                    {(authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") ? (<li className="menu nav-item relative ">
                                                        <button type="button" className={`${location.pathname == '/settings' ? " bg-[#000]/[0.08] text-black" : ''} nav-link bg-[#f1faff] w-48 rounded mt-2`}>
                                                            <div className="flex items-center">
                                                                <IoSettingsOutline />
                                                                <NavLink to="/settings"><span className="px-1">Settings </span></NavLink>
                                                            </div>
                                                        </button>
                                                    </li>) : null}

                                                    {apiUrl == 'https://growthcrm.thefinsap.com' && (authUser?.user_type == "Admin" || authUser?.user_type == 'Branch Admin' || authUser?.user_type == "Floor Manager") ? (<li className="menu nav-item relative ">
                                                        <button type="button" className={`${location.pathname == '/public-general' ? " bg-[#000]/[0.08] text-black" : ''} nav-link bg-[#f1faff] w-48 rounded mt-2`}>
                                                            <div className="flex items-center">
                                                                <MdOutlinePublic />
                                                                <NavLink to="/public-general"><span className="px-1">Public Site</span></NavLink>
                                                            </div>
                                                        </button>
                                                    </li>) : null}

                                                </ul>
                                            </div >



                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>

        </>
    )
}
