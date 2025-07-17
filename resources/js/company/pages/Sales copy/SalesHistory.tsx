import React, { Fragment, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import PageLoader from '../../components/Layouts/PageLoader';
import axios from 'axios';
import { IRootState } from '../../store';
import { useSelector } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import { useAuth } from '../../AuthContext';
export default function SalesHistory({ salesHistoryModal, setSalesHistoryModal, lead_id }: any) {

    const [isFetching, setIsFetching] = useState(false);
    const [salesHistories, setSalesHistories] = useState([]);

    const { settingData, crmToken, apiUrl } = useAuth()



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
            console.log(response)
        } catch (error) {
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        if (salesHistoryModal) handleSalesHistory()
    }, [salesHistoryModal])




    const [active, setActive] = useState<any>('');
    const togglePara = (value: any) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    return (
        <Transition appear show={salesHistoryModal} as={Fragment}>
            <Dialog as="div" open={salesHistoryModal} onClose={() => setSalesHistoryModal(false)}>
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
                                    <div className="text-lg font-bold">Sales History</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setSalesHistoryModal(false)}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <PerfectScrollbar className="h-[calc(50vh-80px)] relative">

                                        {isFetching ? <PageLoader /> : (
                                            <>







                                                {salesHistories.length ? salesHistories.map((sale: any) => (

                                                    <div className="mb-3">
                                                        <div className="space-y-2 font-semibold">
                                                            <div className={`${sale.status == "Approved" ? 'bg-success-light' :
                                                                sale.status == "Verified" ? 'bg-info-light' :
                                                                    sale.status == "Pending" ? 'bg-warning-light' :
                                                                        sale.status == "Paused" ? 'bg-dark-light' :
                                                                            'bg-danger-light'}
                                                                        rounded p-2`}>
                                                                <div onClick={() => togglePara(sale.id)} className={`flex justify-between items-center
                                                                            `}>
                                                                    <div className="flex items-center ">
                                                                        <div className="flex-none">
                                                                            <img src={`https://ui-avatars.com/api/?background=random&name=${sale.first_name + ' ' + sale.last_name}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                        </div>
                                                                        <div className="mx-3">
                                                                            <div className='flex justify-between w-[140px]'>
                                                                                <p className="mb-1 font-semibold truncate">{sale.first_name} </p><p><span className="badge badge-outline-info cursor-pointer">View</span></p>
                                                                            </div>
                                                                            <p className="text-xs text-white-dark">{sale.product
                                                                            } </p>
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
                                                                <div>
                                                                    <AnimateHeight duration={300} height={active === sale.id ? 'auto' : 0}>
                                                                        <div className="space-y-2 p-4 text-white-dark text-[13px]  ">

                                                                            <div className='flex justify-between'>
                                                                                <span>Sale Date <br />{sale.sale_date}</span>
                                                                                <span>Start Date <br />{sale.start_date}</span>
                                                                                <span>Due Date <br />{sale.due_date}</span>
                                                                            </div>
                                                                        </div>
                                                                    </AnimateHeight>
                                                                </div>
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

                                    </PerfectScrollbar>
                                    <div className="flex justify-end items-center mt-8">
                                        <button type="button" className="btn btn-outline-danger" onClick={() => setSalesHistoryModal(false)}>
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
