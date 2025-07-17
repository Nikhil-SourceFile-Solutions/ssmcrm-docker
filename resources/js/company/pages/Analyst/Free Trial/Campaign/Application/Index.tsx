import React, { useEffect, Fragment, useState } from 'react';

import IconFile from '../../../../../components/Icon/IconFile';
import IconPrinter from '../../../../../components/Icon/IconPrinter';
import axios from 'axios';
import { DataTable } from 'mantine-datatable';
import Phone from '../Phone';
import Flatpickr from 'react-flatpickr';
import View from './View';
import Update from './Update';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useAuth } from '../../../../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';

export default function Index() {

    const { settingData, crmToken, apiUrl, authUser, logout } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');

    const getFormattedTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Extracts date in 'YYYY-MM-DD' format
    };
    const [dateRange, setDateRange] = useState([getFormattedTodayDate(), getFormattedTodayDate()]);
    useEffect(() => {
        fetchApplicationCampaign();
    }, [page, dateRange])


    useEffect(() => {
        if (page != 1) setPage(1);
        else fetchApplicationCampaign();
    }, [pageSize, search]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal1, setModal1] = useState(false);


    const fetchApplicationCampaign = async () => {
        console.log("Fetching Application Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-application-notification",
                params: { page: page, size: pageSize, search: search, dateRange: JSON.stringify(dateRange) },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)

                console.log('all datata', response.data.data.data);
            }
        } catch (error) {

            console.log(error)
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false)
        }
    }


    ////////////////////// DRAWER CALCULATION /////////////////////////////

    const [drawer, setDrawer] = useState(false);

    const [selectedData, setSelectedData] = useState<any>('');
    const [action, setAction] = useState('');





    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (
        <div className=" flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <div className="flex items-center flex-wrap">
                    <button type="button" className="btn btn-primary btn-sm m-1" >
                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        EXCEL
                    </button>
                    <button type="button" className="btn btn-primary btn-sm m-1">
                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                        Print
                    </button>
                </div>

                <div className=' flex justify-between' >
                    <Flatpickr
                        options={{
                            mode: 'range',
                            dateFormat: 'Y-m-d',
                            position: 'auto left',
                        }}
                        value={dateRange}
                        className="form-input w-[240px]"
                        onChange={(CustomDate) => {
                            const date = CustomDate.map((dateStr) => {
                                const formattedDate = dateFormatter.format(new Date(dateStr));
                                return formattedDate.split('/').reverse().join('-');
                            });
                            if (date.length == 2) setDateRange(date)
                        }
                        }
                    />

                    <input type="text" className="form-input w-auto mx-4" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                    <button onClick={() => { fetchApplicationCampaign() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                        <IoMdRefresh className="w-5 h-5" />
                    </button>
                </div>

            </div>

            <div className="datatables">
                <DataTable
                    noRecordsText="No results match your search query"
                    highlightOnHover
                    className="whitespace-nowrap table-hover"
                    records={data['data']}
                    // records={data}
                    columns={[
                        {
                            accessor: 'script_name', title: 'Instrument Name', render: ({ script_name }: any) => {
                                return (
                                    <b>{script_name}</b>
                                )
                            },
                        },
                        // {
                        //     accessor: 'count', title: 'Clients',
                        //     render: (data: any) => {
                        //         return (
                        //             <span className='badge bg-primary' onClick={() => {
                        //                 setSelectedData(data)
                        //                 setAction('phone');
                        //                 setDrawer(true)
                        //             }}>{data.count}4</span>
                        //         )
                        //     },
                        // },
                        {
                            accessor: 'price_range', title: 'Price',
                            render: ({ price_range, campaign_name }) => {
                                return (
                                    <div className='max-w-[400px]' style={{ textWrap: "wrap" }}>
                                        <h1><b>{campaign_name}</b></h1>
                                        <span className='font-bold text-[12px] text-[#506690]'>{price_range}</span>
                                    </div>
                                )
                            },
                        },
                        { accessor: 'created_at', title: 'Time' },
                        {
                            accessor: 'id', title: 'Action', render: (data: any) => {
                                return (
                                    <div>
                                        <span className={`badge ${data?.is_existed == 1 ? 'bg-gray-400' : 'bg-success'} cursor-pointer me-2`} onClick={() => {

                                            if (data.is_existed == 0) {
                                                setSelectedData(data)
                                                setAction('update');
                                                setDrawer(true)
                                            }

                                        }}>Send Update</span>
                                        <span className={`badge  ${data?.is_existed ? 'bg-warning' : 'bg-danger'} cursor-pointer me-2`} onClick={() => {
                                            if (!data?.is_existed) {
                                                setSelectedData(data)
                                                setAction('exist');
                                                setModal1(true)
                                            }

                                        }}>{data?.is_existed ? 'Exited' : 'Exit'}</span>
                                        <span className='badge badge-outline-info cursor-pointer' onClick={() => {
                                            setSelectedData(data)
                                            setAction('view');
                                            setDrawer(true)
                                        }}>View Update</span>
                                    </div>

                                )
                            },
                        },
                    ]}
                    fetching={isLoading}
                    loaderColor="blue"
                    loaderBackgroundBlur={4}
                    totalRecords={data['totalItems']}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    paginationText={({ totalRecords }) => `Showing  ${data['from']} to ${data['to']} of ${totalRecords} entries`}
                />
            </div>

            <div>
                <div className={`${(drawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setDrawer(!1)}>
                </div>
                <nav className={`${(drawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                    <div className="flex flex-col h-screen overflow-hidden">
                        <div className="w-full py-4">
                            <div>
                                <h3 className="mb-1 dark:text-white font-bold text-[18px]">
                                    {action == "view" ? selectedData?.script_name + ' - View' :
                                        action == "update" ? selectedData?.script_name + ' - Application Campaigng' :
                                            action == "phone" ? selectedData?.campaign_name + ' - Phones' : ''}
                                </h3>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                        </div>

                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar ">

                            {action == "view" ? <View data={selectedData} setDrawer={setDrawer} drawer={drawer} /> :
                                action == "update" ? <Update data={selectedData} setDrawer={setDrawer} drawer={drawer} /> :
                                    action == "phone" ? <Phone data={selectedData} /> :
                                        action == "exist" ? <Exist data={selectedData} setSelectedData={setSelectedData} setModal1={setModal1} modal1={modal1} fetchApplicationCampaign={fetchApplicationCampaign} /> :
                                            null}




                        </section>
                    </div>
                </nav>
            </div>

            {/* exit modal  */}




        </div>
    )
}


const Exist = ({ data, setSelectedData, modal1, setModal1, fetchApplicationCampaign }) => {
    const { logout, crmToken, apiUrl } = useAuth();
    const [isBtnLoading, setIsBtnLoading] = useState(false)
    const [message, setmessage] = useState('')
    const [error, setError] = useState('')
    const existApi = async () => {
        setError('')
        if (!message) {
            setError('Message is required')
            return false;
        }
        try {
            setIsBtnLoading(true)
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/exist-application-notification",
                data: { id: data.id, exist_message: message },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                fetchApplicationCampaign()
                setSelectedData('')
                setModal1(false)
                setmessage('')
                setError('')
            }
            else {
                alert('error')
            }
        } catch (error) {

        }
        finally {
            setIsBtnLoading(false)
        }
    }
    return (
        <>
            <div className="mb-5">
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
                                            <div className="text-lg font-bold">Exit - {data?.script_name}</div>
                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                                x
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <div>
                                                <div className="flex">

                                                    <textarea onChange={(e) => setmessage(e.target.value)} rows={4} placeholder='Enter Details' className="form-textarea ltr:rounded-l-none rtl:rounded-r-none" defaultValue={message} ></textarea>
                                                </div>
                                                <span className=' text-red-600' >{error}</span>
                                            </div>

                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" disabled={isBtnLoading} className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => existApi()}>
                                                    {isBtnLoading ? 'please wait' : 'Exit'}
                                                </button>
                                            </div>
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
