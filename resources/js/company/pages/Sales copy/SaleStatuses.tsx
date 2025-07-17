import React, { Fragment, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import PageLoader from '../../components/Layouts/PageLoader';
import axios from 'axios';
import { IRootState } from '../../store';
import { useSelector } from 'react-redux';
import { useAuth } from '../../AuthContext';

export default function SaleStatuses({ salesStatusModal, setSalesStatusModal, sale }: any) {

    const [isFetching, setIsFetching] = useState(false);
    const [saleStatuses, setSaleStatuses] = useState([]);
    const { settingData, crmToken, apiUrl } = useAuth()


    const handleSalesHistory = async () => {
        setIsFetching(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-sales-statuses",
                params: { sale_id: sale.id },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") setSaleStatuses(response.data.statuses)
            console.log(response)
        } catch (error) {
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        if (salesStatusModal) handleSalesHistory()
    }, [salesStatusModal])



    return (
        <Transition appear show={salesStatusModal} as={Fragment}>
            <Dialog as="div" open={salesStatusModal} onClose={() => setSalesStatusModal(false)}>
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
                    <div className="flex items-start justify-center min-h-screen px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="text-lg font-bold">Sales Logs</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setSalesStatusModal(false)}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <PerfectScrollbar className="h-[calc(50vh-80px)] relative">

                                        {isFetching ? <PageLoader /> : (
                                            <>
                                                {saleStatuses.length ? saleStatuses.map((status: any) => (
                                                    <div className={`${status.status == "Approved" ? 'bg-success-light' :
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
                                    </PerfectScrollbar>
                                    <div className="flex justify-end items-center mt-8">
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setSalesStatusModal(false)}>
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div >
                </div >
            </Dialog >
        </Transition >
    )
}
