

import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';


import PageLoader from '../../../../../components/Layouts/PageLoader';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../../../../AuthContext';
import { IoCloseSharp } from 'react-icons/io5';


function StatusHistory({ leadHistoryDrawer, tab, lead_id }) {

    const { logout, crmToken, apiUrl } = useAuth();


    const [isLoading, setIsLoading] = useState(true);
    const [leadHistories, setLeadHistories] = useState([]);

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

    useEffect(() => {
        if (leadHistoryDrawer) fetchStatusHistory()
    }, [leadHistoryDrawer])
    return (

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
        </section>



    )
}

export default StatusHistory

