import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';


import PageLoader from '../../../../../components/Layouts/PageLoader';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../../../../AuthContext';
import { IoCloseSharp } from 'react-icons/io5';

function SalesHistory({ leadHistoryDrawer, tab, lead_id }) {
    const { logout, crmToken, apiUrl } = useAuth();
    console.log("tab", tab)
    console.log("lead_id", lead_id)


    const [isLoading, setIsLoading] = useState(true);
    const [salesHistories, setSalesHistories] = useState([]);

    const fetchSalesHistory = async () => {
        console.log("Fetching Sales History...")


        setIsLoading(true)
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
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (leadHistoryDrawer) fetchSalesHistory()
    }, [leadHistoryDrawer])


    return (
        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

            <PerfectScrollbar className="relative h-full  ">
                <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">



                    {isLoading ? <PageLoader /> : (
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
                                                <p className="mb-1 font-semibold truncate">{sale.first_name} </p>
                                                {/* <p><span className="badge badge-outline-info cursor-pointer">View</span></p> */}
                                            </div>
                                            <p className="text-xs text-white-dark">{sale.start_date}  - {sale.due_date}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mx-3">
                                            <p className="mb-1  text-xs text-dark font-bold">{sale.bank_name} - ₹{sale.client_paid}</p>
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
    )
}


export default SalesHistory



