import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import IconX from '../../../../components/Icon/IconX';
import PageLoader from '../../../../components/Layouts/PageLoader';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../../../AuthContext';
import { IoCloseSharp } from 'react-icons/io5';
import SalesHistory from './SalesHistory';
export default function StatusHistory({ statusHistoryDrawer, setStatusHistoryDrawer, lead_id }) {
    const { logout, crmToken, apiUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [leadHistories, setLeadHistories] = useState([]);


    useEffect(() => {
        if (statusHistoryDrawer) fetchStatusHistory()
    }, [statusHistoryDrawer])

    const fetchStatusHistory = async () => {
        console.log("Fetching Status History...")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/get-lead-statuses/" + lead_id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setLeadHistories(response.data.leadStatuses)
            } else alert("error")
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }


    const [a, b] = useState('status');
    const [salesHistoryDrawer, setSalesHistoryDrawer] = useState(false);



    const [isFetching, setIsFetching] = useState(false);
    const [salesHistories, setSalesHistories] = useState([]);

    const handleSalesHistory = async () => {
        setIsFetching(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-sales-history",
                params: {
                    lead_id: lead_id
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") setSalesHistories(response.data.sales)

        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        handleSalesHistory()
    }, [])


    return (

        <div>
            <div className={`${(statusHistoryDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setStatusHistoryDrawer(false)}></div>
            <nav
                className={`${(statusHistoryDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[650px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setStatusHistoryDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Lead  History</h3>
                    </div>
                    <div className='flex gap-4'>
                        <button
                            className={`${a == "status" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                            onClick={() => b('status')}
                            type='button'
                        >
                            Status History
                        </button>
                        <button
                            className={`${a == "sales" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                            onClick={() => b('sales')} type='button'>
                            Sales History
                        </button>
                    </div>
                    {
                        a == 'status' ?
                            <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">



                                <PerfectScrollbar className="relative h-full  ">
                                    <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">



                                        <>
                                            {isLoading ? <PageLoader /> : (
                                                <>


                                                    {leadHistories?.length ? (
                                                        <PerfectScrollbar className=" relative mx-4">
                                                            {leadHistories?.map((history: any, index: any) => (
                                                                <div key={index} className='bg-[#eee] rounded p-2 mb-2'>
                                                                    <div className='flex justify-between items-center'>
                                                                        <div className="flex items-center">
                                                                            <div className="flex-none">
                                                                                <img src={`https://ui-avatars.com/api/?background=random&name=${history.first_name} ${history.last_name}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                            </div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 font-semibold ">{history.first_name} {history.last_name}</p>
                                                                                <p className="text-xs text-white-dark">{history.created_at}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="badge bg-secondary">{history.status}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className='bg-white p-2 my-2 rounded '>
                                                                        <ol>
                                                                            {(() => {
                                                                                try {
                                                                                    const changes = JSON.parse(history?.changes);
                                                                                    return changes.map((change, index) => (
                                                                                        <li className='mb-1.5' key={index}>
                                                                                            <b>{change.field}</b> changed from
                                                                                            <span className='badge bg-[#888ea8] mx-2'>{change.original || 'N/A'}</span>
                                                                                            to
                                                                                            <span className='badge bg-[#3b3f5c] mx-2'>{change.new}</span>
                                                                                        </li>
                                                                                    ));
                                                                                } catch (error) {
                                                                                    console.error("Error parsing JSON:", error);
                                                                                    // return <li>Error displaying changes</li>;
                                                                                }
                                                                            })()}
                                                                        </ol>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </PerfectScrollbar>
                                                    ) : (<>
                                                        <div className="flex flex-wrap w-full justify-center mb-5">
                                                            <div className="rounded-md bg-danger-light p-6 pt-12 mt-8 relative">
                                                                <div className="bg-danger/50 absolute text-white-light ltr:left-6 rtl:right-6 -top-8 w-16 h-16 rounded-md flex items-center justify-center mb-5 mx-auto">
                                                                    <BsFillInfoCircleFill size={35} />
                                                                </div>
                                                                <h5 className="text-dark text-lg font-semibold mb-3.5 dark:text-white-light">No History</h5>
                                                                <p className="text-white-dark text-[15px]  mb-3.5">No history found with this lead!</p>
                                                            </div>
                                                        </div>

                                                    </>)}

                                                </>
                                            )}

                                        </>





                                    </div>
                                </PerfectScrollbar>
                            </section> :
                            <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                                <PerfectScrollbar className="relative h-full  ">
                                    <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">



                                        {isFetching ? <PageLoader /> : (
                                            <>

                                                {salesHistories.length ? salesHistories.map((sale: any, index: number) => (

                                                    <div key={index} className={`flex justify-between items-center mx-4 mb-2
                                                     ${sale.status == "Approved" ? 'bg-success-light' :
                                                            sale.status == "Verified" ? 'bg-info-light' :
                                                                sale.status == "Pending" ? 'bg-warning-light' :
                                                                    sale.status == "Paused" ? 'bg-dark-light' :
                                                                        'bg-danger-light'}
                                                 rounded p-2 mb-2`}>
                                                        <div className="flex items-center ">
                                                            <div className="flex-none">
                                                                <img src={`https://ui-avatars.com/api/?background=random&name=${sale.first_name + ' ' + sale.last_name}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                            </div>
                                                            <div className="mx-3">
                                                                <div className='flex justify-between w-[140px]'>
                                                                    <p className="mb-1 font-semibold truncate">{sale.first_name} </p><p><span className="badge badge-outline-info cursor-pointer">View</span></p>
                                                                </div>
                                                                <p className="text-xs text-white-dark">{sale.start_date}  - {sale.due_date}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="mx-3">
                                                                <p className="mb-1  text-xs text-dark font-bold">{sale.bank} - ₹{sale.client_paid}</p>
                                                                <p className='text-end'><span className={`badge ${sale.status == "Approved" ? 'bg-success' :
                                                                    sale.status == "Verified" ? 'bg-info' :
                                                                        sale.status == "Pending" ? 'bg-warning' :
                                                                            sale.status == "Paused" ? 'bg-dark' :
                                                                                'bg-danger'}`}>{sale.status}</span></p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                )) : <>
                                                    <div className='bg-danger-light rounded p-6 text-center font-bold text-2xl'>
                                                        <h4>No Sale Found!</h4>
                                                    </div>

                                                </>}



                                            </>
                                        )}
                                    </div>
                                </PerfectScrollbar>
                            </section>
                        // <SalesHistory salesHistoryDrawer={salesHistoryDrawer} setSalesHistoryDrawer={setSalesHistoryDrawer} lead_id={lead_id1} />

                    }

                    {/* <footer className="w-full text-center border-t border-grey h-8 bg-[#3b3f5c] rounded-t-md">


                    </footer> */}
                </div>
            </nav>
        </div>

    )
}
