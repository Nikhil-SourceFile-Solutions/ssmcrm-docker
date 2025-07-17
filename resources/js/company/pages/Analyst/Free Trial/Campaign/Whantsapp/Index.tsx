import React, { useEffect, useState } from 'react';
import IconFile from '../../../../../components/Icon/IconFile';
import IconPrinter from '../../../../../components/Icon/IconPrinter';
import axios from 'axios';
import { DataTable } from 'mantine-datatable';
import View from './View';
import Update from './Update';
import Phone from '../Phone';
import Flatpickr from 'react-flatpickr';
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
        fetchWhatsappCampaign();
    }, [page, search, dateRange])
    useEffect(() => {
        if (page != 1) setPage(1);
        else fetchWhatsappCampaign();
    }, [pageSize]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchWhatsappCampaign = async () => {
        console.log("Fetching Whatsapp Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/campaigns/free-trail/whatsapp/today",
                params: { page: page, size: pageSize, dateRange: JSON.stringify(dateRange) },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
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

                <div className=' flex justify-between ' >
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

                    <input type="text" className="form-input w-auto mx-4" placeholder="Search..." />
                    <button onClick={() => { fetchWhatsappCampaign() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                        <IoMdRefresh className="w-5 h-5" />
                    </button>
                </div>

            </div>

            <div className="datatables">
                <DataTable
                    noRecordsText="No results match your search query"
                    highlightOnHover
                    className="whitespace-nowrap table-hover"
                    records={data[0]}
                    columns={[
                        {
                            accessor: 'campaign_name', title: 'Campaign Name', render: ({ campaign_name }: any) => {
                                return (
                                    <b>{campaign_name}</b>
                                )
                            },
                        },
                        {
                            accessor: 'count', title: 'Clients',
                            render: (data: any) => {
                                return (
                                    <span className='badge bg-primary' onClick={() => {
                                        setSelectedData(data)
                                        setAction('phone');
                                        setDrawer(true)
                                    }}>{data.count}</span>
                                )
                            },
                        },
                        {
                            accessor: 'final_template', title: 'Content',
                            render: ({ final_template, campaign_name }) => {
                                return (
                                    <div className='max-w-[400px]' style={{ textWrap: "wrap" }}>
                                        <h1><b>{campaign_name}</b></h1>
                                        <span className='font-bold text-[12px] text-[#506690]'>{final_template}</span>
                                    </div>
                                )
                            },
                        },
                        { accessor: 'created_at', title: 'Time' },
                        {
                            accessor: 'id', title: 'Action', render: (data: any) => {
                                return (
                                    <div>
                                        <span className='badge bg-success cursor-pointer me-2' onClick={() => {
                                            setSelectedData(data)
                                            setAction('update');
                                            setDrawer(true)
                                        }}>Send Update</span>
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
                    totalRecords={data[2]}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    paginationText={({ totalRecords }) => `Showing  ${data[3]} to ${data[4]} of ${totalRecords} entries`}
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
                                    {action == "view" ? selectedData?.campaign_name + ' - Update' :
                                        action == "update" ? selectedData?.campaign_name + ' - Whatsapp Campaign' :
                                            action == "phone" ? selectedData?.campaign_name + ' - Phones' : ''}
                                </h3>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                        </div>

                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar ">

                            {action == "view" ? <View data={selectedData} setDrawer={setDrawer} drawer={drawer} /> :
                                action == "update" ? <Update data={selectedData} setDrawer={setDrawer} drawer={drawer} /> :
                                    action == "phone" ? <Phone data={selectedData} /> : null}

                        </section>
                    </div>
                </nav>
            </div>
        </div>
    )
}
