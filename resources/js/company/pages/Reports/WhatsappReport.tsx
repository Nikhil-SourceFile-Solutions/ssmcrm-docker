import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import 'tippy.js/dist/tippy.css';
import Main from '../Development/Main';
import axios from 'axios';
import WhatsAppReportDrawer from './WhatsAppReportDrawer';
import Tippy from '@tippyjs/react';
import ViewWhatsappReport from './ViewWhatsappReport';
import { useAuth } from '../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';

export default function WhatsappReport() {


  const { settingData, crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Whatsapp Report')); });

    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    useEffect(() => {
        fetchWhatsappCampaign();
    }, [page, search,pageSize])
    useEffect(() => {
        setPage(1);
    }, [pageSize]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchWhatsappCampaign = async () => {
        console.log("Fetching Whatsapp Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/reports/whatsapp",
                params: { page: page, size: pageSize, search:search },
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

        } finally {
            setIsLoading(false)
        }
    }
    const [reload, setReload] = useState(false);



    useEffect(() => {
        if (reload) {
            fetchWhatsappCampaign()
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [pageSize]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);

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

    const searchSetting = () => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
        setSearch(search)
    }



    return (


        <div className="panel flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <div className="flex items-center flex-wrap">
                    {/* <button type="button" className="btn btn-primary btn-sm m-1" >
                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        EXCEL
                    </button>

                    <button type="button" className="btn btn-primary btn-sm m-1">
                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                        Print
                    </button> */}
                </div>
                <div className=' flex  justify-between gap-2' >
                <div className="flex">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Campaign Name" className="form-input min-w-[220px] ltr:rounded-r-none rtl:rounded-l-none" />
                        <div onClick={() => { searchSetting() }} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <IoSearchSharp />
                        </div>
                    </div>
                {/* <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} /> */}
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
                                    <span className='badge bg-primary' >{data.count}</span>
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

                        {
                            accessor: 'id', title: 'Action', render: (data: any) => {
                                return (
                                    <div>
                                        <span className='badge bg-success cursor-pointer me-2' onClick={() => {
                                            setSelectedData(data)
                                            setDrawer(true)
                                        }}>View</span>

                                    </div>

                                )
                            },
                        },

                        { accessor: 'created_at', title: 'Time' },
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
                <nav className={`${(drawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>

                    <ViewWhatsappReport selectedData={selectedData} drawer={drawer} />

                </nav>
            </div>
        </div>

    )
}
