import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleTheme, setSelectedBranch, setBroadcast, setCrmVersion } from '../../store/themeConfigSlice';
import Dropdown from '../Dropdown';
import { TbReport } from "react-icons/tb";
import { PiNotepad } from "react-icons/pi";
import { IoAlertCircleSharp } from "react-icons/io5";
import IconChatNotification from '../Icon/IconChatNotification';
import Chatbox from './Chatbox';
import axios from 'axios';
import { MdPhoneCallback } from "react-icons/md";
import CallbackDrawer from './CallbackDrawer';
import Marquee from "react-fast-marquee";
import Tippy from '@tippyjs/react';
import { useAuth } from '../../AuthContext';
import UpdateProfile from './UpdateProfile';
import Search from './Search';
import { IoSearchOutline } from "react-icons/io5";
import Menu from './Menu';
import BroadCastAlert from './BroadCastAlert';
import CrmUpdateModal from './CrmUpdateModal';
const Header = ({ _CALLBACK }: any) => {
    const { logout, crmToken, authUser, apiUrl, branches, settingData, selectedBranch } = useAuth();
    const leadAlert = useSelector((state: IRootState) => state.themeConfig.leadAlert);

    const broadcast = useSelector((state: IRootState) => state.themeConfig.broadcast);
    const crmVersion = useSelector((state: IRootState) => state.themeConfig.crmVersion);


    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const [showDrawer, setShowDrawer] = useState(false)
    const Logout = async () => {
        if (!0 == confirm("Are you sure you want to logout?"))
            try {
                let t = await axios({ method: "post", url: apiUrl + "/api/logout", headers: { "Content-Type": "application/json", Authorization: "Bearer " + crmToken } });
                "success" == t.data.status ? logout() : alert(t.data.message);
            } catch (o: any) {
                401 == o.response.status && logout();
            }
    };

    const logoutAll = async () => {
        if (!0 == confirm("Are you sure you want to logout All users?"))
            try {
                let t = await axios({ method: "post", url: apiUrl + "/api/logout-all-users", headers: { "Content-Type": "application/json", Authorization: "Bearer " + crmToken } });
                "success" == t.data.status ? alert(t.data.message) : alert(t.data.message);
            } catch (o: any) {
                401 == o.response.status && logout();
            }
    };

    const [chats, setChats] = useState([])

    const [latestBroadCast, setLatestBroadCast] = useState(broadcast);

    const [showCallbackDrawer, setShowCallbackDrawer] = useState(false);
    const [profileUpdateDrawer, showProfileUpdateDrawer] = useState(false)
    const [searchDrawer, setSearchDrawer] = useState(false);

    const [isOpen, setIsOpen] = useState(false);


    const [isWindowActive, setIsWindowActive] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsWindowActive(!document.hidden);

            if (!document.hidden) fetchLatestData()
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const navigationType = window.performance?.navigation?.type;
        if (navigationType === 1) {
            fetchLatestData()
        }
    }, []);


    const [updateModal, setUpdateModal] = useState(false);
    const fetchLatestData = async () => {

        if (updateModal) return 0;
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-crm-latest-data",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            // setCrmVersion
            if (response.data?.status === "success") {
                const newBroadcast = response.data?.data?.broadCast;
                const newCrmVersion = response.data?.data?.crmVersion;
                if (crmVersion != newCrmVersion) {
                    console.log("updating")
                    dispatch(setCrmVersion(newCrmVersion))
                    setUpdateModal(true)
                } else dispatch(setCrmVersion(newCrmVersion))

                if (newBroadcast) {
                    const storedBroadcast = localStorage.getItem('broadcast');
                    if (storedBroadcast) {
                        const parsedBroadcast = JSON.parse(storedBroadcast);
                        if (parsedBroadcast.id !== newBroadcast.id) {
                            dispatch(setBroadcast(JSON.stringify(newBroadcast)));
                        }
                    } else {
                        dispatch(setBroadcast(JSON.stringify(newBroadcast)));
                    }
                }
            }

        } catch (error) {
            if (error?.response?.status == 401) logout()
        }
    }


    useEffect(() => {
        if (broadcast) setLatestBroadCast(broadcast)
        if (broadcast.new) setIsOpen(true)
    }, [broadcast])
    return (
        <>
            <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
                <div className="shadow-sm">
                    <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
                        <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                            {settingData?.logo ? (<NavLink to="/" className="main-logo flex items-center shrink-0">
                                <img className="max-h-[50px] ltr:-ml-1 rtl:-mr-1 inline max-w-[150px]" src={`${apiUrl}/storage/${settingData?.logo}`} alt={`${settingData?.crm_name}`} />
                            </NavLink>) : <b className='text-[20px]'>{settingData?.crm_name}</b>}
                        </div>
                        <div>
                            <select
                                onChange={(e) => dispatch(setSelectedBranch(e.target.value))}
                                value={selectedBranch}
                                className={`form-select w-[200px] h-8 ${branches.length <= 1 ? 'bg-[#DBE7FF]' : ''} `} disabled={branches.length <= 1} >
                                {branches.length > 1 ? <option value={0}>All</option> : null}
                                {
                                    branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <UpdateProfile showProfileUpdateDrawer={showProfileUpdateDrawer} profileUpdateDrawer={profileUpdateDrawer} authUser={authUser} />

                        <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">


                            <Marquee
                                pauseOnHover={true}
                                direction="left"
                                speed={50}
                                gradientColor={[255, 255, 255]}
                            >
                                <span className=' text-primary font-bold text-[16px]' style={{ margin: '0 10px' }}>
                                    {latestBroadCast?.message}
                                </span>
                            </Marquee>

                            {leadAlert == "1" ? (<button className=''>
                                <IoAlertCircleSharp className='animate-ping mx-4' color='red' size={20} />
                            </button>) : ''}

                            <div>




                                {themeConfig.theme === 'light' ? (
                                    <button
                                        className={`${themeConfig.theme === 'light' &&
                                            'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                            }`}
                                        onClick={() => {
                                            dispatch(toggleTheme('dark'));
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                ) : (
                                    ''
                                )}
                                {themeConfig.theme === 'dark' && (
                                    <button
                                        className={`${themeConfig.theme === 'dark' &&
                                            'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                            }`}
                                        onClick={() => {
                                            dispatch(toggleTheme('light'));
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </button>
                                )}

                            </div>
                            {/* Call Back    */}
                            {
                                authUser?.user_type == 'HR'
                                    || authUser?.user_type == 'Accounts' || authUser?.user_type == 'Networking'
                                    ? '' :
                                    <div>
                                        <Tippy content="Call Back" placement="bottom">
                                            <button type="button" onClick={() => setShowCallbackDrawer(!showCallbackDrawer)} className="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                                                <span>
                                                    <MdPhoneCallback size={20} />
                                                    <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                                                        <span className="animate-ping absolute ltr:-left-[3px] rtl:-right-[3px] -top-[3px] inline-flex h-full w-full rounded-full bg-success/50 opacity-75">
                                                        </span>
                                                        <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-success">
                                                        </span>
                                                    </span>
                                                </span>
                                            </button>
                                        </Tippy>
                                        <CallbackDrawer showCallbackDrawer={showCallbackDrawer} setShowCallbackDrawer={setShowCallbackDrawer} _CALLBACK={_CALLBACK} />
                                    </div>
                            }




                            {/* Search  */}
                            <div>
                                <Tippy content="Search" placement="bottom">
                                    <button
                                        onClick={() => setSearchDrawer(true)}
                                        className="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                    >
                                        <IoSearchOutline size={20} />
                                    </button>
                                </Tippy>
                            </div>

                            {/* Notepad  */}
                            <div className="">
                                <Tippy content="Notepad" placement="bottom">
                                    <NavLink to='/notepads'
                                        className="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                                        <PiNotepad size={20} />
                                    </NavLink>
                                </Tippy>
                            </div>



                            {/* broadcast  */}
                            <div>
                                <Tippy content="Broadcast" placement="bottom">
                                    <button
                                        onClick={() => {
                                            setShowDrawer(!showDrawer);

                                        }}
                                        className="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                    >
                                        <IconChatNotification />
                                    </button>
                                </Tippy>
                                <Chatbox showDrawer={showDrawer} chats={chats} setShowDrawer={setShowDrawer} />
                            </div>



                            <div className="dropdown shrink-0">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="relative block rounded-full  pr-3  dark:bg-dark/40 hover:text-primary  dark:hover:bg-dark/60"
                                    button={
                                        <div>

                                            <img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${authUser?.first_name + ' ' + authUser?.last_name}`} alt="userProfile" />

                                        </div>
                                    }
                                >
                                    <ul className="text-dark dark:text-white-dark !py-0 w-max font-semibold  dark:text-white-light/90">
                                        <li>
                                            <div className="flex items-center px-4 py-4">
                                                <img className="rounded-md w-10 h-10 object-cover" src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${authUser?.first_name + ' ' + authUser?.last_name}`} alt="userProfile" />
                                                <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                    <h4 className="text-base">
                                                        {authUser?.first_name + ' ' + authUser?.last_name}
                                                        <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2">{authUser?.user_type}</span>
                                                    </h4>
                                                    <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                        {authUser?.email}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <Link to="#" onClick={() => { showProfileUpdateDrawer(true) }} className="dark:hover:text-white">
                                                <svg className="ltr:mr-2 rtl:ml-2 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                                    <path
                                                        opacity="0.5"
                                                        d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                    />
                                                </svg>
                                                Profile
                                            </Link>

                                        </li>

                                        <li className="border-t border-white-light dark:border-white-light/10">
                                            <button onClick={() => Logout()} className="text-danger !py-3">
                                                <svg className="ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        opacity="0.5"
                                                        d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                    <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </li>
                                    </ul>

                                    {authUser?.user_type == "Admin" || authUser?.user_type == "HR" ? (<button onClick={() => logoutAll()} className="flex mt-5 btn btn-danger m-auto !py-3">
                                        <svg className="ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                opacity="0.5"
                                                d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                            <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Sign Out All Users
                                    </button>) : null}

                                </Dropdown>
                            </div>

                        </div>
                    </div>
                    {/* horizontal menu */}




                    <Menu />

                </div>
            </header>
            <Search searchDrawer={searchDrawer} setSearchDrawer={setSearchDrawer} />
            <BroadCastAlert broadcast={latestBroadCast} isOpen={isOpen} setIsOpen={setIsOpen} />
            <CrmUpdateModal updateModal={updateModal} setUpdateModal={setUpdateModal} />
        </>
    );
};

export default Header;
