import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import axios from 'axios';
import { setCrmToken, setLeadRequestCount } from '../../store/themeConfigSlice';
import PageLoader from '../../components/Layouts/PageLoader';
import AllReferClientDrawer from '../Development/AllReferClientDrawer';
import ViewTransferLeads from '../Development/ViewTransferLeads';
import { FaRegStar } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useAuth } from '../../AuthContext';
import { IRootState } from '../../store';
import { TbRefreshDot } from "react-icons/tb";
export default function MainLeft({ children }: PropsWithChildren) {

    const { logout, authUser, settingData, crmToken, apiUrl } = useAuth();

    const leadRequestCount = useSelector((state: IRootState) => state.themeConfig.leadRequestCount);
    const dispatch = useDispatch();

    const [showCustomizer, setShowCustomizer] = useState(false);

    //

    const [active, setActive] = useState<string>('');

    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        if (active) fetchNavData()
    }, [active])

    const [isLoading, setIsLoading] = useState(false);

    const fetchNavData = async () => {
        console.log('Fetching Left nav data for ' + active);
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lef-nav-data",
                params: { action: active },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });


            if (response.data.status == "success") handleResponse(response.data)
            else alert("error")
        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false)
        }
    }

    const [files, setFiles] = useState([]);
    const [activities, setActivities] = useState([]);
    const [monthSales, setMonthSales] = useState([]);
    const [referClient, setReferClient] = useState([]);
    const [transferClient, setTransferClient] = useState([]);
    const [calls, setCalls] = useState<any>([]);
    const [sales, setSales] = useState<any>([]);
    const [leadRequests, setLeadRequests] = useState<any>([]);
    const handleResponse = (data: any) => {
        if (data.action == "lead-upload") setFiles(data.data)
        else if (data.action == "recent-activity") setActivities(data.data)
        else if (data.action == "month-sale") setMonthSales(data.data)
        else if (data.action == "refer-client") setReferClient(data.data)
        else if (data.action == "calls-details") setCalls(data.data)
        else if (data.action == "sales-details") setSales(data.data)
        else if (data.action == "transfer-clients") setTransferClient(data.data)
        else if (data.action == "lead-request") {
            setLeadRequests(data.data)
            dispatch(setLeadRequestCount(data.data.length))
        }
    }
    const [showAllReferClient, setShowAllReferClient] = useState(false);
    const initialRecords = referClient.slice(0, 10);

    const [showAllReferClientDrawer, setShowReferClientDrawer] = useState(false);
    const [showAllTransferClientDrawer, setShowAllTransferClientDrawer] = useState(false);

    const [data, setData] = useState([])
    const handleReport = (tranfer: any) => {
        setData(tranfer);
        setShowAllTransferClientDrawer(true);

    }
    const [tab, setTab] = useState('');
    const [referredData, setReferredData] = useState('');
    const handleReferredClient = (lead) => {
        setShowReferClientDrawer(true);
        setReferredData(lead);
        setTab('view-referred-client');
    }
    const handleViewAll = (referClient) => {
        setReferClient(referClient);
        setShowReferClientDrawer(true);
        setTab('referred-client-lead-data');
    }
    const handleLeadRequest = (request) => {
        Swal.fire({
            title: 'Cancel Request?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Cancel Now',
            cancelButtonText: 'No',
            padding: '2em',
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'post',
                        url: apiUrl + "/api/cancel-lead-request",
                        data: { id: request.id },
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken,
                        },
                    });
                    if (response.data.status == "success") {
                        setLeadRequests(leadRequests.filter((r: any) => r.id != request.id))

                        dispatch(setLeadRequestCount(leadRequestCount - 1))
                    } else alert(response.data.message)


                } catch (error) {

                    console.log(error)
                    //
                }
            },
        })
    }

    const stickyButtonStyle = {
        position: 'sticky',
        bottom: '0px',
        // backgroundColor: '#32CD32',
        backgroundColor: 'rgb(33, 150, 243)',
        color: '#fff',
        // padding: '5px 5px',
        borderRadius: '5px',
        padding: 2,

        cursor: 'pointer',
        zIndex: 1000,
        textAlign: 'center',
    };

    return (
        <div className={`flex relative  h-full sm:min-h-0 `}>
            {/* sm:h-[calc(100vh_-_150px)] */}
            {/* <div className={`panel p-4 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full h-full hidden xl:block overflow-hidden ${isShowChatMenu ? '!block' : ''}`}> */}
            <div className={`panel p-2 w-[275px] mr-2`}>
                {/* --------------------------------------For Admin-------------------------------------- */}
                {authUser.user_type == "Admin" ? (
                    <>
                        <div className="border border-[#d3d3d3] dark:border-[#1b2e4b]  rounded  mb-2">
                            <button
                                type="button"
                                className={`p-4 w-full flex items-center dark:text-[#bfc9d4] text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                                onClick={() => togglePara('lead-request')}
                            >
                                Lead Requests
                                <div className={`ltr:ml-auto rtl:mr-auto `}>
                                    <TbRefreshDot size={20} />
                                </div>
                            </button>
                            <div>
                                <AnimateHeight duration={300} height={active === 'lead-request' ? 'auto' : 0}>
                                    <div className=" text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                        <PerfectScrollbar className="relative ">
                                            {isLoading && active == "lead-request" ? <PageLoader /> : (
                                                <>
                                                    {leadRequests.length ? (<div className="text-sm cursor-pointer">
                                                        <div className="table-responsive">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>User</th>
                                                                        <th>State</th>
                                                                        <th>Count</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {leadRequests.map((request: any, index: any) => (
                                                                        <tr key={index} onClick={() => handleLeadRequest(request)}>
                                                                            <td>
                                                                                <div className="whitespace-nowrap">{request.first_name} {request.last_name}</div>
                                                                            </td>
                                                                            <td>{request.state}</td>
                                                                            <td>{request.count}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>) : (
                                                        <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                                                            <span className="ltr:pr-2 rtl:pl-2">
                                                                <strong className="ltr:mr-1 rtl:ml-1">No Request Found!</strong>
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                        </PerfectScrollbar>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>

                        <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]  mb-2">
                            <button
                                type="button"
                                className={`p-4 w-full flex items-center dark:text-[#bfc9d4] text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] ${active === 'lead-upload' ? '!text-primary' : ''}`}
                                onClick={() => togglePara('lead-upload')}
                            >
                                Leads Uploaded Activities
                                <div className={`ltr:ml-auto rtl:mr-auto ${active === 'lead-upload' ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div>
                                <AnimateHeight duration={300} height={active === 'lead-upload' ? 'auto' : 0}>
                                    <div className="space-y-2 p-4 text-dark dark:text-[#bfc9d4] text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                        <PerfectScrollbar className="relative h-[100px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                                            {isLoading && active == "lead-upload" ? <PageLoader /> : (
                                                <div className="text-sm cursor-pointer">
                                                    {files.map((file: any) => (
                                                        <Tippy
                                                            key={file.id}
                                                            placement='right'
                                                            content={`Inseted: ${file.inserted}  Duplicate: ${file.duplicate} Invalid: ${file.invalid
                                                                }`}

                                                        >
                                                            <div className="flex items-center py-1.5 relative group">
                                                                <div className="flex-1">{file.unique_id}</div>
                                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">{file.created_at
                                                                }</div>

                                                            </div>
                                                        </Tippy>
                                                    ))}


                                                </div>
                                            )}


                                        </PerfectScrollbar>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    </>
                ) : null}
                {/* --------------------------------------For BDE and Manager-------------------------------------- */}
                <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded mb-2">
                    <button
                        type="button"
                        className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                        onClick={() => togglePara('month-sale')}
                    >
                        Last 4 Month Sales
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <div>
                        <AnimateHeight duration={300} height={active === 'month-sale' ? 'auto' : 0}>
                            <div className="p-4 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">


                                    {isLoading && active == "month-sale" ? <PageLoader /> : (
                                        <div className="text-sm cursor-pointer">
                                            {monthSales.map((month: any, index) => (
                                                <div key={index} className="flex items-center py-1.5 relative group" >
                                                    <div className="flex-1">{month.month}</div>
                                                    <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">₹{month.amount}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </PerfectScrollbar>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                {/* --------------------------------------For BDE and Manager-------------------------------------- */}
                <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded  mb-2">
                    <button
                        type="button"
                        className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                        onClick={() => togglePara('calls-details')}
                    >
                        Call Details
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <div>
                        <AnimateHeight duration={300} height={active === 'calls-details' ? 'auto' : 0}>
                            <div className="p-1 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">

                                {isLoading && active == "calls-details" ? <PageLoader /> : (
                                    <div className="table-responsive mb-5">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Value</th>
                                                    <th>Daily</th>
                                                    <th>Monthly</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="whitespace-nowrap">Calls</div>
                                                    </td>
                                                    <td>{calls['calls']?.daily}</td>
                                                    <td>{calls['calls']?.monthly}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="whitespace-nowrap">Free Trial</div>
                                                    </td>
                                                    <td>{calls['freeTrail']?.daily}</td>
                                                    <td>{calls['freeTrail']?.monthly}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="whitespace-nowrap">Follow Up</div>
                                                    </td>
                                                    <td>{calls['followUp']?.daily}</td>
                                                    <td>{calls['followUp']?.monthly}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                {/* --------------------------------------For Admin, Accounts and Manager(View)-------------------------------------- */}
                <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded  mb-2">
                    <button
                        type="button"
                        className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                        onClick={() => togglePara('sales-details')}
                    >
                        Sales Details
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <div>
                        <AnimateHeight duration={300} height={active === 'sales-details' ? 'auto' : 0}>
                            <div className="p-1 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                {isLoading && active == "sales-details" ? <PageLoader /> : (
                                    <div className="table-responsive mb-5">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sales.map((sale: any) => (
                                                    <tr key={sale.id} >
                                                        <td>
                                                            <div className="whitespace-nowrap">{sale.name}</div>
                                                        </td>
                                                        <td>₹{sale.amount}</td>
                                                        <td>{sale.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                {/* --------------------------------------For BDE and Manager-------------------------------------- */}
                {settingData?.transfer_permission == 1 &&
                    authUser?.user_type === 'Admin' && <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded  mb-2">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                            onClick={() => togglePara('transfer-clients')}
                        >
                            Transfer Clients
                            <div className={`ltr:ml-auto rtl:mr-auto `}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === 'transfer-clients' ? 'auto' : 0}>
                                <div className="p-4 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                                        {isLoading && active == "transfer-clients" ? <PageLoader /> : (
                                            <div className="text-sm cursor-pointer">

                                                <div className="text-sm cursor-pointer">
                                                    {transferClient?.map((transfer: any) => (
                                                        <div key={transfer.id} className=" py-1.5 relative group" onClick={() => {
                                                            {
                                                                handleReport(transfer)
                                                            }
                                                        }} >
                                                            <div className='flex items-center  relative group'>
                                                                <div className="flex-1">{transfer.first_name}</div>
                                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">{transfer.phone}</div>
                                                            </div>
                                                            <div className='flex items-center'>
                                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">Transferred by:{transfer.owner}</div>
                                                            </div>
                                                            <hr />
                                                        </div>
                                                    ))}
                                                </div>
                                                <ViewTransferLeads
                                                    showAllTransferClientDrawer={showAllTransferClientDrawer}
                                                    setShowAllTransferClientDrawer={setShowAllTransferClientDrawer}
                                                    transferClient={transferClient}
                                                    setTransferClient={setTransferClient}
                                                    data={data}
                                                />

                                            </div>
                                        )}
                                    </PerfectScrollbar>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                }
                {
                    settingData?.refer_permission == 1 &&
                    <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded  mb-2">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] `}
                            onClick={() => togglePara('refer-client')}
                        >
                            Refer Clients
                            <div className={`ltr:ml-auto rtl:mr-auto `}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === 'refer-client' ? 'auto' : 0}>
                                <div className="p-4 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                                        {isLoading && active == "refer-client" ? <PageLoader /> : (
                                            <div className="text-sm cursor-pointer">
                                                {(showAllReferClient ? referClient : initialRecords).map((lead: any) => (
                                                    <div key={lead.id} className=" py-1.5 relative group" onClick={() => {
                                                        {
                                                            handleReferredClient(lead)
                                                            setTab('referred-client-lead-data')
                                                        }
                                                    }} >
                                                        <div className='flex items-center  relative group'>
                                                            <div className="flex-1">{lead.client}</div>
                                                            <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">{lead.phone}</div>
                                                        </div>
                                                        <div className='flex items-center'>
                                                            <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">Refered by:{lead.owner}</div>
                                                        </div>
                                                        <hr />
                                                    </div>
                                                ))}

                                                {referClient.length > 10 && (
                                                    <div style={stickyButtonStyle} onClick={() => {
                                                        handleViewAll(referClient);
                                                        setTab('view-referred-client');
                                                    }}>
                                                        View All
                                                    </div>
                                                )}

                                                <AllReferClientDrawer
                                                    showAllReferClientDrawer={showAllReferClientDrawer}
                                                    setShowReferClientDrawer={setShowReferClientDrawer}
                                                    referClient={referClient}
                                                    setReferClient={setReferClient}
                                                    tab={tab}
                                                    referredData={referredData}
                                                />

                                            </div>
                                        )}
                                    </PerfectScrollbar>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                }
                {/* --------------------------------------For All-------------------------------------- */}

                {/* <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]  mb-2">
                            <button
                                type="button"
                                className={`p-4 w-full flex items-center text-dark dark:text-[#bfc9d4] dark:bg-[#1b2e4b] ${active === 'recent-activity' ? '!text-primary' : ''}`}
                                onClick={() => togglePara('recent-activity')}
                            >
                                Recent Activities
                                <div className={`ltr:ml-auto rtl:mr-auto ${active === 'recent-activity' ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div>
                                <AnimateHeight duration={300} height={active === 'recent-activity' ? 'auto' : 0}>
                                    <div className="space-y-2 p-4 text-dark dark:text-[#bfc9d4] text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                        <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">

                                            {isLoading && active == "recent-activity" ? <PageLoader /> : (
                                                <div className="text-sm cursor-pointer">
                                                    {activities.map((activity: any, index) => (
                                                        <div key={index + 1} className="flex items-center py-1.5 relative group">
                                                            <div className="flex-1">{activity.activitiy}</div>
                                                            <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-[#bfc9d4] dark:text-gray-500">{activity.created_at}</div>
                                                        </div>
                                                    ))}


                                                </div>
                                            )}

                                        </PerfectScrollbar>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div> */}
            </div>
            {/* Right Part  */}
            {children}
            {/* Right Part End */}
        </div>
    )
}
