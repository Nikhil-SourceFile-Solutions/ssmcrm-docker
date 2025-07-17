
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import PageLoader from '../../../components/Layouts/PageLoader';
export default function Log({ logDrawer, setLogDrawer, sale_id, lead_id }) {

    const { logout, crmToken, apiUrl } = useAuth();

    const [isFetching, setIsFetching] = useState(false);
    const [saleStatuses, setSaleStatuses] = useState([]);





    const fetchSaleStatus = async () => {
        setIsFetching(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-sales-statuses",
                params: { sale_id: sale_id },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") setSaleStatuses(response.data.statuses)
        } catch (error) {
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        if (logDrawer) fetchSaleStatus()
    }, [logDrawer])



    return (
        <div>
            <div className={`${(logDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setLogDrawer(false)}></div>

            <nav
                className={`${(logDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[650px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setLogDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Sales Logs - #{sale_id}</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <PerfectScrollbar className="relative h-full  ">
                            <div className="space-y-5  sm:pb-0 pb-[68px]  mx-3">


                                {isFetching ? <PageLoader /> : (
                                    <>
                                        {saleStatuses.length ? saleStatuses.map((status: any, index: number) => (
                                            <div key={index} className={`${status.status == "Approved" ? 'bg-success-light' :
                                                status.status == "Verified" ? 'bg-info-light' :
                                                    status.status == "Pending" ? 'bg-warning-light' :
                                                        status.status == "Paused" ? 'bg-dark-light' :
                                                            'bg-danger-light'} rounded p-2 mb-2`}>
                                                <div className={`flex justify-between items-center  `}>
                                                    <div className="flex items-center ">
                                                        <div className="flex-none">
                                                            <img src={`https://ui-avatars.com/api/?background=random&name=albin}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                        </div>
                                                        <div className="mx-3">
                                                            <div className='flex justify-between w-[140px]'>
                                                                <p className="mb-1 font-semibold truncate">{status.user_type}</p>
                                                            </div>
                                                            <p className="text-xs text-white-dark">{status.first_name} {status.last_name}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mx-3">
                                                            <p className='text-end mb-2'><span className={`badge
                                                                    ${status.status == "Approved" ? 'bg-success' :
                                                                    status.status == "Verified" ? 'bg-info' :
                                                                        status.status == "Pending" ? 'bg-warning' :
                                                                            status.status == "Paused" ? 'bg-dark' :
                                                                                'bg-danger'}
                                                                    `}>{status.status}</span></p>
                                                            <p className="  text-xs text-dark font-bold">{status.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <small className='font-semibold text-[#506690]'>
                                                    {status.description}
                                                </small>
                                            </div>
                                        )) : <>
                                            <div className='bg-danger-light rounded p-6 text-center font-bold text-2xl'>
                                                <h4>No Sale Status Found!</h4>
                                            </div>
                                        </>}
                                    </>
                                )}




                            </div>
                        </PerfectScrollbar>
                    </section>
                    <footer className="w-full text-center border-t border-grey h-8 bg-[#3b3f5c] rounded-t-md flex justify-between px-4">

                        <p className='mt-2 text-white'><b>Lead Id : #{lead_id}</b></p>
                        <p className='mt-2 text-white'><b>Total Logs : {saleStatuses.length}</b></p>
                    </footer>
                </div>
            </nav>
        </div>
    )
}
