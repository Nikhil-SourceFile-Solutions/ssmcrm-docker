import React, { Fragment, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../../../components/Icon/IconX';
import PageLoader from '../../../../components/Layouts/PageLoader';
import axios from 'axios';
import { IRootState } from '../../../../store';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../AuthContext';
import { IoCloseSharp } from 'react-icons/io5';

export default function SalesHistory({ salesHistoryDrawer, setSalesHistoryDrawer, lead_id }: any) {

    const { logout, crmToken, apiUrl } = useAuth();

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
        if (salesHistoryDrawer) handleSalesHistory()
    }, [salesHistoryDrawer])

    const [view, setView] = useState(false);

    const handleView = (data) => {
        if (view === data.id) {
            setView(null);
        } else {
            setView(data.id);
        }
    };



    return (
        <div>
            <div className={`${(salesHistoryDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setSalesHistoryDrawer(false)}></div>

            <nav
                className={`${(salesHistoryDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[650px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setSalesHistoryDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Sales History 999</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <PerfectScrollbar className="relative h-full  ">
                            <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">



                                {isFetching ? <PageLoader /> : (
                                    <>

                                        {salesHistories.length ? salesHistories.map((sale: any, index: number) => (


                                            <div key={index}>
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
                                                                <p className="mb-1 font-semibold truncate">{sale.first_name} </p><p><span onClick={() => { handleView(sale) }} className="badge badge-outline-info cursor-pointer">View</span></p>
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
                                                <div className='' >

                                                    {view === sale.id && (
                                                        <div
                                                            className={` mx-4 mb-2
                                                            ${sale.status == "Approved" ? 'bg-success-light' :
                                                                    sale.status == "Verified" ? 'bg-info-light' :
                                                                        sale.status == "Pending" ? 'bg-warning-light' :
                                                                            sale.status == "Paused" ? 'bg-dark-light' :
                                                                                'bg-danger-light'}
                                                        rounded p-2 mb-2`}
                                                        >
                                                            <h1>
                                                                Owner: <span>{sale.first_name + ' ' + sale.last_name}</span>
                                                            </h1>
                                                            <h1>
                                                                Start date: <span>{sale.start_date}</span>
                                                            </h1>
                                                            <h1>
                                                                Due Date: <span>{sale.due_date}</span>
                                                            </h1>
                                                            <h1>
                                                                Product name: <span>{sale.product}</span>
                                                            </h1>
                                                            <h1>
                                                                Client Paid: <span>{sale.client_paid}</span>
                                                            </h1>
                                                        </div>
                                                    )}

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
                    <footer className="w-full text-center border-t border-grey h-8 bg-[#3b3f5c] rounded-t-md">


                    </footer>
                </div>
            </nav>
        </div>
    )
}
